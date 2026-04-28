'use client';

import { useRef, useEffect, useState, useCallback, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import AnimText from './AnimText';
import NGHLogoSVG from './NGHLogoSVG';
import { useInView } from './useInView';
import StackedDeckComponent from './StackedDeck';
/* ════════════════════════════════════════════
   HELPER: FadeIn wrapper for staggered reveals
   ════════════════════════════════════════════ */
function FadeIn({
  children,
  delay = 0,
  className = '',
  direction = 'up',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
}) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.15, triggerOnce: true });

  const offsets = {
    up: { x: 0, y: 40 },
    down: { x: 0, y: -40 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, x: offsets[direction].x, y: offsets[direction].y }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

/* ════════════════════════════════════════════
   HELPER: CountUp number animation
   ════════════════════════════════════════════ */
function CountUpStat({
  value,
  suffix = '',
  label,
  delay = 0,
}: {
  value: string;
  suffix?: string;
  label: string;
  delay?: number;
}) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.3, triggerOnce: true });
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!isInView) return;

    const numericPart = value.replace(/[^0-9]/g, '');
    const prefix = value.replace(/[0-9]/g, '');
    const target = parseInt(numericPart, 10);
    if (isNaN(target)) {
      setDisplay(value);
      return;
    }

    const duration = 2000;
    const startTime = performance.now();
    const delayMs = delay * 1000;

    const timer = setTimeout(() => {
      const animate = (now: number) => {
        const elapsed = now - startTime - delayMs;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);
        setDisplay(prefix + current.toString());

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplay(value);
        }
      };
      requestAnimationFrame(animate);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [isInView, value, delay]);

  return (
    <div ref={ref} className="text-center px-4">
      <div
        className="text-4xl md:text-5xl lg:text-6xl font-light mb-2"
        style={{ fontFamily: 'var(--font-serif)', color: '#C6A96C' }}
      >
        {display}
        {suffix}
      </div>
      <div
        className="text-xs md:text-sm tracking-[0.2em] uppercase"
        style={{ color: '#8A8F83' }}
      >
        {label}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   HELPER: Marquee strip for partners
   ════════════════════════════════════════════ */
function MarqueeStrip({ items }: { items: { name: string; logo: string }[] }) {
  const doubled = [...items, ...items];

  return (
    <div className="overflow-hidden py-12" style={{ backgroundColor: '#1F1F1F' }}>
      <div className="flex animate-marquee">
        {doubled.map((item, i) => (
          <div
            key={`${item.name}-${i}`}
            className="flex-shrink-0 mx-8 md:mx-12 flex items-center justify-center h-16 w-32 md:w-40 opacity-50 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
          >
            <Image
              src={item.logo}
              alt={item.name}
              width={160}
              height={64}
              className="object-contain h-full w-auto"
            />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}

/* ════════════════════════════════════════════
   SCENE OVERLAY — appears/disappears by scroll
   ════════════════════════════════════════════ */
interface SceneProps {
  progress: number;
  startAt: number;
  endAt: number;
  children: React.ReactNode;
  position?: 'center' | 'bottom-left' | 'bottom-center';
}

function Scene({ progress, startAt, endAt, children, position = 'center' }: SceneProps) {
  const fadeInEnd = startAt + (endAt - startAt) * 0.2;
  const fadeOutStart = endAt - (endAt - startAt) * 0.2;

  let opacity = 0;
  if (progress >= startAt && progress <= endAt) {
    if (progress < fadeInEnd) {
      opacity = (progress - startAt) / (fadeInEnd - startAt);
    } else if (progress > fadeOutStart) {
      opacity = 1 - (progress - fadeOutStart) / (endAt - fadeOutStart);
    } else {
      opacity = 1;
    }
  }

  if (opacity <= 0) return null;

  const positionStyles: Record<string, CSSProperties> = {
    center: {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
    },
    'bottom-left': {
      bottom: '12%',
      left: '8%',
      textAlign: 'left',
    },
    'bottom-center': {
      bottom: '12%',
      left: '50%',
      transform: 'translateX(-50%)',
      textAlign: 'center',
    },
  };

  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 10,
        opacity,
        transition: 'opacity 0.05s linear',
        maxWidth: '90vw',
        ...positionStyles[position],
      }}
    >
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════
   TROPICAL PARTICLES (contact section)
   ════════════════════════════════════════════ */
function TropicalParticles() {
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; size: number; delay: number; duration: number }[]
  >([]);

  useEffect(() => {
    const p = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      delay: Math.random() * 5,
      duration: 6 + Math.random() * 8,
    }));
    setParticles(p);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: 'rgba(198, 169, 108, 0.3)',
          }}
          animate={{
            y: [0, -60, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════
   PHOTO DIASHOW — scroll-driven fullscreen
   ════════════════════════════════════════════ */
const DIASHOW_PHOTOS = [
  { src: '/images/diashow-01-rooftop.jpg', label: 'Rooftop Terrace', sub: 'Fire Pit & Lounge Area' },
  { src: '/images/diashow-03-sauna.jpg', label: 'Sauna', sub: 'Premium Wellness Facilities' },
  { src: '/images/diashow-04-fitness.jpg', label: 'Fitness Suite', sub: 'Fully Equipped Gym' },
  { src: '/images/diashow-05-interiors.jpg', label: 'Luxury Interiors', sub: 'Designer Living Spaces' },
  { src: '/images/diashow-02-location.jpg', label: 'The Location', sub: 'Uluwatu, Bali' },
  { src: '/images/diashow-06-rental.jpg', label: 'Investment Returns', sub: 'ROI in 6-7 Years' },
];

const SLIDE_DURATION = 4000; // 4 seconds per slide

function PhotoDiashow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInView, setIsInView] = useState(false);

  // Intersection observer — only auto-play when visible
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.3 }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Auto-play timer
  useEffect(() => {
    if (!isInView) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % DIASHOW_PHOTOS.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [isInView]);

  const count = DIASHOW_PHOTOS.length;

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <div
        className="relative w-full overflow-hidden"
        style={{ backgroundColor: '#0E0C0A', height: '100vh' }}
      >
        {/* Photo layers — auto crossfade */}
        {DIASHOW_PHOTOS.map((photo, i) => {
          const isActive = i === activeIndex;

          return (
            <div
              key={photo.src}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: isActive ? 1 : 0,
                transition: 'opacity 1.2s ease-in-out',
              }}
            >
              <Image
                src={photo.src}
                alt={photo.label}
                fill
                className="object-contain"
                sizes="100vw"
                priority={i === 0}
                style={{
                  objectPosition: 'center top',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  transition: `transform ${SLIDE_DURATION}ms linear`,
                  transformOrigin: 'center center',
                }}
              />
              {/* Vignette overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.15) 100%)',
                }}
              />
            </div>
          );
        })}

        {/* Caption overlay — bottom left */}
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '8%',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <span
              style={{
                display: 'block',
                fontFamily: '"Inter", sans-serif',
                fontSize: '0.7rem',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: '#C6A96C',
                marginBottom: '0.5rem',
              }}
            >
              {String(activeIndex + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
            </span>
            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2rem, 5vw, 4rem)',
                fontWeight: 300,
                color: '#F5F3EE',
                lineHeight: 1.1,
                letterSpacing: '-0.01em',
                marginBottom: '0.4rem',
              }}
            >
              {DIASHOW_PHOTOS[activeIndex]?.label}
            </h3>
            <p
              style={{
                fontFamily: '"Inter", sans-serif',
                fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
                color: 'rgba(245,243,238,0.65)',
                letterSpacing: '0.04em',
              }}
            >
              {DIASHOW_PHOTOS[activeIndex]?.sub}
            </p>
          </motion.div>
        </div>

        {/* Progress dots — right side */}
        <div
          style={{
            position: 'absolute',
            right: '2rem',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            pointerEvents: 'none',
          }}
        >
          {DIASHOW_PHOTOS.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === activeIndex ? 6 : 4,
                height: i === activeIndex ? 24 : 6,
                borderRadius: 3,
                backgroundColor:
                  i === activeIndex ? '#C6A96C' : 'rgba(245,243,238,0.35)',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          ))}
        </div>

        {/* Progress bar — bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: '3rem',
            left: '8%',
            right: '8%',
            zIndex: 10,
            display: 'flex',
            gap: 6,
          }}
        >
          {DIASHOW_PHOTOS.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 2,
                backgroundColor: 'rgba(245,243,238,0.2)',
                borderRadius: 1,
                overflow: 'hidden',
                cursor: 'pointer',
              }}
              onClick={() => setActiveIndex(i)}
            >
              <div
                style={{
                  height: '100%',
                  backgroundColor: '#C6A96C',
                  width: i < activeIndex ? '100%' : i === activeIndex ? '100%' : '0%',
                  opacity: i <= activeIndex ? 1 : 0,
                  transition: i === activeIndex ? `width ${SLIDE_DURATION}ms linear` : 'none',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   HELPER: Auto-playing image slideshow
   ════════════════════════════════════════════ */
function ImageSlideshow({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={`NGH Property ${i + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          style={{
            opacity: i === current ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
          }}
          priority={i === 0}
        />
      ))}
      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i === current ? '#C6A96C' : 'rgba(255,255,255,0.5)',
              transform: i === current ? 'scale(1.3)' : 'scale(1)',
            }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN: ScrollExperience
   ════════════════════════════════════════════ */
const FRAME_COUNT = 156;
const FRAME_PATH = '/frames/frame-'; // frame-0001.jpg to frame-0156.jpg

export default function ScrollExperience() {
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const blurVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const framesLoadedRef = useRef(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const isMobileRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);

  // Detect touch/mobile device
  useEffect(() => {
    const checkMobile = () => {
      const mobile =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.innerWidth < 768;
      setIsMobile(mobile);
      isMobileRef.current = mobile;
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile: preload frames for canvas rendering (Apple-style approach)
  useEffect(() => {
    if (!isMobile) return;
    const frames: HTMLImageElement[] = [];
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new window.Image();
      img.src = `${FRAME_PATH}${String(i).padStart(4, '0')}.jpg`;
      img.onload = () => { framesLoadedRef.current++; };
      frames.push(img);
    }
    framesRef.current = frames;
  }, [isMobile]);

  // Mobile: draw frame to canvas based on progress
  useEffect(() => {
    if (!isMobile) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const frameIndex = Math.min(
      Math.floor(videoProgress * (FRAME_COUNT - 1)),
      FRAME_COUNT - 1
    );
    const img = framesRef.current[frameIndex];
    if (img && img.complete && img.naturalWidth > 0) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
    }
  }, [isMobile, videoProgress]);

  // Force video load via blob fetch (fixes Cloudflare Pages streaming)
  // Runs on mount with empty deps — doesn't wait for isMobile state
  useEffect(() => {
    const loadAsBlob = async (el: HTMLVideoElement) => {
      try {
        const src = el.getAttribute('src') || el.src || '';
        if (!src || src === 'about:blank') return;
        const r = await fetch(src);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const blob = await r.blob();
        const blobUrl = URL.createObjectURL(blob);
        // Preserve the metadata event by adding a listener before changing src
        el.addEventListener('loadedmetadata', () => {
          setVideoReady(true);
        }, { once: true });
        el.src = blobUrl;
        el.load();
      } catch {
        // Fallback: just trigger native load — video may still play
        el.load();
      }
    };

    // Small delay to ensure refs are attached
    const timer = setTimeout(() => {
      const mobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768;
      if (mobile) return; // Mobile uses canvas frames, not video
      const video = videoRef.current;
      const blurVideo = blurVideoRef.current;
      if (video) loadAsBlob(video);
      if (blurVideo) loadAsBlob(blurVideo);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Scroll-driven video — smooth lerp for buttery playback
  // Uses refs for isMobile to avoid re-mounting on orientation change
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let targetProgress = 0;
    let currentProgress = 0;
    let animating = false;
    let lastSetProgress = 0; // track last state update for throttling
    let blurSeekCounter = 0; // throttle blur video seeks

    const lerp = (start: number, end: number, factor: number) =>
      start + (end - start) * factor;

    const updateVideo = () => {
      const mobile = isMobileRef.current;
      const video = videoRef.current;
      const blurVideo = blurVideoRef.current;

      // Smoother lerp: 0.15 for responsive yet smooth feel
      const lerpFactor = mobile ? 0.18 : 0.15;
      currentProgress = lerp(currentProgress, targetProgress, lerpFactor);

      const delta = Math.abs(currentProgress - targetProgress);
      if (delta < 0.0005) {
        currentProgress = targetProgress;
      }

      // Always update state for overlays — Scene components depend on this
      // regardless of whether video is loaded or not
      const progressDelta = Math.abs(currentProgress - lastSetProgress);
      const threshold = mobile ? 0.008 : 0.002;
      if (progressDelta > threshold || currentProgress === targetProgress) {
        setVideoProgress(currentProgress);
        lastSetProgress = currentProgress;
      }

      // Set video time directly — only when video is ready
      if (!mobile && video && video.duration) {
        const targetTime = currentProgress * video.duration;
        // Only seek if difference is noticeable (avoids micro-seeks)
        if (Math.abs(video.currentTime - targetTime) > 0.03) {
          video.currentTime = targetTime;
        }

        if (blurVideo && blurVideo.duration) {
          blurSeekCounter++;
          if (blurSeekCounter % 2 === 0) {
            blurVideo.currentTime = targetTime;
          }
        }
      }

      // Keep animating until settled
      if (delta > 0.0005) {
        rafIdRef.current = requestAnimationFrame(updateVideo);
      } else {
        animating = false;
        rafIdRef.current = null;
      }
    };

    const handleScroll = () => {
      const container = videoContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const containerHeight = container.offsetHeight;
      const scrollable = containerHeight - window.innerHeight;
      if (scrollable <= 0) return;

      const scrolled = -rect.top;
      targetProgress = Math.max(0, Math.min(1, scrolled / scrollable));

      if (!animating) {
        animating = true;
        rafIdRef.current = requestAnimationFrame(updateVideo);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      // Cancel any pending animation frame to prevent ghost loops
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, []); // No dependencies — uses refs for mutable values

  // Stacked deck cards data (StackedCard interface from StackedDeck component)
  const stackCards = [
    {
      id: '1br',
      title: '1 Bedroom Apartment',
      subtitle: 'Compact Luxury Living',
      description: 'Modern 45m\u00B2 apartment designed for maximum comfort and investment potential. Perfect for short-term rental or personal use.',
      image: '/images/1br.jpg',
      badge: 'Best Seller',
      price: 'From \u20AC112,500',
      specs: [
        { label: 'Size', value: '45m\u00B2' },
        { label: 'Lease', value: '28 Years' },
        { label: 'ROI', value: '15%' },
      ],
    },
    {
      id: '2br',
      title: '2 Bedroom Apartment',
      subtitle: 'Spacious Island Living',
      description: 'Generous 100m\u00B2 layout with premium finishes. Ideal for families or investors seeking higher returns.',
      image: '/images/2br.jpg',
      price: 'From \u20AC265,000',
      specs: [
        { label: 'Size', value: '100m\u00B2' },
        { label: 'Lease', value: '28 Years' },
        { label: 'ROI', value: '15%' },
      ],
    },
    {
      id: 'pool',
      title: 'Pool & Rooftop Terrace',
      subtitle: 'Resort-Style Amenities',
      description: 'Infinity pool with panoramic ocean views and a sunset lounge designed for the ultimate Bali lifestyle.',
      image: '/images/pool.jpg',
      badge: 'Exclusive',
    },
    {
      id: 'gym',
      title: 'Gym, Sauna & Co-working',
      subtitle: 'Live, Work, Thrive',
      description: 'Fully-equipped gym, Finnish sauna, and high-speed co-working space right at your doorstep.',
      image: '/images/gym.jpg',
    },
    {
      id: 'construction',
      title: 'Construction Progress',
      subtitle: 'Built on Dutch Standards',
      description: 'Transparent construction updates, quality European materials, and guaranteed on-time delivery.',
      image: '/images/construction.jpg',
      badge: 'In Progress',
    },
  ];

  // Partner logos
  const partners = [
    { name: 'Uluwatu Paradise', logo: '/images/partners/uluwatu-paradise.png' },
    { name: 'NextGen Home', logo: '/images/partners/nextgen-home.png' },
    { name: 'Supreme', logo: '/images/partners/supreme.png' },
    { name: 'Coco', logo: '/images/partners/coco.png' },
    { name: 'Elle', logo: '/images/partners/elle.png' },
    { name: 'Mirah', logo: '/images/partners/mirah.png' },
  ];

  // Blog cards
  const blogCards = [
    {
      title: 'Uluwatu Paradise: A Thoughtfully Designed Development in South Bali',
      category: 'Development',
      image: '/images/content-07.jpg',
      date: 'April 1, 2026',
      href: '/insights/uluwatu-paradise-development',
    },
    {
      title: 'Balangan Beach: One of the Most Beautiful Beaches Near Uluwatu Paradise',
      category: 'Lifestyle',
      image: '/images/content-08.jpg',
      date: 'March 29, 2026',
      href: '/insights/balangan-beach',
    },
    {
      title: 'Cafes and Restaurants Near Uluwatu Paradise',
      category: 'Area Guide',
      image: '/images/content-09.jpg',
      date: 'March 23, 2026',
      href: '/insights/cafes-restaurants-uluwatu',
    },
  ];

  return (
    <main>

      {/* ── HERO: Scroll-Driven Video ── */}
      <div
        id="hero"
        ref={videoContainerRef}
        className="relative"
        style={{ height: isMobile ? '600vh' : '900vh' }}
      >
        {/* Sticky video wrapper */}
        <div
          className="sticky top-0 h-screen w-full overflow-hidden"
          style={{ backgroundColor: videoProgress < 0.12 ? '#F5F0E8' : '#0E0C0A' }}
        >
          {/* ── Cinema Blur Background: eliminates grey sidebars (hidden on mobile for performance) ── */}
          {!isMobile && (
            <video
              ref={blurVideoRef}
              src="/video/scroll-v2.mp4"
              muted
              playsInline
              preload="metadata"
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{
                filter: 'blur(28px) brightness(0.35) saturate(1.2)',
                transform: 'scale(1.08)',
                willChange: 'transform',
                opacity: 1,
              }}
            />
          )}

          {/* ── Main video: desktop uses <video>, mobile uses <canvas> with frame images ── */}
          {isMobile ? (
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-contain"
              style={{
                willChange: 'transform',
                opacity: videoProgress < 0.08 ? 0 : Math.min(1, (videoProgress - 0.08) / 0.08),
                transition: 'opacity 0.1s linear',
              }}
            />
          ) : (
            <video
              ref={videoRef}
              src="/video/scroll-v2.mp4"
              poster="/video/poster.jpg"
              muted
              playsInline
              preload="auto"
              onLoadedMetadata={() => setVideoReady(true)}
              className="absolute inset-0 w-full h-full object-contain"
              style={{
                willChange: 'transform',
                opacity: 1,
              }}
            />
          )}

          {/* Gradient overlay — reduced opacity so property photos breathe */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: videoProgress < 0.12
                ? 'transparent'
                : 'linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.08) 45%, rgba(0,0,0,0.28) 100%)',
              transition: 'background 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          />

          {/* ── Logo intro (page load → first scroll, soft 0→0.22 fade) ── */}
          {videoProgress < 0.24 && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: videoProgress < 0.05
                  ? 1
                  : Math.max(0, 1 - (videoProgress - 0.05) / 0.17),
                transition: 'opacity 0.05s linear',
                zIndex: 10,
                textAlign: 'center' as const,
                pointerEvents: 'none',
                width: '100%',
                display: 'flex',
                flexDirection: 'column' as const,
                alignItems: 'center',
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.88, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              >
                <Image
                  src="/images/logo-gold.png"
                  alt="NGH Bali Property Group"
                  width={420}
                  height={420}
                  className="w-[260px] md:w-[340px] lg:w-[400px] h-auto"
                  style={{
                    mixBlendMode: 'multiply',
                    filter: 'drop-shadow(0 8px 32px rgba(198,169,108,0.35))',
                  }}
                  priority
                />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.0, delay: 0.7, ease: 'easeOut' }}
                style={{
                  marginTop: 20,
                  fontFamily: '"Inter", sans-serif',
                  fontSize: 'clamp(10px, 1.4vw, 13px)',
                  letterSpacing: '0.3em',
                  color: '#8B6914',
                  textTransform: 'uppercase' as const,
                  fontWeight: 500,
                  opacity: 0.8,
                }}
              >
                Premium Real Estate · Bali
              </motion.p>
            </div>
          )}

          {/* ── Scroll indicator (fades out as user scrolls) ── */}
          {videoProgress < 0.06 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 1 }}
              style={{
                position: 'absolute',
                bottom: '2.5rem',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 15,
                display: 'flex',
                flexDirection: 'column' as const,
                alignItems: 'center',
                gap: 8,
                pointerEvents: 'none',
              }}
            >
              <span style={{ fontSize: 10, letterSpacing: '0.25em', color: '#8B6914', textTransform: 'uppercase' as const, opacity: 0.7 }}>
                Scroll
              </span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <polyline points="6 9 12 15 18 9" stroke="#C6A96C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
            </motion.div>
          )}

          {/* Scene 2: Dutch Standards (12% - 28%) */}
          <Scene progress={videoProgress} startAt={0.12} endAt={0.28} position="center">
            <h2
              className="text-5xl md:text-7xl lg:text-8xl font-light mb-6"
              style={{
                fontFamily: 'var(--font-serif)',
                color: '#F5F3EE',
                textShadow: '0 2px 40px rgba(0,0,0,0.7)',
                lineHeight: 1.1,
              }}
            >
              Built on Dutch
              <br />
              Standards
            </h2>
            <p
              className="text-lg md:text-xl lg:text-2xl max-w-lg mx-auto"
              style={{
                color: 'rgba(245, 243, 238, 0.9)',
                textShadow: '0 2px 20px rgba(0,0,0,0.6)',
              }}
            >
              Over 10 years of experience in premium real estate development
            </p>
          </Scene>

          {/* Scene 3: Uluwatu Paradise (28% - 46%) */}
          <Scene progress={videoProgress} startAt={0.28} endAt={0.46} position="bottom-left">
            <h2
              className="text-4xl md:text-6xl lg:text-7xl font-light mb-3"
              style={{
                fontFamily: 'var(--font-serif)',
                color: '#F5F3EE',
                textShadow: '0 2px 40px rgba(0,0,0,0.7)',
              }}
            >
              Uluwatu Paradise
            </h2>
            <div
              className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4"
              style={{ backgroundColor: 'rgba(198, 169, 108, 0.85)', color: '#F5F3EE' }}
            >
              Our Flagship Project
            </div>
            <p
              className="text-sm md:text-base max-w-sm"
              style={{
                color: 'rgba(245, 243, 238, 0.8)',
                textShadow: '0 1px 10px rgba(0,0,0,0.5)',
              }}
            >
              A premium residential complex on Bali&apos;s most sought-after coastline
            </p>
          </Scene>

          {/* Scene 4: Construction Quality (46% - 64%) */}
          <Scene progress={videoProgress} startAt={0.46} endAt={0.64} position="bottom-center">
            <h2
              className="text-4xl md:text-6xl lg:text-7xl font-light mb-3"
              style={{
                fontFamily: 'var(--font-serif)',
                color: '#F5F3EE',
                textShadow: '0 2px 40px rgba(0,0,0,0.7)',
              }}
            >
              Dutch Construction Quality
            </h2>
            <p
              className="text-base md:text-lg"
              style={{
                color: '#C8B9A6',
                textShadow: '0 1px 10px rgba(0,0,0,0.5)',
              }}
            >
              Modern Mediterranean Architecture
            </p>
          </Scene>

          {/* Scene 5: 2BR (64% - 82%) — video shows large open-plan living/dining */}
          <Scene progress={videoProgress} startAt={0.64} endAt={0.82} position="bottom-left">
            <h2
              className="text-4xl md:text-6xl lg:text-7xl font-light mb-4"
              style={{
                fontFamily: 'var(--font-serif)',
                color: '#F5F3EE',
                textShadow: '0 2px 40px rgba(0,0,0,0.7)',
              }}
            >
              2 Bedroom Apartment
            </h2>
            <div
              className="inline-block px-6 py-3 rounded-full text-xl md:text-2xl font-medium"
              style={{ backgroundColor: 'rgba(198, 169, 108, 0.9)', color: '#F5F3EE' }}
            >
              From &euro;265,000
            </div>
            <p
              className="mt-3 text-base md:text-lg"
              style={{ color: 'rgba(245,243,238,0.8)', textShadow: '0 1px 10px rgba(0,0,0,0.5)' }}
            >
              100m² · 28yr Leasehold · 15% Expected ROI
            </p>
          </Scene>

          {/* Scene 6: 1BR (82% - 100%) — video shows bedroom */}
          <Scene progress={videoProgress} startAt={0.82} endAt={1.0} position="bottom-left">
            <h2
              className="text-4xl md:text-6xl lg:text-7xl font-light mb-4"
              style={{
                fontFamily: 'var(--font-serif)',
                color: '#F5F3EE',
                textShadow: '0 2px 40px rgba(0,0,0,0.7)',
              }}
            >
              1 Bedroom Apartment
            </h2>
            <div
              className="inline-block px-6 py-3 rounded-full text-xl md:text-2xl font-medium"
              style={{ backgroundColor: 'rgba(198, 169, 108, 0.9)', color: '#F5F3EE' }}
            >
              From &euro;112,500
            </div>
            <p
              className="mt-3 text-base md:text-lg"
              style={{ color: 'rgba(245,243,238,0.8)', textShadow: '0 1px 10px rgba(0,0,0,0.5)' }}
            >
              45m² · 28yr Leasehold · 15% Expected ROI
            </p>
          </Scene>

          {/* Scroll hint arrow (visible at start) */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ opacity: videoProgress < 0.05 ? 1 : 0, transition: 'opacity 0.5s' }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C6A96C"
              strokeWidth="1.5"
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </motion.div>
        </div>
      </div>

      {/* ── DISCOVER SECTION ── */}
      <section
        id="discover"
        className="relative py-24 md:py-32 px-6 lg:px-8 overflow-hidden"
        style={{ backgroundColor: '#F5F3EE' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div>
              <FadeIn>
                <div
                  className="w-12 h-[2px] mb-8"
                  style={{ backgroundColor: '#C6A96C' }}
                />
              </FadeIn>
              <AnimText
                text="Discover"
                as="h2"
                className="text-5xl md:text-6xl lg:text-7xl font-light mb-8"
                delay={0.1}
              />
              <FadeIn delay={0.3}>
                <p
                  className="text-lg md:text-xl leading-relaxed mb-8"
                  style={{ color: '#8A8F83', fontFamily: 'var(--font-sans)' }}
                >
                  NGH Property Group is dedicated to raising the standard of real estate
                  development in Bali by combining Dutch construction quality, disciplined
                  planning, and transparent investment structures.
                </p>
              </FadeIn>
              <FadeIn delay={0.5}>
                <a
                  href="#opportunities"
                  className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full text-sm font-medium tracking-[0.1em] uppercase transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: '#C6A96C',
                    color: '#F5F3EE',
                  }}
                >
                  Explore Opportunities
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
              </FadeIn>
            </div>

            {/* Parallax Image */}
            <FadeIn delay={0.2} direction="right">
              <div className="relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden">
                <Image
                  src="/images/discover-hero.jpg"
                  alt="Discover NGH Property Group"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(198,169,108,0.1) 0%, transparent 50%)',
                  }}
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── INVEST WITH US ── */}
      <section
        id="invest"
        className="relative py-24 md:py-32 px-6 lg:px-8"
        style={{ backgroundColor: '#1F1F1F' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <FadeIn>
              <div
                className="w-12 h-[2px] mx-auto mb-8"
                style={{ backgroundColor: '#C6A96C' }}
              />
            </FadeIn>
            <AnimText
              text="Invest with us"
              as="h2"
              className="text-4xl md:text-5xl lg:text-6xl font-light mb-8"
              delay={0.1}
            />
            <FadeIn delay={0.3}>
              <p
                className="text-lg leading-relaxed"
                style={{ color: '#C8B9A6' }}
              >
                With more than a decade of experience in the real estate sector, NGH Property
                Group develops high-quality projects in Bali by combining Dutch construction
                standards, disciplined planning, and a long-term vision for sustainable
                property development.
              </p>
            </FadeIn>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C6A96C" strokeWidth="1.5">
                    <path d="M3 21h18M3 7v14M21 7v14M12 3l9 4-9 4-9-4 9-4z" />
                    <path d="M9 10v5M15 10v5" />
                  </svg>
                ),
                title: 'Dutch Quality',
                description:
                  'European construction standards applied to every project. No shortcuts, no compromises.',
              },
              {
                icon: (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C6A96C" strokeWidth="1.5">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                  </svg>
                ),
                title: '15% Expected ROI',
                description:
                  'Transparent investment structures designed to deliver consistent returns for our investors.',
              },
              {
                icon: (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C6A96C" strokeWidth="1.5">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                  </svg>
                ),
                title: 'Global Vision',
                description:
                  'A long-term vision for sustainable development, attracting investors from around the world.',
              },
            ].map((card, i) => (
              <FadeIn key={card.title} delay={i * 0.15}>
                <div
                  className="p-8 md:p-10 rounded-2xl border transition-all duration-500 hover:-translate-y-2"
                  style={{
                    borderColor: 'rgba(200, 185, 166, 0.15)',
                    backgroundColor: 'rgba(245, 243, 238, 0.03)',
                  }}
                >
                  <div className="mb-6">{card.icon}</div>
                  <h3
                    className="text-xl font-light mb-4"
                    style={{ fontFamily: 'var(--font-serif)', color: '#F5F3EE' }}
                  >
                    {card.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#8A8F83' }}>
                    {card.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── STACKED DECK — OPPORTUNITIES ── */}
      <section
        id="opportunities"
        className="py-24 md:py-32"
        style={{ backgroundColor: '#F5F3EE' }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center mb-16">
          <FadeIn>
            <div
              className="w-12 h-[2px] mx-auto mb-8"
              style={{ backgroundColor: '#C6A96C' }}
            />
          </FadeIn>
          <AnimText
            text="Opportunities"
            as="h2"
            className="text-4xl md:text-5xl lg:text-6xl font-light mb-6"
          />
          <FadeIn delay={0.2}>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#8A8F83' }}>
              Explore our current investment opportunities in Uluwatu, Bali
            </p>
          </FadeIn>
        </div>

        <StackedDeckComponent cards={stackCards} />
      </section>

      {/* ── STATS BAR ── */}
      <section
        className="py-20 md:py-28 px-6 lg:px-8"
        style={{ backgroundColor: '#1F1F1F' }}
      >
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          <CountUpStat value="10+" suffix="" label="Years Experience" delay={0} />
          <CountUpStat value="15" suffix="%" label="Expected ROI" delay={0.15} />
          <CountUpStat value="28" suffix="" label="Year Leasehold" delay={0.3} />
          <CountUpStat value="12-18" suffix="" label="Month Build Time" delay={0.45} />
        </div>
      </section>

      {/* ── PARTNERS MARQUEE ── */}
      <MarqueeStrip items={partners} />

      {/* ── OUR EDGE ── */}
      <section
        id="our-edge"
        className="relative py-24 md:py-32 px-6 lg:px-8 overflow-hidden"
        style={{ backgroundColor: '#F5F3EE' }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Section intro */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <FadeIn>
              <div
                className="w-12 h-[2px] mx-auto mb-8"
                style={{ backgroundColor: '#C6A96C' }}
              />
            </FadeIn>
            <AnimText
              text="Our Edge"
              as="h2"
              className="text-4xl md:text-5xl lg:text-6xl font-light mb-8"
            />
            <FadeIn delay={0.2}>
              <p className="text-lg leading-relaxed" style={{ color: '#8A8F83' }}>
                We didn&apos;t come to Bali to follow the market. We came to raise the standard.
              </p>
            </FadeIn>
          </div>

          {/* Founder Spotlight */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn direction="left">
              <div className="relative h-[500px] rounded-2xl overflow-hidden">
                <Image
                  src="/images/mitchell.jpg"
                  alt="Mitchell Kasiman — Founder"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </FadeIn>

            <div>
              <FadeIn delay={0.2}>
                <div
                  className="text-6xl md:text-7xl font-light leading-none mb-6"
                  style={{ fontFamily: 'var(--font-serif)', color: '#C6A96C' }}
                >
                  &ldquo;
                </div>
                <blockquote
                  className="text-xl md:text-2xl font-light leading-relaxed mb-8"
                  style={{ fontFamily: 'var(--font-serif)', color: '#1F1F1F' }}
                >
                  We don&apos;t just build properties &mdash; we build trust. Every project
                  reflects our commitment to quality, transparency, and creating real value
                  for our investors.
                </blockquote>
                <div>
                  <p
                    className="text-base font-medium"
                    style={{ color: '#1F1F1F' }}
                  >
                    Mitchell Kasiman
                  </p>
                  <p
                    className="text-sm tracking-[0.1em] uppercase"
                    style={{ color: '#8A8F83' }}
                  >
                    Founder &amp; CEO
                  </p>
                </div>
              </FadeIn>

              {/* Team grid */}
              <FadeIn delay={0.4}>
                <div className="mt-12 grid grid-cols-3 gap-4">
                  {[
                    { name: 'Sergio', role: 'Strategic Partner', image: '/images/steven.jpg' },
                    { name: 'Lucy Leanatan', role: 'Marketing Manager', image: '/images/lucy.jpg' },
                    { name: 'Richard Argapara', role: 'Financial Manager', image: '/images/sergio.jpg' },
                    { name: 'Ibi Imrich', role: 'Sales Advisor', image: '/images/ibi.jpg' },
                    { name: 'Steven Tan-a-Kiam', role: 'Investor & Strategic Coach', image: '/images/richard.jpg' },
                    { name: 'Geraldina Sky', role: 'Sales Advisor', image: '/images/sky.jpg' },
                  ].map((member) => (
                    <div
                      key={member.name}
                      className="relative aspect-square rounded-xl overflow-hidden group"
                      style={{ backgroundColor: '#C8B9A6' }}
                    >
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                        sizes="200px"
                        style={{ objectPosition: 'center 20%', transform: 'scale(1.25)' }}
                      />
                      <div
                        className="absolute inset-0 flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          background: 'linear-gradient(to top, rgba(31,31,31,0.8) 0%, transparent 60%)',
                        }}
                      >
                        <p className="text-xs font-medium text-white leading-tight">{member.name}</p>
                        <p className="text-[10px]" style={{ color: '#C8B9A6' }}>{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ── INSIGHTS PREVIEW ── */}
      <section
        id="insights"
        className="py-24 md:py-32 px-6 lg:px-8"
        style={{ backgroundColor: '#1F1F1F' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-16">
            <div>
              <FadeIn>
                <div
                  className="w-12 h-[2px] mb-8"
                  style={{ backgroundColor: '#C6A96C' }}
                />
              </FadeIn>
              <AnimText
                text="Insights"
                as="h2"
                className="text-4xl md:text-5xl lg:text-6xl font-light"
              />
            </div>
            <FadeIn delay={0.2}>
              <a
                href="/insights"
                className="hidden md:inline-flex items-center gap-2 text-sm tracking-[0.1em] uppercase transition-colors duration-300 hover:text-gold"
                style={{ color: '#C8B9A6' }}
              >
                View All
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </FadeIn>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {blogCards.map((card, i) => (
              <FadeIn key={card.title} delay={i * 0.15}>
                <Link href={card.href}>
                  <article className="group cursor-pointer">
                    <div className="relative h-56 md:h-64 rounded-xl overflow-hidden mb-6">
                      <Image
                        src={card.image}
                        alt={card.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div
                        className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-0"
                        style={{ backgroundColor: 'rgba(31,31,31,0.2)' }}
                      />
                    </div>
                    <span
                      className="text-xs tracking-[0.2em] uppercase mb-3 block"
                      style={{ color: '#C6A96C' }}
                    >
                      {card.category}
                    </span>
                    <h3
                      className="text-lg md:text-xl font-light leading-snug mb-2 transition-colors duration-300"
                      style={{
                        fontFamily: 'var(--font-serif)',
                        color: '#F5F3EE',
                      }}
                    >
                      {card.title}
                    </h3>
                    <span className="text-xs" style={{ color: '#8A8F83' }}>
                      {card.date}
                    </span>
                  </article>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── INVESTOR GUIDE ── */}
      <section
        id="investor-guide"
        className="py-24 md:py-32 px-6 lg:px-8"
        style={{ backgroundColor: '#F5F3EE' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <FadeIn>
              <div
                className="w-12 h-[2px] mx-auto mb-8"
                style={{ backgroundColor: '#C6A96C' }}
              />
            </FadeIn>
            <AnimText
              text="Investor Guide"
              as="h2"
              className="text-4xl md:text-5xl lg:text-6xl font-light mb-6"
            />
            <FadeIn delay={0.2}>
              <p className="text-lg leading-relaxed" style={{ color: '#8A8F83' }}>
                Everything you need to know about investing in Bali real estate
              </p>
            </FadeIn>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              {
                title: 'Getting Started',
                description: 'Your first steps into Bali property investment — from research to reservation.',
                icon: '01',
              },
              {
                title: 'Legal & Ownership',
                description: 'Understanding property ownership structures, contracts, and legal protections for foreign investors.',
                icon: '02',
              },
              {
                title: 'Permits & Compliance',
                description: 'Building permits, zoning regulations, and compliance requirements explained clearly.',
                icon: '03',
              },
              {
                title: 'Visas & Living',
                description: 'Visa options for property owners, residency pathways, and living in Bali full-time.',
                icon: '04',
              },
              {
                title: 'Bali Areas Guide',
                description: 'Detailed overview of investment hotspots — Uluwatu, Canggu, Seminyak, Ubud, and more.',
                icon: '05',
              },
              {
                title: 'Building & Development',
                description: 'Construction timelines, quality standards, and what to expect during the development process.',
                icon: '06',
              },
            ].map((faq, i) => (
              <FadeIn key={faq.title} delay={i * 0.1}>
                <div
                  className="p-8 rounded-2xl border transition-all duration-500 hover:-translate-y-1 hover:shadow-lg h-full"
                  style={{
                    borderColor: 'rgba(200, 185, 166, 0.25)',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <span
                    className="text-xs tracking-[0.2em] uppercase block mb-4"
                    style={{ color: '#C6A96C' }}
                  >
                    {faq.icon}
                  </span>
                  <h3
                    className="text-lg font-medium mb-3"
                    style={{ fontFamily: 'var(--font-serif)', color: '#1F1F1F' }}
                  >
                    {faq.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#8A8F83' }}>
                    {faq.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.3}>
            <div className="text-center">
              <a
                href="/investor-guide"
                className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full text-sm font-medium tracking-[0.1em] uppercase transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: '#C6A96C',
                  color: '#F5F3EE',
                }}
              >
                View Full Guide
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── PHOTO DIASHOW (scroll-driven, replaces contact image grid) ── */}
      <PhotoDiashow />

      {/* ── CONTACT CTA ── */}
      <section
        id="contact"
        className="relative py-24 md:py-32 px-6 lg:px-8 overflow-hidden"
        style={{ backgroundColor: '#F5F3EE' }}
      >
        <TropicalParticles />

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <FadeIn>
              <div
                className="w-12 h-[2px] mx-auto mb-8"
                style={{ backgroundColor: '#C6A96C' }}
              />
            </FadeIn>
            <AnimText
              text="Ready to reserve a piece of paradise?"
              as="h2"
              className="text-3xl md:text-4xl lg:text-5xl font-light mb-4"
            />
          </div>

          {/* Contact Info — full width, diashow played above */}
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div />

            {/* Contact Info */}
            <FadeIn delay={0.2} direction="right">
              <div className="space-y-8">
                {/* Email */}
                <div>
                  <h4
                    className="text-xs tracking-[0.2em] uppercase mb-2"
                    style={{ color: '#8A8F83' }}
                  >
                    Email
                  </h4>
                  <a
                    href="mailto:info@nghpropertygroup.com"
                    className="text-lg md:text-xl font-light transition-colors duration-300"
                    style={{ color: '#1F1F1F', fontFamily: 'var(--font-serif)' }}
                  >
                    info@nghpropertygroup.com
                  </a>
                </div>

                {/* Address */}
                <div>
                  <h4
                    className="text-xs tracking-[0.2em] uppercase mb-2"
                    style={{ color: '#8A8F83' }}
                  >
                    Location
                  </h4>
                  <p
                    className="text-base leading-relaxed"
                    style={{ color: '#1F1F1F' }}
                  >
                    Jl. Pantai Balangan
                    <br />
                    Ungasan, Bali
                    <br />
                    Indonesia
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <a
                    href="https://wa.me/message/nghpropertygroup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    style={{ backgroundColor: '#25D366' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp Us
                  </a>
                  <a
                    href="https://calendly.com/nghpropertygroup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full font-medium transition-all duration-300 hover:scale-105 border"
                    style={{
                      borderColor: '#C6A96C',
                      color: '#C6A96C',
                      backgroundColor: 'transparent',
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                    Schedule a Call
                  </a>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="py-16 md:py-20 px-6 lg:px-8"
        style={{ backgroundColor: '#1F1F1F' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="md:col-span-2">
              <Image
                src="/images/logo-gold.png"
                alt="NGH Bali Property Group"
                width={180}
                height={64}
                className="mb-6"
              />
              <p
                className="text-sm leading-relaxed max-w-md mb-6"
                style={{ color: '#8A8F83' }}
              >
                NGH Property Group is dedicated to raising the standard of real estate
                development in Bali. Dutch quality, transparent structures, long-term value.
              </p>
              {/* Social Icons */}
              <div className="flex gap-4">
                {[
                  {
                    label: 'Instagram',
                    href: 'https://instagram.com/nghpropertygroup',
                    icon: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                      </svg>
                    ),
                  },
                  {
                    label: 'LinkedIn',
                    href: 'https://linkedin.com/company/nghpropertygroup',
                    icon: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    ),
                  },
                  {
                    label: 'YouTube',
                    href: 'https://youtube.com/@nghpropertygroup',
                    icon: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    ),
                  },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                    style={{
                      backgroundColor: 'rgba(198, 169, 108, 0.1)',
                      color: '#C8B9A6',
                    }}
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4
                className="text-xs tracking-[0.2em] uppercase mb-6"
                style={{ color: '#C6A96C' }}
              >
                Quick Links
              </h4>
              <ul className="space-y-3">
                {NAV_LINKS_FOOTER.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm transition-colors duration-300 hover:text-cream"
                      style={{ color: '#8A8F83' }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4
                className="text-xs tracking-[0.2em] uppercase mb-6"
                style={{ color: '#C6A96C' }}
              >
                Contact
              </h4>
              <ul className="space-y-3 text-sm" style={{ color: '#8A8F83' }}>
                <li>info@nghpropertygroup.com</li>
                <li>
                  Jl. Pantai Balangan
                  <br />
                  Ungasan, Bali
                  <br />
                  Indonesia
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
            style={{ borderTop: '1px solid rgba(200,185,166,0.15)' }}
          >
            <p className="text-xs" style={{ color: '#8A8F83' }}>
              &copy; {new Date().getFullYear()} NGH Property Group. All rights reserved.
            </p>
            <p className="text-xs" style={{ color: 'rgba(138,143,131,0.5)' }}>
              Powered by{' '}
              <a
                href="https://linkaiagency.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-300"
                style={{ color: '#C6A96C' }}
              >
                Link AI
              </a>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* Footer nav links (separate from Navigation component to avoid circular issues) */
const NAV_LINKS_FOOTER = [
  { label: 'Home', href: '#hero' },
  { label: 'Opportunities', href: '#opportunities' },
  { label: 'Our Edge', href: '#our-edge' },
  { label: 'Insights', href: '#insights' },
  { label: 'Investor Guide', href: '#investor-guide' },
  { label: 'Contact', href: '#contact' },
];
