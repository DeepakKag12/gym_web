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
    <footer className={`relative z-20 border-t mt-16 sm:mt-20 transition-colors duration-200 ${
      isDark ? 'bg-[#0d0e11] border-white/10 text-gray-300' : 'bg-[#fbfaf9] border-[#e6e0d8] text-slate-700'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

        {/* Grid — 1 col mobile, 2 col sm, 4 col lg */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-10">

          {/* Brand — full width on mobile */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <Logo size={30} />
              <div>
                <div className={`font-black gym-font text-lg tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>FITNATION</div>
                <div className="text-primary font-bold text-[9px] tracking-[3px]">BY AJEET</div>
              </div>
            </div>
            <p className={`text-sm leading-relaxed mb-4 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
              Uniting a healthier world. Premium fitness training, nutrition guidance, and supplements — all under one roof.
            </p>
            {/* Real social links */}
            <div className="flex gap-2">
              <a href={site.instagramHref} target="_blank" rel="noreferrer"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all text-xs min-h-0 ${
                  isDark
                    ? 'border-white/10 text-gray-300 hover:text-pink-400 hover:border-pink-400/30 hover:bg-white/5'
                    : 'border-slate-300 bg-white text-slate-700 hover:text-pink-600 hover:border-pink-500/50 hover:bg-slate-50 shadow-xs'
                }`}>
                <Instagram size={14} /> Instagram
              </a>
              <a href={site.waHref} target="_blank" rel="noreferrer"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all text-xs min-h-0 ${
                  isDark
                    ? 'border-white/10 text-gray-300 hover:text-emerald-400 hover:border-emerald-400/30 hover:bg-white/5'
                    : 'border-slate-300 bg-white text-slate-700 hover:text-[#176b45] hover:border-[#176b45]/50 hover:bg-slate-50 shadow-xs'
                }`}>
                <MessageCircle size={14} /> WhatsApp
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className={`font-semibold text-sm mb-3 uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>Explore</h4>
            <div className="space-y-2">
              {[
                { label: 'Explore Workouts', path: '/exercises' },
                { label: 'Join FitNation', path: '/enquiry' },
                { label: 'Diet Plans', path: '/diet' },
                { label: 'Store', path: '/store' },
                { label: 'Transformations', path: '/transformations' },
                { label: 'About FitNation', path: '/about' },
              ].map(l => (
                <Link key={l.path} to={l.path}
                  className={`block text-sm transition-colors py-0.5 min-h-0 ${
                    isDark
                      ? 'text-gray-400 hover:text-emerald-400 font-normal hover:font-medium'
                      : 'text-slate-600 hover:text-[#176b45] font-normal hover:font-semibold'
                  }`}>{l.label}</Link>
              ))}
            </div>
          </div>

          {/* Members */}
          <div>
            <h4 className={`font-semibold text-sm mb-3 uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>Members</h4>
            <div className="space-y-2">
              {[
                { label: 'Member Login', path: '/login' },
                { label: 'Member Dashboard', path: '/dashboard' },
                { label: 'My Workout', path: '/my-workout' },
                { label: 'My Diet', path: '/my-diet' },
                { label: 'My Progress', path: '/my-progress' },
                { label: 'My Orders', path: '/my-orders' },
              ].map(l => (
                <Link key={l.path} to={l.path}
                  className={`block text-sm transition-colors py-0.5 min-h-0 ${
                    isDark
                      ? 'text-gray-400 hover:text-emerald-400 font-normal hover:font-medium'
                      : 'text-slate-600 hover:text-[#176b45] font-normal hover:font-semibold'
                  }`}>{l.label}</Link>
              ))}
            </div>
          </div>

          {/* Contact — full width on mobile sm */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <h4 className={`font-semibold text-sm mb-3 uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>Contact</h4>
            <div className="space-y-2.5">
              <a href={site.telHref}
                className={`flex items-center gap-2.5 text-sm transition-colors min-h-0 py-0.5 ${
                  isDark ? 'text-gray-400 hover:text-emerald-400' : 'text-slate-600 hover:text-[#176b45] font-normal hover:font-medium'
                }`}>
                <Phone size={13} className={`flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}/> {site.phone}
              </a>
              <a href={site.waHref} target="_blank" rel="noreferrer"
                className={`flex items-center gap-2.5 text-sm transition-colors min-h-0 py-0.5 ${
                  isDark ? 'text-gray-400 hover:text-emerald-400' : 'text-slate-600 hover:text-[#176b45] font-normal hover:font-medium'
                }`}>
                <MessageCircle size={13} className={`flex-shrink-0 ${isDark ? 'text-emerald-400' : 'text-[#176b45]'}`}/> Chat on WhatsApp
              </a>
              <a href={site.instagramHref} target="_blank" rel="noreferrer"
                className={`flex items-center gap-2.5 text-sm transition-colors min-h-0 py-0.5 ${
                  isDark ? 'text-gray-400 hover:text-pink-400' : 'text-slate-600 hover:text-pink-600 font-normal hover:font-medium'
                }`}>
                <Instagram size={13} className={`flex-shrink-0 ${isDark ? 'text-pink-400' : 'text-pink-600'}`}/> @{site.instagram}
              </a>
              <div className={`flex items-start gap-2.5 text-sm pt-1 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                <Clock size={13} className={`flex-shrink-0 mt-0.5 ${isDark ? 'text-gray-500' : 'text-slate-500'}`}/>
                <div>
                  {site.hours.map((line, i) => <div key={i}>{line}</div>)}
                  <div className={`text-xs mt-0.5 font-medium ${isDark ? 'text-rose-400/90' : 'text-rose-600'}`}>Sunday: Closed</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className={`border-t pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left ${
          isDark ? 'border-white/10 text-gray-500' : 'border-slate-300 text-slate-500'
        }`}>
          <p className="text-xs">© {new Date().getFullYear()} FITNATION BY AJEET. All rights reserved.</p>
          <p className={`text-xs italic ${isDark ? 'text-gray-600' : 'text-slate-500'}`}>"Uniting a Healthier World"</p>
        </div>

        {/*
          Developer credit.
          Separated from the gym's own contact block above so a member looking
          for the gym never dials the developer by mistake — the two numbers sit
          in different sections and this one says plainly what it is for.
          Both are real links: tel: dials on a phone, mailto: opens the mail app.
        */}
        <div className={`mt-4 pt-4 border-t ${isDark ? 'border-white/10' : 'border-slate-300'}`}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-x-4 gap-y-2 text-center">
            <span className={`flex items-center gap-2 text-xs ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
              <Code2 size={13} className="text-primary flex-shrink-0" />
              Developed by <strong className={`font-semibold ${isDark ? 'text-gray-200' : 'text-slate-900'}`}>Deepak Kag</strong>
            </span>
            <span className={`hidden sm:block ${isDark ? 'text-gray-600' : 'text-slate-400'}`}>·</span>
            <a href="tel:+919174222924"
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                isDark ? 'text-gray-400 hover:text-emerald-400' : 'text-slate-600 hover:text-[#176b45] font-medium'
              }`}>
              <Phone size={12} className="flex-shrink-0" /> 91742 22924
            </a>
            <span className={`hidden sm:block ${isDark ? 'text-gray-600' : 'text-slate-400'}`}>·</span>
            <a href="mailto:kagdeepak45@gmail.com"
              className={`flex items-center gap-1.5 text-xs transition-colors break-all ${
                isDark ? 'text-gray-400 hover:text-emerald-400' : 'text-slate-600 hover:text-[#176b45] font-medium'
              }`}>
              <Mail size={12} className="flex-shrink-0" /> kagdeepak45@gmail.com
            </a>
          </div>
          <p className={`text-[11px] text-center mt-2 ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
            Available for web and app development projects
          </p>
        </div>
      </div>
    </footer>
  );
}
