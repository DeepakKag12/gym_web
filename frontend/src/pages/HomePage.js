import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform, animate, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Dumbbell, Salad, ShoppingBag, MessageCircle, ChevronRight,
  Phone, Instagram, Sun, Moon, Footprints, Sparkles, Activity, Flame, CheckCircle2, Zap,
  Users, Calendar, Award, TrendingUp, ShieldCheck
} from 'lucide-react';
import Hero08 from '../components/ui/hero-08';
import FlashlightBackground from '../components/ui/FlashlightBackground';
import FlashlightTextReveal from '../components/ui/flashlight-text-reveal';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';

/* ── Counter Animation Hook ──────────────────────────────── */
function useCounter(target, duration = 1.8, inView) {
  const [val, setVal] = useState(0);
  const done = useRef(false);
  useEffect(() => {
    if (!inView || done.current) return;
    done.current = true;
    const ctrl = animate(0, target, { duration, ease: 'easeOut', onUpdate: v => setVal(Math.floor(v)) });
    return () => ctrl.stop();
  }, [inView, target, duration]);
  return val;
}

/* ── Athletic Stat Capsule ──────────────────────────────── */
function StatCard({ icon: Icon, value, label, suffix = '+', delay = 0, isDark }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const num = useCounter(parseInt(value, 10), 1.8, inView);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className={`group relative rounded-2xl p-6 border transition-all duration-300 text-center ${
        isDark
          ? 'bg-[#121620]/75 border-white/8 hover:border-emerald-500/30 hover:bg-[#161c28]/90 shadow-lg shadow-black/20'
          : 'bg-white/85 border-slate-200/90 hover:border-emerald-600/30 hover:bg-white shadow-sm hover:shadow-md'
      }`}
    >
      <div
        className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 transition-transform duration-300 group-hover:scale-110"
        style={{
          background: 'var(--primary-soft, rgba(99, 102, 241, 0.12))',
          color: 'var(--primary, #6366f1)',
        }}
      >
        <Icon size={20} />
      </div>
      <div className={`gym-font text-4xl sm:text-5xl font-bold tracking-tight mb-1 ${
        isDark ? 'text-white' : 'text-slate-900'
      }`}>
        <span style={{ color: 'var(--primary, #6366f1)' }}>{num}</span>{suffix}
      </div>
      <div className={`text-xs font-semibold uppercase tracking-wider ${
        isDark ? 'text-slate-400' : 'text-slate-600'
      }`}>
        {label}
      </div>
    </motion.div>
  );
}

/* ── Muscle categories with high-res photography ────────── */
const MUSCLES = [
  {
    key: 'chest', label: 'Chest',
    img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
    accent: '#10b981',
  },
  {
    key: 'back', label: 'Back',
    img: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=600&q=80',
    accent: '#06b6d4',
  },
  {
    key: 'shoulders', label: 'Shoulders',
    img: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&q=80',
    accent: '#f59e0b',
  },
  {
    key: 'arms', label: 'Arms',
    img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=80',
    accent: '#8b5cf6',
  },
  {
    key: 'legs', label: 'Legs',
    img: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&q=80',
    accent: '#22c55e',
  },
  {
    key: 'core', label: 'Core',
    img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
    accent: '#eab308',
  },
  {
    key: 'cardio', label: 'Cardio',
    img: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600&q=80',
    accent: '#f97316',
  },
  {
    key: 'fullbody', label: 'Full Body',
    img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80',
    accent: '#14b8a6',
  },
];

