import { getCareerRole, getRoleQuestions, isRoleOpenForApplications } from '../../../data/careers'
import { isApplicationExpired, sanitizeFileName, validateUploadMagicBytes, validateUploadRequest, type UploadKind, type UploadRequest } from './security'
import { presignR2Url } from './presign'

type Env = {
  CAREERS_BUCKET: R2Bucket
  TURNSTILE_SECRET_KEY?: string
  TELEGRAM_NOTIFY_BOT_TOKEN?: string
  TELEGRAM_NOTIFY_CHAT_ID?: string
  R2_ACCOUNT_ID?: string
  R2_ACCESS_KEY_ID?: string
  R2_SECRET_ACCESS_KEY?: string
  R2_BUCKET_NAME?: string
  R2_S3_ENDPOINT?: string
  CORS_ORIGIN?: string
  ADMIN_DELETE_TOKEN?: string
  TURNSTILE_TEST_MODE?: string
}

type PresignFile = UploadRequest

type ApplicationSession = {
  appId: string
  roleSlug: string
  createdAt: string
  uploads: Array<PresignFile & { key: string }>
}

type FinalizeUpload = PresignFile & { key: string }

type FinalizeBody = {
  appId: string
  roleSlug: string
  consentAccepted: boolean
  candidate: Record<string, string>
  answers: Array<{ id: string; label: string; section: string; value: string | string[] }>
  uploads: FinalizeUpload[]
}

const PRESIGNED_PUT_EXPIRES_SECONDS = 15 * 60
const PRESIGNED_GET_EXPIRES_SECONDS = 24 * 60 * 60
const SESSION_EXPIRES_SECONDS = 30 * 60
const APP_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const APPLY_BASE_URL = 'https://apply.nghpropertygroup.com'
const SAFE_REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const REF_TOKEN_LENGTH = 4
const REF_COLLISION_ATTEMPTS = 8
const SECURITY_HEADERS = {
  'Referrer-Policy': 'no-referrer',
}

function corsHeaders(env?: Env) {
  return {
    ...SECURITY_HEADERS,
    'Access-Control-Allow-Origin': env?.CORS_ORIGIN || 'https://nghpropertygroup.com',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  }
}

function json(data: unknown, init: ResponseInit = {}, env?: Env) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(env),
      ...init.headers,
    },
  })
}

function badRequest(error: string, env: Env, status = 400) {
  return json({ error }, { status }, env)
}

async function readJson<T>(request: Request) {
  return (await request.json()) as T
}

function requireString(value: unknown, name: string) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${name} is required.`)
  return value.trim()
}

function randomRefToken() {
  const bytes = new Uint8Array(REF_TOKEN_LENGTH)
  crypto.getRandomValues(bytes)
  return [...bytes].map((byte) => SAFE_REF_ALPHABET[byte % SAFE_REF_ALPHABET.length]).join('')
}

async function refExistsForActiveRole(env: Env, roleSlug: string, ref: string, now = new Date()) {
  let cursor: string | undefined
  do {
    const listed = await env.CAREERS_BUCKET.list({ prefix: 'applications/', cursor })
    const metadataJsons = listed.objects.filter((object) => object.key.endsWith('/metadata.json'))
    for (const object of metadataJsons) {
      const metadataObject = await env.CAREERS_BUCKET.get(object.key)
      if (!metadataObject) continue
      const metadata = (await metadataObject.json()) as { ref?: string; roleSlug?: string; roleCloseDate?: string }
      if (metadata.ref === ref && metadata.roleSlug === roleSlug && !isApplicationExpired(metadata.roleCloseDate || '', now)) {
        return true
      }
    }
    cursor = listed.truncated ? listed.cursor : undefined
  } while (cursor)
  return false
}

async function generateApplicationRef(env: Env, role: { roleCode: string; slug: string }) {
  for (let attempt = 0; attempt < REF_COLLISION_ATTEMPTS; attempt += 1) {
    const ref = `${role.roleCode}-${randomRefToken()}`
    try {
      if (!(await refExistsForActiveRole(env, role.slug, ref))) return ref
    } catch (error) {
      console.warn('Application ref collision check skipped:', error)
      return ref
    }
  }
  return `${role.roleCode}-${randomRefToken()}`
}

function getR2Config(env: Env) {
  const bucket = env.R2_BUCKET_NAME || 'ngh-careers-applications-dev'
  const endpoint = env.R2_S3_ENDPOINT || (env.R2_ACCOUNT_ID ? `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : '')
  if (!endpoint || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) {
    throw new Error('R2 signing secrets are not configured.')
  }
  return { bucket, endpoint, accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY }
}

