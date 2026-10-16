import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, MessageCircle, MapPin, Clock, ArrowRight } from 'lucide-react';
import DotMatrixCanvas from '../ui/DotMatrixCanvas';

export default function Footer({
  brandName = 'FITNATION',
  tagline = 'Uniting a Healthier World',
  phone = '+91 96309 06906',
  altPhone = '+91 95897 30151',
  address = 'Fourlane Square, Tridalam Arcade, First Floor, Rajgarh (Dhar), MP',
}) {
  const footerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const location = useLocation?.() || {};
  const isHome = location.pathname === '/' || location.pathname === '/oris' || location.pathname === '/apex';

  useEffect(() => {
    if (!isHome) return;

    const handleScroll = () => {
      const el = footerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const winH = window.innerHeight;
      if (rect.top <= winH) {
        const progress = Math.min(Math.max((winH - rect.top) / winH, 0), 1);
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  // Scrub animations for watermark and columns (only on home curtain)
  const logoScale = isHome ? 0.92 + scrollProgress * 0.12 : 1;
  const logoY = isHome ? (1 - scrollProgress) * 25 : 0;
  const colY = isHome ? (1 - scrollProgress) * 20 : 0;
  const colOpacity = isHome ? 0.75 + scrollProgress * 0.25 : 1;

  const footerContent = (
    <>
      {/* Background Dot Matrix Canvas */}
      <DotMatrixCanvas
        spacing={24}
        lerpFactor={0.15}
        baseRadius={1.4}
        maxRadius={3.8}
        interactionRadius={200}
      />

      {/* Giant Scaling Brand Mark Vector (Watermark Background — zero collision) */}
      <div
        aria-hidden="true"
        style={
          isHome
            ? {
                transform: `translate3d(-50%, ${logoY}px, 0) scale(${logoScale})`,
                willChange: 'transform',
                transition: 'transform 0.1s linear',
              }
            : { transform: 'translateX(-50%)' }
        }
        className="absolute bottom-0 left-1/2 pointer-events-none select-none z-0 overflow-hidden w-full flex justify-center items-end opacity-[0.09]"
      >
        <span className="gym-font text-[14vw] sm:text-[13vw] leading-none tracking-widest text-white uppercase whitespace-nowrap translate-y-[22%]">
          {brandName}
        </span>
      </div>

      {/* Top Headline */}
      <div className="relative z-10 flex flex-col items-start max-w-3xl max-[1025px]:max-w-full mb-6 sm:mb-8">
        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-white font-semibold text-xs tracking-widest uppercase border border-white/20 mb-3 backdrop-blur-sm shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {tagline}
        </span>
        <h2 className="oris-text64 font-extrabold text-white max-w-[50vw] max-[1025px]:max-w-full tracking-tight leading-tight">
          Forge unbreakable physical strength with expert guidance.
        </h2>
        <p className="text-white/80 text-xs sm:text-sm mt-2 max-w-xl font-normal leading-relaxed">
          4,000+ sq ft athletic floor, certified periodization coaching, and scientific Indian nutrition in Rajgarh (Dhar), MP.
        </p>
      </div>

      {/* Navigation Grid — 4 Clean Columns with Rich Contrast */}
      <nav
        aria-label="Footer"
        style={
          isHome
            ? {
                transform: `translate3d(0, ${colY}px, 0)`,
                opacity: colOpacity,
                transition: 'transform 0.1s linear, opacity 0.1s linear',
              }
            : undefined
        }
        className="relative z-10 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 my-auto pt-2 pb-6"
      >
        {/* Column 1: Programs */}
        <div className="flex flex-col gap-3">
          <p className="text-white font-bold text-sm tracking-wider uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B5C9F7]" />
            Training Programs
          </p>
          <ul className="flex flex-col gap-2.5 text-xs sm:text-sm text-white/90">
            {['Strength Mastery', 'Metabolic Conditioning', 'Olympic Lifting', 'Mobility & Recovery'].map((item, i) => (
              <li key={i}>
                <Link to="/exercises" className="group inline-block relative py-0.5 text-white/85 hover:text-white transition-colors no-underline">
                  <span>{item}</span>
                  <span className="absolute left-0 bottom-0 w-full h-[1.5px] bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
              </li>
            ))}
            <li>
              <Link to="/exercises" className="group inline-flex items-center gap-1.5 py-0.5 text-blue-200 hover:text-white font-semibold transition-colors no-underline">
                <span>Explore Workouts</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 2: Facility */}
        <div className="flex flex-col gap-3">
          <p className="text-white font-bold text-sm tracking-wider uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B5C9F7]" />
            The Facility
          </p>
          <ul className="flex flex-col gap-2.5 text-xs sm:text-sm text-white/90">
            {[
              { label: 'Facility Tour & Zones', href: '/about' },
              { label: 'Founder Ajeet Kag', href: '/about' },
              { label: 'Member Results', href: '/transformations' },
              { label: 'Membership Tiers', href: isHome ? '#oris-plans' : '/#oris-plans' },
              { label: 'Indian Diet Plans', href: '/diet' },
            ].map((item, i) => (
              <li key={i}>
                {item.href.startsWith('#') ? (
                  <a href={item.href} className="group inline-block relative py-0.5 text-white/85 hover:text-white transition-colors no-underline">
                    <span>{item.label}</span>
                    <span className="absolute left-0 bottom-0 w-full h-[1.5px] bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </a>
                ) : (
                  <Link to={item.href} className="group inline-block relative py-0.5 text-white/85 hover:text-white transition-colors no-underline">
                    <span>{item.label}</span>
                    <span className="absolute left-0 bottom-0 w-full h-[1.5px] bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Hours & Schedule */}
        <div className="flex flex-col gap-3">
          <p className="text-white font-bold text-sm tracking-wider uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B5C9F7]" />
            Location &amp; Hours
          </p>
          <div className="flex items-start gap-2 text-xs text-white/90 leading-relaxed">
            <MapPin size={15} className="text-blue-200 flex-shrink-0 mt-0.5" />
            <span>{address}</span>
          </div>
          <div
            className="p-3.5 rounded-xl border text-xs space-y-1.5 shadow-sm"
            style={{
              backgroundColor: 'rgba(11, 27, 74, 0.7)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <div className="flex items-center gap-2 font-bold text-white text-xs tracking-wide">
              <Clock size={14} className="text-emerald-400 shrink-0" />
              <span>Operating Timings</span>
            </div>
            <div className="text-white/95 text-xs font-medium pt-0.5">
              Morning: <strong className="text-white font-extrabold tracking-wide">5:00 AM – 11:00 AM</strong>
            </div>
            <div className="text-white/95 text-xs font-medium">
              Evening: <strong className="text-white font-extrabold tracking-wide">4:00 PM – 10:00 PM</strong>
            </div>
            <div className="text-[11px] text-[#B5C9F7] font-bold tracking-wide pt-1 border-t border-white/10">
              Mon–Sat (Sunday Closed)
            </div>
          </div>
        </div>

        {/* Column 4: Contact & Direct Pass */}
        <div className="flex flex-col gap-3">
          <p className="text-white font-bold text-sm tracking-wider uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B5C9F7]" />
            Direct Contact
          </p>
          <div className="flex flex-col gap-2 text-xs">
            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              className="inline-flex items-center gap-2 p-2.5 rounded-lg text-white font-bold transition-all border shadow-xs"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.14)',
                borderColor: 'rgba(255, 255, 255, 0.22)',
              }}
            >
              <Phone size={14} className="text-blue-200" />
              <span>Call: {phone}</span>
            </a>
            <a
              href={`https://wa.me/919630906906?text=Hi%20Coach%20Ajeet,%20I%20want%20to%20enquire%20about%20FitNation%20membership`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 p-2.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white font-bold transition-all shadow-md"
            >
              <MessageCircle size={14} />
              <span>WhatsApp Head Coach</span>
            </a>
          </div>
          <div className="text-[11px] text-white/90 pt-1 font-medium">
            Support: <a href={`tel:${altPhone.replace(/\s+/g, '')}`} className="text-blue-200 hover:underline font-bold">{altPhone}</a>
          </div>
        </div>
      </nav>

      {/* Bottom Bar: Copyright & Credits — Elevated Z-Index, Absolute Zero Overlap */}
      <div
        className="relative z-20 w-full pt-4 pb-2 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-white/80 text-xs"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <p className="font-medium text-center sm:text-left">
          &copy; {new Date().getFullYear()} FitNation by Ajeet. All Rights Reserved. Location: Rajgarh (Dhar), MP.
        </p>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white font-medium text-[11px] border border-white/15">
            Crafted by Deepak Kag
          </span>
        </div>
      </div>
    </>
  );

  // If on Home page, render the exact fixed curtain wrapper
  if (isHome) {
    return (
      <div
        ref={footerRef}
        className="relative min-h-[640px] lg:h-screen w-full max-[1025px]:h-auto max-[1025px]:min-h-0"
        style={{ clipPath: 'inset(0 0 0 0)' }}
      >
        <footer
          id="oris-footer"
          className="fixed bottom-0 left-0 w-full h-full lg:h-screen bg-gradient-to-b from-[#3365e2] via-[#234fc7] to-[#0f2b82] text-white overflow-y-auto lg:overflow-hidden oris-paddx pt-12 lg:pt-[4vw] pb-6 flex flex-col justify-between max-[1025px]:relative max-[1025px]:h-auto max-[1025px]:min-h-0 select-none"
        >
          {footerContent}
        </footer>
      </div>
    );
  }

  // If on Subpages, render relative container with identical styling and tokens
  return (
    <footer
      id="oris-footer"
      className="relative z-20 w-full min-h-[560px] bg-gradient-to-b from-[#3365e2] via-[#234fc7] to-[#0f2b82] text-white overflow-hidden oris-paddx pt-14 pb-6 flex flex-col justify-between select-none"
    >
      {footerContent}
    </footer>
  );
}

export { Footer as OrisCurtainFooter };
