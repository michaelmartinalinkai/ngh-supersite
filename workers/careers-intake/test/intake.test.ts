import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import worker from '../src/index'
import { getCareerRole, isRoleOpenForApplications } from '../../../data/careers'

type StoredObject = { key: string; body: unknown; size: number; bytes?: Uint8Array; contentType?: string }

class FakeBucket {
  objects = new Map<string, StoredObject>()
  deleted: string[] = []

  seedJson(key: string, body: unknown) {
    const raw = JSON.stringify(body)
    this.objects.set(key, { key, body, size: raw.length })
  }

  seedFile(key: string, bytes: Uint8Array, contentType = 'application/octet-stream') {
    this.objects.set(key, { key, body: null, size: bytes.byteLength, bytes, contentType })
  }

  async put(key: string, value: string) {
    this.objects.set(key, { key, body: JSON.parse(value), size: value.length })
  }

  async get(key: string, options?: { range?: { offset?: number; length?: number } }) {
    const object = this.objects.get(key)
    if (!object) return null
    const rawBytes = object.bytes || new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d])
    const offset = options?.range?.offset ?? 0
    const length = options?.range?.length ?? rawBytes.byteLength - offset
    const bytes = rawBytes.slice(offset, offset + length)
    return {
      key,
      size: object.size,
      httpMetadata: { contentType: object.contentType },
      body: new Response(bytes).body,
      json: async () => object.body,
      arrayBuffer: async () => bytes.buffer,
    }
  }

  async head(key: string) {
    const object = this.objects.get(key)
    if (!object) return null
    return { size: object.size, httpMetadata: { contentType: object.contentType } }
  }

  async list({ prefix }: { prefix?: string; cursor?: string }) {
    const objects = [...this.objects.keys()]
      .filter((key) => !prefix || key.startsWith(prefix))
      .map((key) => ({ key }))
    return { objects, truncated: false, cursor: undefined }
  }

  async delete(keys: string | string[]) {
    const list = Array.isArray(keys) ? keys : [keys]
    for (const key of list) {
      this.deleted.push(key)
      this.objects.delete(key)
    }
  }
}

const appId = '11111111-1111-4111-8111-111111111111'
const resumeKey = `applications/${appId}/candidate.pdf`
const videoKey = `applications/${appId}/intro-video-candidate.mp4`

function validAnswers() {
  return [
    { id: 'availability', label: 'availability', section: 'Availability', value: 'now' },
    { id: 'salaryExpectation', label: 'salary', section: 'Availability', value: '1000' },
    { id: 'experience', label: 'experience', section: 'Experience', value: '5 years' },
    { id: 'motivation', label: 'motivation', section: 'Motivation', value: 'aligned' },
    { id: 'toolsAiUsage', label: 'tools', section: 'Tools & AI', value: 'AI tools' },
    { id: 'projectControlExample', label: 'project', section: 'Role-specific questions', value: 'example' },
    { id: 'budgetDelayScenario', label: 'budget', section: 'Role-specific questions', value: 'scenario' },
  ]
}

