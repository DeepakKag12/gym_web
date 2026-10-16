'use client';
import React, { useState, useEffect } from 'react';
import SpiralAnimation from './spiral-animation';

/**
 * SpiralLoader
 * Elegant 3D kinetic spiral particle loader.
 * Replaces generic spinners with smooth logarithmic spiral kinetics.
 * Guarantees 100% transparent background by default, no black boxes,
 * zero layout shift, and smooth natural easing.
 */
export function SpiralLoader({
  message = '',
  fullscreen = false,
  size = 'md', // 'sm' | 'md' | 'lg' | 'full'
  className = '',
  transparent = true,
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 50ms micro-threshold avoids flash on instant cached requests
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const isFullscreen = fullscreen || size === 'full';

  // Dimension mapping for container mode
  const dimensionClasses = {
    sm: 'w-36 h-36 sm:w-44 sm:h-44',
    md: 'w-48 h-48 sm:w-60 sm:h-60',
    lg: 'w-64 h-64 sm:w-80 sm:h-80',
    full: 'w-full h-full',
  }[size] || 'w-48 h-48 sm:w-60 sm:h-60';

  if (isFullscreen) {
    return (
      <div
        className={`fixed inset-0 w-screen h-screen z-[99999] bg-[#050607]/85 backdrop-blur-md flex flex-col items-center justify-center select-none overflow-hidden transition-opacity duration-300 ${className}`}
        aria-label="Loading"
        role="status"
      >
        <div className="relative w-[min(78vw,440px)] h-[min(78vw,440px)] pointer-events-none flex items-center justify-center">
          <SpiralAnimation hoverToPlay={false} transparent={true} className="w-full h-full" />
        </div>

        {Boolean(message) && (
          <div className="relative z-10 font-mono text-xs uppercase tracking-[0.25em] text-[#93c5fd] mt-4 drop-shadow-md">
            {message}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none py-6 sm:py-8 ${className}`}
      aria-label="Loading"
      role="status"
    >
      <div className={`relative ${dimensionClasses} overflow-hidden pointer-events-none flex items-center justify-center`}>
        <SpiralAnimation hoverToPlay={false} transparent={transparent} className="w-full h-full" />
      </div>

      {Boolean(message) && (
        <div className="relative z-10 font-mono text-xs uppercase tracking-widest text-[#3365e2] dark:text-blue-400 mt-2">
          {message}
        </div>
      )}
    </div>
  );
}

export default SpiralLoader;
