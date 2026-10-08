import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform, animate, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Dumbbell, Salad, ShoppingBag, MessageCircle, ChevronRight,
  Phone, Instagram, Sun, Moon, Footprints, Sparkles, Activity, Flame, CheckCircle2, Zap,
} from 'lucide-react';
import Hero08 from '../components/ui/hero-08';
import FlashlightBackground from '../components/ui/FlashlightBackground';
import FlashlightTextReveal from '../components/ui/flashlight-text-reveal';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';


/* ── Counter ──────────────────────────────── */
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

function StatCard({ value, label, suffix = '+', delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const num = useCounter(parseInt(value), 1.8, inView);
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay }}
      className="text-center">
      <div className="gym-font text-5xl md:text-6xl gradient-text mb-1">{num}{suffix}</div>
      <div className="text-gray-500 text-sm tracking-wide">{label}</div>
    </motion.div>
  );
}

/* ── Muscle categories with real photos ────────── */
const MUSCLES = [
  {
    key: 'chest', label: 'Chest',
    img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
    accent: '#ef4444',
  },
  {
    key: 'back', label: 'Back',
    img: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=600&q=80',
    accent: '#3b82f6',
  },
  {
    key: 'shoulders', label: 'Shoulders',
    img: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&q=80',
    accent: '#f59e0b',
  },
  {
    key: 'arms', label: 'Arms',
    img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=80',
    accent: '#a855f7',
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

/* ── Auto-rotating muscle showcase ──────────── */
function MuscleShowcase() {
  const [active, setActive] = useState(0);
  const { isDark } = useTheme();

  useEffect(() => {
    const id = setInterval(() => setActive(p => (p + 1) % MUSCLES.length), 2000);
    return () => clearInterval(id);
  }, []);

  const m = MUSCLES[active];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

      {/* Big featured card - auto switches */}
      <div className="relative rounded-3xl overflow-hidden aspect-[4/5] max-w-md mx-auto w-full shadow-2xl">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Label */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`label-${active}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="absolute bottom-6 left-6"
          >
            <div className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: m.accent }}>
              Muscle Group
            </div>
            <div className="gym-font text-4xl text-on-photo">{m.label}</div>
          </motion.div>
        </AnimatePresence>

        {/* Link overlay */}
        <Link to={`/exercises?muscle=${m.key}`}
          className="absolute top-5 right-5 bg-black/50 border border-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs text-on-photo flex items-center gap-1.5 hover:bg-white/20 transition-all">
          View exercises <ArrowRight size={11} />
        </Link>

        {/* Dot nav */}
        <div className="absolute bottom-6 right-6 flex gap-1.5">
          {MUSCLES.map((_, i) => (
            <button key={i} onClick={() => setActive(i)}
              className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{ background: i === active ? m.accent : 'rgba(255,255,255,0.3)', transform: i === active ? 'scale(1.5)' : 'scale(1)' }}
            />
          ))}
        </div>
      </div>

      {/* Grid of 8 clickable pills */}
      <div className="grid grid-cols-2 gap-3">
        {MUSCLES.map((muscle, i) => (
          <Link
            key={muscle.key}
            to={`/exercises?muscle=${muscle.key}`}
            onClick={() => setActive(i)}
            className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${active === i
                ? (isDark ? 'border-white/30 scale-[1.02]' : 'border-slate-400 scale-[1.02]')
                : (isDark ? 'border-white/8 hover:border-white/20' : 'border-slate-200/80 hover:border-slate-300')
              }`}
          >
            {/* Thumbnail */}
            <div className="h-20 relative overflow-hidden">
              <img src={muscle.img} alt={muscle.label} loading="lazy" decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/50" />
              {active === i && (
                <motion.div className="absolute inset-0" style={{ background: `${muscle.accent}22` }}
                  layoutId="activeOverlay" transition={{ duration: 0.3 }} />
              )}
            </div>
            <div className={`px-3 py-2 transition-colors ${isDark ? 'bg-[#111318]/90 text-white' : 'bg-white/90 text-slate-900'} backdrop-blur-sm`}>
              <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{muscle.label}</div>
              <div className={`text-xs flex items-center gap-1 mt-0.5 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                View exercises <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
            {active === i && (
              <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: muscle.accent }} />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ── Modern 21st-Century Kinetic Performance Engine ──────────────────── */
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
            ? 'radial-gradient(circle, rgba(23,107,69,0.28) 0%, rgba(16,185,129,0.08) 70%, transparent 100%)'
            : 'radial-gradient(circle, rgba(23,107,69,0.18) 0%, rgba(16,185,129,0.05) 70%, transparent 100%)',
          opacity: 0.7 + clampedProg * 0.3,
        }}
      />

      {/* Main Kinetic Interactive Dial Frame */}
      <div
        className={`relative w-64 h-64 rounded-3xl p-4 backdrop-blur-xl border transition-all duration-300 shadow-xl flex items-center justify-center ${isDark
            ? 'bg-[#15191c]/80 border-white/10 shadow-black/40'
            : 'bg-[#fcf8f2]/95 border-[#e2dacf] shadow-[#ded6ca]/40'
          }`}
      >
        {/* Animated Concentric SVG HUD */}
        <svg className="w-52 h-52 -rotate-90" viewBox="0 0 160 160">
          <defs>
            <linearGradient id="kineticGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-primary, #176b45)" />
              <stop offset="100%" stopColor="var(--color-highlight, #10b981)" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
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
            stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
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
            filter="url(#glow)"
          />

          {/* Inner Accent Orbital Ring */}
          <circle
            cx="80"
            cy="80"
            r="44"
            fill="none"
            stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}
            strokeWidth="2"
            strokeDasharray="2 4"
          />
        </svg>

        {/* Center Live Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span
            className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full mb-1 transition-all"
            style={{
              background: 'var(--color-primary-soft, rgba(23,107,69,0.12))',
              color: 'var(--color-primary, #176b45)',
              border: '1px solid var(--color-primary-border, rgba(23,107,69,0.25))',
            }}
          >
            {zoneText}
          </span>
          <div className={`gym-font text-5xl leading-none tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {percent}%
          </div>
          <div className="text-[11px] font-semibold tracking-wider text-muted mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            CADENCE
          </div>
        </div>

        {/* Floating Dynamic Metric Badge Top-Right */}
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute -top-3 -right-3 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold border backdrop-blur-md shadow-md flex items-center gap-1.5 ${isDark ? 'bg-[#181d21]/90 border-white/12 text-white' : 'bg-[#fcf8f2]/95 border-[#e2dacf] text-slate-800'
            }`}
        >
          <Zap size={12} className="text-emerald-400" />
          <span>{bpm} BPM</span>
        </motion.div>

        {/* Floating Dynamic Metric Badge Bottom-Left */}
        <motion.div
          animate={{ y: [0, 3, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute -bottom-3 -left-3 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold border backdrop-blur-md shadow-md flex items-center gap-1.5 ${isDark ? 'bg-[#181d21]/90 border-white/12 text-white' : 'bg-[#fcf8f2]/95 border-[#e2dacf] text-slate-800'
            }`}
        >
          <Flame size={12} className="text-amber-500" />
          <span>{calories} kcal</span>
        </motion.div>
      </div>

      <div className="text-xs text-center text-muted mt-4 font-medium flex items-center gap-2">
        <Activity size={13} style={{ color: 'var(--color-primary, #176b45)' }} />
        <span>Kinetic cadence tracker • Active output</span>
      </div>
    </div>
  );
}

