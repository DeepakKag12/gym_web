import React, { useState, useEffect, useRef } from 'react';

/**
 * OrisPreloader
 * Fullscreen preloader with dual-layer SVG logo clip-path reveal and lifecycle handshake.
 * Dispatches `oris-loader-finished` and sets `window.__orisLoaderFinished = true`.
 */
export default function GymPreloader({ brandName = 'FITNATION', onFinish }) {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);
  const clipRef = useRef(null);
  const animRef = useRef(0);

  useEffect(() => {
    // If user already visited in current session, bypass immediately
    if (window.__orisLoaderFinished) {
      setShouldRender(false);
      return;
    }

    const startTime = performance.now();
    let currentProgress = 0;

    const tick = (now) => {
      const elapsed = (now - startTime) / 1000;

      // Realistic progressive curve: fast start, eases smoothly into 100%
      let target = 100 * (1 - Math.exp(-elapsed * 3.5));
      if (elapsed > 1.2) target = 100;

      currentProgress += (target - currentProgress) * 0.15;

      if (currentProgress >= 99.5) {
        currentProgress = 100;
        setProgress(100);
        if (clipRef.current) {
          clipRef.current.style.clipPath = 'inset(0 0% 0 0)';
        }

        setTimeout(() => {
          setIsDone(true);
          window.__orisLoaderFinished = true;
          window.dispatchEvent(new CustomEvent('oris-loader-finished'));
          if (onFinish) onFinish();

          setTimeout(() => {
            setShouldRender(false);
          }, 750);
        }, 300);
        return;
      }

      setProgress(currentProgress);
      if (clipRef.current) {
        clipRef.current.style.clipPath = `inset(0 ${(100 - currentProgress).toFixed(2)}% 0 0)`;
      }

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [onFinish]);

  if (!shouldRender) return null;

  return (
    <aside
      aria-label="Loading"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-gradient-to-b from-[#3365e2] to-[#0f2b82] text-white transition-all duration-700 select-none ${
        isDone ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100 pointer-events-auto'
      }`}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.85, 0, 0.15, 1)',
      }}
    >
      {/* Central glow orb */}
      <div className="absolute w-[20vw] h-[20vw] min-w-[200px] min-h-[200px] rounded-full bg-white/10 blur-3xl pointer-events-none" />

      {/* Dual-layered logo reveal */}
      <div className="relative z-10 flex flex-col items-center select-none px-6">
        <div className="relative w-[34vw] max-w-[420px] min-w-[240px] aspect-[1872/334] flex items-center justify-center">
          {/* Base dim logo */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
            <span className="gym-font text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wider text-white">
              {brandName}
            </span>
          </div>

          {/* Sharp clipping logo overlay */}
          <div
            ref={clipRef}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              clipPath: `inset(0 ${(100 - progress).toFixed(2)}% 0 0)`,
              willChange: 'clip-path',
            }}
          >
            <span className="gym-font text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wider text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
              {brandName}
            </span>
          </div>
        </div>

        {/* Numeric progress indicator */}
        <div className="mt-6 flex items-center gap-2 text-white/70 font-mono text-xs uppercase tracking-widest">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span>INITIALIZING CORE // {Math.round(progress)}%</span>
        </div>
      </div>
    </aside>
  );
}

export { GymPreloader as OrisPreloader };
