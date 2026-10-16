import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, Instagram, MapPin, Clock, Award, Target, Heart,
  Dumbbell, MessageCircle, CheckCircle, Sun, Moon, AlertCircle, Footprints, Sparkles,
  ChevronRight, ArrowRight, ShieldCheck, Flame, Compass, Layers, Building2, CalendarDays
} from 'lucide-react';
import SlotOdometer from '../components/ui/SlotOdometer';
import PillButton from '../components/ui/PillButton';

import { useSettings } from '../context/SettingsContext';

/* ── Sliding hero gallery ───────────────── */
const HERO_IMGS = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1400&q=80',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1400&q=80',
];

function HeroGallery() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx(p => (p + 1) % HERO_IMGS.length), 4500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={idx}
          src={HERO_IMGS[idx]}
          alt="FitNation by Ajeet Training Facility"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.35]"
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#ffffff_0%,rgba(239,246,255,0.75)_20%,rgba(191,219,254,0.8)_45%,rgba(96,165,250,0.88)_70%,#3365e2_100%)]" />
    </div>
  );
}

const achievements = [
  { icon: Building2, code: '01', num: '4000+', label: 'Sq Ft Ultra-Modern Facility', sub: 'Dedicated iron & cardio zones' },
  { icon: Target, code: '02', num: '8+', label: 'Specialized Training Programs', sub: 'Strength, HIIT, mobility & power' },
  { icon: CalendarDays, code: '03', num: '6', label: 'Days Every Week Active', sub: 'Consistent scheduled programming' },
  { icon: Clock, code: '04', num: '12', label: 'Hours Daily Training Window', sub: 'Morning 5–11 AM & Evening 4–10 PM' },
];

const facilityZones = [
  {
    icon: Dumbbell,
    title: 'Olympic Free-Weight Arena',
    desc: 'Calibrated Olympic barbells, competition bumper plates, multi-grip pull-up power cages, and cast-iron dumbbell racks up to 50 kg.',
    highlight: 'Powerlifting & Heavy Compound Strength',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=900&q=80&auto=format&fit=crop',
  },
  {
    icon: Layers,
    title: 'Plate-Loaded & Hypertrophy Sector',
    desc: 'Linear hack squats, 45-degree heavy leg presses, dual adjustable cable crossovers, and chest-supported seated row platforms.',
    highlight: 'Targeted Muscle Isolation & Safety',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=80&auto=format&fit=crop',
  },
  {
    icon: Compass,
    title: 'Functional Turf & Calisthenics Deck',
    desc: 'High-density sprint turf track for sled pushes, battle ropes, plyometric boxes, Roman rings, and bodyweight suspension gear.',
    highlight: 'Metabolic Conditioning & Mobility',
    image: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=900&q=80&auto=format&fit=crop',
  },
  {
    icon: Flame,
    title: 'Cardiovascular Conditioning Suite',
    desc: 'Commercial-grade motorized treadmills, high-incline trainers, and assault fan bikes calibrated for HIIT and steady-state cardio.',
    highlight: 'Endurance & Active Recovery',
    image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=900&q=80&auto=format&fit=crop',
  },
];

const principles = [
  {
    icon: Award,
    title: 'Progressive Overload & Periodization',
    desc: 'Every session is tracked. We focus on mechanical tension, volume progression, and logged weights rather than arbitrary workouts.',
  },
  {
    icon: Target,
    title: 'Biomechanical Form Mastery',
    desc: 'Coaches ensure spinal alignment, proper bar path, and joint safety before plate weight is increased.',
  },
  {
    icon: Heart,
    title: 'Scientific Indian Nutrition',
    desc: 'Practical, macro-counted Indian diets tailored to local cuisine — high protein paneer, soya, pulses, eggs, and lean proteins.',
  },
  {
    icon: ShieldCheck,
    title: 'Lifting Culture & Accountability',
    desc: 'A supportive, focused environment where beginners and experienced athletes train together with mutual respect and discipline.',
  },
];

