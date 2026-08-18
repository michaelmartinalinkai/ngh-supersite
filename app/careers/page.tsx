import type { Metadata } from 'next'
import Link from 'next/link'
import { careerRoles, isRoleOpenForApplications } from '@/data/careers'

export const metadata: Metadata = {
  title: 'Careers at NGH Property Group',
  description: 'Explore current career opportunities at NGH Property Group and apply with your CV, questionnaire answers, and intro video.',
}

export default function CareersPage() {
  const roles = careerRoles

  return (
    <main className="min-h-screen bg-[#F5F3EE] text-[#1F1F1F]">
      <section className="bg-[#1F1F1F] px-6 pb-20 pt-32 text-[#F5F3EE] lg:px-8 lg:pt-40">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 h-[2px] w-12 bg-[#C6A96C]" />
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.28em] text-[#C6A96C]">
            Careers at NGH
          </p>
          <h1 className="max-w-4xl text-4xl font-light leading-tight md:text-6xl" style={{ fontFamily: 'var(--font-serif)' }}>
            Build the future of real estate development in Bali.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#D4D0C8]">
            Join a team combining Dutch construction standards, disciplined execution, hospitality, and AI-supported operations.
          </p>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#C6A96C]">Job postings</p>
              <h2 className="mt-3 text-3xl font-light md:text-4xl" style={{ fontFamily: 'var(--font-serif)' }}>
                Opportunities at NGH
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-[#4A4A4A]">
              Each application includes the locked NGH questionnaire, CV upload, intro-video upload, consent, and anti-bot verification.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
              <article key={role.slug} className="flex min-h-[360px] flex-col rounded-3xl border border-[#C8B9A6]/40 bg-white/75 p-6 shadow-sm">
                <div className="mb-6 flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em]">
                  <span className="rounded-full bg-[#1F1F1F] px-3 py-1 text-[#F5F3EE]">{role.type}</span>
                  <span className="rounded-full border border-[#C8B9A6] px-3 py-1 text-[#6F6A60]">{role.department}</span>
                  <span className={`rounded-full px-3 py-1 ${isRoleOpenForApplications(role) ? 'bg-[#DCE7D3] text-[#365131]' : 'bg-[#EEEAE2] text-[#6F6A60]'}`}>
                    {isRoleOpenForApplications(role) ? 'Applications open' : 'Applications closed'}
                  </span>
                </div>
                <h3 className="text-2xl font-light leading-tight" style={{ fontFamily: 'var(--font-serif)' }}>
                  {role.title}
                </h3>
                <p className="mt-3 text-sm text-[#6F6A60]">{role.location}</p>
                <div className="mt-5 flex-1 space-y-3 text-sm leading-relaxed text-[#4A4A4A]">
                  {(role.summary ?? [role.description]).map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                <div className="mt-6 border-t border-[#C8B9A6]/40 pt-5 text-xs text-[#6F6A60]">
                  Role close date: <span className="text-[#1F1F1F]">{role.closingDate}</span>
                </div>
                <Link
                  href={`/careers/${role.slug}`}
                  className="mt-5 inline-flex items-center justify-center rounded-full bg-[#1F1F1F] px-5 py-3 text-sm font-medium uppercase tracking-[0.18em] text-[#F5F3EE] transition hover:bg-[#C6A96C] hover:text-[#1F1F1F]"
                >
                  View position
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
