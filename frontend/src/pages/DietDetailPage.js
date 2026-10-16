import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  Flame,
  Dumbbell,
  UtensilsCrossed,
  Salad,
  Clock,
  ShieldCheck,
  MessageCircle,
  Lock,
  Sparkles,
  Droplets,
  HeartPulse,
  Scale
} from 'lucide-react';
import { cachedGet } from '../utils/api';
import { img } from '../utils/img';

const GOAL_BADGES = {
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
    label: 'Athletic Conditioning & Endurance',
    color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
  'general': {
    label: 'General Health & Vitality',
    color: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20',
  },
};

export default function DietDetailPage() {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cachedGet(`/diet/${id}`, { cache: 90 })
      .then(res => setPlan(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg)]">
        <div className="w-9 h-9 border-3 border-[#3365e2] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center gap-4 text-slate-500 text-sm px-6 text-center">
        <p className="text-base font-semibold text-slate-700 dark:text-slate-300">Diet plan not found or access restricted.</p>
        <Link
          to="/diet"
          className="text-[#3365e2] font-bold hover:underline inline-flex items-center gap-1.5"
        >
          <ArrowLeft size={16} /> Return to Diet Plans
        </Link>
      </div>
    );
  }

  const badgeInfo = GOAL_BADGES[plan.goal] || {
    label: (plan.goal || 'Custom Plan').replace('-', ' '),
    color: 'text-[#3365e2] bg-[#3365e2]/10 border-[#3365e2]/20',
  };

  const whatsappMsg = `Hi Coach Ajeet, I am reviewing the "${plan.title}" (${plan.totalCalories || 0} kcal, ${plan.totalProtein || 'protein'}) diet plan on FitNation by Ajeet and would like guidance on customizing this protocol for my body.`;

  return (
    <div className="min-h-screen bg-white text-oris-secondary relative font-sans selection:bg-[#3365e2] selection:text-white">
      {/* ── Landing Page White & Blue Hero Header ── */}
      <div className="relative overflow-hidden pt-28 sm:pt-36 pb-12 sm:pb-16 bg-[linear-gradient(to_bottom,#ffffff_0%,#eff6ff_20%,#bfdbfe_45%,#60a5fa_70%,#3365e2_100%)] text-slate-900 border-b border-[#3365e2]/20">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#15324d_1.2px,transparent_1.2px)] [background-size:24px_24px] pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          {/* Breadcrumb */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-semibold mb-4">
            <Link to="/" className="hover:text-[#3365e2] transition-colors">Home</Link>
            <ChevronRight size={13} className="text-slate-400" />
            <Link to="/diet" className="hover:text-[#3365e2] transition-colors">Diet &amp; Nutrition</Link>
            <ChevronRight size={13} className="text-slate-400" />
            <span className="text-[#3365e2] font-semibold capitalize">{plan.goal ? plan.goal.replace('-', ' ') : 'Nutrition'}</span>
            <ChevronRight size={13} className="text-slate-400" />
            <span className="text-slate-900 font-bold line-clamp-1 max-w-xs">{plan.title}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#3365e2]/30 text-[#3365e2] text-xs font-bold uppercase tracking-wider shadow-xs">
              <Salad size={13} /> {badgeInfo.label}
            </span>
            {plan.totalCalories && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 border border-orange-500/25 text-orange-700 text-xs font-bold shadow-xs">
                <Flame size={13} className="text-orange-500" /> {plan.totalCalories} kcal
              </span>
            )}
            {plan.totalProtein && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 border border-[#3365e2]/25 text-[#3365e2] text-xs font-bold shadow-xs">
                <Dumbbell size={13} className="text-[#3365e2]" /> {plan.totalProtein} protein
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight uppercase leading-tight mb-2">
            {plan.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-700 max-w-2xl leading-relaxed font-medium">
            {plan.description || 'Nutrient-dense Indian whole food plan engineered for muscle tissue preservation and sustained energy.'}
          </p>
        </div>
      </div>

      <div className="bg-[#f8fafc] text-slate-800 min-h-[60vh]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Back Link */}
          <Link
            to="/diet"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-[#3365e2] mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Diet Plans
          </Link>

          {/* ── Top Hero Section ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start mb-12">
          {/* Visual Card (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl overflow-hidden border border-slate-200/90 shadow-[0_12px_36px_rgba(0,0,0,0.06)] bg-slate-100 relative group">
              {plan.image ? (
                <img
                  src={img(plan.image, 800)}
                  alt={plan.title}
                  className="w-full h-72 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-72 sm:h-80 flex flex-col items-center justify-center bg-linear-to-br from-[#15324d] to-[#0b1b4a] text-white p-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-3">
                    <Salad size={32} className="text-[#3365e2]" />
                  </div>
                  <span className="font-black text-xl tracking-tight uppercase">FitNation Nutrition</span>
                  <span className="text-xs text-white/70 mt-1">Calibrated Indian Diet Protocol</span>
                </div>
              )}

              {/* Badges on Image */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border backdrop-blur-md bg-white/95 shadow-xs ${badgeInfo.color}`}>
                  {badgeInfo.label}
                </span>
                {!plan.isPublic && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/90 text-white backdrop-blur-md shadow-xs">
                    <Lock size={12} /> Members Only
                  </span>
                )}
              </div>
            </div>

            {/* Direct Coach WhatsApp Action */}
            <a
              href={`https://wa.me/919630906906?text=${encodeURIComponent(whatsappMsg)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(37,211,102,0.25)] transition-all duration-200 cursor-pointer"
            >
              <MessageCircle size={18} />
              <span>Ask Coach Ajeet About Diet Customization</span>
            </a>
          </div>

          {/* Metadata & Macro Grid (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3365e2]/10 border border-[#3365e2]/25 text-[#3365e2] text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles size={13} /> Precision Nutritional Programming
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
                {plan.title}
              </h1>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {plan.description || 'Structured nutrition protocol designed for lean body composition, sustained athletic recovery, and disciplined energy periodization.'}
              </p>
            </div>

            {/* Macro Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-2">
              <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
                  <Flame size={15} /> Daily Energy
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {plan.totalCalories ? `${plan.totalCalories}` : '—'}
                  <span className="text-xs font-semibold text-slate-500 ml-1">kcal</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Calibrated daily target</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-[#3365e2] uppercase tracking-wider mb-1">
                  <Dumbbell size={15} /> Protein
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {plan.totalProtein || 'High'}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Muscle repair & retention</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-xs col-span-2 sm:col-span-1">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                  <UtensilsCrossed size={15} /> Daily Meals
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {plan.meals?.length || 0}
                  <span className="text-xs font-semibold text-slate-500 ml-1">feedings</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Even metabolic distribution</p>
              </div>
            </div>

            {/* Quick Principles Note */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-4 flex items-start gap-3">
              <Scale size={20} className="text-[#3365e2] shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-900">Indian Athletic Adaptation: </span>
                All ingredient measurements represent raw weights before cooking. Prioritize wholesome Indian protein sources such as paneer, curd, soya chunks, whole lentils, and eggs.
              </div>
            </div>
          </div>
        </div>

        {/* ── Daily Meal Protocol Section ── */}
        <div className="mb-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3365e2] uppercase tracking-wider mb-1">
                <Clock size={14} /> Chronological Timeline
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Daily Meal Protocol ({plan.meals?.length || 0} Meals)
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Stagger meals every 3–4 hours for optimal amino acid retention
            </span>
          </div>

          {plan.meals?.length > 0 ? (
            <div className="space-y-6">
              {plan.meals.map((meal, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:border-[#3365e2]/40 transition-colors"
                >
                  {/* Meal Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-[#3365e2] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {index + 1 < 10 ? `0${index + 1}` : index + 1}
                      </span>
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900 capitalize flex items-center gap-2">
                          <UtensilsCrossed size={16} className="text-[#3365e2]" />
                          {meal.mealType}
                        </h3>
                        <p className="text-xs text-slate-500">Meal timing sequence</p>
                      </div>
                    </div>

                    {meal.time && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                        <Clock size={13} className="text-[#3365e2]" />
                        {meal.time}
                      </span>
                    )}
                  </div>

                  {/* Meal Items */}
                  {meal.items?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {meal.items.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm"
                        >
                          <div className="font-semibold text-slate-900">
                            {item.name}
                            {item.quantity && (
                              <span className="text-slate-500 font-normal ml-1.5">
                                ({item.quantity})
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {item.calories && (
                              <span className="font-bold text-[11px] px-2 py-0.5 rounded bg-orange-500/10 text-orange-600 border border-orange-500/20">
                                {item.calories} kcal
                              </span>
                            )}
                            {item.protein && (
                              <span className="font-bold text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 border border-blue-500/20">
                                {item.protein}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic mb-4">Balanced whole food portion as advised by trainer.</p>
                  )}

                  {/* Meal Notes */}
                  {meal.notes && (
                    <div className="p-3 rounded-xl bg-slate-100/70 border border-slate-200/60 text-xs text-slate-700 flex items-start gap-2 italic">
                      <span className="font-bold not-italic text-slate-900 shrink-0">Coaching Note:</span>
                      <span>{meal.notes}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl border border-slate-200 bg-white text-slate-500 text-sm">
              Custom meal protocol will be calibrated by your assigned FitNation coach.
            </div>
          )}
        </div>

        {/* ── Nutritional Guardrails ── */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2.5 mb-4">
            <ShieldCheck size={20} className="text-[#3365e2]" />
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
              FitNation Periodized Nutrition Guardrails
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm text-slate-600">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="font-extrabold text-slate-900 block text-sm">1. Caloric Adherence</span>
              <p className="text-slate-500 leading-relaxed">Weigh raw portions accurately to ensure progressive overload in energy balance.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="font-extrabold text-slate-900 block text-sm flex items-center gap-1.5">
                <Droplets size={14} className="text-blue-500" /> 2. Daily Hydration
              </span>
              <p className="text-slate-500 leading-relaxed">Target 3.5L to 4.5L daily to optimize nutrient partitioning and muscle volume.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="font-extrabold text-slate-900 block text-sm flex items-center gap-1.5">
                <HeartPulse size={14} className="text-emerald-500" /> 3. Micronutrient Integrity
              </span>
              <p className="text-slate-500 leading-relaxed">Incorporate daily green salads, seasonal vegetables, and lemon water for digestion.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="font-extrabold text-slate-900 block text-sm">4. Training Synchronization</span>
              <p className="text-slate-500 leading-relaxed">Consume your pre-workout meal 60–90 min prior to your training slot.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
