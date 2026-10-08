import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import { Instagram, Phone, MessageCircle, Clock, Code2, Mail } from 'lucide-react';

function Logo({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="44" stroke="url(#ffr)" strokeWidth="5" fill="none"/>
      <rect x="4"  y="46" width="18" height="8" rx="3" fill="url(#ffb)"/>
      <rect x="2"  y="42" width="6"  height="16" rx="2" fill="#176b45"/>
      <rect x="78" y="46" width="18" height="8" rx="3" fill="url(#ffb)"/>
      <rect x="92" y="42" width="6"  height="16" rx="2" fill="#176b45"/>
      <polygon points="50,18 28,75 72,75" fill="url(#fft)"/>
      <polygon points="50,40 40,65 60,65" fill="#141211"/>
      <defs>
        <linearGradient id="fft" x1="28" y1="18" x2="72" y2="75" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981"/><stop offset="100%" stopColor="#176b45"/>
        </linearGradient>
        <linearGradient id="ffr" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#176b45"/><stop offset="100%" stopColor="#141211"/>
        </linearGradient>
        <linearGradient id="ffb" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981"/><stop offset="100%" stopColor="#141211"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Footer() {
  const site = useSettings();
  const { isDark } = useTheme();

  return (
    <footer
      className={`site-footer relative z-20 border-t mt-16 sm:mt-24 transition-colors duration-200 ${
        isDark
          ? 'bg-[#090d14] border-white/15 text-slate-200'
          : 'bg-[#0c1017] border-white/15 text-slate-200'
      }`}
    >
      {/* Top luminous emerald accent line for high visibility in dark and light modes */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent pointer-events-none opacity-80" />

      {/* Ambient emerald radial lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(16,185,129,0.08),transparent_75%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Grid — 1 col mobile, 2 col sm, 4 col lg */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-12">

          {/* Brand — full width on mobile */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-3.5 group">
              <Logo size={34} />
              <div>
                <div
                  className="font-black gym-font text-xl sm:text-2xl tracking-wider text-white group-hover:text-emerald-400 transition-colors"
                  style={{ color: '#ffffff' }}
                >
                  FITNATION
                </div>
                <div className="text-emerald-400 font-bold text-[10px] tracking-[3px]" style={{ color: '#34d399' }}>
                  BY AJEET
                </div>
              </div>
            </Link>
            <p className="text-sm leading-relaxed mb-5 text-slate-300 font-normal">
              Uniting a healthier world. Premium fitness training, nutrition guidance, and supplements — all under one roof.
            </p>

            {/* Social badges with tactile dark glass finish & vibrant brand colors */}
            <div className="flex flex-wrap gap-2.5">
              <a
                href={site.instagramHref}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-pink-500/30 bg-pink-500/10 hover:bg-pink-500/20 text-xs font-semibold text-white hover:border-pink-400 transition-all shadow-xs"
              >
                <Instagram size={14} className="text-pink-400 flex-shrink-0" /> Instagram
              </a>
              <a
                href={site.waHref}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-semibold text-white hover:border-emerald-400 transition-all shadow-xs"
              >
                <MessageCircle size={14} className="text-emerald-400 flex-shrink-0" /> WhatsApp
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4
              className="footer-heading font-black text-xs sm:text-sm mb-4 uppercase tracking-wider text-white flex items-center gap-2.5"
              style={{ color: '#ffffff' }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] flex-shrink-0" style={{ backgroundColor: '#34d399' }}></span>
              Explore
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Explore Workouts', path: '/exercises' },
                { label: 'Join FitNation', path: '/enquiry' },
                { label: 'Diet Plans', path: '/diet' },
                { label: 'Store', path: '/store' },
                { label: 'Transformations', path: '/transformations' },
                { label: 'About FitNation', path: '/about' },
              ].map(l => (
                <li key={l.path}>
                  <Link
                    to={l.path}
                    className="text-sm text-slate-200 hover:text-emerald-300 hover:translate-x-1.5 transition-all duration-150 inline-flex items-center gap-1.5 py-0.5 group"
                  >
                    <span className="text-emerald-400 font-bold text-xs group-hover:text-emerald-300">›</span>
                    <span className="text-slate-200 group-hover:text-white transition-colors">{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Members */}
          <div>
            <h4
              className="footer-heading font-black text-xs sm:text-sm mb-4 uppercase tracking-wider text-white flex items-center gap-2.5"
              style={{ color: '#ffffff' }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] flex-shrink-0" style={{ backgroundColor: '#34d399' }}></span>
              Members
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Member Login', path: '/login' },
                { label: 'Member Dashboard', path: '/dashboard' },
                { label: 'My Workout', path: '/my-workout' },
                { label: 'My Diet', path: '/my-diet' },
                { label: 'My Progress', path: '/my-progress' },
                { label: 'My Orders', path: '/my-orders' },
              ].map(l => (
                <li key={l.path}>
                  <Link
                    to={l.path}
                    className="text-sm text-slate-200 hover:text-emerald-300 hover:translate-x-1.5 transition-all duration-150 inline-flex items-center gap-1.5 py-0.5 group"
                  >
                    <span className="text-emerald-400 font-bold text-xs group-hover:text-emerald-300">›</span>
                    <span className="text-slate-200 group-hover:text-white transition-colors">{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact — full width on mobile sm */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <h4
              className="footer-heading font-black text-xs sm:text-sm mb-4 uppercase tracking-wider text-white flex items-center gap-2.5"
              style={{ color: '#ffffff' }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] flex-shrink-0" style={{ backgroundColor: '#34d399' }}></span>
              Contact
            </h4>
            <div className="space-y-3">
              <a
                href={site.telHref}
                className="flex items-center gap-3 text-sm text-slate-100 hover:text-emerald-400 transition-colors py-0.5 group"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-400 group-hover:bg-emerald-500/25 group-hover:border-emerald-400 transition-all shadow-xs">
                  <Phone size={14} />
                </div>
                <span className="font-medium text-slate-100 group-hover:text-emerald-400">{site.phone}</span>
              </a>

              <a
                href={site.waHref}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-sm text-slate-100 hover:text-emerald-400 transition-colors py-0.5 group"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-400 group-hover:bg-emerald-500/25 group-hover:border-emerald-400 transition-all shadow-xs">
                  <MessageCircle size={14} />
                </div>
                <span className="font-medium text-slate-100 group-hover:text-emerald-400">Chat on WhatsApp</span>
              </a>

              <a
                href={site.instagramHref}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-sm text-slate-100 hover:text-pink-400 transition-colors py-0.5 group"
              >
                <div className="w-8 h-8 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center flex-shrink-0 text-pink-400 group-hover:bg-pink-500/25 group-hover:border-pink-400 transition-all shadow-xs">
                  <Instagram size={14} />
                </div>
                <span className="font-medium text-slate-100 group-hover:text-pink-400">@{site.instagram}</span>
              </a>

              <div className="flex items-start gap-3 text-sm pt-1">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0 text-amber-300 mt-0.5 shadow-xs">
                  <Clock size={14} />
                </div>
                <div>
                  {site.hours.map((line, i) => (
                    <div key={i} className="text-slate-200 font-medium leading-relaxed">{line}</div>
                  ))}
                  <div className="mt-1.5">
                    <span className="inline-block px-2.5 py-0.5 text-xs font-bold rounded-md bg-rose-500/20 text-rose-200 border border-rose-500/40">
                      Sunday: Closed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} <strong className="text-white font-semibold" style={{ color: '#ffffff' }}>FITNATION BY AJEET</strong>. All rights reserved.
          </p>
          <p className="text-xs font-semibold text-emerald-400 tracking-wider uppercase" style={{ color: '#34d399' }}>
            "Uniting a Healthier World"
          </p>
        </div>

        {/* Developer credit card */}
        <div className="mt-6 pt-5 border-t border-white/12">
          <div className="bg-white/[0.04] border border-white/12 rounded-2xl p-4 text-center hover:border-emerald-500/30 transition-all">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-x-4 gap-y-2">
              <span className="flex items-center gap-2 text-xs text-slate-200 font-medium">
                <Code2 size={14} className="text-emerald-400 flex-shrink-0" />
                Developed by <strong className="font-bold text-white" style={{ color: '#ffffff' }}>Deepak Kag</strong>
              </span>
              <span className="hidden sm:inline text-emerald-500/40">·</span>
              <a
                href="tel:+919174222924"
                className="flex items-center gap-1.5 text-xs text-slate-200 hover:text-emerald-400 transition-colors font-semibold"
              >
                <Phone size={12} className="flex-shrink-0 text-emerald-400" /> 91742 22924
              </a>
              <span className="hidden sm:inline text-emerald-500/40">·</span>
              <a
                href="mailto:kagdeepak45@gmail.com"
                className="flex items-center gap-1.5 text-xs text-slate-200 hover:text-emerald-400 transition-colors font-semibold break-all"
              >
                <Mail size={12} className="flex-shrink-0 text-emerald-400" /> kagdeepak45@gmail.com
              </a>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Available for web and app development projects
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
