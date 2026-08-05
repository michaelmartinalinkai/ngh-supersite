'use client'

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import type { CareerQuestion, CareerRole } from '@/data/careers'
import { isRoleOpenForApplications } from '@/data/careers'

type UploadKind = 'resume' | 'introVideo'
type UploadDescriptor = {
  kind: UploadKind
  fileName: string
  size: number
  contentType: string
}
type PresignResponse = {
  appId: string
  expiresAt: string
  uploads: Array<{ kind: UploadKind; key: string; uploadUrl: string }>
}
type FinalizeResponse = {
  ok: boolean
  appId: string
  ref?: string
}

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: Record<string, unknown>) => string
      reset: (widgetId?: string) => void
    }
  }
}

const apiBaseUrl = process.env.NEXT_PUBLIC_CAREERS_API_BASE_URL || 'https://apply.nghpropertygroup.com'
const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '0x4AAAAAADxWtmNSBt1hDWg6'

function groupQuestions(questions: CareerQuestion[]) {
  return questions.reduce<Record<string, CareerQuestion[]>>((groups, question) => {
    groups[question.section] ||= []
    groups[question.section].push(question)
    return groups
  }, {})
}

function getQuestionValue(formData: FormData, question: CareerQuestion) {
  if (question.type === 'checkbox') {
    return formData.getAll(question.id).map(String)
  }
  return String(formData.get(question.id) || '').trim()
}

function inputClass() {
  return 'mt-2 w-full rounded-2xl border border-[#C8B9A6]/60 bg-white px-4 py-3 text-sm text-[#1F1F1F] outline-none transition focus:border-[#C6A96C] focus:ring-2 focus:ring-[#C6A96C]/20'
}