function jsonRequest(path: string, body: unknown) {
  return new Request(`https://intake.test${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function testEnv(bucket = new FakeBucket()) {
  return {
    CAREERS_BUCKET: bucket,
    TURNSTILE_TEST_MODE: 'true',
    R2_S3_ENDPOINT: 'https://example.r2.cloudflarestorage.com',
    R2_ACCESS_KEY_ID: 'test-access-key',
    R2_SECRET_ACCESS_KEY: 'test-secret-key',
    R2_BUCKET_NAME: 'ngh-careers-applications-dev',
  }
}

describe('intake Worker hardening', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-01T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('treats a role as closed from the start of the day after its Bali close date', () => {
    const role = getCareerRole('operations-planning-manager')
    expect(role).toBeDefined()
    expect(isRoleOpenForApplications(role!, new Date('2026-07-20T15:59:59.999Z'))).toBe(true)
    expect(isRoleOpenForApplications(role!, new Date('2026-07-20T16:00:00.000Z'))).toBe(false)
  })

  it('rejects upload preparation after the role close date', async () => {
    vi.setSystemTime(new Date('2026-07-20T16:00:00.000Z'))
    const response = await worker.fetch(
      jsonRequest('/uploads/presign', {
        appId,
        roleSlug: 'operations-planning-manager',
        turnstileToken: 'test-token',
        files: [
          { kind: 'resume', fileName: 'candidate.pdf', size: 1000, contentType: 'application/pdf' },
          { kind: 'introVideo', fileName: 'intro.mp4', size: 1000, contentType: 'video/mp4' },
        ],
      }),
      testEnv() as never,
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'This role is not open for applications.' })
  })

  it('sets no-referrer on normal JSON responses', async () => {
    const response = await worker.fetch(new Request('https://intake.test/health'), testEnv() as never)
    expect(response.status).toBe(200)
    expect(response.headers.get('Referrer-Policy')).toBe('no-referrer')
  })

  it('fails closed when Turnstile secret is missing and explicit test mode is not enabled', async () => {
    const response = await worker.fetch(
      jsonRequest('/uploads/presign', {
        appId,
        roleSlug: 'operations-planning-manager',
        turnstileToken: 'test-token',
        files: [
          { kind: 'resume', fileName: 'john-smith-cv.pdf', size: 1000, contentType: 'application/pdf' },
          { kind: 'introVideo', fileName: 'intro.mp4', size: 1000, contentType: 'video/mp4' },
        ],
      }),
      { CAREERS_BUCKET: new FakeBucket() } as never,
    )

    expect(response.status).toBe(403)
  })

  it('uses the SETUP.md per-appId R2 object contract', async () => {
    const response = await worker.fetch(
      jsonRequest('/uploads/presign', {
        appId,
        roleSlug: 'operations-planning-manager',
        turnstileToken: 'test-token',
        files: [
          { kind: 'resume', fileName: 'Jane Smith CV.pdf', size: 1000, contentType: 'application/pdf' },
          { kind: 'introVideo', fileName: 'Jane Smith Intro.mp4', size: 1000, contentType: 'video/mp4' },
        ],
      }),
      testEnv() as never,
    )

    expect(response.status).toBe(200)
    const body = await response.json() as { uploads: Array<{ key: string; uploadUrl: string }> }
    expect(body.uploads.map((upload) => upload.key)).toEqual([
      `applications/${appId}/jane-smith-cv.pdf`,
      `applications/${appId}/intro-video-jane-smith-intro.mp4`,
    ])
  })

  it('rejects finalize when both signed uploads are not provided', async () => {
    const bucket = new FakeBucket()
    bucket.seedJson(`applications/${appId}/session.json`, {
      appId,
      roleSlug: 'operations-planning-manager',
      createdAt: new Date().toISOString(),
      uploads: [
        { kind: 'resume', fileName: 'candidate.pdf', size: 1000, contentType: 'application/pdf', key: resumeKey },
        { kind: 'introVideo', fileName: 'candidate.mp4', size: 1000, contentType: 'video/mp4', key: videoKey },
      ],
    })

    const response = await worker.fetch(
      jsonRequest('/applications', {
        appId,
        roleSlug: 'operations-planning-manager',
        consentAccepted: true,
        candidate: { name: 'Jane', dateOfBirth: '1991-02-03', email: 'jane@example.com', phone: '+62', location: 'Bali' },
        answers: validAnswers(),
        uploads: [],
      }),
      { CAREERS_BUCKET: bucket } as never,
    )

    expect(response.status).toBe(400)
    const body = await response.json() as { error: string }
    expect(body.error).toMatch(/Exactly one resume and one intro video/)
  })

  it('rejects finalize when the signed session is missing a resume and does not write metadata', async () => {
    const bucket = new FakeBucket()
    bucket.seedJson(`applications/${appId}/session.json`, {
      appId,
      roleSlug: 'operations-planning-manager',
      createdAt: new Date().toISOString(),
      uploads: [
        { kind: 'introVideo', fileName: 'candidate.mp4', size: 1000, contentType: 'video/mp4', key: videoKey },
      ],
    })

    const response = await worker.fetch(
      jsonRequest('/applications', {
        appId,
        roleSlug: 'operations-planning-manager',
        consentAccepted: true,
        candidate: { name: 'Jane', dateOfBirth: '1991-02-03', email: 'jane@example.com', phone: '+62', location: 'Bali' },
        answers: validAnswers(),
        uploads: [
          { kind: 'introVideo', key: videoKey, fileName: 'candidate.mp4', size: 1000, contentType: 'video/mp4' },
        ],
      }),
      { CAREERS_BUCKET: bucket } as never,
    )

    expect(response.status).toBe(400)
    expect(bucket.objects.has(`applications/${appId}/metadata.json`)).toBe(false)
  })

  it('rejects finalize when Date of Birth is missing', async () => {
    const bucket = new FakeBucket()
    bucket.seedJson(`applications/${appId}/session.json`, {
      appId,
      roleSlug: 'operations-planning-manager',
      createdAt: new Date().toISOString(),
      uploads: [
        { kind: 'resume', fileName: 'candidate.pdf', size: 5, contentType: 'application/pdf', key: resumeKey },
        { kind: 'introVideo', fileName: 'candidate.mp4', size: 12, contentType: 'video/mp4', key: videoKey },
      ],
    })

    const response = await worker.fetch(
      jsonRequest('/applications', {
        appId,
        roleSlug: 'operations-planning-manager',
        consentAccepted: true,
        candidate: { name: 'Jane Candidate', email: 'jane@example.com', phone: '+62 812', location: 'Bali' },
        answers: validAnswers(),
        uploads: [
          { kind: 'resume', key: resumeKey, fileName: 'ignored.pdf', size: 5, contentType: 'application/pdf' },
          { kind: 'introVideo', key: videoKey, fileName: 'ignored.mp4', size: 12, contentType: 'video/mp4' },
        ],
      }),
      testEnv(bucket) as never,
    )

    expect(response.status).toBe(400)
    const body = await response.json() as { error: string }
    expect(body.error).toBe('Candidate date of birth is required.')
    expect(bucket.objects.has(`applications/${appId}/metadata.json`)).toBe(false)
  })

  it('writes metadata.json and sends only the secondary Telegram ping on finalize', async () => {
    const bucket = new FakeBucket()
    bucket.seedJson(`applications/${appId}/session.json`, {
      appId,
      roleSlug: 'operations-planning-manager',
      createdAt: new Date().toISOString(),
      uploads: [
        { kind: 'resume', fileName: 'candidate.pdf', size: 5, contentType: 'application/pdf', key: resumeKey },
        { kind: 'introVideo', fileName: 'candidate.mp4', size: 12, contentType: 'video/mp4', key: videoKey },
      ],
    })
    bucket.seedJson('applications/22222222-2222-4222-8222-222222222222/metadata.json', {
      appId: '22222222-2222-4222-8222-222222222222',
      roleSlug: 'operations-planning-manager',
      roleCloseDate: '2099-12-31',
      ref: 'OPM-AAAA',
    })
    bucket.seedFile(resumeKey, new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]))
    bucket.seedFile(videoKey, new Uint8Array([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d]))
    let randomCall = 0
    vi.spyOn(crypto, 'getRandomValues').mockImplementation((array: ArrayBufferView) => {
      const bytes = new Uint8Array(array.buffer, array.byteOffset, array.byteLength)
      bytes.set(randomCall === 0 ? [0, 0, 0, 0] : [1, 1, 1, 1])
      randomCall += 1
      return array
    })

    const calls: Array<{ url: string; body: unknown }> = []
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ url: String(input), body: init?.body ? JSON.parse(String(init.body)) : null })
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }))

    const response = await worker.fetch(
      jsonRequest('/applications', {
        appId,
        roleSlug: 'operations-planning-manager',
        consentAccepted: true,
        candidate: { name: 'Jane Candidate', dateOfBirth: '1991-02-03', email: 'jane@example.com', phone: '+62 812', location: 'Bali' },
        answers: validAnswers(),
        uploads: [
          { kind: 'resume', key: resumeKey, fileName: 'ignored.pdf', size: 5, contentType: 'application/pdf' },
          { kind: 'introVideo', key: videoKey, fileName: 'ignored.mp4', size: 12, contentType: 'video/mp4' },
        ],
      }),
      {
        ...testEnv(bucket),
        TELEGRAM_NOTIFY_BOT_TOKEN: 'test-telegram-token',
        TELEGRAM_NOTIFY_CHAT_ID: 'sandbox-group',
      } as never,
    )

    expect(response.status).toBe(200)
    expect(calls.some((call) => call.url.includes('/emails'))).toBe(false)
    const metadata = bucket.objects.get(`applications/${appId}/metadata.json`)?.body as { ref: string; roleCode: string; applicantName: string; applicantDateOfBirth: string; applicantEmail: string; applicantPhone: string; role: string; cvKey: string; videoUrl: string; answers: Record<string, string> }
    expect(metadata).toMatchObject({
      ref: 'OPM-BBBB',
      roleCode: 'OPM',
      applicantName: 'Jane Candidate',
      applicantDateOfBirth: '1991-02-03',
      applicantEmail: 'jane@example.com',
      applicantPhone: '+62 812',
      role: 'Operations & Planning Manager',
      cvKey: resumeKey,
    })
    expect(metadata.answers.availability).toBe('now')
    expect(appId).not.toContain(metadata.ref.replace('OPM-', ''))
    expect(metadata.videoUrl).toContain(videoKey)

    const telegram = calls.find((call) => call.url.includes('api.telegram.org'))?.body as { text: string }
    expect(telegram.text).toContain('New Operations & Planning Manager application · Ref OPM-BBBB')
    expect(telegram.text).toContain(`CV link: https://apply.nghpropertygroup.com/applicants/${appId}/cv`)
    expect(telegram.text).toContain(`Video link: https://apply.nghpropertygroup.com/applicants/${appId}/video`)
    expect(telegram.text).not.toContain('Application ID:')
    expect(telegram.text).not.toContain('OPM-AAAA')
    expect(telegram.text).not.toContain('Jane Candidate')
    expect(telegram.text).not.toContain('jane@example.com')
    expect(telegram.text).not.toContain('+62 812')
    expect(telegram.text).not.toContain('1991-02-03')
    expect(telegram.text).not.toContain('Date of Birth')
    expect(telegram.text).not.toContain('DOB')
    expect(telegram.text).not.toContain('Name:')
    expect(telegram.text).not.toContain('Email:')
    expect(telegram.text).not.toContain('Phone:')
    expect(telegram.text).not.toContain('Submitted:')
  })

  it('streams private CV and video objects through durable applicant routes', async () => {
    const bucket = new FakeBucket()
    const videoBytes = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    bucket.seedJson(`applications/${appId}/metadata.json`, {
      appId,
      cvKey: resumeKey,
      videoKey,
    })
    bucket.seedFile(resumeKey, new Uint8Array([0x25, 0x50, 0x44, 0x46]), 'application/pdf')
    bucket.seedFile(videoKey, videoBytes, 'video/mp4')

    const cvResponse = await worker.fetch(new Request(`https://intake.test/applicants/${appId}/cv`), testEnv(bucket) as never)
    expect(cvResponse.status).toBe(200)
    expect(cvResponse.headers.get('Cache-Control')).toBe('private, no-store')
    expect(cvResponse.headers.get('X-Robots-Tag')).toBe('noindex')
    expect(cvResponse.headers.get('Referrer-Policy')).toBe('no-referrer')
    expect(cvResponse.headers.get('Content-Disposition')).toBe('attachment; filename="candidate.pdf"')
    expect(new Uint8Array(await cvResponse.arrayBuffer())).toEqual(new Uint8Array([0x25, 0x50, 0x44, 0x46]))

    const videoResponse = await worker.fetch(
      new Request(`https://intake.test/applicants/${appId}/video`, { headers: { Range: 'bytes=2-5' } }),
      testEnv(bucket) as never,
    )
    expect(videoResponse.status).toBe(206)
    expect(videoResponse.headers.get('Cache-Control')).toBe('private, no-store')
    expect(videoResponse.headers.get('X-Robots-Tag')).toBe('noindex')
    expect(videoResponse.headers.get('Referrer-Policy')).toBe('no-referrer')
    expect(videoResponse.headers.get('Content-Disposition')).toBe('inline')
    expect(videoResponse.headers.get('Content-Range')).toBe('bytes 2-5/10')
    expect(videoResponse.headers.get('Accept-Ranges')).toBe('bytes')
    expect(new Uint8Array(await videoResponse.arrayBuffer())).toEqual(new Uint8Array([2, 3, 4, 5]))
  })

  it('rejects invalid applicant route UUIDs before R2 lookup', async () => {
    const response = await worker.fetch(new Request('https://intake.test/applicants/not-a-uuid/cv'), testEnv() as never)
    expect(response.status).toBe(400)
  })
})
