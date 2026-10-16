import React, { useState, useEffect, useRef } from 'react';

const DEFAULT_ATHLETES = [
  { name: 'Marcus Wright', role: '-18kg Body Fat / Strength Peak', src: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop' },
  { name: 'Emma Watson', role: 'Powerlifting State Gold', src: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop' },
  { name: 'Michael Chang', role: '+12kg Lean Muscle Mass', src: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=800&auto=format&fit=crop' },
  { name: 'Rachel Patel', role: 'Hyrox Pro Finisher', src: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=800&auto=format&fit=crop' },
  { name: 'Thomas Brooks', role: 'CrossFit Open Top 5%', src: 'https://images.unsplash.com/photo-1549476464-37392f717541?q=80&w=800&auto=format&fit=crop' },
  { name: 'Aria Lin', role: 'Marathon PR Sub 3:15', src: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop' },
  { name: 'Arthur Chen', role: 'Sub-10% Body Fat Cut', src: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop' },
  { name: 'Ananya Gupta', role: 'Barbell Mastery & Toning', src: 'https://images.unsplash.com/photo-1550345332-09e3ac987658?q=80&w=800&auto=format&fit=crop' },
  { name: 'Sarah Jenkins', role: 'Mobility & Rehab Recovery', src: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=800&auto=format&fit=crop' },
];

export default function TransformationsMatrix({
  manifesto = 'From modern lifting racks to structured macro protocols, every discipline is engineered around athlete progression, clinical coaching, and lasting physical mastery.',
  athletes = DEFAULT_ATHLETES,
}) {
  const containerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const scrollDist = -rect.top;
      const totalScrollable = rect.height - window.innerHeight;

      if (totalScrollable > 0) {
        const rawProgress = scrollDist / totalScrollable;
        setScrollProgress(Math.min(Math.max(rawProgress, 0), 1));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Split into 3 columns
  const leftCol = athletes.slice(0, 3);
  const midCol = athletes.slice(3, 6);
  const rightCol = athletes.slice(6, 9);

  // Exact Oris multi-phase scroll math:
  // Phase 1 (0 -> 0.70): Strips scrub in opposing directions
  // Phase 2 (0.70 -> 1.0): Outer strips translate offscreen (x: +-180%), mid cards fly apart, revealing the manifesto
  const phase1 = Math.min(scrollProgress / 0.7, 1);
  const isSplitPhase = scrollProgress > 0.7;
  const splitProgress = isSplitPhase ? (scrollProgress - 0.7) / 0.3 : 0;

  const leftY = 3 + phase1 * (-77 - 3);
  const midY = -80 + phase1 * (-4.5 - -80);
  const rightY = 3 + phase1 * (-77 - 3);
  const scale = 0.5 + phase1 * 0.5;

  const leftX = isSplitPhase ? -splitProgress * 180 : 0;
  const rightX = isSplitPhase ? splitProgress * 180 : 0;
  const midCard1Y = isSplitPhase ? -splitProgress * 130 : 0;
  const midCard2Y = isSplitPhase ? splitProgress * 130 : 0;

  const manifestoScale = isSplitPhase ? 0.82 + splitProgress * 0.18 : 0.82;
  const manifestoOpacity = isSplitPhase ? Math.min(splitProgress * 2, 1) : 0;
  const watermarkOpacity = isSplitPhase ? Math.max(0.2 - splitProgress * 0.4, 0) : 0.2;

  return (
    <>
      {/* Desktop Mode (>1025px): Pinned 3-Strip Matrix */}
      <div
        ref={containerRef}
        id="oris-reviews"
        className="w-full h-[450vh] bg-white text-oris-secondary max-[1025px]:hidden relative z-10 overflow-clip"
      >
        {/* Sticky Viewport Container */}
        <div className="w-full h-screen sticky top-0 flex justify-center items-center overflow-hidden">
          {/* Giant Background Watermark */}
          <div
            className="absolute inset-0 flex justify-center items-center pointer-events-none select-none z-1"
            style={{ opacity: watermarkOpacity }}
          >
            <h2 className="text-[13vw] font-medium tracking-tight text-oris-secondary leading-none uppercase text-center">
              ATHLETE
              <br />
              RESULTS
            </h2>
          </div>

          {/* 3 Vertical Strips Deck */}
          <div className="w-full h-full flex justify-between px-[7vw] z-2 overflow-hidden items-center">
            {/* Left Strip (Scrubs Upward) */}
            <div
              className="w-[23vw] h-fit flex flex-col gap-[4vw] items-center will-change-transform"
              style={{
                transform: `translate3d(${leftX}%, ${leftY}%, 0) scale(${scale})`,
                transition: 'transform 0.05s linear',
              }}
            >
              {leftCol.map((ath, idx) => (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredIdx(`l-${idx}`)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="w-[90%] h-[27vw] rounded-2xl overflow-hidden relative shadow-xl cursor-pointer group"
                >
                  <img
                    src={ath.src}
                    alt={ath.name}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_ATHLETES[idx % DEFAULT_ATHLETES.length].src;
                    }}
                    className="w-full h-full object-cover group-hover:scale-110 group-hover:brightness-75 transition-all duration-500 ease-out"
                  />
                  <div
                    className={`absolute bottom-[8%] left-[8%] overflow-hidden pointer-events-none transition-opacity duration-300 ${
                      hoveredIdx === `l-${idx}` ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <p className="text-white text-[1.6vw] font-medium leading-none drop-shadow-md">
                      {ath.name}
                    </p>
                    <p className="text-white/80 text-[1vw] mt-1 drop-shadow-sm">
                      {ath.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Mid Strip (Scrubs Downward & Splits) */}
            <div
              className="w-[28vw] h-fit flex flex-col gap-[7vw] items-center will-change-transform"
              style={{
                transform: `translate3d(0, ${midY}%, 0) scale(${scale})`,
                transition: 'transform 0.05s linear',
              }}
            >
              {midCol.map((ath, idx) => {
                const cardFlyY = idx === 0 ? midCard1Y : (idx === 2 ? midCard2Y : 0);
                const cardOpacity = idx === 1 && isSplitPhase ? Math.max(1 - splitProgress * 2.2, 0) : 1;
                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredIdx(`m-${idx}`)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    style={{
                      transform: `translate3d(0, ${cardFlyY}%, 0)`,
                      opacity: cardOpacity,
                      transition: 'transform 0.05s linear, opacity 0.2s ease-out',
                    }}
                    className="w-[90%] h-[34vw] rounded-2xl overflow-hidden relative shadow-2xl cursor-pointer group"
                  >
                    <img
                      src={ath.src}
                      alt={ath.name}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = DEFAULT_ATHLETES[(idx + 3) % DEFAULT_ATHLETES.length].src;
                      }}
                      className="w-full h-full object-cover group-hover:scale-110 group-hover:brightness-75 transition-all duration-500 ease-out"
                    />
                    <div
                      className={`absolute bottom-[8%] left-[8%] overflow-hidden pointer-events-none transition-opacity duration-300 ${
                        hoveredIdx === `m-${idx}` ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <p className="text-white text-[1.8vw] font-medium leading-none drop-shadow-md">
                        {ath.name}
                      </p>
                      <p className="text-white/80 text-[1.1vw] mt-1 drop-shadow-sm">
                        {ath.role}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Strip (Scrubs Upward) */}
            <div
              className="w-[23vw] h-fit flex flex-col gap-[4vw] items-center will-change-transform"
              style={{
                transform: `translate3d(${rightX}%, ${rightY}%, 0) scale(${scale})`,
                transition: 'transform 0.05s linear',
              }}
            >
              {rightCol.map((ath, idx) => (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredIdx(`r-${idx}`)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="w-[90%] h-[27vw] rounded-2xl overflow-hidden relative shadow-xl cursor-pointer group"
                >
                  <img
                    src={ath.src}
                    alt={ath.name}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_ATHLETES[(idx + 6) % DEFAULT_ATHLETES.length].src;
                    }}
                    className="w-full h-full object-cover group-hover:scale-110 group-hover:brightness-75 transition-all duration-500 ease-out"
                  />
                  <div
                    className={`absolute bottom-[8%] left-[8%] overflow-hidden pointer-events-none transition-opacity duration-300 ${
                      hoveredIdx === `r-${idx}` ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <p className="text-white text-[1.6vw] font-medium leading-none drop-shadow-md">
                      {ath.name}
                    </p>
                    <p className="text-white/80 text-[1vw] mt-1 drop-shadow-sm">
                      {ath.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Centered Manifesto Statement Zoom Reveal */}
          <div
            className="absolute inset-0 flex justify-center items-center pointer-events-none z-10 px-8"
            style={{
              opacity: manifestoOpacity,
              transform: `scale(${manifestoScale})`,
              transition: 'opacity 0.2s, transform 0.2s',
            }}
          >
            <div className="w-[72%] text-center">
              <p className="text-oris-secondary font-normal text-[3.4vw] leading-[1.25] tracking-tight">
                {manifesto}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Fallback (≤1025px): Clean 2-Column Responsive Grid */}
      <div className="hidden max-[1025px]:block w-full bg-white text-oris-secondary px-6 py-20 max-md:py-14">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-[6vw] max-md:text-[7.5vw] font-normal leading-tight">
              Athlete Transformations
            </h2>
            <p className="oris-text22 text-slate-600 mt-2 max-w-xl">
              Real results from verified members forging strength at FitNation.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-md:grid-cols-2">
            {athletes.map((ath, i) => (
              <div key={i} className="overflow-hidden rounded-xl relative aspect-[3/4] shadow-md group">
                <img
                  src={ath.src}
                  alt={ath.name}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = DEFAULT_ATHLETES[i % DEFAULT_ATHLETES.length].src;
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3 text-white">
                  <span className="font-medium text-sm">{ath.name}</span>
                  <span className="text-[11px] text-white/75">{ath.role}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-6 text-center oris-bg-primary text-white mt-4 shadow-lg">
            <p className="oris-text22 font-normal leading-relaxed">
              {manifesto}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export { TransformationsMatrix as OrisTransformationsMatrix };