/* ── Auto-rotating interactive muscle showcase ──────────── */
function MuscleShowcase() {
  const [active, setActive] = useState(0);
  const { isDark } = useTheme();

  useEffect(() => {
    const id = setInterval(() => setActive(p => (p + 1) % MUSCLES.length), 2200);
    return () => clearInterval(id);
  }, []);

  const m = MUSCLES[active];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      {/* Big featured card - auto switches with crossfade */}
      <div className={`relative rounded-3xl overflow-hidden aspect-[4/5] max-w-md mx-auto w-full shadow-2xl ring-1 ${
        isDark ? 'ring-white/12 shadow-black/60' : 'ring-slate-300/80 shadow-slate-300/50'
      }`}>
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={m.img}
            alt={m.label}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="w-full h-full object-cover absolute inset-0"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

        {/* Label & Details */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`label-${active}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="absolute bottom-6 left-6 right-6"
          >
            <span
              className="text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full text-white inline-flex items-center gap-1.5 mb-2 backdrop-blur-md"
              style={{ background: `${m.accent}33`, border: `1px solid ${m.accent}66` }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.accent }} />
              Muscle Focus
            </span>
            <div className="gym-font text-4xl sm:text-5xl text-white font-bold tracking-wide leading-tight">
              {m.label}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Link overlay */}
        <Link
          to={`/exercises?muscle=${m.key}`}
          className="absolute top-5 right-5 bg-black/60 hover:bg-black/80 border border-white/20 backdrop-blur-md rounded-full px-3.5 py-1.5 text-xs font-semibold text-white flex items-center gap-1.5 transition-all shadow-md hover:scale-105"
        >
          View exercises <ArrowRight size={12} className="text-primary" />
        </Link>

        {/* Interactive indicator dots */}
        <div className="absolute top-5 left-5 flex gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/10">
          {MUSCLES.map((muscle, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Show ${muscle.label}`}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === active ? '18px' : '6px',
                background: i === active ? m.accent : 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Grid of 8 clickable muscle tiles */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {MUSCLES.map((muscle, i) => {
          const isSel = active === i;
          return (
            <Link
              key={muscle.key}
              to={`/exercises?muscle=${muscle.key}`}
              onClick={() => setActive(i)}
              className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                isSel
                  ? (isDark
                      ? 'border-primary/80 shadow-lg shadow-indigo-950/30 scale-[1.02]'
                      : 'border-primary shadow-md shadow-indigo-500/15 scale-[1.02]')
                  : (isDark
                      ? 'border-white/8 hover:border-white/25 hover:bg-white/[0.02]'
                      : 'border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/80')
              }`}
            >
              {/* Thumbnail */}
              <div className="h-20 sm:h-22 relative overflow-hidden">
                <img
                  src={muscle.img}
                  alt={muscle.label}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
                {isSel && (
                  <div
                    className="absolute inset-0"
                    style={{ background: `${muscle.accent}20` }}
                  />
                )}
                {isSel && (
                  <span
                    className="absolute top-2 right-2 w-2 h-2 rounded-full"
                    style={{ background: muscle.accent }}
                  />
                )}
              </div>
              <div className={`px-3.5 py-2.5 transition-colors ${
                isDark ? 'bg-[#121620]/95 text-white' : 'bg-white/95 text-slate-900'
              } backdrop-blur-sm`}>
                <div className={`text-sm font-bold tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {muscle.label}
                </div>
                <div className={`text-xs flex items-center gap-1 mt-0.5 font-medium ${
                  isDark ? 'text-slate-400 group-hover:text-primary' : 'text-slate-500 group-hover:text-primary'
                } transition-colors`}>
                  View guides <ChevronRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
              {isSel && (
                <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: muscle.accent }} />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ── Modern Kinetic Performance Cadence Engine ──────────────────── */
function KineticPerformanceEngine({ progress, isDark }) {
  const clampedProg = Math.min(Math.max(progress, 0), 1);
  const percent = Math.round(clampedProg * 100);
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedProg * circumference);
  const calories = 280 + Math.round(clampedProg * 480);
  const bpm = 110 + Math.round(clampedProg * 48);

  const zoneText = clampedProg < 0.25 ? 'WARMUP'
    : clampedProg < 0.6 ? 'HYPERTROPHY'
      : clampedProg < 0.85 ? 'PEAK OUTPUT'
        : 'PR THRESHOLD';

  return (
    <div className="relative w-full max-w-sm mx-auto flex flex-col items-center justify-center select-none py-2">
      {/* Dynamic Ambient Background Glow */}
      <div
        className="absolute w-56 h-56 rounded-full blur-3xl pointer-events-none transition-opacity duration-500"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(79,70,229,0.08) 70%, transparent 100%)'
            : 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(129,140,248,0.06) 70%, transparent 100%)',
          opacity: 0.7 + clampedProg * 0.3,
        }}
      />

      {/* Main Kinetic Interactive Dial Frame */}
      <div
        className={`relative w-64 h-64 rounded-3xl p-4 backdrop-blur-xl border transition-all duration-300 shadow-xl flex items-center justify-center ${
          isDark
            ? 'bg-[#121620]/85 border-white/10 shadow-black/50'
            : 'bg-white/95 border-slate-200/90 shadow-slate-200/50'
        }`}
      >
        {/* Animated Concentric SVG HUD */}
        <svg className="w-52 h-52 -rotate-90" viewBox="0 0 160 160">
          <defs>
            <linearGradient id="kineticGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
            <filter id="dialGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}
            strokeWidth="8"
            strokeDasharray="4 3"
          />

          {/* Active Gradient Kinetic Ring */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="url(#kineticGradient)"
            strokeWidth="9"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-200 ease-out"
            filter="url(#dialGlow)"
          />

          {/* Inner Accent Orbital Ring */}
          <circle
            cx="80"
            cy="80"
            r="44"
            fill="none"
            stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
            strokeWidth="2"
            strokeDasharray="2 4"
          />
        </svg>

        {/* Center Live Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span
            className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full mb-1 transition-all"
            style={{
              background: isDark ? 'rgba(99,102,241,0.18)' : 'rgba(99,102,241,0.12)',
              color: isDark ? '#818cf8' : '#4f46e5',
              border: isDark ? '1px solid rgba(129,140,248,0.35)' : '1px solid rgba(99,102,241,0.25)',
            }}
          >
            {zoneText}
          </span>
          <div className={`gym-font text-5xl leading-none tracking-tight font-bold ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            {percent}%
          </div>
          <div className="text-[11px] font-semibold tracking-wider text-muted mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            CADENCE
          </div>
        </div>

        {/* Floating Dynamic Metric Badge Top-Right */}
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute -top-3 -right-3 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold border backdrop-blur-md shadow-md flex items-center gap-1.5 ${
            isDark ? 'bg-[#181d28]/95 border-white/12 text-white' : 'bg-white/95 border-slate-200 text-slate-800'
          }`}
        >
          <Zap size={12} className="text-primary" />
          <span>{bpm} BPM</span>
        </motion.div>

        {/* Floating Dynamic Metric Badge Bottom-Left */}
        <motion.div
          animate={{ y: [0, 3, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute -bottom-3 -left-3 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold border backdrop-blur-md shadow-md flex items-center gap-1.5 ${
            isDark ? 'bg-[#181d28]/95 border-white/12 text-white' : 'bg-white/95 border-slate-200 text-slate-800'
          }`}
        >
          <Flame size={12} className="text-amber-500" />
          <span>{calories} kcal</span>
        </motion.div>
      </div>

      <div className="text-xs text-center text-muted mt-4 font-medium flex items-center gap-2">
        <Activity size={14} className="text-primary" />
        <span>Kinetic Cadence Engine • Active Rep Momentum</span>
      </div>
    </div>
  );
}

