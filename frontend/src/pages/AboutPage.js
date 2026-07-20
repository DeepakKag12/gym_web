import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, Instagram, MapPin, Clock, Award, Target, Heart,
  Dumbbell, MessageCircle, CheckCircle, Sun, Moon, AlertCircle,
  ChevronRight, ArrowRight
} from 'lucide-react';

const GYM_PHONE     = '9589730151';
const GYM_WA        = '919589730151';
const GYM_INSTAGRAM = 'fitnation.by.ajeet';
// GYM_ADDRESS removed (unused)

/* ── Sliding hero gallery ───────────────── */
const HERO_IMGS = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1400&q=80',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1400&q=80',
];

function HeroGallery() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx(p => (p + 1) % HERO_IMGS.length), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={idx}
          src={HERO_IMGS[idx]}
          alt="gym"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1,  scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b0c0e]/75 via-[#0b0c0e]/60 to-[#0b0c0e]" />
    </div>
  );
}

const team = [
  { name: 'Ajeet Singh',  role: 'Head Trainer & Founder', exp: '10+ years', spec: 'Strength & Conditioning', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80' },
  { name: 'Rahul Sharma', role: 'Nutrition Expert',        exp: '6 years',  spec: 'Diet & Meal Planning',    img: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=400&q=80' },
  { name: 'Pooja Gupta',  role: 'Yoga & Flexibility',      exp: '5 years',  spec: 'Flexibility & Core',      img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80' },
  { name: 'Vikram Yadav', role: 'Cardio Specialist',       exp: '7 years',  spec: 'Cardio & Fat Loss',       img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80' },
];

const values = [
  { icon: Award,   title: 'Results-Driven',   desc: 'Every program is designed to deliver measurable, visible progress you can be proud of.' },
  { icon: Dumbbell,title: 'Expert Training',  desc: 'Certified trainers with real-world experience across all fitness disciplines.' },
  { icon: Target,  title: 'Holistic Approach',desc: 'Training + nutrition + lifestyle = lasting transformation. We cover it all.' },
  { icon: Heart,   title: 'Community',        desc: 'A supportive family that pushes each other to be their best every single day.' },
];

const achievements = [
  { num: '500+', label: 'Active Members' },
  { num: '10+',  label: 'Years of Experience' },
  { num: '1000+',label: 'Transformations' },
  { num: '8+',   label: 'Expert Trainers' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0b0c0e] text-white pt-16">

      {/* ══ HERO — auto-sliding gym photos ════════════════ */}
      <section className="relative min-h-[70vh] flex items-end overflow-hidden">
        <HeroGallery />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pb-16 w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="section-pill mb-4 inline-block">Est. 2026</span>
            <h1 className="gym-font text-6xl md:text-8xl text-white leading-none">
              ABOUT <span className="gradient-text">FITNATION</span>
            </h1>
            <p className="text-gray-300 text-lg mt-4 max-w-xl leading-relaxed">
              Born from passion. Built with dedication. FITNATION BY AJEET is more than a gym — it's your transformation partner.
            </p>
          </motion.div>

          {/* Quick contact bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-4 mt-8">
            <a href={`tel:${GYM_PHONE}`}
              className="flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-white hover:bg-white/20 transition-all">
              <Phone size={14} className="text-cyan-400" /> {GYM_PHONE}
            </a>
            <a href={`https://instagram.com/${GYM_INSTAGRAM}`} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-white hover:bg-white/20 transition-all">
              <Instagram size={14} className="text-pink-400" /> @{GYM_INSTAGRAM}
            </a>
            <a href={`https://wa.me/${GYM_WA}`} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 bg-green-500/20 border border-green-500/40 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-green-300 hover:bg-green-500/30 transition-all">
              <MessageCircle size={14} /> WhatsApp Us
            </a>
          </motion.div>
        </div>
      </section>

      {/* ══ ACHIEVEMENTS STRIP ════════════════════════════ */}
      <section className="border-y border-white/5 bg-[#0d0e11]">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {achievements.map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="gym-font text-4xl gradient-text">{a.num}</div>
                <div className="text-gray-500 text-sm mt-1">{a.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ STORY ═════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-14 items-center">

          {/* Photo — spans 2 cols */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="lg:col-span-2">
            <div className="relative rounded-3xl overflow-hidden">
              <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700&q=80"
                alt="Ajeet Singh" className="w-full object-cover aspect-[3/4]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0e]/80 via-transparent to-transparent"/>
              {/* Floating badge */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="glass rounded-2xl p-4 border border-cyan-500/20">
                  <div className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-1">Founder & Head Trainer</div>
                  <div className="text-white font-bold text-xl">Ajeet Singh</div>
                  <div className="text-gray-400 text-sm mt-0.5">10+ years · Certified Coach</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Text — spans 3 cols */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="lg:col-span-3">
            <span className="section-pill">Our Story</span>
            <h2 className="gym-font text-5xl text-white mt-3 mb-6">HOW IT <span className="gradient-text">STARTED</span></h2>
            <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
              <p>FITNATION was founded by Ajeet Singh — a certified personal trainer who believed that professional-grade fitness coaching should be accessible to everyone, regardless of background.</p>
              <p>Starting from a small setup with big dreams, Ajeet built this gym from the ground up. Today, we're home to 500+ active members, an expert team of trainers, and a fully equipped facility.</p>
              <p>Our approach goes beyond lifting weights. We combine strength training, nutrition science, flexibility work, and mental wellness to deliver transformations that actually last.</p>
            </div>
            <ul className="mt-6 space-y-2">
              {['500+ Active Members', 'Expert Certified Trainers', '10+ Years of Experience', 'Personalised Programs', 'Modern Equipment', 'Hygienic Facility'].map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle size={15} className="text-[#22d3ee] flex-shrink-0"/> {f}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* ══ GYM TIMING ════════════════════════════════════ */}
      <section className="py-20 px-6 bg-[#0d0e11] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="section-pill">When to Visit</span>
            <h2 className="gym-font text-5xl text-white">GYM <span className="gradient-text">TIMING</span></h2>
            <p className="text-gray-500 mt-3 text-sm">Discipline today, strength tomorrow</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">

            {/* Morning */}
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              whileHover={{ y: -4 }} className="relative overflow-hidden glass rounded-2xl p-8 border border-white/8 hover:border-amber-400/30 transition-all group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/10 flex items-center justify-center">
                  <Sun size={22} className="text-amber-400" />
                </div>
                <div>
                  <div className="text-white font-bold text-lg">Morning Session</div>
                  <div className="text-amber-400/70 text-xs font-semibold uppercase tracking-widest">Early Bird</div>
                </div>
              </div>
              <div className="gym-font text-5xl text-white mb-2">5:00 – 11:00</div>
              <div className="text-amber-400 text-xs font-bold mb-4">AM</div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Clock size={13} className="text-gray-600" />
                Mon to Sat &nbsp;·&nbsp;
                <span className="text-red-400 font-medium">Sunday Closed</span>
              </div>
            </motion.div>

            {/* Evening */}
            <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              whileHover={{ y: -4 }} className="relative overflow-hidden glass rounded-2xl p-8 border border-white/8 hover:border-indigo-400/30 transition-all group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-400/10 flex items-center justify-center">
                  <Moon size={22} className="text-indigo-400" />
                </div>
                <div>
                  <div className="text-white font-bold text-lg">Evening Session</div>
                  <div className="text-indigo-400/70 text-xs font-semibold uppercase tracking-widest">After Work</div>
                </div>
              </div>
              <div className="gym-font text-5xl text-white mb-2">4:00 – 10:00</div>
              <div className="text-indigo-400 text-xs font-bold mb-4">PM</div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Clock size={13} className="text-gray-600" />
                Mon to Sat &nbsp;·&nbsp;
                <span className="text-red-400 font-medium">Sunday Closed</span>
              </div>
            </motion.div>
          </div>

          {/* Rules strip */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="glass rounded-2xl border border-yellow-500/20 overflow-hidden">
            <div className="px-6 py-3 bg-yellow-500/10 border-b border-yellow-500/20 flex items-center gap-2">
              <AlertCircle size={15} className="text-yellow-400" />
              <span className="text-yellow-400 text-xs font-bold uppercase tracking-widest">Important Notes</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
              {[
                { icon: '👟', title: 'Proper Gym Shoes', sub: 'Compulsory for all members' },
                { icon: '🏋️', title: 'Rerack Your Weights', sub: 'After every set, every time' },
                { icon: '🧹', title: 'Keep Gym Clean', sub: 'Maintain hygiene & discipline' },
              ].map((n, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-5">
                  <span className="text-2xl">{n.icon}</span>
                  <div>
                    <div className="text-white font-semibold text-sm">{n.title}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{n.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ VALUES ════════════════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="section-pill">Our Values</span>
            <h2 className="gym-font text-5xl text-white">WHAT WE <span className="gradient-text">STAND FOR</span></h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="glass rounded-2xl p-6 border border-white/5 hover:border-[#22d3ee]/20 transition-all">
                  <div className="w-11 h-11 rounded-xl bg-[#22d3ee]/10 border border-[#22d3ee]/20 flex items-center justify-center text-[#22d3ee] mb-4">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{v.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ TEAM ══════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-[#0d0e11] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="section-pill">Expert Team</span>
            <h2 className="gym-font text-5xl text-white">MEET YOUR <span className="gradient-text">TRAINERS</span></h2>
            <p className="text-gray-500 mt-3">Certified professionals dedicated to your transformation</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {team.map((t, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass rounded-2xl overflow-hidden group border border-white/5 hover:border-[#22d3ee]/25 transition-all">
                <div className="relative h-52 overflow-hidden">
                  <img src={t.img} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0e] via-transparent to-transparent"/>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#22d3ee] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"/>
                </div>
                <div className="p-4">
                  <div className="text-white font-bold text-base">{t.name}</div>
                  <div className="text-[#22d3ee] text-xs font-semibold mt-0.5">{t.role}</div>
                  <div className="text-gray-600 text-xs mt-2">{t.spec}</div>
                  <div className="text-gray-700 text-xs mt-0.5">{t.exp} experience</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CONTACT & SOCIAL ══════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="section-pill">Get in Touch</span>
            <h2 className="gym-font text-5xl text-white">FIND <span className="gradient-text">US</span></h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Phone */}
            <motion.a href={`tel:${GYM_PHONE}`}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0 }}
              whileHover={{ y: -4, borderColor: 'rgba(34,211,238,0.4)' }}
              className="glass rounded-2xl p-6 border border-white/8 flex items-start gap-4 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 flex-shrink-0 group-hover:bg-cyan-400/20 transition-all">
                <Phone size={20} />
              </div>
              <div>
                <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Call / WhatsApp</div>
                <div className="text-white font-bold text-lg">{GYM_PHONE}</div>
                <div className="text-gray-500 text-xs mt-1">Available Mon–Sat</div>
              </div>
              <ChevronRight size={16} className="text-gray-600 group-hover:text-cyan-400 ml-auto mt-1 transition-colors" />
            </motion.a>

            {/* Instagram */}
            <motion.a href={`https://instagram.com/${GYM_INSTAGRAM}`} target="_blank" rel="noreferrer"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              whileHover={{ y: -4 }}
              className="glass rounded-2xl p-6 border border-white/8 flex items-start gap-4 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 flex-shrink-0 group-hover:bg-pink-500/20 transition-all">
                <Instagram size={20} />
              </div>
              <div>
                <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Follow Us</div>
                <div className="text-white font-bold text-lg">@{GYM_INSTAGRAM}</div>
                <div className="text-gray-500 text-xs mt-1">Daily motivation & updates</div>
              </div>
              <ChevronRight size={16} className="text-gray-600 group-hover:text-pink-400 ml-auto mt-1 transition-colors" />
            </motion.a>

            {/* Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              whileHover={{ y: -4 }}
              className="glass rounded-2xl p-6 border border-white/8 flex items-start gap-4 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-green-400/10 border border-green-400/20 flex items-center justify-center text-green-400 flex-shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Location</div>
                <div className="text-white font-bold">FITNATION BY AJEET</div>
                <div className="text-gray-400 text-sm mt-1">Your Fitness, Our Mission</div>
                <div className="text-gray-500 text-xs mt-1">Mon–Sat: 5AM–11AM &amp; 4PM–10PM</div>
              </div>
            </motion.div>
          </div>

          {/* WhatsApp CTA banner */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mt-5 glass-cyan rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-white font-bold text-lg">Let's build a stronger community together</div>
              <div className="text-cyan-300/70 text-sm mt-0.5">Message us on WhatsApp for any query or to join FITNATION BY AJEET</div>
            </div>
            <a href={`https://wa.me/${GYM_WA}`} target="_blank" rel="noreferrer"
              className="btn-fire px-6 py-3 flex-shrink-0 flex items-center gap-2">
              <MessageCircle size={16} /> Chat on WhatsApp
            </a>
          </motion.div>
        </div>
      </section>

      {/* ══ CTA ══════════════════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="glass rounded-3xl p-10 border border-white/8">
            <h2 className="gym-font text-5xl text-white mb-4">READY TO <span className="gradient-text">START?</span></h2>
            <p className="text-gray-400 mb-7">Join hundreds of members who have transformed with FITNATION BY AJEET.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/enquiry" className="btn-fire px-8 py-3.5 flex items-center gap-2">
                Enquire to Join <ArrowRight size={16} />
              </Link>
              <a href={`https://wa.me/${GYM_WA}`} target="_blank" rel="noreferrer"
                className="btn-outline px-8 py-3.5 flex items-center gap-2">
                <MessageCircle size={16}/> WhatsApp Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
