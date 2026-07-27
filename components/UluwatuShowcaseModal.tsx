'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

/**
 * Full-screen "site within a site" viewer — awwwards-style.
 * Embeds the archived Uluwatu Paradise website in a framed browser window so the
 * original design is preserved and showcased from nghpropertygroup.com.
 *
 * The framed content is loaded from the archive host, but that URL is never shown
 * to the visitor: the chrome address bar reads the live brand domain, and every
 * "visit" affordance routes to the new website (uluwatuparadise.com).
 */

// Archived site rendered inside the frame (not shown as a link anywhere).
export const LEGACY_ULUWATU_URL = 'https://legacy.uluwatuparadise.com/';
// The one link visitors are ever sent to.
export const NEW_ULUWATU_URL = 'https://uluwatuparadise.com/';
// What the fake browser chrome displays — the live brand domain, never the archive host.
const DISPLAY_HOST = 'uluwatuparadise.com';

const GOLD = '#C6A96C';
const CREAM = '#F5F3EE';
const INK = '#141414';

export default function UluwatuShowcaseModal({
  open,
  onClose,
  url = LEGACY_ULUWATU_URL,
}: {
  open: boolean;
  onClose: () => void;
  url?: string;
}) {
  const reduce = useReducedMotion();
  const [loaded, setLoaded] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Esc to close + lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    setLoaded(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // move focus into the dialog for keyboard users
    const t = window.setTimeout(() => closeRef.current?.focus(), 60);
    // The framed site is media-heavy, so its full `load` event fires late (all
    // images + videos). Don't make the visitor stare at a spinner until then —
    // reveal the frame once it has had time to paint its first content, so they
    // watch it fill in progressively instead of waiting on a blank screen.
    const reveal = window.setTimeout(() => setLoaded(true), 1400);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(t);
      window.clearTimeout(reveal);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Uluwatu Paradise website"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.3 }}
          style={{
            background:
              'radial-gradient(120% 120% at 50% 0%, rgba(30,30,30,0.92) 0%, rgba(10,10,10,0.97) 60%, rgba(6,6,6,0.98) 100%)',
            backdropFilter: 'blur(6px)',
          }}
          onClick={onClose}
        >
          {/* Top chrome bar */}
          <div
            className="flex items-center gap-4 px-4 sm:px-6 py-3 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* traffic lights */}
            <div className="hidden sm:flex items-center gap-2" aria-hidden>
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff5f57' }} />
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#febc2e' }} />
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#28c840' }} />
            </div>

            {/* address pill — shows the live brand domain, never the archive host */}
            <div
              className="flex-1 min-w-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm truncate"
              style={{ backgroundColor: 'rgba(255,255,255,0.07)', color: 'rgba(245,243,238,0.72)' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span className="truncate">{DISPLAY_HOST}</span>
            </div>

            {/* Visit site — always the new website */}
            <a
              href={NEW_ULUWATU_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium tracking-[0.1em] uppercase transition-transform duration-200 hover:scale-105"
              style={{ backgroundColor: GOLD, color: INK }}
            >
              Visit site
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M7 17L17 7M17 7H8M17 7v9" />
              </svg>
            </a>

            {/* Close */}
            <button
              ref={closeRef}
              onClick={onClose}
              aria-label="Close"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full transition-colors duration-200"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: CREAM }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {/* Framed viewport */}
          <motion.div
            className="relative flex-1 mx-2 mb-2 sm:mx-4 sm:mb-4 rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.985 }}
            transition={{ duration: reduce ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{ backgroundColor: CREAM, boxShadow: '0 40px 120px rgba(0,0,0,0.55)' }}
          >
            {/* loading shimmer until the archived site paints; fades out on reveal */}
            <AnimatePresence>
              {!loaded && (
                <motion.div
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4"
                  style={{ color: '#8A8F83', backgroundColor: CREAM }}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduce ? 0 : 0.4 }}
                >
                  <motion.div
                    className="w-10 h-10 rounded-full border-2"
                    style={{ borderColor: GOLD, borderTopColor: 'transparent' }}
                    animate={reduce ? {} : { rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                  />
                  <span className="text-xs uppercase tracking-[0.2em]">Loading Uluwatu Paradise</span>
                </motion.div>
              )}
            </AnimatePresence>
            <iframe
              key={url}
              src={url}
              title="Uluwatu Paradise website"
              className="w-full h-full border-0"
              onLoad={() => setLoaded(true)}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              referrerPolicy="no-referrer"
              loading="eager"
            />
          </motion.div>

          {/* mobile Visit-site (chrome hides it on small screens) */}
          <a
            href={NEW_ULUWATU_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="sm:hidden mx-2 mb-2 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full text-xs font-medium tracking-[0.1em] uppercase"
            style={{ backgroundColor: GOLD, color: INK }}
          >
            Open Uluwatu Paradise in new tab
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M7 17L17 7M17 7H8M17 7v9" />
            </svg>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
