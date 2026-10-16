import React, { useState } from 'react';
import { Check, Sparkles, ShieldCheck } from 'lucide-react';
import PillButton from '../ui/PillButton';

const PLANS = [
  {
    id: '1-month',
    name: '1 Month Membership',
    price: 1500,
    duration: '1 Month',
    badge: 'Standard Access',
    popular: false,
    description: 'Complete unrestricted access to all strength equipment, free weights, and cardio machines with certified floor supervision.',
    features: [
      'Full Gym Floor & Free Weights Access',
      'Dual Shift Access: Morning (5–11 AM) & Evening (4–10 PM)',
      'Certified Floor Coach Assistance',
      'Locker Room & Changing Amenities',
      'Baseline Fitness & Movement Screening',
    ],
  },
  {
    id: '3-months',
    name: '3 Months Membership',
    price: 3600,
    originalPrice: 4500,
    savings: 900,
    duration: '3 Months',
    badge: 'Best Value · Save ₹900',
    popular: true,
    description: 'Our most popular committed training tenure. Recommended by Head Coach Ajeet Kag to complete a full 12-week hypertrophy or fat loss cycle.',
    features: [
      'Everything in 1 Month Tier',
      'Save Flat ₹900 on 3-Month Commitment',
      'Personalized Workout Split Roadmap',
      'Targeted Macronutrient & Diet Consultation',
      'Bi-Weekly Body Composition & Strength Tracking',
      'Continuous Form Correction by Head Coach Ajeet Kag',
    ],
  },
];

export default function MembershipPricing({
  headline = 'Uncompromising Training, Zero Excuses',
  subheading = 'Transparent membership tiers with no hidden registration costs. Choose your commitment and start your transformation today.',
}) {
  const [selectedPlan, setSelectedPlan] = useState('3-months');

  return (
    <section id="oris-plans" className="w-full bg-white relative z-10 py-[7vw] max-md:py-16 oris-paddx text-oris-secondary select-none">
      {/* Header */}
      <div className="flex flex-col items-center text-center mx-auto mb-[5vw] max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-oris-primary text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles size={14} /> Official Verified Tiers
        </div>
        <h2 className="text-[4.2vw] max-[1025px]:text-[6vw] max-md:text-[7.5vw] font-normal leading-[1.15] tracking-tight">
          {headline}
        </h2>
        <p className="oris-text22 text-slate-600 mt-[1.2vw]">
          {subheading}
        </p>
      </div>

      {/* 2-Tier Cards Grid */}
      <div className="grid grid-cols-2 max-[1025px]:grid-cols-1 gap-8 max-w-5xl mx-auto items-stretch">
        {PLANS.map((plan) => {
          const isHighlighted = plan.id === selectedPlan;

          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative rounded-[2vw] max-[1025px]:rounded-2xl p-[3vw] max-[1025px]:p-8 flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                isHighlighted
                  ? 'bg-gradient-to-b from-[#13314a] to-[#0a1b2a] text-white shadow-2xl ring-2 ring-[#3365e2] hover:-translate-y-2'
                  : 'bg-white text-oris-secondary border border-slate-200 hover:border-slate-300 shadow-lg hover:-translate-y-1'
              }`}
            >
              {/* Top Badge */}
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                    isHighlighted
                      ? 'bg-[#3365e2] text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {plan.badge}
                </span>

                {plan.savings && (
                  <span className="text-xs font-mono font-semibold text-emerald-400">
                    Save ₹{plan.savings}
                  </span>
                )}
              </div>

              {/* Title & Price */}
              <div>
                <h3 className="text-2xl font-bold tracking-tight">
                  {plan.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-bold tracking-tight">
                    ₹{plan.price.toLocaleString()}
                  </span>
                  <span className={isHighlighted ? 'text-white/70' : 'text-slate-500'}>
                    / {plan.duration}
                  </span>
                  {plan.originalPrice && (
                    <span className="text-lg line-through text-slate-400 ml-2">
                      ₹{plan.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                <p className={`mt-4 text-sm leading-relaxed ${
                  isHighlighted ? 'text-white/80' : 'text-slate-600'
                }`}>
                  {plan.description}
                </p>

                {/* Feature Checklist */}
                <ul className="mt-6 space-y-3 pt-6 border-t border-white/10">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3 text-sm">
                      <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                        isHighlighted ? 'bg-[#3365e2]/40 text-emerald-300' : 'bg-slate-100 text-slate-700'
                      }`}>
                        <Check size={12} strokeWidth={3} />
                      </span>
                      <span className={isHighlighted ? 'text-white/90' : 'text-slate-700'}>
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <div className="mt-8 pt-4">
                <PillButton
                  btnText="Select Membership"
                  href="#oris-form"
                  className="w-full"
                  bgColor={isHighlighted ? '#3365e2' : '#13314a'}
                  textColor="#ffffff"
                  hoverBgColor="#ffffff"
                  hoverTextColor={isHighlighted ? '#3365e2' : '#13314a'}
                  dotColor={isHighlighted ? '#ffffff' : '#3365e2'}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Verified Schedule Note */}
      <div className="mt-12 text-center text-xs text-slate-500 max-w-xl mx-auto flex items-center justify-center gap-2">
        <ShieldCheck size={16} className="text-oris-primary" />
        <span>
          Facility Timings: Morning 5:00 AM – 11:00 AM | Evening 4:00 PM – 10:00 PM | Mon–Sat (Sunday Closed).
        </span>
      </div>
    </section>
  );
}

export { MembershipPricing as OrisMembershipPlans };
