import React, { useState, useEffect, useRef } from 'react';

export default function ParallaxBanner({
  imageSrc = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2000&auto=format&fit=crop',
  text = 'At FitNation by Ajeet, our training environment is built for relentless focus: from Olympic barbells and custom power cages to metabolic conditioning rigs and contrast therapy, every square foot is calibrated for athletic excellence.',
}) {
  const sectionRef = useRef(null);
  const imageRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = sectionRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const winH = window.innerHeight;

      if (rect.bottom >= 0 && rect.top <= winH) {
        const progress = (winH - rect.top) / (winH + rect.height);
        const clamped = Math.min(Math.max(progress, 0), 1);
        setScrollProgress(clamped);

        if (imageRef.current) {
          // Exact Oris parallax translation: (progress - 0.5) * 100px
          imageRef.current.style.transform = `translate3d(0, ${(clamped - 0.5) * 120}px, 0) scale(1.15)`;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const words = text.split(' ');

  return (
    <section
      ref={sectionRef}
      id="parallax"
      className="h-screen max-[1025px]:max-h-[80vh] w-full flex items-center justify-center relative overflow-hidden select-none"
    >
      {/* Parallax Background Photo */}
      <div
        ref={imageRef}
        className="absolute inset-0 w-full h-full will-change-transform"
        style={{
          transition: 'transform 0.1s linear',
        }}
      >
        <img
          src={imageSrc}
          alt="Iron Forge Facility Interior"
          className="w-full h-full object-cover brightness-[0.45]"
        />
      </div>

      {/* Dark gradient vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/80 z-5" />

      {/* Kinetic Letter / Word Scrubbing Overlay */}
      <h2 className="oris-text48 relative text-center w-[88vw] max-w-6xl z-10 font-medium leading-[1.3] text-balance px-4">
        {words.map((word, wIdx) => {
          // Calculate when each word lights up from dim to bright white
          const wordThreshold = (wIdx + 0.5) / words.length;
          const isRevealed = scrollProgress >= wordThreshold * 0.8;

          return (
            <span
              key={wIdx}
              className="inline-block mr-[0.35em] transition-colors duration-300"
              style={{
                color: isRevealed ? '#ffffff' : 'rgba(255, 255, 255, 0.28)',
                textShadow: isRevealed ? '0 0 16px rgba(255, 255, 255, 0.3)' : 'none',
              }}
            >
              {word}
            </span>
          );
        })}
      </h2>
    </section>
  );
}

export { ParallaxBanner as OrisParallaxBand };