/* ── Hero content defaults ─────────────────────────────────────────────
   The two cards carry the page's primary actions: the workout
   library and the join-the-gym enquiry. */
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

const marqueeItems = ['STRENGTH', 'ENDURANCE', 'TRANSFORM', 'NUTRITION', 'CARDIO', 'MUSCLE', 'RESULTS', 'POWER'];

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
        isDark ? 'text-white' : 'text-slate-900 bg-[#f5f1eb]'
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

        {/* Contact details */}
        <div className="relative z-20 max-w-6xl mx-auto px-6 pb-14 -mt-6 sm:-mt-10">
          <div className={`flex flex-wrap gap-5 text-sm items-center ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
            <a href={site.telHref} className={`flex items-center gap-2 transition-colors ${isDark ? 'hover:text-white' : 'hover:text-slate-900'}`}>
              <Phone size={13} className="opacity-70" /> {site.phone}
            </a>
            <a href={site.instagramHref} target="_blank" rel="noreferrer"
              className={`flex items-center gap-2 transition-colors ${isDark ? 'hover:text-white' : 'hover:text-slate-900'}`}>
              <Instagram size={13} className="opacity-70" /> @{site.instagram}
            </a>
            <span className="flex items-center gap-2">
              <span className="glow-dot" /> {site.hours[0] || ''}
            </span>
          </div>
        </div>

        {/* ── MARQUEE ───────────────────────────────── */}
        <div className={`py-4 border-y overflow-hidden backdrop-blur-[3px] transition-colors ${
          isDark ? 'border-white/10 bg-black/30' : 'border-[#e0d8cb]/80 bg-[#ede5d8]/40'
        }`}>
          <div className="flex animate-marquee gap-12 w-max">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={i} className={`gym-font text-2xl tracking-widest flex items-center gap-4 ${isDark ? 'text-white/30' : 'text-slate-700/40'
                }`}>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* ── STATS ─────────────────────────────────── */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <StatCard value="500" label="Active Members" delay={0} />
              <StatCard value="10" label="Years Experience" suffix="+" delay={0.1} />
              <StatCard value="8" label="Expert Trainers" suffix="+" delay={0.2} />
              <StatCard value="1000" label="Transformations" suffix="+" delay={0.3} />
            </div>
          </div>
        </section>

        {/* ── MUSCLE CATEGORIES ─────────────────────── */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
              <span className="section-pill">Exercise Library</span>
              <h2 className={`gym-font text-5xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
                TRAIN EVERY <span className="gradient-text">MUSCLE</span>
              </h2>
              <p className={`mt-3 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                Every muscle group. Curated exercises. Video guides. Auto-browsing every 2 seconds.
              </p>
            </motion.div>
            <MuscleShowcase />
            <div className="text-center mt-10">
              <Link to="/exercises" className="btn-outline px-8 py-3">Browse All Exercises <ArrowRight size={16} /></Link>
            </div>
          </div>
        </section>

        {/* ── GYM TIMING SECTION ────────────────────── */}
        <section className={`py-20 px-6 border-y backdrop-blur-[3px] transition-colors ${
          isDark ? 'border-white/10 bg-black/35' : 'border-[#e0d8cb]/80 bg-[#ede5d8]/40'
        }`}>
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <span className="section-pill">Gym Timing</span>
              <h2 className={`gym-font text-5xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
                DISCIPLINE TODAY, <span className="gradient-text">STRENGTH TOMORROW</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
              {/* Morning */}
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                className={`rounded-2xl p-7 border backdrop-blur-md transition-all ${
                  isDark ? 'bg-white/5 border-white/10 hover:border-primary/40' : 'bg-[#fcf8f2]/95 border-[#e2dacf] hover:border-primary/40 shadow-sm'
                }`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center"><Sun size={18} /></div>
                  <div>
                    <div className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>Morning Session</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Early risers welcome</div>
                  </div>
                </div>
                <div className={`gym-font text-4xl mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>5:00 AM – 11:00 AM</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>Monday to Saturday &nbsp;·&nbsp; <span className="text-red-500 font-semibold">Sunday Closed</span></div>
              </motion.div>

              {/* Evening */}
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                className={`rounded-2xl p-7 border backdrop-blur-md transition-all ${
                  isDark ? 'bg-white/5 border-white/10 hover:border-primary/40' : 'bg-[#fcf8f2]/95 border-[#e2dacf] hover:border-primary/40 shadow-sm'
                }`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-400/10 text-indigo-400 flex items-center justify-center"><Moon size={18} /></div>
                  <div>
                    <div className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>Evening Session</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>After-work warriors</div>
                  </div>
                </div>
                <div className={`gym-font text-4xl mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>4:00 PM – 10:00 PM</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>Monday to Saturday &nbsp;·&nbsp; <span className="text-red-500 font-semibold">Sunday Closed</span></div>
              </motion.div>
            </div>

            {/* Important notes */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className={`rounded-2xl p-6 border backdrop-blur-md ${
                isDark ? 'bg-white/5 border-yellow-500/20' : 'bg-[#fcf8f2]/95 border-yellow-500/30 shadow-sm'
              }`}>
              <div className="text-yellow-500 text-xs font-bold uppercase tracking-widest mb-4">Important Notes</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                {[
                  { icon: Footprints, title: 'Proper Gym Shoes', sub: 'Compulsory for all members' },
                  { icon: Dumbbell, title: 'Rerack Your Weights', sub: 'After every set, every time' },
                  { icon: Sparkles, title: 'Keep Gym Clean', sub: 'Maintain hygiene & discipline' },
                ].map((n, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <n.icon size={18} className="flex-shrink-0 mt-0.5 text-yellow-500/90" />
                    <div>
                      <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{n.title}</div>
                      <div className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{n.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── MOTIVATION SPOTLIGHT REVEAL ───────────── */}
        <section className="py-16 px-6">
          <div className={`max-w-6xl mx-auto rounded-3xl overflow-hidden border relative shadow-2xl transition-all duration-300 ${
            isDark ? 'border-white/15 bg-black shadow-primary/10' : 'border-[#dfd6c8] bg-[#ede5d8] shadow-slate-300/20'
          }`}>
            <FlashlightTextReveal
              text={"UNLEASH YOUR\nINNER BEAST\nFITNATION"}
              height="58vh"
              fontSize="clamp(2.5rem, 7.5vw, 6.5rem)"
              textColor={isDark ? "#f8fafc" : "#0f172a"}
              ghost={isDark ? 0.06 : 0.12}
              colors={isDark ? ["#0b0c0e", "#1e293b", "#0f172a"] : ["#e2e8f0", "#cbd5e1", "#94a3b8", "#38bdf8"]}
              radius={isDark ? 0.38 : 0.44}
              strength={isDark ? 1.25 : 1.5}
              contrast={isDark ? 0.91 : 1.15}
              brightness={isDark ? -0.08 : -0.10}
            >
              <div className="absolute bottom-7 left-0 right-0 flex justify-center items-center pointer-events-auto">
                <Link to="/enquiry" className="btn-light px-7 py-3 text-sm flex items-center gap-2 shadow-xl hover:scale-105 transition-all">
                  Start Training Today <ArrowRight size={16} />
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
              <h2 className={`gym-font text-5xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
                THE PATH TO <span className="gradient-text">PEAK PERFORMANCE</span>
              </h2>
              <p className={`mt-3 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                Scroll to power the cadence — every rep builds momentum
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
                    background: 'linear-gradient(to bottom, var(--color-primary, #176b45), var(--color-highlight, #10b981))',
                  }}
                />

                {[
                  { p: 0.1, title: 'Set your goal', desc: 'Define what you want. Write it down. Commit to ownership.' },
                  { p: 0.4, title: 'Build the habit', desc: 'Show up without excuses. Consistency beats intensity every time.' },
                  { p: 0.7, title: 'Earn the result', desc: 'Transformation belongs to those who persist day after day.' },
                ].map((tp, i) => {
                  const active = prog >= tp.p;
                  return (
                    <motion.div
                      key={i}
                      animate={{ opacity: active ? 1 : 0.4, x: active ? 0 : 12 }}
                      transition={{ duration: 0.35 }}
                      className={`relative flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 ${active
                          ? (isDark ? 'bg-white/5 border-white/15 shadow-sm' : 'bg-[#fcf8f2] border-[#e2dacf] shadow-sm')
                          : (isDark ? 'border-transparent' : 'border-transparent')
                        }`}
                    >
                      <div
                        className="w-10 h-10 rounded-full border-2 flex-shrink-0 flex items-center justify-center font-bold text-sm transition-all duration-300 z-10"
                        style={{
                          borderColor: active ? 'var(--color-primary, #176b45)' : (isDark ? '#2c2523' : '#d5cdbf'),
                          background: active ? 'var(--color-primary, #176b45)' : (isDark ? '#141211' : '#ede5d8'),
                          color: active ? '#ffffff' : (isDark ? '#756b65' : '#887d72'),
                          boxShadow: active ? '0 0 16px rgba(23,107,69,0.30)' : 'none',
                        }}
                      >
                        {active ? <CheckCircle2 size={18} /> : (i + 1)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-bold text-lg flex items-center justify-between ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          <span>{tp.title}</span>
                          {active && (
                            <span className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase">Unlocked</span>
                          )}
                        </div>
                        <div className={`text-sm mt-1 leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>{tp.desc}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── QUICK LINKS ───────────────────────────── */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
              <span className="section-pill">Everything you need</span>
              <h2 className={`gym-font text-5xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
                YOUR FITNESS <span className="gradient-text">HUB</span>
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { icon: <Salad size={28} />, title: 'Diet Plans', desc: 'Goal-based nutrition plans crafted by our experts for your body type.', path: '/diet', color: 'from-green-500/15 to-transparent', border: 'hover:border-green-500/30', accent: 'text-green-400' },
                { icon: <ShoppingBag size={28} />, title: 'Supplement Store', desc: '100% authentic proteins, creatine, pre-workout and more. Fast delivery.', path: '/store', color: 'from-purple-500/15 to-transparent', border: 'hover:border-purple-500/30', accent: 'text-purple-400' },
                { icon: <Dumbbell size={28} />, title: 'Transformations', desc: 'Real results from real people. Before & after gallery of our members.', path: '/transformations', color: 'from-amber-500/15 to-transparent', border: 'hover:border-amber-500/30', accent: 'text-amber-400' },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Link to={item.path}
                    className={`group block bg-gradient-to-br ${item.color} backdrop-blur-md rounded-2xl p-7 transition-all duration-300 h-full ${
                      isDark ? 'border border-white/8 hover:border-white/20' : 'border border-[#e2dacf] hover:border-primary/40 shadow-sm'
                    } ${item.border}`}>
                    <div className={`${item.accent} mb-4 group-hover:scale-110 transition-transform inline-block`}>{item.icon}</div>
                    <h3 className={`font-bold text-xl mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
                    <p className={`text-sm leading-relaxed mb-4 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>{item.desc}</p>
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
            <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={site.ctaBannerImage || 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&q=80'}
                alt="Start Your Transformation"
                className="w-full h-72 object-cover object-center opacity-70 transition-opacity duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-transparent flex items-center px-10">
                <div>
                  <h2 className="gym-font text-5xl text-white mb-3">START YOUR<br /><span className="gradient-text">TRANSFORMATION</span></h2>
                  <p className="text-gray-200 mb-6 max-w-sm">Talk to us on WhatsApp and get a free consultation with our head trainer.</p>
                  <div className="flex flex-wrap gap-3">
                    <a href={site.waHref} target="_blank" rel="noreferrer" className="btn-light text-base px-7 py-3.5">
                      <MessageCircle size={18} /> Chat on WhatsApp
                    </a>
                    <a href={site.telHref} className="btn-outline-light text-base px-7 py-3.5">
                      <Phone size={16} /> {site.phone}
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
