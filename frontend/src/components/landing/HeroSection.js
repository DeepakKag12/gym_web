import React, { useState, useEffect, useRef } from 'react';
import DotMatrixCanvas from '../ui/DotMatrixCanvas';
import Athlete3DVisualizer from './Athlete3DVisualizer';

const DEFAULT_AVATARS = [
  {
    name: 'Sarah J.',
    role: 'Hypertrophy Member',
    src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
  },
  {
    name: 'David C.',
    role: 'Strength Athlete',
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
  },
  {
    name: 'Elena R.',
    role: 'CrossFit Competitor',
    src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300&auto=format&fit=crop',
  },
  {
    name: 'Marcus B.',
    role: 'Powerlifter',
    src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop',
  },
  {
    name: 'Chloe B.',
    role: 'Sprinter & Conditioning',
    src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop',
  },
];

export default function HeroSection({
  title = 'Forge your ultimate physique with elite coaching',
  subtitle = 'We engineer periodized athletic training that builds unbreakable strength, high-output conditioning, and lifelong physical resilience.',
  sideDescription = 'Our training protocols are designed to support athletes across diverse goals, from foundational movement screening to peak strength periodization. Every program is customized to your body mechanics, metabolic rate, and timeline.',
  memberCount = '500+',
  memberLabel = 'Satisfied athletes',
  avatars = DEFAULT_AVATARS,
}) {
  const dimmerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  // Listen to loader handshake or initialize immediately if already completed
  useEffect(() => {
    if (window.__orisLoaderFinished) {
      setLoaded(true);
    } else {
      const onFinished = () => setLoaded(true);
      window.addEventListener('oris-loader-finished', onFinished, { once: true });
      return () => window.removeEventListener('oris-loader-finished', onFinished);
    }
  }, []);

  // Scroll dimmer calculation: overlays dark obsidian gradient as hero scrolls away
  useEffect(() => {
    const handleScroll = () => {
      if (!dimmerRef.current) return;
      const scrollY = window.scrollY || 0;
      const threshold = 0.85 * (window.innerHeight || 800);
      const progress = Math.min(Math.max(scrollY / threshold, 0), 1);
      dimmerRef.current.style.opacity = (0.95 * progress).toString();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      id="oris-hero"
      className="h-dvh max-[1025px]:h-auto max-[1025px]:min-h-dvh max-[1025px]:relative sticky top-0 z-0 overflow-hidden w-full text-white bg-[linear-gradient(to_top,#3365E2_0%,#3365E2_20%,#4a78e7_40%,#789ef1_60%,#b9d0fb_80%,#ffffff_100%)] select-none"
    >
      <div className="h-full w-full relative flex flex-col justify-between">
        {/* 2D Interactive Magnetic Dot-Matrix Canvas */}
        <DotMatrixCanvas
          spacing={22}
          lerpFactor={0.15}
          baseRadius={1.4}
          maxRadius={3.8}
          interactionRadius={200}
        />

        {/* Central 3D Visualizer (Desktop: absolute centered) */}
        <div className="hidden min-[1026px]:flex absolute inset-0 pointer-events-none items-center justify-center z-[6]">
          <Athlete3DVisualizer />
        </div>

        {/* Hero Content Grid (3 Columns: Left Text | Center 3D Clearance | Right Card) */}
        <div className="w-full oris-paddx flex items-center justify-between h-full max-[1025px]:flex-col max-[1025px]:items-start max-[1025px]:justify-start max-[1025px]:gap-6 max-[1025px]:pt-28 max-[1025px]:pb-12 z-10 pointer-events-none *:pointer-events-auto">
          {/* Left Column: Heading & Mission */}
          <div className="w-[32%] max-w-[440px] max-[1025px]:w-full max-[1025px]:max-w-xl flex flex-col gap-6 justify-center items-start">
            <div className="overflow-hidden">
              <h1
                className={`oris-text64 font-normal tracking-tight text-white drop-shadow-[0_2px_14px_rgba(15,35,70,0.5)] transition-transform duration-850 ease-out ${
                  loaded ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                }`}
                style={{ transitionDelay: '0.35s' }}
              >
                {title}
              </h1>
            </div>

            <div className="overflow-hidden">
              <p
                className={`oris-text22 text-white/95 font-light leading-relaxed max-w-[27vw] max-[1025px]:max-w-xl drop-shadow-[0_1px_8px_rgba(15,35,70,0.4)] transition-transform duration-850 ease-out ${
                  loaded ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                }`}
                style={{ transitionDelay: '0.55s' }}
              >
                {subtitle}
              </p>
            </div>
          </div>

          {/* Center Column on Mobile: 3D Model gracefully flows between header and card */}
          <div className="min-[1026px]:hidden w-full flex items-center justify-center my-2 z-10">
            <Athlete3DVisualizer className="w-full max-w-[320px]" />
          </div>

          {/* Right Column: Narrative & Social Proof Card (Screenshot 1 Layout) */}
          <div className="w-[31%] max-w-[400px] max-[1025px]:w-full max-[1025px]:max-w-xl flex flex-col justify-between items-end max-[1025px]:items-start gap-8 self-end pb-12 max-[1025px]:pb-0">
            <div className="overflow-hidden text-right max-[1025px]:text-left">
              <p
                className={`oris-text22 text-white/95 font-light leading-relaxed max-w-[27vw] max-[1025px]:max-w-xl drop-shadow-[0_1px_8px_rgba(15,35,70,0.4)] transition-transform duration-850 ease-out ${
                  loaded ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                }`}
                style={{ transitionDelay: '0.65s' }}
              >
                {sideDescription}
              </p>
            </div>

            {/* Floating Social Proof Card */}
            <div
              className={`w-full max-w-[340px] rounded-[32px] bg-white p-6 shadow-2xl border border-white/60 relative z-10 transition-all duration-700 ease-out ${
                loaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
              }`}
              style={{ transitionDelay: '0.85s' }}
            >
              <div className="mb-4">
                <h3 className="text-oris-secondary text-3xl font-medium tracking-tight">
                  Join {memberCount}
                </h3>
                <p className="text-slate-600 text-sm font-normal mt-0.5">
                  {memberLabel}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                {/* Overlapping Avatar Stack */}
                <div className="flex items-center space-x-[-10px]">
                  {avatars.map((av, idx) => (
                    <div
                      key={idx}
                      className="relative group/avatar z-10 hover:z-30 will-change-transform"
                    >
                      <img
                        src={av.src}
                        alt={av.name}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = DEFAULT_AVATARS[idx % DEFAULT_AVATARS.length].src;
                        }}
                        className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm transition-all duration-300 ease-out group-hover/avatar:scale-115 group-hover/avatar:shadow-md cursor-pointer"
                      />
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 -translate-y-1 group-hover/avatar:opacity-100 group-hover/avatar:translate-y-0 pointer-events-none transition-all duration-200 ease-out z-40 whitespace-nowrap bg-[#13314a] text-white text-[11px] font-medium py-1 px-2.5 rounded-md shadow-lg flex flex-col items-center">
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#13314a] rotate-45" />
                        <span>{av.name}</span>
                        <span className="text-[10px] text-white/70 font-normal">{av.role}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-slate-400 text-xs font-normal leading-tight text-right pl-2">
                  Trusted by 500+
                  <br />
                  happy athletes
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll-Linked Dynamic Dimmer Overlay */}
        <div
          ref={dimmerRef}
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none z-40 bg-gradient-to-b from-[#13314a] via-[#0f283c] to-[#0a1b2a] opacity-0 will-change-opacity"
        />
      </div>
    </section>
  );
}

export { HeroSection as OrisHero };
