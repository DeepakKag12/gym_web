import React, { useState, useRef } from 'react';
import DotMatrixCanvas from '../ui/DotMatrixCanvas';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const DEFAULT_PROGRAMS = [
  {
    id: 1,
    title: 'Movement Screen &\nBiomechanics',
    description: 'Comprehensive functional assessment of your kinetic chain to identify muscular imbalances and prime joints for heavy load.',
    bgClassName: 'oris-bg-primary', // #3365e2
  },
  {
    id: 2,
    title: 'Periodized Strength\nArchitecture',
    description: 'Progressive overload training models targeting maximal neural recruitment, barbell compound mastery, and power development.',
    bgClassName: 'bg-oris-secondary', // #13314a
  },
  {
    id: 3,
    title: 'High-Output Metabolic\nConditioning',
    description: 'Interval-based engine development combining rowers, kettlebells, and plyometrics to incinerate body fat and elevate VO2 max.',
    bgClassName: 'oris-bg-primary',
  },
  {
    id: 4,
    title: 'Hypertrophy &\nMuscle Sculpting',
    description: 'Targeted volume, time-under-tension protocols, and angle variations designed for optimal fiber tears and muscle density.',
    bgClassName: 'bg-oris-secondary',
  },
  {
    id: 5,
    title: 'Mobility, Recovery &\nContrast Therapy',
    description: 'Structured myofascial release, joint decompression, and hot/cold recovery guidance to keep your body injury-free.',
    bgClassName: 'oris-bg-primary',
  },
  {
    id: 6,
    title: 'Targeted Nutrition &\nMacronutrient Protocol',
    description: 'Custom macro allocations aligned to your metabolic expenditure, training volume, and specific body composition goals.',
    bgClassName: 'bg-oris-secondary',
  },
];

export default function ProgramsCarousel({
  headline = 'Built for Your Lasting Progress',
  subheading = 'Every workout is engineered with scientific periodization, progressive overload, and continuous personal guidance to maximize athletic capacity and physical longevity.',
  programs = DEFAULT_PROGRAMS,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef(null);

  const maxIndex = programs.length - 1;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
  };

  const handlePointerDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX || (e.touches && e.touches[0].clientX) || 0);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    setDragOffset(currentX - startX);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset < -60) {
      handleNext();
    } else if (dragOffset > 60) {
      handlePrev();
    }
    setDragOffset(0);
  };

  return (
    <section
      id="care-comfort"
      className="w-full bg-white relative z-10 py-[7vw] max-md:py-16 overflow-hidden text-oris-secondary select-none"
    >
      {/* Header Grid */}
      <div className="oris-paddx mb-[5vw] max-md:mb-8 flex justify-between items-start max-[1025px]:flex-col max-[1025px]:gap-6">
        <div className="w-[50%] max-[1025px]:max-w-full">
          <h2 className="text-[4.2vw] max-md:w-[90vw] max-[1025px]:text-[6vw] max-md:text-[7.5vw] font-normal leading-[1.15] tracking-tight">
            {headline}
          </h2>
        </div>

        <div className="max-w-[37vw] max-[1025px]:max-w-full text-right max-[1025px]:text-left pt-[0.6vw] max-[1025px]:pt-0">
          <p className="oris-text22 text-slate-600 leading-relaxed">
            {subheading}
          </p>
        </div>
      </div>

      {/* Carousel Track */}
      <div
        ref={containerRef}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        className="w-full relative py-6 cursor-grab active:cursor-grabbing overflow-hidden"
      >
        <div
          className="flex w-full select-none py-2 pl-[2.05vw] max-[1025px]:pl-[3.7vw] max-md:pl-[3vw] transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(calc(-${currentIndex * 30}vw + ${dragOffset}px))`,
          }}
        >
          {programs.map((card, idx) => (
            <div
              key={card.id || idx}
              className="shrink-0 px-[0.95vw] max-[1025px]:px-[1.3vw] max-md:px-[2vw]"
            >
              <div
                className={`w-[28vw] max-[1025px]:w-[50vw] max-md:w-[76vw] aspect-[440/477] rounded-[32px] px-[1.8vw] pt-[1.8vw] pb-[5vw] max-md:px-6 max-md:pt-6 max-md:pb-8 flex flex-col justify-end gap-[2.4vw] max-md:gap-6 relative overflow-hidden select-none shadow-lg transition-transform duration-500 hover:scale-[1.02] ${card.bgClassName}`}
              >
                {/* Per-Card Interactive 2D Dot Matrix Canvas */}
                <DotMatrixCanvas
                  spacing={20}
                  baseRadius={1.2}
                  maxRadius={4.0}
                  interactionRadius={280}
                  baseOpacity={0.0} // invisible until cursor hovers
                  maxOpacity={0.75}
                  lerpFactor={0.22}
                  gradient={false}
                />

                <h3 className="relative z-10 text-white text-[2.4vw] max-[1025px]:text-[4vw] max-md:text-[7vw] font-normal leading-[1.15] whitespace-pre-line tracking-tight">
                  {card.title}
                </h3>

                <p className="relative z-10 text-white/85 oris-text22 max-[1025px]:text-[2.5vw] max-md:text-[3.6vw] leading-[1.3] max-w-[96%] font-normal">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="oris-paddx mt-[3vw] max-md:mt-6 max-[1025px]:mx-auto max-[1025px]:justify-center flex items-center justify-end gap-[0.8vw] max-[1025px]:gap-3">
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous slide"
          className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-oris-secondary/20 cursor-pointer select-none size-[3.4vw] min-w-[46px] min-h-[46px] transition-colors"
        >
          {/* Expanding circular hover layer */}
          <span
            aria-hidden="true"
            className="absolute rounded-full pointer-events-none oris-bg-primary transition-transform duration-500"
            style={{
              width: '350%',
              aspectRatio: '1 / 1',
              transform: 'translate(-50%, -50%) scale(0)',
              transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)',
            }}
          />
          <ArrowLeft className="w-5 h-5 text-oris-secondary relative z-10 transition-colors group-hover:text-white" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Next slide"
          className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-oris-secondary/20 cursor-pointer select-none size-[3.4vw] min-w-[46px] min-h-[46px] transition-colors"
        >
          <span
            aria-hidden="true"
            className="absolute rounded-full pointer-events-none oris-bg-primary transition-transform duration-500"
            style={{
              width: '350%',
              aspectRatio: '1 / 1',
              transform: 'translate(-50%, -50%) scale(0)',
              transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)',
            }}
          />
          <ArrowRight className="w-5 h-5 text-oris-secondary relative z-10 transition-colors group-hover:text-white" />
        </button>
      </div>
    </section>
  );
}

export { ProgramsCarousel as OrisProgramsCarousel };