const trainingPrograms = [
  'Muscle Hypertrophy & Periodization',
  'Targeted Calorie Deficit & Fat Loss',
  'Olympic & Compound Lift Fundamentals',
  'Functional Calisthenics & Core Power',
  'Metabolic HIIT & Conditioning',
  'Postural Alignment & Joint Mobility',
  'Indian Macro Nutrition Protocols',
  'Beginner 1-on-1 Floor Onboarding',
];

export default function AboutPage() {
  const site = useSettings();
  const founderName = site.ownerName || 'Ajeet Kag';
  const gymName = site.gymName || 'FitNation by Ajeet';
  const founderImg = site.heroJoinImage || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700&q=80';
  const address = site.address || 'Fourlane Square, Tridalam Arcade, First Floor, Rajgarh (Dhar), MP';

  return (
    <div className="min-h-screen bg-white text-oris-secondary relative font-sans selection:bg-[#3365e2] selection:text-white">

      {/* ══ 1. HERO SECTION ══════════════════════════════════ */}
      <section className="relative min-h-[65vh] sm:min-h-[72vh] flex items-end overflow-hidden pt-28 sm:pt-36 pb-14 sm:pb-20 border-b border-[#3365e2]/20">
        <HeroGallery />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 w-full">
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#3365e2]/30 text-[#3365e2] text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#3365e2] animate-pulse" />
              Rajgarh (Dhar), MP · Premium Athletic Hub
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-slate-900 leading-tight tracking-tight uppercase">
              ABOUT FITNATION <span className="text-[#3365e2]">BY AJEET</span>
            </h1>
            <p className="text-slate-800 text-sm sm:text-base md:text-lg mt-4 max-w-2xl leading-relaxed font-medium">
              Uniting a healthier world through disciplined strength training, authentic biomechanics, and sustainable Indian nutrition in our 4,000+ sq ft Rajgarh facility.
            </p>
          </motion.div>

          {/* Quick contact bar */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mt-8">
            <a
              href={site.telHref}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-white/80 bg-white/90 hover:bg-white text-xs font-bold text-slate-800 transition-all backdrop-blur-sm shadow-xs hover:text-[#3365e2]"
            >
              <Phone size={14} className="text-[#3365e2]" /> {site.phone}
            </a>
            <a
              href={site.instagramHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-white/80 bg-white/90 hover:bg-white text-xs font-bold text-slate-800 transition-all backdrop-blur-sm shadow-xs hover:text-pink-600"
            >
              <Instagram size={14} className="text-pink-500" /> @{site.instagram || 'fitnation_by_ajeet'}
            </a>
            <a
              href={site.waHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-xs font-bold uppercase tracking-wider text-white transition-all shadow-md"
            >
              <MessageCircle size={14} /> WhatsApp Founder
            </a>
          </div>
        </div>
      </section>

      {/* ══ 2. VERIFIED 4 ARCHITECTURAL METRIC CARDS ═════════════════════ */}
      <section className="border-y border-slate-200 dark:border-white/10 bg-gradient-to-b from-slate-50/70 via-white to-slate-50/30 dark:from-[#0a0f1d] dark:to-[#080d19] py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((a, i) => {
              const Icon = a.icon;
              return (
                <div
                  key={i}
                  className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#0e1526] border border-slate-200/90 dark:border-white/10 hover:border-[#3365e2]/50 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(51,101,226,0.12)] hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#eff4fe] dark:bg-[#3365e2]/15 group-hover:bg-[#3365e2] text-[#3365e2] group-hover:text-white flex items-center justify-center transition-colors duration-300 shadow-xs">
                      <Icon size={20} />
                    </div>
                    <span className="text-[11px] font-mono font-bold tracking-widest text-slate-400 group-hover:text-[#3365e2] transition-colors">
                      {a.code}
                    </span>
                  </div>

                  <div className="mb-2">
                    <span className="inline-flex items-baseline text-4xl sm:text-5xl font-black text-slate-900 dark:text-white group-hover:text-[#3365e2] tracking-tight leading-none transition-colors">
                      <SlotOdometer
                        value={a.num}
                        duration={1.6}
                        stagger={0.08}
                        baseDelay={i * 0.1}
                      />
                    </span>
                  </div>

                  <div>
                    <p className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {a.label}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-relaxed">
                      {a.sub}
                    </p>
                  </div>

                  <div className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#3365e2] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ 3. FOUNDER & HEAD COACH SPOTLIGHT ═══════════════ */}
      <section className="py-20 sm:py-24 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Founder Photo */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-900 shadow-xl group">
              <img
                src={founderImg}
                alt={founderName}
                className="w-full object-cover aspect-[3/4] group-hover:scale-102 transition-transform duration-500"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent pointer-events-none" />

              {/* Founder badge */}
              <div className="absolute bottom-5 left-5 right-5 p-5 rounded-xl bg-white/95 dark:bg-[#0e1628]/95 backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-lg">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#3365e2] mb-1">
                  <ShieldCheck size={13} /> Founder & Head Coach
                </div>
                <div className="text-slate-900 dark:text-white font-black text-xl">{founderName}</div>
                <div className="text-slate-600 dark:text-slate-300 text-xs mt-1 font-medium">
                  Strength & Conditioning Specialist · Periodization Coach
                </div>
              </div>
            </div>
          </div>

          {/* Founder Story & Manifesto */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#3365e2]/10 border border-[#3365e2]/20 text-[#3365e2] text-xs font-bold uppercase tracking-wider mb-3">
              Coaching Manifesto
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight tracking-tight">
              DISCIPLINE OVER SHORTCUTS. <br className="hidden sm:inline" />
              SCIENCE OVER GIMMICKS.
            </h2>
            <div className="space-y-4 text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed font-normal">
              <p>
                <strong>{gymName}</strong> was founded by <strong>{founderName}</strong> with a non-negotiable mission: stripping away the noise from modern fitness and providing our community with uncompromising coaching, verified biomechanics, and genuine athletic standards.
              </p>
              <p>
                Located at Fourlane Square in Rajgarh (Dhar), our 4,000+ sq ft floor was purposely engineered for results. We do not sell extreme crash diets or miracle supplements. Instead, we teach members how to lift with precision, progress their volume safely, and eat balanced, protein-rich Indian meals that fuel long-term health.
              </p>
              <p>
                Whether you are stepping into a gym for the first time or training for competitive strength, every member receives hands-on guidance, lifting form corrections, and mutual accountability.
              </p>
            </div>

            {/* Verified training checklist */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                'Floor coaches who actively correct lifting form',
                'Calibrated Olympic plates, barbells & power cages',
                'Macro-counted Indian nutrition protocols',
                'Strict floor cleanliness & hygiene standards',
                'Dual-shift morning & evening facility access',
                'Direct trainer access on WhatsApp for member queries'
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-semibold">
                  <CheckCircle size={16} className="text-[#3365e2] flex-shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ 4. FACILITY ARCHITECTURE & 4 ZONES ══════════════ */}
      <section className="py-20 px-6 bg-slate-50 dark:bg-[#0c1220] border-y border-slate-200 dark:border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#3365e2]/10 border border-[#3365e2]/20 text-[#3365e2] text-xs font-bold uppercase tracking-wider mb-3">
              Facility Tour
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              4,000+ SQ FT ATHLETIC ZONES
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-2">
              Every square foot is engineered for purpose, biomechanical safety, and athletic flow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {facilityZones.map((z, i) => {
              const Icon = z.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e1628] hover:border-[#3365e2]/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
                    <img
                      src={z.image}
                      alt={z.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                      <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#3365e2] text-white shadow-sm uppercase tracking-wider">
                        {z.highlight}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2.5">
                        <div className="w-10 h-10 rounded-xl bg-[#3365e2]/10 text-[#3365e2] flex items-center justify-center flex-shrink-0">
                          <Icon size={20} />
                        </div>
                        <h3 className="text-slate-900 dark:text-white font-bold text-xl leading-snug">
                          {z.title}
                        </h3>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-normal">
                        {z.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ 5. OPERATING HOURS & SCHEDULE ═══════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#3365e2]/10 border border-[#3365e2]/20 text-[#3365e2] text-xs font-bold uppercase tracking-wider mb-3">
              Facility Schedule
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              DAILY OPERATING HOURS
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mt-2 text-xs sm:text-sm">
              Disciplined dual-shift access. 12 hours daily, 6 days a week.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Morning Shift */}
            <div className="rounded-2xl p-7 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1220] shadow-xs">
              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center flex-shrink-0">
                  <Sun size={20} />
                </div>
                <div>
                  <div className="font-extrabold text-lg text-slate-900 dark:text-white">Morning Shift</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Early risers & heavy compound lifting</div>
                </div>
              </div>
              <div className="text-2xl min-[400px]:text-3xl sm:text-4xl font-black text-[#13314a] dark:text-white mb-3 tabular-nums tracking-tight">
                5:00 AM – 11:00 AM
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-xs font-semibold flex-wrap">
                <Clock size={14} className="text-[#3365e2]" />
                <span>Monday to Saturday</span>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="text-rose-600 dark:text-rose-400 font-bold">Sunday Closed</span>
              </div>
            </div>

            {/* Evening Shift */}
            <div className="rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1220] shadow-xs">
              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[#3365e2] flex items-center justify-center flex-shrink-0">
                  <Moon size={20} />
                </div>
                <div>
                  <div className="font-extrabold text-lg text-slate-900 dark:text-white">Evening Shift</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Hypertrophy training & floor coaching</div>
                </div>
              </div>
              <div className="text-2xl min-[400px]:text-3xl sm:text-4xl font-black text-[#13314a] dark:text-white mb-3 tabular-nums tracking-tight">
                4:00 PM – 10:00 PM
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-xs font-semibold flex-wrap">
                <Clock size={14} className="text-[#3365e2]" />
                <span>Monday to Saturday</span>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="text-rose-600 dark:text-rose-400 font-bold">Sunday Closed</span>
              </div>
            </div>
          </div>

          {/* Floor Etiquette Strip */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1220] overflow-hidden shadow-xs">
            <div className="px-6 py-3.5 border-b border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-black/20 flex items-center gap-2">
              <AlertCircle size={15} className="text-[#3365e2]" />
              <span className="text-slate-800 dark:text-slate-200 text-xs font-bold uppercase tracking-wider">
                Gym Floor Code &amp; Etiquette
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-white/10">
              {[
                { icon: Footprints, title: 'Clean Lifting Shoes', sub: 'Indoor shoes mandatory on the floor' },
                { icon: Dumbbell,   title: 'Rerack Every Weight', sub: 'Strip bars & rerack after every set' },
                { icon: Sparkles,   title: 'Maintain Floor Hygiene', sub: 'Wipe down equipment after heavy sets' },
              ].map((n, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-9 h-9 rounded-lg bg-[#3365e2]/10 text-[#3365e2] flex items-center justify-center flex-shrink-0">
                    <n.icon size={18} />
                  </div>
                  <div>
                    <div className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm">{n.title}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">{n.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ 6. 8 SPECIALIZED PROGRAMS ═══════════════════════ */}
      <section className="py-20 px-6 bg-slate-50 dark:bg-[#0c1220] border-y border-slate-200 dark:border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#3365e2]/10 border border-[#3365e2]/20 text-[#3365e2] text-xs font-bold uppercase tracking-wider mb-3">
              Coaching Curriculum
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              8 SPECIALIZED PROGRAMS
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-2">
              Periodized training protocols tailored to your athletic development phase.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trainingPrograms.map((prog, i) => (
              <div
                key={i}
                className="p-5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e1628] flex items-center gap-3.5 hover:border-[#3365e2]/50 transition-all shadow-xs"
              >
                <div className="w-8 h-8 rounded-lg bg-[#3365e2]/10 text-[#3365e2] font-black text-xs flex items-center justify-center flex-shrink-0">
                  0{i + 1}
                </div>
                <span className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm leading-snug">
                  {prog}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 7. CORE PRINCIPLES ══════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#3365e2]/10 border border-[#3365e2]/20 text-[#3365e2] text-xs font-bold uppercase tracking-wider mb-3">
              Our Core Standards
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              WHAT WE STAND FOR
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {principles.map((v, i) => {
              const Icon = v.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl p-6 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1220] hover:border-[#3365e2]/40 transition-all flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="w-11 h-11 rounded-xl bg-[#3365e2]/10 text-[#3365e2] flex items-center justify-center mb-4">
                      <Icon size={20} />
                    </div>
                    <h3 className="text-slate-900 dark:text-white font-bold text-base mb-2">
                      {v.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
                      {v.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ 8. VERIFIED LOCATION & DIRECT REACH OUT ═════════ */}
      <section className="py-20 px-6 bg-slate-50 dark:bg-[#0c1220] border-t border-slate-200 dark:border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#3365e2]/10 border border-[#3365e2]/20 text-[#3365e2] text-xs font-bold uppercase tracking-wider mb-3">
              Location &amp; Access
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              VISIT OUR FACILITY
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Phone */}
            <a
              href={site.telHref}
              className="rounded-2xl p-6 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e1628] hover:border-[#3365e2] transition-all flex items-start gap-4 group shadow-xs"
            >
              <div className="w-11 h-11 rounded-xl bg-[#3365e2]/10 text-[#3365e2] flex items-center justify-center flex-shrink-0">
                <Phone size={20} />
              </div>
              <div className="flex-1">
                <div className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">
                  Direct Line
                </div>
                <div className="text-slate-900 dark:text-white font-bold text-base">
                  {site.phone}
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                  Mon–Sat: 5am–11am &amp; 4pm–10pm
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:text-[#3365e2] group-hover:translate-x-1 transition-all mt-1" />
            </a>

            {/* Instagram */}
            <a
              href={site.instagramHref}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl p-6 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e1628] hover:border-pink-500/40 transition-all flex items-start gap-4 group shadow-xs"
            >
              <div className="w-11 h-11 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center flex-shrink-0">
                <Instagram size={20} />
              </div>
              <div className="flex-1">
                <div className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">
                  Instagram
                </div>
                <div className="text-slate-900 dark:text-white font-bold text-base">
                  @{site.instagram || 'fitnation_by_ajeet'}
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                  Daily athlete lifts &amp; updates
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:text-pink-500 group-hover:translate-x-1 transition-all mt-1" />
            </a>

            {/* Address */}
            <div className="rounded-2xl p-6 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e1628] flex items-start gap-4 shadow-xs">
              <div className="w-11 h-11 rounded-xl bg-[#3365e2]/10 text-[#3365e2] flex items-center justify-center flex-shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">
                  Rajgarh Facility
                </div>
                <div className="text-slate-900 dark:text-white font-bold text-sm leading-snug">
                  {address}
                </div>
                <div className="text-[#3365e2] text-xs font-semibold mt-1">
                  First Floor, Tridalam Arcade
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp walkthrough banner */}
          <div className="mt-8 rounded-2xl p-7 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e1628] flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xs">
            <div>
              <div className="text-slate-900 dark:text-white font-extrabold text-lg sm:text-xl">
                Schedule a Facility Walkthrough
              </div>
              <div className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-1">
                Connect directly with Founder &amp; Head Coach Ajeet Kag on WhatsApp to inspect the floor and plan your goals.
              </div>
            </div>
            <a
              href={site.waHref}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2 flex-shrink-0"
            >
              <MessageCircle size={16} /> WhatsApp Head Coach
            </a>
          </div>
        </div>
      </section>

      {/* ══ 9. BOTTOM ACTION CTA ════════════════════════════ */}
      <section className="py-20 px-6 border-t border-slate-200 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-3 tracking-tight">
            START YOUR ATHLETIC JOURNEY
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mb-8 leading-relaxed font-normal">
            1 Month ₹1,500 · 3 Months ₹3,600 (Save ₹900). Join FitNation by Ajeet and train with true athletic periodization.
          </p>
          <div className="flex flex-wrap gap-3.5 justify-center">
            <PillButton
              to="/enquiry"
              btnText="Enquire For Membership"
              size="sm"
              icon={<ArrowRight size={15} />}
            />
            <PillButton
              to="/transformations"
              btnText="Inspect Member Results"
              bgColor="#f1f5f9"
              textColor="#1e293b"
              hoverBgColor="#3365e2"
              hoverTextColor="#ffffff"
              dotColor="#3365e2"
              size="sm"
              className="border border-slate-300"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
