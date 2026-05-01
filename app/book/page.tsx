'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function BookPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #1a1a1a 0%, #2c2c2c 100%)',
        color: '#f5f0e8',
      }}
    >
      {/* Hero Section */}
      <section
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '120px 24px 60px',
          textAlign: 'center',
        }}
      >
        {/* Logo */}
        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: 14,
            letterSpacing: 4,
            color: '#c4a265',
            marginBottom: 8,
            textTransform: 'uppercase',
          }}
        >
          NGH Property Group
        </p>

        <h1
          style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 700,
            lineHeight: 1.2,
            marginBottom: 20,
            color: '#f5f0e8',
          }}
        >
          Schedule a Personal <br />
          <span style={{ color: '#c4a265' }}>Investment Consultation</span>
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: 18,
            lineHeight: 1.7,
            color: '#b5a58a',
            maxWidth: 640,
            margin: '0 auto 48px',
          }}
        >
          Discover premium real estate opportunities in Bali. Our team will
          guide you through investment options, expected returns, and ownership
          structures — tailored to your goals.
        </p>

        {/* Key Stats */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 40,
            flexWrap: 'wrap',
            marginBottom: 60,
          }}
        >
          {[
            { value: '15%', label: 'Expected ROI' },
            { value: '€112,500', label: 'Starting From' },
            { value: '12-18', label: 'Months Build Time' },
            { value: '30yr', label: 'Leasehold' },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center', minWidth: 120 }}>
              <p
                style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: 32,
                  fontWeight: 700,
                  color: '#c4a265',
                  marginBottom: 4,
                }}
              >
                {stat.value}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: 13,
                  color: '#b5a58a',
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div
          style={{
            width: 80,
            height: 2,
            background: '#c4a265',
            margin: '0 auto 48px',
          }}
        />

        {/* Why Book Section */}
        <div
          style={{
            maxWidth: 700,
            margin: '0 auto 60px',
            textAlign: 'left',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 28,
              color: '#f5f0e8',
              marginBottom: 30,
              textAlign: 'center',
            }}
          >
            Why Schedule a Consultation?
          </h2>

          {[
            {
              title: 'Personalized Investment Strategy',
              desc: 'We tailor our advice to your budget, timeline, and investment goals — whether you want rental income, personal use, or both.',
            },
            {
              title: 'Full Transparency, No Hidden Costs',
              desc: 'What we quote is what you pay. We walk you through every cost upfront — land lease, construction, furnishing, permits.',
            },
            {
              title: 'Dutch Building Standards in Bali',
              desc: 'Reinforced concrete, premium materials, and European project management. Built to last, designed to impress.',
            },
            {
              title: 'Turnkey Delivery',
              desc: 'Your property is delivered fully furnished and rental-ready. We handle everything from permits to pool installation.',
            },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                display: 'flex',
                gap: 16,
                marginBottom: 28,
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'rgba(196, 162, 101, 0.15)',
                  border: '1.5px solid #c4a265',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2,
                  color: '#c4a265',
                  fontSize: 14,
                }}
              >
                ✓
              </div>
              <div>
                <p
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: 17,
                    fontWeight: 600,
                    color: '#f5f0e8',
                    marginBottom: 4,
                  }}
                >
                  {item.title}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: 15,
                    color: '#b5a58a',
                    lineHeight: 1.6,
                  }}
                >
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div
          style={{
            width: 80,
            height: 2,
            background: '#c4a265',
            margin: '0 auto 48px',
          }}
        />

        {/* Calendly Embed */}
        <h2
          style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 28,
            color: '#f5f0e8',
            marginBottom: 8,
          }}
        >
          Pick a Time That Works for You
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: 16,
            color: '#b5a58a',
            marginBottom: 32,
          }}
        >
          30-minute video call with our investment team
        </p>

        <div
          className="calendly-inline-widget"
          data-url="https://calendly.com/nghpropertygroup?hide_gdpr_banner=1&background_color=2c2c2c&text_color=f5f0e8&primary_color=c4a265"
          style={{
            minWidth: 320,
            height: 700,
            maxWidth: 900,
            margin: '0 auto',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        />
        <Script
          src="https://assets.calendly.com/assets/external/widget.js"
          strategy="lazyOnload"
        />

        {/* Bottom CTA */}
        <div style={{ marginTop: 60, marginBottom: 80 }}>
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: 15,
              color: '#b5a58a',
              marginBottom: 16,
            }}
          >
            Prefer to reach out directly?
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 24,
              flexWrap: 'wrap',
            }}
          >
            <a
              href="https://api.whatsapp.com/send/?phone=6285190520175"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 28px',
                background: '#25D366',
                color: '#fff',
                borderRadius: 8,
                fontFamily: 'var(--font-inter)',
                fontSize: 15,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp Us
            </a>
            <a
              href="mailto:info@nghpropertygroup.com"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 28px',
                background: 'transparent',
                color: '#c4a265',
                border: '1.5px solid #c4a265',
                borderRadius: 8,
                fontFamily: 'var(--font-inter)',
                fontSize: 15,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Email Us
            </a>
          </div>
        </div>

        {/* Footer note */}
        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: 13,
            color: 'rgba(181, 165, 138, 0.5)',
            marginBottom: 40,
          }}
        >
          NGH Property Group — Real Estate Development in Bali, Built on Dutch
          Standards
        </p>
      </section>
    </main>
  );
}
