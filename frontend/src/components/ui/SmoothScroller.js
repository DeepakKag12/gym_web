import React, { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * SmoothScroller
 * Physics-based smooth scrolling engine (Lenis) replicating Oris Dental's
 * continuous, sub-pixel scroll rhythm.
 */
export default function SmoothScroller({ children }) {
  useEffect(() => {
    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (prefersReducedMotion) return;

    let lenis = null;
    let animId = 0;

    try {
      const LenisClass = Lenis?.default || Lenis;
      if (typeof LenisClass === 'function') {
        lenis = new LenisClass({
          duration: 1.25,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: 'vertical',
          gestureOrientation: 'vertical',
          smoothWheel: true,
          wheelMultiplier: 0.9,
          touchMultiplier: 1.2,
        });

        const raf = (time) => {
          if (lenis?.raf) lenis.raf(time);
          animId = requestAnimationFrame(raf);
        };

        animId = requestAnimationFrame(raf);
      }
    } catch (e) {
      console.warn('Lenis smooth scroller error:', e);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (lenis && typeof lenis.destroy === 'function') lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
