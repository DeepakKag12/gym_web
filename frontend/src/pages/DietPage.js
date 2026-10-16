import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Salad, Lock, Flame, Dumbbell, UtensilsCrossed, ArrowRight, Sparkles } from 'lucide-react';
import { cachedGet } from '../utils/api';
import { img } from '../utils/img';
import PillButton from '../components/ui/PillButton';
import { SpiralLoader } from '../components/ui';

const GOAL_CONFIG = {
  'weight-loss': {
    label: 'Targeted Fat Loss',
    color: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
  },
  'muscle-gain': {
    label: 'Muscle Hypertrophy',
    color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  'maintenance': {
    label: 'Body Composition Maintenance',
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  'endurance': {
    label: 'Athletic Endurance',
    color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
  'general': {
    label: 'General Health & Vitality',
    color: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20',
  },
};

function DietCard({ plan }) {
  const goalMeta = GOAL_CONFIG[plan.goal] || {
    label: (plan.goal || 'General').replace('-', ' '),
    color: 'text-[#3365e2] bg-[#3365e2]/10 border-[#3365e2]/20',
  };

  return (
    <div className="bg-white rounded-[22px] overflow-hidden border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(51,101,226,0.14)] hover:border-[#3365e2]/60 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
      <div className="p-5 sm:p-6 flex flex-col flex-1">
        {/* Card Image */}
        <Link to={`/diet/${plan._id}`} className="block relative rounded-xl overflow-hidden mb-4 bg-slate-100 aspect-16/10">
          {plan.image ? (
            <img
              src={img(plan.image, 600)}
              alt={plan.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-br from-[#15324d] to-[#0b1b4a] text-white p-4 text-center">
              <Salad size={32} className="text-[#3365e2] mb-2" />
              <span className="text-xs font-bold uppercase tracking-wider text-white/80">FitNation Nutrition</span>
            </div>
          )}

          {/* Goal Chip on Image */}
          {plan.goal && (
            <span className={`absolute top-3 left-3 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border backdrop-blur-md bg-white/95 shadow-xs ${goalMeta.color}`}>
              {goalMeta.label}
            </span>
          )}

          {/* Meals count chip */}
          {plan.meals?.length > 0 && (
            <span className="absolute bottom-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-md bg-black/70 text-white backdrop-blur-md flex items-center gap-1">
              <UtensilsCrossed size={11} className="text-[#3365e2]" />
              {plan.meals.length} Meals
            </span>
          )}
        </Link>

        {/* Title and Lock Badge */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link to={`/diet/${plan._id}`}>
            <h3 className="text-slate-900 font-extrabold text-lg sm:text-xl tracking-tight leading-snug hover:text-[#3365e2] transition-colors line-clamp-2">
              {plan.title}
            </h3>
          </Link>
          {!plan.isPublic && (
            <span title="Members Only" className="p-1 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0 mt-0.5">
              <Lock size={13} />
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed line-clamp-2 flex-1">
          {plan.description || 'Nutrient-dense Indian whole food plan engineered for muscle tissue preservation and sustained energy.'}
        </p>

        {/* Macro Highlights */}
        {(plan.totalCalories || plan.totalProtein) && (
          <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center gap-2">
            {plan.totalCalories && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-700 border border-orange-500/20 text-xs font-bold">
                <Flame size={13} className="text-orange-500" />
                {plan.totalCalories} kcal
              </span>
            )}
            {plan.totalProtein && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-700 border border-blue-500/20 text-xs font-bold">
                <Dumbbell size={13} className="text-blue-500" />
                {plan.totalProtein} protein
              </span>
            )}
          </div>
        )}

        {/* Primary Action Button — Uses PillButton with Kinetic Roll Animation */}
        <PillButton
          to={`/diet/${plan._id}`}
          btnText="View Full Diet Protocol"
          size="sm"
          className="w-full mt-5"
          icon={<ArrowRight size={14} />}
          showDot={false}
        />
      </div>
    </div>
  );
}

export default function DietPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    cachedGet('/diet', { cache: 90 })
      .then(res => setPlans(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const goals = [
    { id: 'all', label: 'All Protocols' },
    { id: 'weight-loss', label: 'Fat Loss' },
    { id: 'muscle-gain', label: 'Muscle Hypertrophy' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'endurance', label: 'Endurance' },
    { id: 'general', label: 'General Health' },
  ];

  const filtered = filter === 'all' ? plans : plans.filter(p => p.goal === filter);

  return (
    <div className="min-h-screen bg-white text-oris-secondary relative font-sans selection:bg-[#3365e2] selection:text-white">
      {/* ── Landing Page White & Blue Hero Banner ── */}
      <div className="relative overflow-hidden pt-28 sm:pt-36 pb-16 sm:pb-20 bg-[linear-gradient(to_bottom,#ffffff_0%,#eff6ff_20%,#bfdbfe_45%,#60a5fa_70%,#3365e2_100%)] text-slate-900 border-b border-[#3365e2]/20">
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#15324d_1.2px,transparent_1.2px)] [background-size:24px_24px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#3365e2]/30 text-[#3365e2] text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <Sparkles size={13} /> Certified Macronutrient &amp; Caloric Periodization
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 mb-4 tracking-tight uppercase">
            Athletic Nutrition &amp; <span className="text-[#3365e2]">Indian Diet Protocols</span>
          </h1>
          <p className="text-slate-700 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
            Scientific Indian macros engineered for progressive overload, lean muscle hypertrophy, and sustained athletic recovery at FitNation by Ajeet.
          </p>
        </div>
      </div>

      <div className="bg-[#f8fafc] text-slate-800 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 pb-20">
        {/* Goal Filter Chips */}
        <div className="flex gap-2.5 flex-wrap mb-10 items-center">
          {goals.map(g => (
            <button
              key={g.id}
              onClick={() => setFilter(g.id)}
              className={`cat-pill ${filter === g.id ? 'active' : ''}`}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        {loading ? (
          <SpiralLoader size="lg" />
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500 text-sm">
            No diet plans found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filtered.map((plan, i) => (
              <motion.div
                key={plan._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <DietCard plan={plan} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
  );
}
