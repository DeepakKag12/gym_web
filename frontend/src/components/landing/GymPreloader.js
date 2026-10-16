import React, { useState, useEffect, useCallback } from 'react';
import { SpiralAnimation } from '../ui/spiral-animation';

/**
 * GymPreloader
 * Non-intrusive, smooth intro reveal.
 * Displays kinetic spiral particle animation briefly while assets hydrate,
 * then smoothly fades away into the landing experience.
 * Never forces the user to wait; can be dismissed instantly on click or tap.
 */
export default function GymPreloader({ onFinish }) {
  const [isDone, setIsDone] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  const completeLoading = useCallback(() => {
    if (isDone) return;
    setIsDone(true);
    window.__orisLoaderFinished = true;
    window.dispatchEvent(new CustomEvent('oris-loader-finished'));
    if (onFinish) onFinish();

    setTimeout(() => {
      setShouldRender(false);
    }, 500);
  }, [isDone, onFinish]);

  useEffect(() => {
    if (window.__orisLoaderFinished) {
      setShouldRender(false);
      return;
    }

    // Smooth brief intro (850ms) - never feels forced or delayed
    const timer = setTimeout(() => {
      completeLoading();
    }, 850);

    return () => clearTimeout(timer);
  }, [completeLoading]);

  if (!shouldRender) return null;

  return (
    <aside
      aria-label="Loading"
      onClick={completeLoading}
      className={`fixed inset-0 z-[99999] w-screen h-screen overflow-hidden bg-[#050607] flex items-center justify-center transition-opacity duration-500 ease-out cursor-pointer select-none ${
        isDone ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
      }`}
    >
      {/* ── Centered Smooth Kinetic Spiral ── */}
      <div className="relative w-[min(70vw,400px)] h-[min(70vw,400px)] pointer-events-none flex items-center justify-center">
        <SpiralAnimation hoverToPlay={false} transparent={true} className="w-full h-full" />
      </div>
    </aside>
  );
}

export { GymPreloader as OrisPreloader };
