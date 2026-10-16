import React from 'react';
import { Building2, Target, CalendarDays, Clock, Sparkles } from 'lucide-react';
import SlotOdometer from '../ui/SlotOdometer';

const STATS = [
  {
    icon: Building2,
    code: '01',
    value: '4000+',
    label: 'Sq Ft Ultra-Modern Facility',
    sublabel: 'Dedicated iron & cardio zones',
  },
  {
    icon: Target,
    code: '02',
    value: '8+',
    label: 'Specialized Training Programs',
    sublabel: 'Strength, HIIT, mobility & power',
  },
  {
    icon: CalendarDays,
    code: '03',
    value: '6',
    label: 'Days Every Week Active',
    sublabel: 'Consistent scheduled programming',
  },
  {
    icon: Clock,
    code: '04',
    value: '12',
    label: 'Hours Daily Training Window',
    sublabel: 'Morning 5–11 AM & Evening 4–10 PM',
  },
];

export default function StatementCounters({
  statement = 'At FitNation by Ajeet, we believe physical transformation begins with disciplined periodization. Our certified coaching delivers results through progressive overload, scientific nutrition, and unwavering personal accountability.',
  stats = STATS,
}) {
  return (
    <section
      id="about-oris"
      className="h-fit w-full relative z-10 bg-gradient-to-b from-slate-50/60 via-white to-slate-50/30 oris-paddx flex flex-col gap-12 lg:gap-16 justify-between py-16 sm:py-24 lg:py-28 text-oris-secondary overflow-hidden"
    >
      {/* Background Ambient Glow Accents */}
      <div className="absolute -top-32 right-10 w-96 h-96 bg-[#3365e2]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-10 w-96 h-96 bg-[#15324d]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header: Indicator Badge + Statement */}
      <div className="relative z-10 flex justify-between items-start w-full max-[1025px]:flex-col max-[1025px]:gap-6">
        <div className="flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#eff4fe] border border-[#3365e2]/25 text-[#3365e2] text-xs font-bold uppercase tracking-wider shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#3365e2] animate-pulse" />
            <span>Who We Are · The Athletic Standard</span>
          </div>
          <p className="text-xs text-slate-500 font-medium tracking-wide uppercase pl-1">
            Rajgarh (Dhar), MP
          </p>
        </div>

        <div className="w-[66vw] max-[1025px]:w-full">
          <h2 className="oris-text64 text-[#13314a] leading-[1.22] font-normal tracking-tight">
            {statement}
          </h2>
        </div>
      </div>

      {/* Bottom Grid: 4 Architectural Metric Cards with Mechanical Slot Counters */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full pt-4">
        {stats.map((st, idx) => {
          const IconComponent = st.icon || Sparkles;
          return (
            <div
              key={idx}
              className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 hover:border-[#3365e2]/50 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(51,101,226,0.12)] hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
            >
              {/* Subtle card ambient highlight on hover */}
              <div className="absolute top-0 right-0 w-28 h-28 bg-[#3365e2]/5 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

              {/* Card top bar: icon & code */}
              <div className="flex items-center justify-between mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#eff4fe] group-hover:bg-[#3365e2] text-[#3365e2] group-hover:text-white flex items-center justify-center transition-colors duration-300 shadow-xs">
                  <IconComponent size={20} />
                </div>
                <span className="text-[11px] font-mono font-bold tracking-widest text-slate-400 group-hover:text-[#3365e2] transition-colors">
                  {st.code || `0${idx + 1}`}
                </span>
              </div>

              {/* Counter Value */}
              <div className="mb-2">
                <span className="inline-flex items-baseline text-4xl sm:text-5xl font-black text-[#13314a] group-hover:text-[#3365e2] tracking-tight leading-none transition-colors">
                  <SlotOdometer
                    value={st.value}
                    duration={1.6}
                    stagger={0.08}
                    baseDelay={idx * 0.1}
                  />
                </span>
              </div>

              {/* Label & High-Contrast Sublabel */}
              <div>
                <p className="text-base font-bold text-slate-900 leading-snug group-hover:text-[#13314a]">
                  {st.label}
                </p>
                {st.sublabel && (
                  <p className="text-xs text-slate-600 font-medium mt-1.5 leading-relaxed">
                    {st.sublabel}
                  </p>
                )}
              </div>

              {/* Bottom active indicator line */}
              <div className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#3365e2] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </div>
          );
        })}
      </div>
    </section>
  );
}

export { StatementCounters as OrisStatementCounters };