export default function ApplicationForm({ role, questions }: { role: CareerRole; questions: CareerQuestion[] }) {
  const groupedQuestions = useMemo(() => groupQuestions(questions), [questions])
  const turnstileRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | undefined>(undefined)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [isOpen, setIsOpen] = useState(() => isRoleOpenForApplications(role))
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const refreshAvailability = () => setIsOpen(isRoleOpenForApplications(role))
    refreshAvailability()
    const timer = window.setInterval(refreshAvailability, 60_000)
    return () => window.clearInterval(timer)
  }, [role])

  useEffect(() => {
    if (!isOpen) return
    const scriptId = 'cf-turnstile-script'
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.defer = true
      document.body.appendChild(script)
    }

    const timer = window.setInterval(() => {
      if (turnstileRef.current && window.turnstile && !widgetIdRef.current) {
        widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
          sitekey: turnstileSiteKey,
          callback: (token: string) => setTurnstileToken(token),
          'expired-callback': () => setTurnstileToken(''),
          'error-callback': () => setTurnstileToken(''),
        })
        window.clearInterval(timer)
      }
    }, 250)

    return () => window.clearInterval(timer)
  }, [])

  async function requestPresignedUploads(appId: string, files: UploadDescriptor[]) {
    const response = await fetch(`${apiBaseUrl}/uploads/presign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appId, roleSlug: role.slug, turnstileToken, files }),
    })
    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      throw new Error(body.error || 'Could not prepare secure uploads.')
    }
    return (await response.json()) as PresignResponse
  }

  async function uploadDirect(uploadUrl: string, file: File) {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    })
    if (!response.ok) {
      throw new Error('Secure file upload failed. Please try again.')
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isRoleOpenForApplications(role)) {
      setIsOpen(false)
      setStatus('error')
      setMessage('Applications for this role are now closed.')
      return
    }
    setStatus('submitting')
    setMessage('Preparing secure upload...')

    try {
      const form = event.currentTarget
      const formData = new FormData(form)
      const resume = formData.get('resume')
      const introVideo = formData.get('introVideo')
      const privacyAcknowledged = formData.get('consent') === 'on'

      if (!(resume instanceof File) || resume.size === 0) throw new Error('Please upload your CV or resume.')
      if (!(introVideo instanceof File) || introVideo.size === 0) throw new Error('Please upload your intro video.')
      if (!privacyAcknowledged) throw new Error('Please confirm you have read and understood the Privacy Notice before submitting.')
      if (!turnstileToken) throw new Error('Please complete the anti-bot verification.')

      const appId = crypto.randomUUID()
      const files: UploadDescriptor[] = [
        { kind: 'resume', fileName: resume.name, size: resume.size, contentType: resume.type || 'application/octet-stream' },
        { kind: 'introVideo', fileName: introVideo.name, size: introVideo.size, contentType: introVideo.type || 'application/octet-stream' },
      ]

      const presigned = await requestPresignedUploads(appId, files)
      const resumeUpload = presigned.uploads.find((upload) => upload.kind === 'resume')
      const videoUpload = presigned.uploads.find((upload) => upload.kind === 'introVideo')
      if (!resumeUpload || !videoUpload) throw new Error('Upload preparation did not return all file links.')

      setMessage('Uploading resume...')
      await uploadDirect(resumeUpload.uploadUrl, resume)
      setMessage('Uploading intro video...')
      await uploadDirect(videoUpload.uploadUrl, introVideo)

      const answers = questions.map((question) => ({
        id: question.id,
        label: question.label,
        section: question.section,
        value: getQuestionValue(formData, question),
      }))

      setMessage('Submitting application...')
      const finalizeResponse = await fetch(`${apiBaseUrl}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId,
          roleSlug: role.slug,
          consentAccepted: privacyAcknowledged,
          candidate: {
            name: String(formData.get('name') || '').trim(),
            dateOfBirth: String(formData.get('dateOfBirth') || '').trim(),
            email: String(formData.get('email') || '').trim(),
            phone: String(formData.get('phone') || '').trim(),
            location: String(formData.get('location') || '').trim(),
          },
          answers,
          uploads: [
            { kind: 'resume', key: resumeUpload.key, fileName: resume.name, size: resume.size, contentType: resume.type || 'application/octet-stream' },
            { kind: 'introVideo', key: videoUpload.key, fileName: introVideo.name, size: introVideo.size, contentType: introVideo.type || 'application/octet-stream' },
          ],
        }),
      })

      if (!finalizeResponse.ok) {
        const body = await finalizeResponse.json().catch(() => ({}))
        throw new Error(body.error || 'Application submission failed after upload.')
      }

      const finalizeBody = await finalizeResponse.json().catch(() => ({})) as Partial<FinalizeResponse>

      setStatus('success')
      setMessage(`Application received. Your reference is ${finalizeBody.ref || appId}.`)
      form.reset()
      setTurnstileToken('')
      window.turnstile?.reset(widgetIdRef.current)
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    }
  }

  function renderQuestion(question: CareerQuestion) {
    const common = {
      id: question.id,
      name: question.id,
      required: question.required,
      className: inputClass(),
      placeholder: question.placeholder,
    }

    if (question.type === 'textarea') {
      return <textarea {...common} rows={5} />
    }

    if (question.type === 'select') {
      return (
        <select {...common}>
          <option value="">Select...</option>
          {question.options?.map((option) => <option key={option}>{option}</option>)}
        </select>
      )
    }

    return <input {...common} type={question.type === 'scale' ? 'number' : question.type} min={question.type === 'scale' ? 1 : undefined} max={question.type === 'scale' ? 10 : undefined} />
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-[#C8B9A6]/40 bg-white/85 p-6 shadow-sm md:p-8">
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#C6A96C]">Secure application</p>
        <h2 className="mt-3 text-3xl font-light" style={{ fontFamily: 'var(--font-serif)' }}>
          Apply for {role.title}
        </h2>
      </div>

      {!isOpen ? (
        <p role="status" className="mb-8 rounded-2xl bg-[#F5F3EE] p-4 text-sm leading-relaxed text-[#4A4A4A]">
          Applications for this role closed on {role.closingDate}.
        </p>
      ) : null}

      <fieldset className="mb-8 border-t border-[#C8B9A6]/40 pt-6">
        <legend className="mb-4 text-lg font-medium">Personal information</legend>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium">Full name *<input name="name" required className={inputClass()} /></label>
          <label className="text-sm font-medium">Date of Birth *<input name="dateOfBirth" type="date" required className={inputClass()} /></label>
          <label className="text-sm font-medium">Email *<input name="email" type="email" required className={inputClass()} /></label>
          <label className="text-sm font-medium">Phone / WhatsApp *<input name="phone" type="tel" required className={inputClass()} /></label>
          <label className="text-sm font-medium">Current location *<input name="location" required className={inputClass()} /></label>
        </div>
      </fieldset>

      {Object.entries(groupedQuestions).map(([section, sectionQuestions]) => (
        <fieldset key={section} className="mb-8 border-t border-[#C8B9A6]/40 pt-6">
          <legend className="mb-4 text-lg font-medium">{section}</legend>
          <div className="space-y-5">
            {sectionQuestions.map((question) => (
              <label key={question.id} className="block text-sm font-medium">
                {question.label}{question.required ? ' *' : ''}
                {question.helpText ? <span className="mt-1 block text-xs font-normal text-[#6F6A60]">{question.helpText}</span> : null}
                {renderQuestion(question)}
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      <fieldset className="mb-8 border-t border-[#C8B9A6]/40 pt-6">
        <legend className="mb-4 text-lg font-medium">Uploads</legend>
        <div className="space-y-5">
          <label className="block text-sm font-medium">
            CV / resume, PDF/DOC/DOCX, max 10MB *
            <input name="resume" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required className={inputClass()} />
          </label>
          <label className="block text-sm font-medium">
            Intro video, MP4/MOV/WEBM, max 100MB *
            <input name="introVideo" type="file" accept=".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm" required className={inputClass()} />
          </label>
        </div>
      </fieldset>

      <div className="mb-6 rounded-2xl border border-[#C8B9A6]/50 bg-[#F5F3EE] p-4 text-sm leading-relaxed text-[#4A4A4A]">
        <label className="flex gap-3">
          <input name="consent" type="checkbox" required className="mt-1 h-4 w-4 flex-none accent-[#C6A96C]" />
          <span>
            I confirm that I have read and understood the{' '}
            <a href="/privacy" target="_blank" rel="noreferrer" className="font-medium text-[#1F1F1F] underline decoration-[#C6A96C] underline-offset-4">
              Privacy Notice
            </a>
            .
          </span>
        </label>
      </div>

      <div className="mb-6" ref={turnstileRef} />

      <button
        type="submit"
        disabled={!isOpen || status === 'submitting'}
        className="w-full rounded-full bg-[#1F1F1F] px-6 py-4 text-sm font-medium uppercase tracking-[0.18em] text-[#F5F3EE] transition hover:bg-[#C6A96C] hover:text-[#1F1F1F] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {!isOpen ? 'Applications closed' : status === 'submitting' ? 'Submitting...' : 'Submit application'}
      </button>

      {message ? (
        <p className={`mt-4 rounded-2xl p-4 text-sm ${status === 'error' ? 'bg-red-50 text-red-700' : status === 'success' ? 'bg-green-50 text-green-700' : 'bg-[#F5F3EE] text-[#4A4A4A]'}`}>
          {message}
        </p>
      ) : null}
    </form>
  )
}
