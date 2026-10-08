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
          ? 'bg-[#08090d] border-white/10 text-slate-300'
          : 'bg-[#0b0f17] border-white/10 text-slate-300'
      }`}
    >
      {/* Top luminous emerald accent line for high visibility in dark mode */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent pointer-events-none" />

      {/* Ambient emerald radial lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(16,185,129,0.06),transparent_70%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Grid — 1 col mobile, 2 col sm, 4 col lg */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-12">

          {/* Brand — full width on mobile */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-3.5 group">
              <Logo size={32} />
              <div>
                <div className="font-black gym-font text-lg sm:text-xl tracking-wider text-white group-hover:text-emerald-400 transition-colors">
                  FITNATION
                </div>
                <div className="text-emerald-400 font-bold text-[9px] tracking-[3px]">
                  BY AJEET
                </div>
              </div>
            </Link>
            <p className="text-sm leading-relaxed mb-5 text-slate-300 font-normal">
              Uniting a healthier world. Premium fitness training, nutrition guidance, and supplements — all under one roof.
            </p>

            {/* Social badges with tactile dark glass finish */}
            <div className="flex flex-wrap gap-2.5">
              <a
                href={site.instagramHref}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.1] text-xs font-medium text-slate-200 hover:text-pink-400 hover:border-pink-500/40 transition-all shadow-xs"
              >
                <Instagram size={14} className="text-pink-400 flex-shrink-0" /> Instagram
              </a>
              <a
                href={site.waHref}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.1] text-xs font-medium text-slate-200 hover:text-emerald-400 hover:border-emerald-500/40 transition-all shadow-xs"
              >
                <MessageCircle size={14} className="text-emerald-400 flex-shrink-0" /> WhatsApp
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="footer-heading font-bold text-sm mb-4 uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
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
                    className="text-sm text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-150 inline-flex items-center gap-1 py-0.5"
                  >
                    <span className="text-emerald-500/60 text-xs">›</span>
                    <span>{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Members */}
          <div>
            <h4 className="footer-heading font-bold text-sm mb-4 uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
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
                    className="text-sm text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-150 inline-flex items-center gap-1 py-0.5"
                  >
                    <span className="text-emerald-500/60 text-xs">›</span>
                    <span>{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact — full width on mobile sm */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <h4 className="footer-heading font-bold text-sm mb-4 uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
              Contact
            </h4>
            <div className="space-y-3">
              <a
                href={site.telHref}
                className="flex items-center gap-2.5 text-sm text-slate-300 hover:text-emerald-400 transition-colors py-0.5"
              >
                <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center flex-shrink-0 text-emerald-400">
                  <Phone size={13} />
                </div>
                <span>{site.phone}</span>
              </a>

              <a
                href={site.waHref}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 text-sm text-slate-300 hover:text-emerald-400 transition-colors py-0.5"
              >
                <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center flex-shrink-0 text-emerald-400">
                  <MessageCircle size={13} />
                </div>
                <span>Chat on WhatsApp</span>
              </a>

              <a
                href={site.instagramHref}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 text-sm text-slate-300 hover:text-pink-400 transition-colors py-0.5"
              >
                <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center flex-shrink-0 text-pink-400">
                  <Instagram size={13} />
                </div>
                <span>@{site.instagram}</span>
              </a>

              <div className="flex items-start gap-2.5 text-sm pt-1.5">
                <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center flex-shrink-0 text-amber-400 mt-0.5">
                  <Clock size={13} />
                </div>
                <div>
                  {site.hours.map((line, i) => (
                    <div key={i} className="text-slate-300 font-normal leading-relaxed">{line}</div>
                  ))}
                  <div className="mt-1.5">
                    <span className="inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
                      Sunday: Closed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} <span className="text-slate-200 font-medium">FITNATION BY AJEET</span>. All rights reserved.
          </p>
          <p className="text-xs italic text-emerald-400/90 font-medium">
            "Uniting a Healthier World"
          </p>
        </div>

        {/* Developer credit card */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3.5 sm:p-4 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-x-4 gap-y-2">
              <span className="flex items-center gap-2 text-xs text-slate-300 font-normal">
                <Code2 size={14} className="text-emerald-400 flex-shrink-0" />
                Developed by <strong className="font-semibold text-white">Deepak Kag</strong>
              </span>
              <span className="hidden sm:inline text-emerald-500/40">·</span>
              <a
                href="tel:+919174222924"
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-emerald-400 transition-colors font-medium"
              >
                <Phone size={12} className="flex-shrink-0 text-emerald-400" /> 91742 22924
              </a>
              <span className="hidden sm:inline text-emerald-500/40">·</span>
              <a
                href="mailto:kagdeepak45@gmail.com"
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-emerald-400 transition-colors font-medium break-all"
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