/* ── Hero content defaults ─────────────────────────────────────────────
   Carries the page's primary actions: the workout library and join enquiry. */
const HERO_DEFAULTS = {
  title: 'Train harder. Live better.',
  description:
    'FITNATION BY AJEET — expert trainers, personalised plans, and a community that pushes you beyond limits.',
  socialProof: 'Join 2,000+ Members Training With Us',
  avatars: [
    { src: 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=128&q=80', fallback: 'AK' },
    { src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=128&q=80', fallback: 'RS' },
    { src: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=128&q=80', fallback: 'PM' },
  ],
  cards: [
    {
      title: 'Explore Workouts',
      subtitle: 'Muscle-group guides, form videos and splits',
      image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1200&auto=format&fit=crop',
      imageAlt: 'A coach correcting a member\'s form during a set',
      invert: true,
      cta: { ctaEnabled: true, text: 'Start Training', link: '/exercises', size: 'default', variant: 'light' },
    },
    {
      title: 'Join FitNation',
      subtitle: 'Talk to us about a plan that fits your goal',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop',
      imageAlt: 'The FitNation training floor',
      invert: true,
      cta: { ctaEnabled: true, text: 'Join Now', link: '/enquiry', size: 'default', variant: 'light' },
    },
  ],
  animation: 'subtle',
};

const marqueeItems = ['STRENGTH', 'ENDURANCE', 'TRANSFORM', 'NUTRITION', 'CARDIO', 'MUSCLE', 'RESULTS', 'DISCIPLINE'];

export default function HomePage() {
  const site = useSettings();
  const { isDark } = useTheme();
  const cableRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: cableRef, offset: ['start end', 'end start'] });
  const cableProgress = useTransform(scrollYProgress, [0.1, 0.7], [0, 1]);
  const [prog, setProg] = useState(0);
  useEffect(() => cableProgress.on('change', v => setProg(v)), [cableProgress]);

  // Dynamically inject custom gym photography and brand configured by the admin in Settings
  const heroContent = useMemo(() => ({
    ...HERO_DEFAULTS,
    description: site.gymName
      ? `${site.gymName.toUpperCase()} — expert trainers, personalised plans, and a community that pushes you beyond limits.`
      : HERO_DEFAULTS.description,
    cards: [
      {
        ...HERO_DEFAULTS.cards[0],
        image: site.heroWorkoutImage || HERO_DEFAULTS.cards[0].image,
      },
      {
        ...HERO_DEFAULTS.cards[1],
        image: site.heroJoinImage || HERO_DEFAULTS.cards[1].image,
      },
    ],
  }), [site.gymName, site.heroWorkoutImage, site.heroJoinImage]);

  return (
    <div
      className={`min-h-screen relative overflow-x-hidden transition-colors duration-300 ${
        isDark ? 'text-white' : 'text-slate-900 bg-slate-50'
      }`}
      style={{ isolation: 'isolate' }}
    >
      {/* ── WHOLE-PAGE FLASHLIGHT BACKGROUND ─────────── */}
      <FlashlightBackground isDark={isDark} />

      <div className="relative z-10">
        {/* ── HERO ───────────────────────────────────── */}
        <Hero08
          {...heroContent}
          className="bg-transparent"
          titleClassName="gym-font text-5xl sm:text-6xl md:text-7xl leading-none"
        />

        {/* Contact details pill bar */}
        <div className="relative z-20 max-w-6xl mx-auto px-6 pb-12 -mt-6 sm:-mt-10">
          <div className={`inline-flex flex-wrap gap-5 text-sm items-center px-5 py-2.5 rounded-full backdrop-blur-md border ${
            isDark ? 'bg-[#121620]/80 border-white/10 text-slate-300' : 'bg-white/85 border-slate-200/90 text-slate-700 shadow-sm'
          }`}>
            <a href={site.telHref} className="flex items-center gap-2 font-medium transition-colors hover:text-primary">
              <Phone size={13} className="text-primary" /> {site.phone}
            </a>
            <span className="opacity-30">•</span>
            <a href={site.instagramHref} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 font-medium transition-colors hover:text-primary">
              <Instagram size={13} className="text-primary" /> @{site.instagram}
            </a>
            <span className="opacity-30">•</span>
            <span className="flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {site.hours[0] || 'Mon–Sat: 5:00 AM – 11:00 AM, 4:00 PM – 10:00 PM'}
            </span>
          </div>
        </div>

        {/* ── MARQUEE ───────────────────────────────── */}
        <div className={`py-4 border-y overflow-hidden backdrop-blur-sm transition-colors ${
          isDark ? 'border-white/10 bg-[#0d1017]/60' : 'border-slate-200/80 bg-white/70'
        }`}>
          <div className="flex animate-marquee gap-12 w-max">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={i} className={`gym-font text-2xl tracking-widest flex items-center gap-4 ${
                isDark ? 'text-white/30' : 'text-slate-600/40'
              }`}>
                {item}
                <span className="text-xs text-primary/70">◆</span>
              </span>
            ))}
          </div>
        </div>

        {/* ── STATS SECTION ─────────────────────────── */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <StatCard icon={Users} value="500" label="Active Athletes" delay={0} isDark={isDark} />
              <StatCard icon={Calendar} value="10" label="Years Dedicated" suffix="+" delay={0.1} isDark={isDark} />
              <StatCard icon={Award} value="8" label="Certified Coaches" suffix="+" delay={0.2} isDark={isDark} />
              <StatCard icon={TrendingUp} value="1000" label="Verified Results" suffix="+" delay={0.3} isDark={isDark} />
            </div>
          </div>
        </section>

        {/* ── MUSCLE CATEGORIES ─────────────────────── */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
              <span className="section-pill">Exercise Library</span>
              <h2 className={`gym-font text-4xl sm:text-5xl mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                TRAIN EVERY <span className="gradient-text">MUSCLE</span>
              </h2>
              <p className={`mt-3 max-w-xl mx-auto text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Biomechanically structured movements, curated form guides, and smart splits for every athlete.
              </p>
            </motion.div>
            <MuscleShowcase />
            <div className="text-center mt-12">
              <Link to="/exercises" className="btn-outline px-8 py-3.5 inline-flex items-center gap-2 font-semibold">
                Browse All Exercises <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── GYM TIMING & SCHEDULE SECTION ─────────── */}
        <section className={`py-20 px-6 border-y backdrop-blur-sm transition-colors ${
          isDark ? 'border-white/10 bg-[#0c1017]/50' : 'border-slate-200/80 bg-slate-100/60'
        }`}>
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <span className="section-pill">Training Windows</span>
              <h2 className={`gym-font text-4xl sm:text-5xl mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                DISCIPLINE TODAY, <span className="gradient-text">STRENGTH TOMORROW</span>
              </h2>
              <p className={`mt-3 text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Structured training sessions designed to keep the floor focused and productive.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {/* Morning Session */}
              <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                className={`rounded-2xl p-7 border backdrop-blur-md transition-all ${
                  isDark
                    ? 'bg-[#121620]/80 border-white/10 hover:border-primary/50 shadow-lg shadow-black/20'
                    : 'bg-white/95 border-slate-200/90 hover:border-primary/50 shadow-sm'
                }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                      <Sun size={20} />
                    </div>
                    <div>
                      <div className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>Morning Session</div>
                      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Early risers & fasted training</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                    SLOT 1
                  </span>
                </div>
                <div className={`gym-font text-4xl mb-3 tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  5:00 AM – 11:00 AM
                </div>
                <div className={`text-sm flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span>Monday to Saturday</span>
                  <span>•</span>
                  <span className="text-rose-500 font-semibold">Sunday Rest</span>
                </div>
              </motion.div>

              {/* Evening Session */}
              <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                className={`rounded-2xl p-7 border backdrop-blur-md transition-all ${
                  isDark
                    ? 'bg-[#121620]/80 border-white/10 hover:border-primary/50 shadow-lg shadow-black/20'
                    : 'bg-white/95 border-slate-200/90 hover:border-primary/50 shadow-sm'
                }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                      <Moon size={20} />
                    </div>
                    <div>
                      <div className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>Evening Session</div>
                      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>After-work intensity & power</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                    SLOT 2
                  </span>
                </div>
                <div className={`gym-font text-4xl mb-3 tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  4:00 PM – 10:00 PM
                </div>
                <div className={`text-sm flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span>Monday to Saturday</span>
                  <span>•</span>
                  <span className="text-rose-500 font-semibold">Sunday Rest</span>
                </div>
              </motion.div>
            </div>

            {/* Gym Etiquette & Standards */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className={`rounded-2xl p-6 border backdrop-blur-md ${
                isDark ? 'bg-[#121620]/60 border-white/10' : 'bg-white/90 border-slate-200/90 shadow-sm'
              }`}>
              <div className="text-primary text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                <ShieldCheck size={15} /> Gym Etiquette & Discipline Standards
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-sm">
                {[
                  { icon: Footprints, title: 'Clean Gym Shoes Only', sub: 'Mandatory footwear to preserve hygiene on all lifting platforms.' },
                  { icon: Dumbbell, title: 'Rerack Every Plate & Dumbbell', sub: 'Respect your training house and athletes sharing the equipment.' },
                  { icon: Sparkles, title: 'Maintain Floor Discipline', sub: 'Bring your personal gym towel and keep bags in designated lockers.' },
                ].map((n, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <n.icon size={18} className="flex-shrink-0 mt-0.5 text-primary" />
                    <div>
                      <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{n.title}</div>
                      <div className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{n.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── MOTIVATION SPOTLIGHT REVEAL ───────────── */}
        <section className="py-20 px-6">
          <div className={`max-w-6xl mx-auto rounded-3xl overflow-hidden border relative shadow-2xl transition-all duration-300 ${
            isDark ? 'border-white/15 bg-[#080a0f] shadow-indigo-950/20' : 'border-slate-300/80 bg-[#0c1017] shadow-slate-300/30'
          }`}>
            <FlashlightTextReveal
              text={"UNLEASH YOUR\nINNER BEAST\nFITNATION"}
              height="58vh"
              fontSize="clamp(2.5rem, 7.5vw, 6.5rem)"
              textColor="#ffffff"
              ghost={0.07}
              colors={["#080a0f", "#0f172a", "#1e1b4b", "#6366f1"]}
              radius={0.42}
              strength={1.3}
              contrast={1.1}
              brightness={-0.08}
            >
              <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center pointer-events-auto">
                <Link to="/enquiry" className="btn-primary px-8 py-3.5 text-sm font-semibold rounded-full flex items-center gap-2 shadow-xl hover:scale-105 transition-all">
                  Claim Consultation & Free Tour <ArrowRight size={16} />
                </Link>
              </div>
            </FlashlightTextReveal>
          </div>
        </section>

        {/* ── KINETIC DISCIPLINE & PEAK PERFORMANCE ──────────────────── */}
        <section ref={cableRef} className="py-24 px-6 relative" style={{ minHeight: '500px' }}>
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
              <span className="section-pill">The Discipline System</span>
              <h2 className={`gym-font text-4xl sm:text-5xl mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                THE PATH TO <span className="gradient-text">PEAK PERFORMANCE</span>
              </h2>
              <p className={`mt-3 text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Scroll to power the cadence engine — every rep builds momentum and unlocks progression.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="max-w-xs mx-auto w-full">
                <KineticPerformanceEngine progress={prog} isDark={isDark} />
              </div>
              <div className="space-y-6 relative">
                {/* Connecting track line */}
                <div
                  className="absolute left-5 top-5 bottom-5 w-0.5 pointer-events-none"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                  }}
                />
                <div
                  className="absolute left-5 top-5 w-0.5 pointer-events-none transition-all duration-300"
                  style={{
                    height: `${Math.min(100, Math.max(0, (prog - 0.1) / 0.6 * 100))}%`,
                    background: 'linear-gradient(to bottom, #6366f1, #818cf8)',
                  }}
                />

                {[
                  { p: 0.1, title: 'Set your goal', desc: 'Define what you want. Write it down. Commit to unwavering ownership.' },
                  { p: 0.4, title: 'Build the habit', desc: 'Show up without excuses. Consistency beats random intensity every single time.' },
                  { p: 0.7, title: 'Earn the result', desc: 'Transformation belongs to those who persist day after day with progressive overload.' },
                ].map((tp, i) => {
                  const active = prog >= tp.p;
                  return (
                    <motion.div
                      key={i}
                      animate={{ opacity: active ? 1 : 0.4, x: active ? 0 : 12 }}
                      transition={{ duration: 0.35 }}
                      className={`relative flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 ${active
                          ? (isDark ? 'bg-[#121620]/80 border-primary/50 shadow-lg shadow-indigo-950/20' : 'bg-white border-primary/50 shadow-sm')
                          : (isDark ? 'border-transparent' : 'border-transparent')
                        }`}
                    >
                      <div
                        className="w-10 h-10 rounded-full border-2 flex-shrink-0 flex items-center justify-center font-bold text-sm transition-all duration-300 z-10"
                        style={{
                          borderColor: active ? '#6366f1' : (isDark ? '#262f40' : '#cbd5e1'),
                          background: active ? '#6366f1' : (isDark ? '#121620' : '#f1f5f9'),
                          color: active ? '#ffffff' : (isDark ? '#64748b' : '#94a3b8'),
                          boxShadow: active ? '0 0 16px rgba(99,102,241,0.35)' : 'none',
                        }}
                      >
                        {active ? <CheckCircle2 size={18} /> : (i + 1)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-bold text-lg flex items-center justify-between ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          <span>{tp.title}</span>
                          {active && (
                            <span className="text-[11px] font-semibold text-primary tracking-wider uppercase">Unlocked</span>
                          )}
                        </div>
                        <div className={`text-sm mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{tp.desc}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── FITNESS HUB (QUICK LINKS) ─────────────── */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
              <span className="section-pill">Everything you need</span>
              <h2 className={`gym-font text-4xl sm:text-5xl mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                YOUR FITNESS <span className="gradient-text">HUB</span>
              </h2>
              <p className={`mt-3 text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Complete ecosystem for performance, nutrition, supplements, and community proof.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { icon: <Salad size={26} />, title: 'Diet Plans', desc: 'Goal-based nutrition plans crafted by our coaches for your body composition and metabolic rate.', path: '/diet', accent: 'text-primary' },
                { icon: <ShoppingBag size={26} />, title: 'Supplement Store', desc: '100% authentic proteins, creatine, pre-workout, and recovery essentials. Verified stock.', path: '/store', accent: 'text-indigo-400' },
                { icon: <Dumbbell size={26} />, title: 'Transformations', desc: 'Real results from real members. Verified before-and-after journeys with measurable strength gains.', path: '/transformations', accent: 'text-indigo-300' },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Link to={item.path}
                    className={`group block backdrop-blur-md rounded-2xl p-7 transition-all duration-300 h-full border ${
                      isDark
                        ? 'bg-[#121620]/80 border-white/8 hover:border-primary/50 hover:bg-[#161d2b]/90 shadow-lg shadow-black/20'
                        : 'bg-white/95 border-slate-200/90 hover:border-primary/50 hover:bg-white shadow-sm hover:shadow-md'
                    }`}>
                    <div className={`${item.accent} mb-4 group-hover:scale-110 transition-transform inline-block`}>
                      {item.icon}
                    </div>
                    <h3 className={`font-bold text-xl mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
                    <p className={`text-sm leading-relaxed mb-5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{item.desc}</p>
                    <span className={`${item.accent} text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all`}>
                      Explore <ArrowRight size={14} />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ────────────────────────────── */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              <img
                src={site.ctaBannerImage || 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&q=80'}
                alt="Start Your Transformation"
                className="w-full h-80 object-cover object-center opacity-70 transition-opacity duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-transparent flex items-center px-8 sm:px-12">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2 inline-block">
                    Take the First Step
                  </span>
                  <h2 className="gym-font text-4xl sm:text-5xl text-white mb-3">
                    START YOUR<br /><span className="gradient-text">TRANSFORMATION</span>
                  </h2>
                  <p className="text-slate-200 mb-6 max-w-md text-sm sm:text-base leading-relaxed">
                    Connect directly with our head trainers on WhatsApp. Get a personalized fitness assessment and structured roadmap today.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a href={site.waHref} target="_blank" rel="noreferrer" className="btn-light text-sm sm:text-base px-6 py-3 font-semibold flex items-center gap-2">
                      <MessageCircle size={18} className="text-primary" /> Chat on WhatsApp
                    </a>
                    <a href={site.telHref} className="btn-outline-light text-sm sm:text-base px-6 py-3 font-semibold flex items-center gap-2">
                      <Phone size={16} /> Call {site.phone}
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
