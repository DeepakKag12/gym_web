import React, { useState, useEffect, useRef, useMemo } from 'react';

const DEFAULT_COACHES = [
  {
    name: 'Ajeet Kag',
    title: 'Founder & Head Strength Coach',
    specialty: 'Powerlifting & Biomechanics',
    src: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=900&auto=format&fit=crop',
  },
  {
    name: 'Vikram Singh',
    title: 'Conditioning Director',
    specialty: 'HIIT & Athletic Capacity',
    src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=900&auto=format&fit=crop',
  },
  {
    name: 'Pooja Sharma',
    title: 'Mobility & Hypertrophy Specialist',
    specialty: 'Movement Screening & Hypertrophy',
    src: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=900&auto=format&fit=crop',
  },
  {
    name: 'Rahul Verma',
    title: 'Performance Nutritionist',
    specialty: 'Macro Protocols & Body Recomp',
    src: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=900&auto=format&fit=crop',
  },
];

export default function CoachesLineup({
  heading = 'Passion Meets Purpose',
  subheading = 'Behind every athlete transformation is a team united by one goal: engineering physical excellence without compromises.',
  coaches = DEFAULT_COACHES,
}) {
  const containerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Guarantee all 4 card slots are populated with high-res photography and zero broken elements
  const displayCoaches = useMemo(() => {
    const list = Array.isArray(coaches) && coaches.length > 0 ? coaches : DEFAULT_COACHES;
    return [
      list[0] || DEFAULT_COACHES[0],
      list[1] || DEFAULT_COACHES[1],
      list[2] || DEFAULT_COACHES[2],
      list[3] || DEFAULT_COACHES[3],
    ];
  }, [coaches]);

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

  // Multi-phase Oris scrub math:
  // Phase 1 (0 -> 0.45): All 4 cards rise from 105% down to 0% (center of viewport)
  // Phase 2 (0.45 -> 1.0): Card 1 fans out left (110% -> 0%), Card 4 fans out right (-110% -> 0%)
  const riseProgress = Math.min(scrollProgress / 0.45, 1);
  const yPercent = (1 - riseProgress) * 105;

  const fanProgress = scrollProgress > 0.45 ? (scrollProgress - 0.45) / 0.55 : 0;
  const card1X = (1 - fanProgress) * 110;
  const card4X = (1 - fanProgress) * -110;

  return (
    <section id="passion-meet-purpose" className="w-full bg-white relative z-10 text-oris-secondary select-none">
      {/* Desktop Mode (>1025px): Pinned 220vh Panoramic Expansion */}
      <div ref={containerRef} className="w-full h-[220vh] max-[1025px]:hidden relative">
        <div className="sticky top-0 h-screen w-full flex flex-col justify-center items-center oris-paddx overflow-hidden">
          {/* Header */}
          <div className="flex flex-col items-center text-center mx-auto mb-[3.5vw]">
            <h2 className="text-[4.2vw] font-normal leading-[1.15] tracking-tight">
              {heading}
            </h2>
            <p className="oris-text22 text-slate-600 mt-[1.2vw] max-w-[42vw]">
              {subheading}
            </p>
          </div>

          {/* Panoramic Cards Lineup */}
          <div className="flex items-center justify-center gap-[2.2vw] w-full max-w-[94vw] relative">
            {displayCoaches.map((coach, idx) => {
              // Exact fan-out transform mapping:
              // Index 0: outer left (card1X)
              // Index 1: center left (anchor, x: 0)
              // Index 2: center right (anchor, x: 0)
              // Index 3: outer right (card4X)
              const cardX = idx === 0 ? card1X : idx === 3 ? card4X : 0;
              const zIndex = idx === 1 || idx === 2 ? 20 : 10;

              return (
                <div
                  key={idx}
                  className={`relative w-[21.5vw] aspect-[3/4.2] rounded-[1.2vw] overflow-hidden will-change-transform shadow-2xl group border border-slate-200/60 bg-slate-900 ${
                    zIndex === 20 ? 'z-20' : 'z-10'
                  }`}
                  style={{
                    transform: `translate3d(${cardX}%, ${yPercent}%, 0)`,
                    transition: 'transform 0.05s linear',
                  }}
                >
                  <img
                    src={coach.src || DEFAULT_COACHES[idx].src}
                    alt={coach.name}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_COACHES[idx].src;
                    }}
                    className="w-full h-full object-cover object-top sm:object-center group-hover:scale-105 transition-transform duration-700 ease-out will-change-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-5 text-white">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
                      <span className="text-[11px] text-[#93c5fd] font-mono tracking-wider uppercase drop-shadow-sm truncate">
                        {coach.specialty}
                      </span>
                    </div>
                    <span className="font-bold text-lg sm:text-xl leading-tight drop-shadow-sm truncate">
                      {coach.name}
                    </span>
                    <span className="text-xs text-white/80 mt-0.5 drop-shadow-sm truncate">
                      {coach.title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Mode (≤1025px): 2x2 Grid */}
      <div className="hidden max-[1025px]:flex max-[1025px]:flex-col max-[1025px]:items-center max-[1025px]:gap-10 oris-paddx py-20 max-md:py-14">
        <div className="flex flex-col items-center text-center mx-auto">
          <h2 className="text-[6vw] max-md:text-[7.5vw] font-normal leading-[1.15]">
            {heading}
          </h2>
          <p className="oris-text22 text-slate-600 mt-3 max-w-xl">
            {subheading}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
          {displayCoaches.map((c, i) => (
            <div key={i} className="w-full aspect-[3/4.2] relative rounded-xl overflow-hidden shadow-lg group border border-slate-200/80 bg-slate-900">
              <img
                src={c.src || DEFAULT_COACHES[i].src}
                alt={c.name}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = DEFAULT_COACHES[i].src;
                }}
                className="w-full h-full object-cover object-top sm:object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent flex flex-col justify-end p-3.5 text-white">
                <span className="text-[10px] text-[#93c5fd] font-mono uppercase truncate">{c.specialty}</span>
                <span className="font-bold text-sm sm:text-base leading-tight truncate">{c.name}</span>
                <span className="text-[11px] text-white/80 truncate">{c.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { CoachesLineup as OrisCoachesLineup };
