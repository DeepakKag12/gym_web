import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform, animate, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, Dumbbell, Salad, ShoppingBag, MessageCircle, ChevronRight, Phone, Instagram, MapPin } from 'lucide-react';

const GYM_PHONE     = '9589730151';
const GYM_WA        = '919589730151';
const GYM_INSTAGRAM = 'fitnation.by.ajeet';

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
    key: 'chest',    label: 'Chest',
    img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
    accent: '#ef4444',
  },
  {
    key: 'back',     label: 'Back',
    img: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=600&q=80',
    accent: '#3b82f6',
  },
  {
    key: 'shoulders',label: 'Shoulders',
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrM_kTQbW_Mqt1pc7qwqjlKEk24YirRggfsIuqxaxXKQ&s=10',
    accent: '#f59e0b',
  },
  {
    key: 'arms',     label: 'Arms',
    img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=80',
    accent: '#a855f7',
  },
  {
    key: 'legs',     label: 'Legs',
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQghoE_TchvbG-34tHJxnha8e6oVRNf6QjqJQH3_Tcp5g&s=10',
    accent: '#22c55e',
  },
  {
    key: 'core',     label: 'Core',
    img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
    accent: '#22d3ee',
  },
  {
    key: 'cardio',   label: 'Cardio',
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

  useEffect(() => {
    const id = setInterval(() => setActive(p => (p + 1) % MUSCLES.length), 2000);
    return () => clearInterval(id);
  }, []);

  const m = MUSCLES[active];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

      {/* Big featured card - auto switches */}
      <div className="relative rounded-3xl overflow-hidden aspect-[4/5] max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={m.img}
            alt={m.label}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1,  scale: 1 }}
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
            animate={{ opacity: 1,  y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="absolute bottom-6 left-6"
          >
            <div className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: m.accent }}>
              Muscle Group
            </div>
            <div className="gym-font text-4xl text-white">{m.label}</div>
          </motion.div>
        </AnimatePresence>

        {/* Link overlay */}
        <Link to={`/exercises?muscle=${m.key}`}
          className="absolute top-5 right-5 bg-black/50 border border-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs text-white flex items-center gap-1.5 hover:bg-white/20 transition-all">
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
            className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
              active === i ? 'border-white/30 scale-[1.02]' : 'border-white/8 hover:border-white/20'
            }`}
          >
            {/* Thumbnail */}
            <div className="h-20 relative overflow-hidden">
              <img src={muscle.img} alt={muscle.label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/50" />
              {active === i && (
                <motion.div className="absolute inset-0" style={{ background: `${muscle.accent}22` }}
                  layoutId="activeOverlay" transition={{ duration: 0.3 }} />
              )}
            </div>
            <div className="px-3 py-2 bg-[#111318]">
              <div className="text-white text-sm font-semibold">{muscle.label}</div>
              <div className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
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

/* ── Scroll cable machine ──────────────────── */
function CableMachine({ progress }) {
  const handleY = 20 + progress * 110;
  const weightY = 130 - progress * 110;
  return (
    <svg viewBox="0 0 160 220" className="w-full h-full" style={{ filter: 'drop-shadow(0 0 20px rgba(34,211,238,0.2))' }}>
      <rect x="20" y="10" width="6" height="200" rx="3" fill="#0e1a22"/>
      <rect x="134" y="10" width="6" height="200" rx="3" fill="#0e1a22"/>
      <rect x="20" y="10" width="120" height="6" rx="3" fill="#0e1a22"/>
      <circle cx="80" cy="17" r="9" fill="none" stroke="#22d3ee" strokeWidth="2.5"/>
      <circle cx="80" cy="17" r="3.5" fill="#22d3ee"/>
      <line x1="80" y1="17" x2="80" y2={weightY} stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.6"/>
      <line x1="80" y1="17" x2="80" y2={handleY} stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.6"/>
      {[0,1,2,3].map(i => (
        <rect key={i} x="62" y={weightY - i * 8} width="36" height="7" rx="2"
          fill={i === 0 ? '#22d3ee' : '#0a1f2e'} stroke="#22d3ee" strokeWidth="0.6"
          opacity={i === 0 ? 1 : 0.7 - i * 0.1}/>
      ))}
      <rect x="78" y={weightY - 30} width="4" height="35" rx="2" fill="#22d3ee" opacity="0.4"/>
      <rect x="55" y={handleY} width="50" height="7" rx="3.5" fill="#67e8f9"/>
      <rect x="55" y={handleY - 2} width="12" height="11" rx="3" fill="#22d3ee" opacity="0.7"/>
      <rect x="93" y={handleY - 2} width="12" height="11" rx="3" fill="#22d3ee" opacity="0.7"/>
      <rect x="14" y="205" width="132" height="8" rx="4" fill="#0e1a22"/>
    </svg>
  );
}

const marqueeItems = ['STRENGTH', 'ENDURANCE', 'TRANSFORM', 'NUTRITION', 'CARDIO', 'MUSCLE', 'RESULTS', 'POWER'];

export default function HomePage() {
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(heroScroll, [0, 1], ['0%', '25%']);

  const cableRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: cableRef, offset: ['start end', 'end start'] });
  const cableProgress = useTransform(scrollYProgress, [0.1, 0.7], [0, 1]);
  const [prog, setProg] = useState(0);
  useEffect(() => cableProgress.on('change', v => setProg(v)), [cableProgress]);

  return (
    <div className="min-h-screen bg-[#0b0c0e] text-white overflow-x-hidden">

      {/* ── HERO ───────────────────────────────────── */}
      <section ref={heroRef} className="relative h-screen min-h-[640px] flex items-center overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80" alt="gym"
            className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c0e] via-[#0b0c0e]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0e] via-transparent to-transparent" />
        </motion.div>

        <div className="absolute top-1/4 right-1/3 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-16">
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <span className="section-pill">💪 Est. 2026 · Premium Fitness</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="gym-font text-6xl md:text-8xl leading-none my-5">
              TRAIN<br /><span className="gradient-text">HARDER.</span><br />LIVE BETTER.
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="text-gray-300 text-lg leading-relaxed mb-8 max-w-lg">
              FITNATION BY AJEET — expert trainers, personalised plans, and a community that pushes you beyond limits.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-3">
              <Link to="/enquiry" className="btn-fire text-base px-7 py-3.5">Join Now <ArrowRight size={18} /></Link>
              <Link to="/exercises" className="btn-outline text-base px-7 py-3.5"><Play size={16} /> Explore Workouts</Link>
            </motion.div>

            {/* Real contact quick bar */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
              className="flex flex-wrap gap-5 mt-10 text-sm text-gray-400 items-center">
              <a href={`tel:${GYM_PHONE}`} className="flex items-center gap-2 hover:text-cyan-400 transition-colors">
                <Phone size={13} className="text-cyan-400" /> {GYM_PHONE}
              </a>
              <a href={`https://instagram.com/${GYM_INSTAGRAM}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 hover:text-cyan-400 transition-colors">
                <Instagram size={13} className="text-cyan-400" /> @{GYM_INSTAGRAM}
              </a>
              <span className="flex items-center gap-2">
                <span className="glow-dot" /> Mon–Sat · 5 AM – 10 PM
              </span>
            </motion.div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500 text-xs">
          <span>Scroll down</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-8 border border-gray-600 rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-[#22d3ee] rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── MARQUEE ───────────────────────────────── */}
      <div className="py-4 border-y border-white/5 overflow-hidden bg-[#0b0c0e]">
        <div className="flex animate-marquee gap-12 w-max">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="gym-font text-2xl text-gray-700 tracking-widest flex items-center gap-4">
              {item} <span className="text-[#22d3ee]">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── STATS ─────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard value="500" label="Active Members" delay={0} />
            <StatCard value="10"  label="Years Experience" suffix="+" delay={0.1} />
            <StatCard value="8"   label="Expert Trainers"  suffix="+" delay={0.2} />
            <StatCard value="1000" label="Transformations" suffix="+" delay={0.3} />
          </div>
        </div>
      </section>

      {/* ── MUSCLE CATEGORIES ─────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
            <span className="section-pill">Exercise Library</span>
            <h2 className="gym-font text-5xl text-white">TRAIN EVERY <span className="gradient-text">MUSCLE</span></h2>
            <p className="text-gray-500 mt-3">Every muscle group. Curated exercises. Video guides. Auto-browsing every 2 seconds.</p>
          </motion.div>
          <MuscleShowcase />
          <div className="text-center mt-10">
            <Link to="/exercises" className="btn-outline px-8 py-3">Browse All Exercises <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* ── GYM TIMING SECTION ────────────────────── */}
      <section className="py-20 px-6 bg-[#0d0e11] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="section-pill">Gym Timing</span>
            <h2 className="gym-font text-5xl text-white">DISCIPLINE TODAY, <span className="gradient-text">STRENGTH TOMORROW</span></h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
            {/* Morning */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="glass rounded-2xl p-7 border border-white/8 hover:border-cyan-500/30 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center text-lg">☀️</div>
                <div>
                  <div className="text-white font-bold text-lg">Morning Session</div>
                  <div className="text-gray-500 text-xs">Early risers welcome</div>
                </div>
              </div>
              <div className="gym-font text-4xl text-white mb-3">5:00 AM – 11:00 AM</div>
              <div className="text-gray-400 text-sm">Monday to Saturday &nbsp;·&nbsp; <span className="text-red-400">Sunday Closed</span></div>
            </motion.div>

            {/* Evening */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="glass rounded-2xl p-7 border border-white/8 hover:border-cyan-500/30 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-400/10 text-indigo-400 flex items-center justify-center text-lg">🌙</div>
                <div>
                  <div className="text-white font-bold text-lg">Evening Session</div>
                  <div className="text-gray-500 text-xs">After-work warriors</div>
                </div>
              </div>
              <div className="gym-font text-4xl text-white mb-3">4:00 PM – 10:00 PM</div>
              <div className="text-gray-400 text-sm">Monday to Saturday &nbsp;·&nbsp; <span className="text-red-400">Sunday Closed</span></div>
            </motion.div>
          </div>

          {/* Important notes */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="glass rounded-2xl p-6 border border-yellow-500/15">
            <div className="text-yellow-400 text-xs font-bold uppercase tracking-widest mb-4">🔔 Important Notes</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              {[
                { icon: '👟', title: 'Proper Gym Shoes', sub: 'Compulsory for all members' },
                { icon: '🏋️', title: 'Rerack Your Weights', sub: 'After every set, every time' },
                { icon: '🧹', title: 'Keep Gym Clean', sub: 'Maintain hygiene & discipline' },
              ].map((n, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">{n.icon}</span>
                  <div>
                    <div className="text-white font-semibold">{n.title}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{n.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CABLE SCROLL SECTION ──────────────────── */}
      <section ref={cableRef} className="py-24 px-6 relative" style={{ minHeight: '500px' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="section-pill">Philosophy</span>
            <h2 className="gym-font text-5xl text-white">THE PULL TO <span className="gradient-text">GREATNESS</span></h2>
            <p className="text-gray-500 mt-3">Scroll to pull the cable — every rep counts</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="h-64 max-w-xs mx-auto w-full"><CableMachine progress={prog} /></div>
            <div className="space-y-8">
              {[
                { p: 0.1, title: 'Set your goal',   desc: 'Define what you want. Write it. Own it.' },
                { p: 0.4, title: 'Build the habit', desc: 'Show up every day. Consistency beats intensity.' },
                { p: 0.7, title: 'Earn the result', desc: 'Transformation belongs to those who persist.' },
              ].map((tp, i) => (
                <motion.div key={i} animate={{ opacity: prog >= tp.p ? 1 : 0.18, x: prog >= tp.p ? 0 : 16 }}
                  transition={{ duration: 0.4 }} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full border-2 flex-shrink-0 flex items-center justify-center font-bold text-sm transition-all duration-500"
                    style={{ borderColor: prog >= tp.p ? '#22d3ee' : '#1e3a4a', background: prog >= tp.p ? 'rgba(34,211,238,0.12)' : 'transparent', color: prog >= tp.p ? '#22d3ee' : '#334155' }}>
                    {i + 1}
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg">{tp.title}</div>
                    <div className="text-gray-500 text-sm mt-1">{tp.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── QUICK LINKS ───────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
            <span className="section-pill">Everything you need</span>
            <h2 className="gym-font text-5xl text-white">YOUR FITNESS <span className="gradient-text">HUB</span></h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: <Salad size={28} />, title: 'Diet Plans', desc: 'Goal-based nutrition plans crafted by our experts for your body type.', path: '/diet', color: 'from-green-500/15 to-transparent', border: 'hover:border-green-500/30', accent: 'text-green-400' },
              { icon: <ShoppingBag size={28} />, title: 'Supplement Store', desc: '100% authentic proteins, creatine, pre-workout and more. Fast delivery.', path: '/store', color: 'from-purple-500/15 to-transparent', border: 'hover:border-purple-500/30', accent: 'text-purple-400' },
              { icon: <Dumbbell size={28} />, title: 'Transformations', desc: 'Real results from real people. Before & after gallery of our members.', path: '/transformations', color: 'from-amber-500/15 to-transparent', border: 'hover:border-amber-500/30', accent: 'text-amber-400' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Link to={item.path}
                  className={`group block bg-gradient-to-br ${item.color} border border-white/8 ${item.border} rounded-2xl p-7 transition-all duration-300 h-full`}>
                  <div className={`${item.accent} mb-4 group-hover:scale-110 transition-transform inline-block`}>{item.icon}</div>
                  <h3 className="text-white font-bold text-xl mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{item.desc}</p>
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
            className="relative rounded-3xl overflow-hidden">
            <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&q=80" alt="cta"
              className="w-full h-72 object-cover object-center"/>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c0e]/95 via-[#0b0c0e]/70 to-transparent flex items-center px-10">
              <div>
                <h2 className="gym-font text-5xl text-white mb-3">START YOUR<br /><span className="gradient-text">TRANSFORMATION</span></h2>
                <p className="text-gray-300 mb-6 max-w-sm">Talk to us on WhatsApp and get a free consultation with our head trainer.</p>
                <div className="flex flex-wrap gap-3">
                  <a href={`https://wa.me/${GYM_WA}`} target="_blank" rel="noreferrer" className="btn-fire text-base px-7 py-3.5">
                    <MessageCircle size={18} /> Chat on WhatsApp
                  </a>
                  <a href={`tel:${GYM_PHONE}`} className="btn-outline text-base px-7 py-3.5">
                    <Phone size={16} /> {GYM_PHONE}
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
