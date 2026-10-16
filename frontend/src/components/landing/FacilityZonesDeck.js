import React, { useState, useEffect, useRef } from 'react';

const DEFAULT_STACKING_PROGRAMS = [
  {
    id: 1,
    title: 'Strength Mastery &\nHeavy Compound Lifts',
    tags: ['Chest', 'Back', 'Progressive Overload'],
    description: 'Master the deadlift, squat, and bench press through micro-periodization and mechanical optimization. Designed to safely break plateaus and forge bone-dense maximal power.',
    bgColor: '#13314a',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'High-Velocity HIIT &\nMetabolic Conditioning',
    tags: ['Shoulders', 'Arms', 'Continuous Burn'],
    description: 'High-intensity athletic conditioning structured in tactical work-to-rest ratios. Enhances oxygen uptake, accelerates calorie expenditure, and conditions mental grit.',
    bgColor: '#3365e2',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 3,
    title: 'Athletic Mobility &\nOlympic Weightlifting',
    tags: ['Clean & Jerk', 'Thoracic Extension', 'Tendon Longevity'],
    description: 'Dynamic power generation through Olympic barbell pulling patterns combined with deep hip and shoulder mobility protocols for lifelong joint integrity.',
    bgColor: '#13314a',
    image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1200&auto=format&fit=crop',
  },
];

export default function FacilityZonesDeck({
  heading = 'Signature Training Programs',
  subheading = 'Rigorous, periodized disciplines designed for athletes seeking tangible physical dominance.',
  cards = DEFAULT_STACKING_PROGRAMS,
}) {
  const containerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const scrollDist = -rect.top;
      const totalScrollable = rect.height - window.innerHeight;

      if (totalScrollable > 0) {
        const rawProgress = scrollDist / totalScrollable;
        const clamped = Math.min(Math.max(rawProgress, 0), 1);
        setScrollProgress(clamped);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="w-full bg-white h-fit relative z-10 pt-[6vw] pb-[2vw] max-md:pb-0 text-oris-secondary">
      {/* Header */}
      <div className="oris-paddx mb-[7vw] max-[1025px]:mb-[10vw] max-md:mb-[12vw]">
        <h2 className="text-[4.2vw] max-[1025px]:text-[6vw] max-md:text-[7.5vw] font-normal leading-tight">
          {heading}
        </h2>
        <p className="oris-text22 mt-[1.5vw] text-slate-600">
          {subheading}
        </p>
      </div>

      {/* Pinned Stacking Deck Container */}
      <div
        ref={containerRef}
        style={{ height: `${55 * cards.length}svh` }}
        className="w-full relative"
      >
        <div className="w-full oris-paddx sticky top-[5vw] max-[1025px]:top-0 h-screen max-[1025px]:h-[100svh] flex items-center justify-center">
          <div className="relative w-full h-[36vw] max-[1025px]:h-[74svh] max-md:h-[76svh]">
            {cards.map((card, idx) => {
              // Exact mathematical translation and scale interpolation
              const segment = 1 / (cards.length - 1);
              let cardProgress = 0;
              if (idx > 0) {
                const startAt = (idx - 1) * segment;
                cardProgress = Math.min(Math.max((scrollProgress - startAt) / segment, 0), 1);
              }

              // Card translates up from 110vh to 0px
              const translateY = idx === 0 ? 0 : (1 - cardProgress) * 100;

              // Previous cards scale down smoothly
              let scale = 1.0;
              if (idx < cards.length - 1) {
                const nextCardProgress = Math.min(
                  Math.max((scrollProgress - idx * segment) / segment, 0),
                  1
                );
                scale = 1.0 - nextCardProgress * 0.05;
              }

              return (
                <div
                  key={card.id || idx}
                  style={{
                    zIndex: idx + 1,
                    backgroundColor: card.bgColor,
                    top: `calc(${6 * idx}vw)`,
                    transform: `translate3d(0, ${translateY}%, 0) scale(${scale})`,
                    transformOrigin: 'center top',
                    willChange: 'transform',
                  }}
                  className="absolute inset-x-0 h-[35vw] max-[1025px]:h-full rounded-[2.2vw] max-[1025px]:rounded-[24px] py-[1.4vw] pb-[2.8vw] px-[2.8vw] max-[1025px]:p-[4.5vw] max-md:p-[5vw] flex flex-row max-[1025px]:flex-col items-center max-[1025px]:items-start justify-between gap-[3vw] max-[1025px]:gap-[2.5vw] border border-white/10 shadow-2xl transition-transform duration-100 ease-linear"
                >
                  {/* Left Column: Title, Tags, Description */}
                  <div className="flex flex-col justify-between h-full flex-1 max-[1025px]:h-auto max-[1025px]:gap-[2.5vw]">
                    <div>
                      <h3 className="text-white w-full text-[3.6vw] max-[1025px]:text-[5.5vw] max-md:text-[7vw] leading-[1.15] whitespace-pre-line font-medium">
                        {card.title}
                      </h3>

                      {/* Pill Tags */}
                      <div className="flex flex-wrap items-center gap-[0.6vw] max-[1025px]:gap-[1.5vw] text-white oris-text22 mt-[1.2vw] max-[1025px]:mt-[2vw]">
                        {card.tags.map((tag, tIdx) => (
                          <React.Fragment key={tIdx}>
                            <span className="font-medium text-white/90">{tag}</span>
                            {tIdx < card.tags.length - 1 && (
                              <span className="w-[0.3vw] h-[0.3vw] min-w-[4px] min-h-[4px] rounded-full bg-white inline-block" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-white/85 oris-text32 max-w-[55vw] pb-[2vw] max-[1025px]:pb-0 max-[1025px]:max-w-full leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: High-Res Image Card */}
                  <div className="relative w-[24vw] h-[26vw] max-[1025px]:w-full max-[1025px]:h-[30svh] rounded-[1.6vw] max-[1025px]:rounded-xl overflow-hidden shrink-0 shadow-xl border border-white/10">
                    <img
                      src={card.image}
                      alt={card.title}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = DEFAULT_STACKING_PROGRAMS[idx % DEFAULT_STACKING_PROGRAMS.length].image;
                      }}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export { FacilityZonesDeck as OrisStackingCardsDeck };