async function verifyTurnstile(token: string, request: Request, env: Env) {
  if (!env.TURNSTILE_SECRET_KEY) {
    return { ok: env.TURNSTILE_TEST_MODE === 'true', testMode: true }
  }
  const formData = new FormData()
  formData.set('secret', env.TURNSTILE_SECRET_KEY)
  formData.set('response', token)
  const ip = request.headers.get('CF-Connecting-IP')
  if (ip) formData.set('remoteip', ip)
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData,
  })
  const result = (await response.json()) as { success?: boolean }
  return { ok: Boolean(result.success), testMode: false }
}

function objectKey(appId: string, kind: UploadKind, fileName: string) {
  const safeName = sanitizeFileName(fileName)
  if (kind === 'resume') return `applications/${appId}/${safeName}`
  return `applications/${appId}/intro-video-${safeName}`
}

function countKind(uploads: Array<{ kind: UploadKind }>, kind: UploadKind) {
  return uploads.filter((upload) => upload.kind === kind).length
}

function hasRequiredUploads(uploads: Array<{ kind: UploadKind }>) {
  return uploads.length === 2 && countKind(uploads, 'resume') === 1 && countKind(uploads, 'introVideo') === 1
}

function isSessionExpired(createdAt: string, now = new Date()) {
  const created = new Date(createdAt).getTime()
  return Number.isNaN(created) || created + SESSION_EXPIRES_SECONDS * 1000 < now.getTime()
}

async function handlePresign(request: Request, env: Env) {
  const body = await readJson<{ appId: string; roleSlug: string; turnstileToken: string; files: PresignFile[] }>(request)
  const appId = requireString(body.appId, 'appId')
  if (!APP_ID_RE.test(appId)) return badRequest('Invalid application ID.', env)
  const roleSlug = requireString(body.roleSlug, 'roleSlug')
  const role = getCareerRole(roleSlug)
  if (!role || !isRoleOpenForApplications(role)) return badRequest('This role is not open for applications.', env)
  const turnstileToken = requireString(body.turnstileToken, 'turnstileToken')
  const turnstile = await verifyTurnstile(turnstileToken, request, env)
  if (!turnstile.ok) return badRequest('Anti-bot verification failed.', env, 403)
  if (!Array.isArray(body.files) || !hasRequiredUploads(body.files)) return badRequest('Exactly one resume and one intro video are required.', env)

  const uploads = body.files.map((file) => {
    const validation = validateUploadRequest(file)
    if (!validation.ok) throw new Error(validation.error)
    return { ...file, key: objectKey(appId, file.kind, file.fileName) }
  })

  const r2 = getR2Config(env)
  const presignedUploads = await Promise.all(
    uploads.map(async (upload) => ({
      kind: upload.kind,
      key: upload.key,
      uploadUrl: await presignR2Url({
        method: 'PUT',
        endpoint: r2.endpoint,
        bucket: r2.bucket,
        key: upload.key,
        accessKeyId: r2.accessKeyId,
        secretAccessKey: r2.secretAccessKey,
        expiresSeconds: PRESIGNED_PUT_EXPIRES_SECONDS,
      }),
    })),
  )

  const session: ApplicationSession = {
    appId,
    roleSlug,
    createdAt: new Date().toISOString(),
    uploads,
  }
  await env.CAREERS_BUCKET.put(`applications/${appId}/session.json`, JSON.stringify(session), {
    httpMetadata: { contentType: 'application/json' },
  })

  return json({ appId, expiresAt: new Date(Date.now() + PRESIGNED_PUT_EXPIRES_SECONDS * 1000).toISOString(), uploads: presignedUploads }, {}, env)
}

