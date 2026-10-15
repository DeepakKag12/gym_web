import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, Instagram, MapPin, Clock, Award, Target, Heart,
  Dumbbell, MessageCircle, CheckCircle, Sun, Moon, AlertCircle, Footprints, Sparkles,
  ChevronRight, ArrowRight
} from 'lucide-react';

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
    const id = setInterval(() => setIdx(p => (p + 1) % HERO_IMGS.length), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={idx}
          src={HERO_IMGS[idx]}
          alt="FitNation Training Facility"
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1,  scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.4]"
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-[var(--bg)]" />
    </div>
  );
}

const otherTrainers = [
  { name: 'Rahul Sharma', role: 'Nutrition Expert',        exp: '6 years',  spec: 'Diet & Meal Planning',    img: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=400&q=80' },
  { name: 'Pooja Gupta',  role: 'Yoga & Flexibility',      exp: '5 years',  spec: 'Flexibility & Core',      img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80' },
  { name: 'Vikram Yadav', role: 'Cardio Specialist',       exp: '7 years',  spec: 'Cardio & Fat Loss',       img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80' },
];

const values = [
  { icon: Award,   title: 'Measurable Outcomes', desc: 'Every program is grounded in progressive overload and logged metrics, not wishful thinking.' },
  { icon: Dumbbell,title: 'Technical Coaching',  desc: 'Certified coaches on the floor who correct lifting form before adding plate weight.' },
  { icon: Target,  title: 'Holistic Discipline', desc: 'Strength training, recovery, and macro-counted Indian nutrition executed in harmony.' },
  { icon: Heart,   title: 'Accountability Culture', desc: 'A lifting community where veterans encourage beginners and discipline is mutual.' },
];

const achievements = [
  { num: '500+', label: 'Active Members' },
  { num: '10+',  label: 'Years Coaching' },
  { num: '1000+',label: 'Transformations' },
  { num: '8+',   label: 'Certified Coaches' },
];

export default function AboutPage() {
  const site = useSettings();
  const founderName = site.ownerName || 'Ajeet Jamadari';
  const gymName = site.gymName || 'FITNATION';
  const founderImg = site.heroJoinImage || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700&q=80';

  const team = [
    {
      name: founderName,
      role: 'Head Trainer & Founder',
      exp: '10+ years',
      spec: 'Strength & Conditioning',
      img: site.heroJoinImage || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80',
    },
    ...otherTrainers,
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] pt-16 transition-colors duration-200">

      {/* ══ HERO SECTION ══════════════════════════════════ */}
      <section className="relative min-h-[60vh] sm:min-h-[65vh] flex items-end overflow-hidden pb-12 sm:pb-16">
        <HeroGallery />

        <div className="relative z-10 max-w-6xl mx-auto px-6 w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[var(--surface-raised)] border border-white/20 text-[var(--primary)] text-xs font-bold uppercase tracking-[0.16em] mb-4">
              Est. 2026 · Premium Athletic Facility
            </div>
            <h1 className="gym-font text-5xl sm:text-7xl md:text-8xl text-white leading-none">
              ABOUT {gymName.toUpperCase()}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mt-4 max-w-2xl leading-relaxed">
              Built on discipline and authentic athletic principles. We provide professional coaching, structured Indian nutrition, and uncompromised gym floor standards.
            </p>
          </motion.div>

          {/* Quick contact bar */}
          <div className="flex flex-wrap gap-3 mt-8">
            <a
              href={site.telHref}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-white/20 bg-white/[0.08] hover:bg-white/[0.15] text-xs font-semibold text-white transition-colors"
            >
              <Phone size={13} className="text-slate-300" /> {site.phone}
            </a>
            <a
              href={site.instagramHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-white/20 bg-white/[0.08] hover:bg-white/[0.15] text-xs font-semibold text-white transition-colors"
            >
              <Instagram size={13} className="text-pink-400" /> @{site.instagram}
            </a>
            <a
              href={site.waHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-xs font-semibold text-white transition-colors shadow-xs"
            >
              <MessageCircle size={13} /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ══ ACHIEVEMENTS STRIP ════════════════════════════ */}
      <section className="border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {achievements.map((a, i) => (
              <div key={i} className="text-center">
                <div className="gym-font text-4xl sm:text-5xl text-[var(--primary)] font-black">
                  {a.num}
                </div>
                <div className="text-[var(--text-muted)] text-xs uppercase tracking-wider font-semibold mt-1">
                  {a.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ STORY SECTION ═════════════════════════════════ */}
      <section className="py-20 sm:py-24 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Photo — 5 cols */}
          <div className="lg:col-span-5">
            <div className="relative rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface-raised)]">
              <img
                src={founderImg}
                alt={founderName}
                className="w-full object-cover aspect-[3/4]"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
              {/* Founder badge */}
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)]">
                <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)] mb-1">
                  Founder & Head Coach
                </div>
                <div className="text-[var(--text-primary)] font-bold text-lg">{founderName}</div>
                <div className="text-[var(--text-muted)] text-xs mt-0.5">10+ Years · Certified Strength Specialist</div>
              </div>
            </div>
          </div>

          {/* Text — 7 cols */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--primary)] text-xs font-bold uppercase tracking-[0.15em] mb-3">
              Our Journey
            </div>
            <h2 className="gym-font text-4xl sm:text-5xl text-[var(--text-primary)] mb-6">
              HOW FITNATION WAS BUILT
            </h2>
            <div className="space-y-4 text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed">
              <p>
                {gymName} was established by {founderName} with a singular focus: stripping away the gimmicks from fitness and providing athletes and everyday individuals with real coaching, real discipline, and real accountability.
              </p>
              <p>
                What started as an uncompromising lifting room has grown into a premier fitness destination for 500+ active members. Every rack, barbell, and cable station is maintained to professional standards.
              </p>
              <p>
                We do not sell quick fixes or fad diets. We educate our members on biomechanics, compound lifts, and sustainable Indian nutrition so their transformations last for life.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'Floor coaches who correct form',
                'Calibrated weights and platforms',
                'Structured Indian diet plans',
                'Strict cleanliness & hygiene rules',
                'Beginner to competitive athlete training',
                'Direct trainer accessibility on WhatsApp'
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-primary)] font-medium">
                  <CheckCircle size={15} className="text-[var(--primary)] flex-shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ GYM TIMING & SCHEDULE ═════════════════════════ */}
      <section className="py-16 sm:py-20 px-6 bg-[var(--surface)] border-y border-[var(--border)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--primary)] text-xs font-bold uppercase tracking-[0.15em] mb-3">
              Training Schedule
            </div>
            <h2 className="gym-font text-4xl sm:text-5xl text-[var(--text-primary)]">
              OPERATING HOURS
            </h2>
            <p className="text-[var(--text-muted)] mt-2 text-xs sm:text-sm">
              Discipline today, strength tomorrow. Two focused sessions daily.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            {/* Morning */}
            <div className="rounded-lg p-6 sm:p-7 border border-[var(--border)] bg-[var(--surface-raised)]">
              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-10 h-10 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center flex-shrink-0">
                  <Sun size={18} />
                </div>
                <div>
                  <div className="font-bold text-base text-[var(--text-primary)]">Morning Session</div>
                  <div className="text-xs text-[var(--text-muted)]">Early risers & strength focus</div>
                </div>
              </div>
              <div className="gym-font text-4xl sm:text-5xl text-[var(--text-primary)] mb-2">
                5:00 AM – 11:00 AM
              </div>
              <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
                <Clock size={13} className="text-[var(--text-muted)]" />
                <span>Monday to Saturday</span>
                <span className="text-[var(--border)]">·</span>
                <span className="text-rose-500 font-semibold">Sunday Closed</span>
              </div>
            </div>

            {/* Evening */}
            <div className="rounded-lg p-6 sm:p-7 border border-[var(--border)] bg-[var(--surface-raised)]">
              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-10 h-10 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[var(--primary)] flex items-center justify-center flex-shrink-0">
                  <Moon size={18} />
                </div>
                <div>
                  <div className="font-bold text-base text-[var(--text-primary)]">Evening Session</div>
                  <div className="text-xs text-[var(--text-muted)]">After-work hypertrophy training</div>
                </div>
              </div>
              <div className="gym-font text-4xl sm:text-5xl text-[var(--text-primary)] mb-2">
                4:00 PM – 10:00 PM
              </div>
              <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
                <Clock size={13} className="text-[var(--text-muted)]" />
                <span>Monday to Saturday</span>
                <span className="text-[var(--border)]">·</span>
                <span className="text-rose-500 font-semibold">Sunday Closed</span>
              </div>
            </div>
          </div>

          {/* Rules strip */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] overflow-hidden">
            <div className="px-6 py-3 border-b border-[var(--border)] bg-[var(--surface)] flex items-center gap-2">
              <AlertCircle size={15} className="text-[var(--primary)]" />
              <span className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest">Gym Rules & Etiquette</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)]">
              {[
                { icon: Footprints, title: 'Clean Lifting Shoes', sub: 'Mandatory on the gym floor' },
                { icon: Dumbbell,   title: 'Rerack Every Weight', sub: 'After every set, every time' },
                { icon: Sparkles,   title: 'Maintain Floor Hygiene', sub: 'Wipe benches after use' },
              ].map((n, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <n.icon size={18} className="flex-shrink-0 text-[var(--primary)]" />
                  <div>
                    <div className="text-[var(--text-primary)] font-semibold text-xs sm:text-sm">{n.title}</div>
                    <div className="text-[var(--text-muted)] text-[11px] mt-0.5">{n.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ VALUES ════════════════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--primary)] text-xs font-bold uppercase tracking-[0.15em] mb-3">
              Our Principles
            </div>
            <h2 className="gym-font text-4xl sm:text-5xl text-[var(--text-primary)]">
              WHAT WE STAND FOR
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <div
                  key={i}
                  className="rounded-lg p-6 border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-md bg-[var(--surface-raised)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] mb-4">
                      <Icon size={18} />
                    </div>
                    <h3 className="text-[var(--text-primary)] font-bold text-base mb-2">{v.title}</h3>
                    <p className="text-[var(--text-secondary)] text-xs sm:text-sm leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ TEAM ══════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-[var(--surface)] border-y border-[var(--border)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--primary)] text-xs font-bold uppercase tracking-[0.15em] mb-3">
              Certified Faculty
            </div>
            <h2 className="gym-font text-4xl sm:text-5xl text-[var(--text-primary)]">
              MEET YOUR COACHES
            </h2>
            <p className="text-[var(--text-secondary)] text-xs sm:text-sm mt-2">
              Qualified trainers dedicated to your physical development and injury prevention
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {team.map((t, i) => (
              <div
                key={i}
                className="rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--surface-raised)] group transition-all"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={t.img}
                    alt={t.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </div>
                <div className="p-4">
                  <div className="text-[var(--text-primary)] font-bold text-base">{t.name}</div>
                  <div className="text-[var(--primary)] text-xs font-semibold mt-0.5">{t.role}</div>
                  <div className="text-[var(--text-secondary)] text-xs mt-2">{t.spec}</div>
                  <div className="text-[var(--text-muted)] text-xs mt-0.5">{t.exp} experience</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CONTACT & REACH OUT ═══════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--primary)] text-xs font-bold uppercase tracking-[0.15em] mb-3">
              Direct Contact
            </div>
            <h2 className="gym-font text-4xl sm:text-5xl text-[var(--text-primary)]">
              FIND US
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Phone */}
            <a
              href={site.telHref}
              className="rounded-lg p-6 border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)] transition-all flex items-start gap-4 group"
            >
              <div className="w-10 h-10 rounded-md bg-[var(--surface-raised)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] flex-shrink-0">
                <Phone size={18} />
              </div>
              <div>
                <div className="text-[var(--text-muted)] text-[11px] font-bold uppercase tracking-wider mb-1">Direct Call</div>
                <div className="text-[var(--text-primary)] font-bold text-base">{site.phone || 'Contact us'}</div>
                <div className="text-[var(--text-muted)] text-xs mt-1">Available Mon–Sat 5am–10pm</div>
              </div>
              <ChevronRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--primary)] ml-auto mt-1 transition-colors" />
            </a>

            {/* Instagram */}
            <a
              href={site.instagramHref}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg p-6 border border-[var(--border)] bg-[var(--surface)] hover:border-pink-500/40 transition-all flex items-start gap-4 group"
            >
              <div className="w-10 h-10 rounded-md bg-[var(--surface-raised)] border border-[var(--border)] flex items-center justify-center text-pink-500 flex-shrink-0">
                <Instagram size={18} />
              </div>
              <div>
                <div className="text-[var(--text-muted)] text-[11px] font-bold uppercase tracking-wider mb-1">Instagram</div>
                <div className="text-[var(--text-primary)] font-bold text-base">@{site.instagram || 'fitnation'}</div>
                <div className="text-[var(--text-muted)] text-xs mt-1">Daily athlete lifts & updates</div>
              </div>
              <ChevronRight size={16} className="text-[var(--text-muted)] group-hover:text-pink-500 ml-auto mt-1 transition-colors" />
            </a>

            {/* Address */}
            <div className="rounded-lg p-6 border border-[var(--border)] bg-[var(--surface)] flex items-start gap-4">
              <div className="w-10 h-10 rounded-md bg-[var(--surface-raised)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] flex-shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <div className="text-[var(--text-muted)] text-[11px] font-bold uppercase tracking-wider mb-1">Location</div>
                <div className="text-[var(--text-primary)] font-bold text-base">{site.gymName || 'FITNATION'}</div>
                <div className="text-[var(--text-secondary)] text-xs mt-1">{site.address || site.tagline || 'Your Fitness, Our Mission'}</div>
              </div>
            </div>
          </div>

          {/* WhatsApp CTA banner */}
          <div className="mt-6 rounded-lg p-6 border border-[var(--border)] bg-[var(--surface-raised)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-[var(--text-primary)] font-bold text-base">Book a Free Floor Walkthrough</div>
              <div className="text-[var(--text-secondary)] text-xs mt-1">Talk to Head Coach Ajeet on WhatsApp to schedule your trial session.</div>
            </div>
            <a
              href={site.waHref}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-md bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs flex items-center gap-2 flex-shrink-0"
            >
              <MessageCircle size={15} /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ══ BOTTOM CTA ════════════════════════════════════ */}
      <section className="py-16 sm:py-20 px-6 border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="gym-font text-4xl sm:text-5xl text-[var(--text-primary)] mb-3">
            READY TO COMMIT?
          </h2>
          <p className="text-[var(--text-secondary)] text-xs sm:text-sm mb-7 leading-relaxed">
            Join 500+ local members building strength, conditioning, and discipline at {gymName}.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/enquiry"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
            >
              Enquire For Membership <ArrowRight size={14} />
            </Link>
            <a
              href={site.waHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-[var(--border)] bg-[var(--surface-raised)] hover:bg-[var(--surface)] text-[var(--text-primary)] text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <MessageCircle size={14} /> WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
