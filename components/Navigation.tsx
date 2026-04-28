'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const NAV_LINKS = [
  { label: 'HOME', href: '#hero' },
  { label: 'OPPORTUNITIES', href: '#opportunities' },
  { label: 'OUR EDGE', href: '#our-edge' },
  { label: 'INSIGHTS', href: '#insights' },
  { label: 'BALI GUIDE', href: '#investor-guide' },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [navVisible, setNavVisible] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 60);
      // Only show nav after user has scrolled past the logo intro (~300px)
      setNavVisible(y > 280);
    };

    // Check on mount too
    setNavVisible(window.scrollY > 280);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track active section via IntersectionObserver
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const sectionIds = ['hero', 'opportunities', 'our-edge', 'insights', 'contact'];
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        { threshold: 0.3, rootMargin: '-80px 0px 0px 0px' }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault();
      setMobileOpen(false);
      const id = href.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    []
  );

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          backgroundColor: scrolled ? 'rgba(245, 243, 238, 0.95)' : 'rgba(31, 31, 31, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: scrolled ? '1px solid rgba(200, 185, 166, 0.3)' : '1px solid rgba(198,169,108,0.2)',
          opacity: navVisible ? 1 : 0,
          pointerEvents: navVisible ? 'auto' : 'none',
          transition: 'all 0.5s ease, opacity 0.6s ease',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-20">
          {/* Logo */}
          <a
            href="#hero"
            onClick={(e) => handleNavClick(e, '#hero')}
            className="relative z-10 flex-shrink-0"
          >
            <Image
              src="/images/logo-gold.png"
              alt="NGH Bali Property Group"
              width={200}
              height={70}
              className="h-14 w-auto object-contain drop-shadow-[0_2px_12px_rgba(198,169,108,0.5)]"
              priority
            />
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const sectionId = link.href.replace('#', '');
              const isActive = activeSection === sectionId;

              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="relative text-xs tracking-[0.2em] font-medium transition-colors duration-300"
                  style={{
                    color: scrolled
                      ? isActive
                        ? '#C6A96C'
                        : '#1F1F1F'
                      : isActive
                        ? '#C6A96C'
                        : '#F5F3EE',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {link.label}
                  {/* Active underline */}
                  <motion.span
                    className="absolute -bottom-1 left-0 right-0 h-[2px]"
                    style={{ backgroundColor: '#C6A96C' }}
                    initial={false}
                    animate={{
                      scaleX: isActive ? 1 : 0,
                      opacity: isActive ? 1 : 0,
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  />
                </a>
              );
            })}
          </div>

          {/* WhatsApp CTA (desktop) */}
          <a
            href="https://wa.me/message/nghpropertygroup"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{ backgroundColor: '#25D366' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Contact Us
          </a>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden relative z-10 w-10 h-10 flex flex-col items-center justify-center gap-1.5"
            aria-label="Toggle menu"
          >
            <motion.span
              className="block w-6 h-[2px] rounded-full"
              style={{ backgroundColor: scrolled && !mobileOpen ? '#1F1F1F' : '#F5F3EE' }}
              animate={{
                rotate: mobileOpen ? 45 : 0,
                y: mobileOpen ? 5 : 0,
              }}
              transition={{ duration: 0.3 }}
            />
            <motion.span
              className="block w-6 h-[2px] rounded-full"
              style={{ backgroundColor: scrolled && !mobileOpen ? '#1F1F1F' : '#F5F3EE' }}
              animate={{
                opacity: mobileOpen ? 0 : 1,
              }}
              transition={{ duration: 0.2 }}
            />
            <motion.span
              className="block w-6 h-[2px] rounded-full"
              style={{ backgroundColor: scrolled && !mobileOpen ? '#1F1F1F' : '#F5F3EE' }}
              animate={{
                rotate: mobileOpen ? -45 : 0,
                y: mobileOpen ? -5 : 0,
              }}
              transition={{ duration: 0.3 }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile Fullscreen Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center"
            style={{ backgroundColor: '#F5F3EE' }}
          >
            {/* Gold accent line */}
            <div
              className="absolute top-20 left-1/2 -translate-x-1/2 w-12 h-[2px]"
              style={{ backgroundColor: '#C6A96C' }}
            />

            <nav className="flex flex-col items-center gap-8">
              {NAV_LINKS.map((link, i) => {
                const sectionId = link.href.replace('#', '');
                const isActive = activeSection === sectionId;

                return (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    className="text-2xl tracking-[0.15em] font-light"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      color: isActive ? '#C6A96C' : '#1F1F1F',
                    }}
                  >
                    {link.label}
                  </motion.a>
                );
              })}

              {/* Mobile WhatsApp CTA */}
              <motion.a
                href="https://wa.me/message/nghpropertygroup"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: NAV_LINKS.length * 0.08, duration: 0.4 }}
                className="mt-4 flex items-center gap-3 px-8 py-3.5 rounded-full text-white text-lg font-medium"
                style={{ backgroundColor: '#25D366' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Contact Us
              </motion.a>
            </nav>

            {/* Bottom brand accent */}
            <div className="absolute bottom-10 flex flex-col items-center gap-2">
              <div
                className="w-8 h-[1px]"
                style={{ backgroundColor: '#C6A96C' }}
              />
              <span
                className="text-[10px] tracking-[0.3em] uppercase"
                style={{ color: '#8A8F83' }}
              >
                NGH Property Group
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