async function readFirstBytes(bucket: R2Bucket, key: string, bytes = 16) {
  const object = await bucket.get(key, { range: { offset: 0, length: bytes } })
  if (!object) return null
  return new Uint8Array(await object.arrayBuffer())
}

async function validateStoredUpload(env: Env, upload: FinalizeUpload) {
  const object = await env.CAREERS_BUCKET.head(upload.key)
  if (!object) return { ok: false as const, error: `${upload.kind} upload is missing.` }
  const requestValidation = validateUploadRequest(upload)
  if (!requestValidation.ok) {
    await env.CAREERS_BUCKET.delete(upload.key)
    return requestValidation
  }
  const expectedMax = upload.kind === 'resume' ? 10 * 1024 * 1024 : 100 * 1024 * 1024
  if (object.size <= 0 || object.size > expectedMax) {
    await env.CAREERS_BUCKET.delete(upload.key)
    return { ok: false as const, error: `${upload.kind} upload has an invalid size.` }
  }
  const bytes = await readFirstBytes(env.CAREERS_BUCKET, upload.key)
  if (!bytes) {
    await env.CAREERS_BUCKET.delete(upload.key)
    return { ok: false as const, error: `${upload.kind} upload cannot be read.` }
  }
  const magicValidation = validateUploadMagicBytes(upload.kind, upload.fileName, bytes)
  if (!magicValidation.ok) await env.CAREERS_BUCKET.delete(upload.key)
  return magicValidation
}

function validateAnswers(roleSlug: string, body: FinalizeBody) {
  const role = getCareerRole(roleSlug)
  if (!role || !isRoleOpenForApplications(role)) return 'This role is not open for applications.'
  const requiredQuestionIds = new Set(getRoleQuestions(role).filter((question) => question.required).map((question) => question.id))
  const answered = new Set(
    body.answers
      .filter((answer) => Array.isArray(answer.value) ? answer.value.length > 0 : String(answer.value || '').trim().length > 0)
      .map((answer) => answer.id),
  )
  for (const id of requiredQuestionIds) {
    if (!answered.has(id)) return `Required question is missing: ${id}`
  }
  const requiredCandidateFields: Array<[string, string]> = [
    ['name', 'name'],
    ['dateOfBirth', 'date of birth'],
    ['email', 'email'],
    ['phone', 'phone'],
    ['location', 'location'],
  ]
  for (const [field, label] of requiredCandidateFields) {
    if (!body.candidate?.[field]?.trim()) return `Candidate ${label} is required.`
  }
  if (!body.consentAccepted) return 'Required privacy consent was not accepted.'
  return null
}

async function signedGetLinks(env: Env, uploads: FinalizeUpload[]) {
  const r2 = getR2Config(env)
  return Promise.all(
    uploads.map(async (upload) => ({
      kind: upload.kind,
      url: await presignR2Url({
        method: 'GET',
        endpoint: r2.endpoint,
        bucket: r2.bucket,
        key: upload.key,
        accessKeyId: r2.accessKeyId,
        secretAccessKey: r2.secretAccessKey,
        expiresSeconds: PRESIGNED_GET_EXPIRES_SECONDS,
      }),
    })),
  )
}

function applicantLink(appId: string, kind: 'cv' | 'video') {
  return `${APPLY_BASE_URL}/applicants/${appId}/${kind}`
}

