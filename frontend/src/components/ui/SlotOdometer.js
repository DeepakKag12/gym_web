import React, { useState, useEffect, useRef, memo } from 'react';

/**
 * DigitColumn
 * Single mechanical rotating slot cylinder containing numbers 0-9.
 */
const DigitColumn = memo(({ digit, delay = 0, duration = 1.6, inView }) => {
  const [offset, setOffset] = useState(0);
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => {
        setOffset(digit * 10);
      }, delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [inView, digit, delay]);

  return (
    <span className="inline-block h-[1em] overflow-hidden leading-none align-baseline">
      <span
        className="flex flex-col select-none transition-transform"
        style={{
          transform: `translateY(-${offset}%)`,
          transitionDuration: `${duration}s`,
          transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)',
          willChange: 'transform',
        }}
      >
        {digits.map((d) => (
          <span
            key={d}
            className="flex h-[1em] items-center justify-center leading-none"
          >
            {d}
          </span>
        ))}
      </span>
    </span>
  );
});

DigitColumn.displayName = 'DigitColumn';

/**
 * SlotOdometer
 * Exact mechanical rolling counter from Oris Dental.
 * Splits string values (e.g., "4,000+", "12", "98%") into individual mechanical reels.
 */
export default function SlotOdometer({
  value = '0',
  className = '',
  duration = 1.6,
  stagger = 0.08,
  baseDelay = 0,
}) {
  const containerRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const chars = String(value).split('');
  let digitIndex = 0;

  return (
    <span ref={containerRef} className={`inline-flex items-baseline ${className}`}>
      {chars.map((char, i) => {
        if (/\d/.test(char)) {
          const digit = parseInt(char, 10);
          const delay = baseDelay + digitIndex * stagger;
          digitIndex++;
          return (
            <DigitColumn
              key={i}
              digit={digit}
              delay={delay}
              duration={duration}
              inView={inView}
            />
          );
        }
        return (
          <span key={i} className="inline-block leading-none">
            {char}
          </span>
        );
      })}
    </span>
  );
}
