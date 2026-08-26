'use client'

import { motion, useInView } from 'framer-motion'
import Image from 'next/image'
import { useRef } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface StackedCard {
  id: string
  title: string
  subtitle?: string
  description: string
  image: string
  badge?: string
  price?: string
  specs?: { label: string; value: string }[]
}

interface StackedDeckProps {
  cards: StackedCard[]
  className?: string
}

// ─── Brand tokens ────────────────────────────────────────────────────────────

const COLORS = {
  cream: '#F5F3EE',
  charcoal: '#1F1F1F',
  sand: '#C8B9A6',
  olive: '#8A8F83',
  gold: '#C6A96C',
} as const

// ─── Responsive CSS (injected once) ─────────────────────────────────────────

const RESPONSIVE_CSS = `
  @media (max-width: 768px) {
    [data-ngh-card] {
      min-height: 55vh !important;
      top: 60px !important;
      border-radius: 16px !important;
    }
  }
`

// ─── Single card ─────────────────────────────────────────────────────────────

function StackedCardItem({
  card,
  index,
  total,
}: {
  card: StackedCard
  index: number
  total: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <div
      ref={ref}
      style={{
        position: 'sticky',
        top: 80,
        zIndex: index + 1,
        marginBottom: '2rem',
      }}
    >
      <div
        className="group"
        data-ngh-card=""
        style={{
          position: 'relative',
          minHeight: '80vh',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
        }}
      >
      {/* ── Background image ── */}
      <Image
        src={card.image}
        alt={card.title}
        fill
        sizes="(max-width: 768px) 100vw, 1200px"
        style={{ objectFit: 'cover' }}
        priority={index < 2}
      />

      {/* ── Gradient overlay (kept light so photos stay visible) ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(
            to top,
            rgba(31,31,31,0.75) 0%,
            rgba(31,31,31,0.35) 30%,
            transparent 55%
          )`,
          pointerEvents: 'none',
        }}
      />

      {/* ── Content ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 'clamp(1.5rem, 4vw, 2.5rem)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Counter */}
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
            style={{
              display: 'block',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.75rem',
              letterSpacing: '0.35em',
              textTransform: 'uppercase' as const,
              color: COLORS.gold,
              marginBottom: '0.75rem',
            }}
          >
            {String(index + 1).padStart(2, '0')} /{' '}
            {String(total).padStart(2, '0')}
          </motion.span>

          {/* Title — words never break mid-word */}
          <h3
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(1.75rem, 5vw, 3.25rem)',
              fontWeight: 400,
              letterSpacing: '-0.01em',
              color: '#FFFFFF',
              lineHeight: 1.1,
              marginBottom: '0.5rem',
              wordBreak: 'keep-all' as const,
              overflowWrap: 'normal' as const,
            }}
          >
            {card.title.split(' ').map((word, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  whiteSpace: 'nowrap' as const,
                  marginRight: '0.35em',
                }}
              >
                {word}
              </span>
            ))}
          </h3>

          {/* Subtitle */}
          {card.subtitle && (
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 'clamp(0.85rem, 2vw, 1.05rem)',
                color: COLORS.sand,
                marginBottom: '0.5rem',
                letterSpacing: '0.02em',
              }}
            >
              {card.subtitle}
            </p>
          )}

          {/* Description */}
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
              color: 'rgba(255,255,255,0.88)',
              lineHeight: 1.65,
              maxWidth: 560,
              marginBottom: card.price || card.specs ? '1.25rem' : 0,
            }}
          >
            {card.description}
          </p>

          <a
            href="#contact"
            className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-[#C6A96C] bg-[#C6A96C] px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#1F1F1F] transition-all duration-300 hover:border-[#F5F3EE] hover:bg-[#F5F3EE] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F5F3EE] md:pointer-events-none md:translate-y-2 md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:pointer-events-auto md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100"
          >
            Enquire now
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>

          {/* Price badge */}
          {card.price && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={
                inView
                  ? {
                      opacity: 1,
                      boxShadow: [
                        `0 0 0px ${COLORS.gold}44`,
                        `0 0 14px ${COLORS.gold}44`,
                        `0 0 0px ${COLORS.gold}44`,
                      ],
                    }
                  : {}
              }
              transition={{
                opacity: { duration: 0.4, delay: 0.3 },
                boxShadow: {
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
              style={{
                display: 'inline-block',
                background: COLORS.gold,
                color: COLORS.charcoal,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '0.9rem',
                padding: '0.5rem 1.25rem',
                borderRadius: 999,
                marginBottom: card.specs ? '1.25rem' : 0,
              }}
            >
              {card.price}
            </motion.span>
          )}

          {/* Badge (e.g. "Nieuw", "Exclusief") */}
          {card.badge && !card.price && (
            <span
              style={{
                display: 'inline-block',
                border: `1px solid ${COLORS.gold}`,
                color: COLORS.gold,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '0.8rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
                padding: '0.35rem 1rem',
                borderRadius: 999,
                marginBottom: card.specs ? '1.25rem' : 0,
              }}
            >
              {card.badge}
            </span>
          )}

          {/* Specs grid */}
          {card.specs && card.specs.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '0.75rem 1.5rem',
                maxWidth: 480,
              }}
            >
              {card.specs.map((spec) => (
                <div key={spec.label}>
                  <span
                    style={{
                      display: 'block',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.7rem',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase' as const,
                      color: COLORS.sand,
                      marginBottom: '0.15rem',
                    }}
                  >
                    {spec.label}
                  </span>
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.95rem',
                      fontWeight: 500,
                      color: '#FFFFFF',
                    }}
                  >
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
      </div>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function StackedDeck({ cards, className }: StackedDeckProps) {
  return (
    <section
      className={className}
      style={{
        position: 'relative',
        padding: '0 1rem',
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      {/* Responsive overrides */}
      <style dangerouslySetInnerHTML={{ __html: RESPONSIVE_CSS }} />

      {cards.map((card, i) => (
        <StackedCardItem
          key={card.id}
          card={card}
          index={i}
          total={cards.length}
        />
      ))}
    </section>
  )
}