async function sendTelegram(env: Env, metadata: {
  appId: string
  role: string
  ref: string
}) {
  if (!env.TELEGRAM_NOTIFY_BOT_TOKEN || !env.TELEGRAM_NOTIFY_CHAT_ID) {
    console.info('Telegram test mode: notification skipped')
    return
  }
  const text = [
    `New ${metadata.role} application · Ref ${metadata.ref}`,
    `CV link: ${applicantLink(metadata.appId, 'cv')}`,
    `Video link: ${applicantLink(metadata.appId, 'video')}`,
  ].join('\n')
  const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_NOTIFY_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: env.TELEGRAM_NOTIFY_CHAT_ID, text, disable_web_page_preview: true }),
  })
  if (!response.ok) throw new Error('Telegram notification failed.')
}

async function handleFinalize(request: Request, env: Env) {
  const body = await readJson<FinalizeBody>(request)
  const appId = requireString(body.appId, 'appId')
  if (!APP_ID_RE.test(appId)) return badRequest('Invalid application ID.', env)
  const roleSlug = requireString(body.roleSlug, 'roleSlug')
  const role = getCareerRole(roleSlug)
  if (!role || !isRoleOpenForApplications(role)) return badRequest('This role is not open for applications.', env)
  const answerError = validateAnswers(roleSlug, body)
  if (answerError) return badRequest(answerError, env)

  const sessionObject = await env.CAREERS_BUCKET.get(`applications/${appId}/session.json`)
  if (!sessionObject) return badRequest('Upload session is missing or expired.', env)
  const session = (await sessionObject.json()) as ApplicationSession
  if (session.roleSlug !== roleSlug) return badRequest('Upload session role does not match application role.', env)
  if (isSessionExpired(session.createdAt)) {
    await deletePrefix(env.CAREERS_BUCKET, `applications/${appId}/`)
    return badRequest('Upload session is expired. Please submit the form again.', env)
  }
  if (!hasRequiredUploads(session.uploads) || !Array.isArray(body.uploads) || !hasRequiredUploads(body.uploads)) {
    return badRequest('Exactly one resume and one intro video are required.', env)
  }

  const requestedKeys = new Set(body.uploads.map((upload) => upload.key))
  const finalUploads = session.uploads.map((upload) => ({ ...upload }))
  if (finalUploads.some((upload) => !requestedKeys.has(upload.key))) {
    return badRequest('Finalized uploads do not match the signed upload session.', env)
  }

  for (const upload of finalUploads) {
    if (!upload.key.startsWith(`applications/${appId}/`)) return badRequest('Upload key does not match application ID.', env)
    const validation = await validateStoredUpload(env, upload)
    if (!validation.ok) return badRequest(validation.error, env)
  }

  const links = await signedGetLinks(env, finalUploads)
  const resumeUpload = finalUploads.find((upload) => upload.kind === 'resume')
  const videoUrl = links.find((link) => link.kind === 'introVideo')?.url
  if (!resumeUpload || !videoUrl) return badRequest('Resume and intro video are required.', env)

  const answers = Object.fromEntries(body.answers.map((answer) => [answer.label, Array.isArray(answer.value) ? answer.value.join(', ') : answer.value]))
  const ref = await generateApplicationRef(env, role)
  const metadata = {
    appId,
    ref,
    role: role.title,
    roleCode: role.roleCode,
    roleSlug,
    applicantName: body.candidate.name,
    applicantDateOfBirth: body.candidate.dateOfBirth,
    applicantEmail: body.candidate.email,
    applicantPhone: body.candidate.phone,
    answers,
    cvKey: resumeUpload.key,
    videoUrl,
    videoKey: finalUploads.find((upload) => upload.kind === 'introVideo')?.key,
    createdAt: new Date().toISOString(),
    roleCloseDate: role.closingDate,
  }
  await env.CAREERS_BUCKET.put(`applications/${appId}/metadata.json`, JSON.stringify(metadata, null, 2), {
    httpMetadata: { contentType: 'application/json' },
  })

  await sendTelegram(env, metadata)
  return json({ ok: true, appId, ref }, {}, env)
}

type ApplicantMetadata = {
  appId: string
  cvKey?: string
  videoKey?: string
  videoUrl?: string
}

function safeDownloadName(key: string) {
  const name = key.split('/').pop() || 'file'
  return name.replace(/["\\\r\n]/g, '_')
}

function resolveVideoKey(metadata: ApplicantMetadata, appId: string) {
  if (typeof metadata.videoKey === 'string' && metadata.videoKey.startsWith(`applications/${appId}/`)) return metadata.videoKey
  if (typeof metadata.videoUrl === 'string') {
    const match = metadata.videoUrl.match(new RegExp(`applications/${appId}/[^?]+`))
    if (match) return decodeURIComponent(match[0])
  }
  return ''
}

function privateFileHeaders(contentType?: string) {
  const headers = new Headers({
    ...SECURITY_HEADERS,
    'Cache-Control': 'private, no-store',
    'X-Robots-Tag': 'noindex',
  })
  if (contentType) headers.set('Content-Type', contentType)
  return headers
}

function parseRangeHeader(rangeHeader: string | null, size: number) {
  if (!rangeHeader) return null
  const match = rangeHeader.match(/^bytes=(\d*)-(\d*)$/)
  if (!match) return { invalid: true as const }
  let start: number
  let end: number
  if (match[1] === '' && match[2] === '') return { invalid: true as const }
  if (match[1] === '') {
    const suffix = Number(match[2])
    if (!Number.isInteger(suffix) || suffix <= 0) return { invalid: true as const }
    start = Math.max(size - suffix, 0)
    end = size - 1
  } else {
    start = Number(match[1])
    end = match[2] === '' ? size - 1 : Number(match[2])
  }
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start || start >= size) return { invalid: true as const }
  return { invalid: false as const, start, end: Math.min(end, size - 1) }
}

async function handleApplicantFile(request: Request, env: Env, appId: string, kind: 'cv' | 'video') {
  if (!APP_ID_RE.test(appId)) return badRequest('Invalid application ID.', env)
  const metadataObject = await env.CAREERS_BUCKET.get(`applications/${appId}/metadata.json`)
  if (!metadataObject) return json({ error: 'Application not found.' }, { status: 404 }, env)
  const metadata = (await metadataObject.json()) as ApplicantMetadata
  const key = kind === 'cv' ? metadata.cvKey : resolveVideoKey(metadata, appId)
  if (!key || !key.startsWith(`applications/${appId}/`)) return json({ error: 'File not found.' }, { status: 404 }, env)
  const head = await env.CAREERS_BUCKET.head(key)
  if (!head) return json({ error: 'File not found.' }, { status: 404 }, env)
  const contentType = head.httpMetadata?.contentType || (kind === 'video' ? 'video/mp4' : 'application/octet-stream')

  if (kind === 'video') {
    const range = parseRangeHeader(request.headers.get('Range'), head.size)
    if (range?.invalid) {
      return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${head.size}`, ...corsHeaders(env) } })
    }
    const headers = privateFileHeaders(contentType)
    headers.set('Content-Disposition', 'inline')
    headers.set('Accept-Ranges', 'bytes')
    if (range && !range.invalid) {
      const object = await env.CAREERS_BUCKET.get(key, { range: { offset: range.start, length: range.end - range.start + 1 } })
      if (!object?.body) return json({ error: 'File not found.' }, { status: 404 }, env)
      headers.set('Content-Range', `bytes ${range.start}-${range.end}/${head.size}`)
      headers.set('Content-Length', String(range.end - range.start + 1))
      return new Response(object.body, { status: 206, headers })
    }
    const object = await env.CAREERS_BUCKET.get(key)
    if (!object?.body) return json({ error: 'File not found.' }, { status: 404 }, env)
    headers.set('Content-Length', String(head.size))
    return new Response(object.body, { status: 200, headers })
  }

  const object = await env.CAREERS_BUCKET.get(key)
  if (!object?.body) return json({ error: 'File not found.' }, { status: 404 }, env)
  const headers = privateFileHeaders(contentType)
  headers.set('Content-Disposition', `attachment; filename="${safeDownloadName(key)}"`)
  headers.set('Content-Length', String(head.size))
  return new Response(object.body, { status: 200, headers })
}

async function deletePrefix(bucket: R2Bucket, prefix: string) {
  let cursor: string | undefined
  do {
    const listed = await bucket.list({ prefix, cursor })
    if (listed.objects.length) await bucket.delete(listed.objects.map((object) => object.key))
    cursor = listed.truncated ? listed.cursor : undefined
  } while (cursor)
}

async function cleanupExpiredApplications(env: Env, now = new Date()) {
  let cursor: string | undefined
  let deleted = 0
  do {
    const listed = await env.CAREERS_BUCKET.list({ prefix: 'applications/', cursor })
    const metadataJsons = listed.objects.filter((object) => object.key.endsWith('/metadata.json'))
    const sessionJsons = listed.objects.filter((object) => object.key.endsWith('/session.json'))

    for (const object of metadataJsons) {
      const metadataObject = await env.CAREERS_BUCKET.get(object.key)
      if (!metadataObject) continue
      const metadata = (await metadataObject.json()) as { roleCloseDate?: string }
      const prefix = object.key.slice(0, object.key.length - 'metadata.json'.length)
      if (metadata.roleCloseDate && isApplicationExpired(metadata.roleCloseDate, now)) {
        await deletePrefix(env.CAREERS_BUCKET, prefix)
        deleted += 1
      }
    }

    for (const object of sessionJsons) {
      const prefix = object.key.slice(0, object.key.length - 'session.json'.length)
      const hasMetadata = metadataJsons.some((metadata) => metadata.key.startsWith(prefix))
      if (hasMetadata) continue
      const sessionObject = await env.CAREERS_BUCKET.get(object.key)
      if (!sessionObject) continue
      const session = (await sessionObject.json()) as { createdAt?: string }
      if (!session.createdAt || isSessionExpired(session.createdAt, now)) {
        await deletePrefix(env.CAREERS_BUCKET, prefix)
        deleted += 1
      }
    }

    cursor = listed.truncated ? listed.cursor : undefined
  } while (cursor)
  return deleted
}

async function handleAdminDelete(request: Request, env: Env) {
  if (!env.ADMIN_DELETE_TOKEN || request.headers.get('Authorization') !== `Bearer ${env.ADMIN_DELETE_TOKEN}`) {
    return badRequest('Unauthorized.', env, 401)
  }
  const body = await readJson<{ appId: string }>(request)
  const appId = requireString(body.appId, 'appId')
  if (!APP_ID_RE.test(appId)) return badRequest('Invalid application ID.', env)
  await deletePrefix(env.CAREERS_BUCKET, `applications/${appId}/`)
  return json({ ok: true, appId }, {}, env)
}

export default {
  async fetch(request: Request, env: Env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(env) })
    const url = new URL(request.url)
    try {
      if (request.method === 'GET' && url.pathname === '/health') return json({ ok: true }, {}, env)
      if (request.method === 'GET') {
        const match = url.pathname.match(/^\/applicants\/([^/]+)\/(cv|video)$/)
        if (match) return await handleApplicantFile(request, env, match[1], match[2] as 'cv' | 'video')
      }
      if (request.method === 'POST' && url.pathname === '/uploads/presign') return await handlePresign(request, env)
      if (request.method === 'POST' && url.pathname === '/applications') return await handleFinalize(request, env)
      if (request.method === 'POST' && url.pathname === '/admin/delete-application') return await handleAdminDelete(request, env)
      return json({ error: 'Not found.' }, { status: 404 }, env)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected intake bridge error.'
      return json({ error: message }, { status: 500 }, env)
    }
  },
  async scheduled(_event: ScheduledEvent, env: Env) {
    await cleanupExpiredApplications(env)
  },
}

export { cleanupExpiredApplications }
