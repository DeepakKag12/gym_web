import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Phone, MessageCircle, Clock } from 'lucide-react';

const GYM_PHONE     = '9589730151';
const GYM_WA        = '919589730151';
const GYM_INSTAGRAM = 'fitnation.by.ajeet';

function Logo({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="44" stroke="url(#ffr)" strokeWidth="5" fill="none"/>
      <rect x="4"  y="46" width="18" height="8" rx="3" fill="url(#ffb)"/>
      <rect x="2"  y="42" width="6"  height="16" rx="2" fill="#67e8f9"/>
      <rect x="78" y="46" width="18" height="8" rx="3" fill="url(#ffb)"/>
      <rect x="92" y="42" width="6"  height="16" rx="2" fill="#67e8f9"/>
      <polygon points="50,18 28,75 72,75" fill="url(#fft)"/>
      <polygon points="50,40 40,65 60,65" fill="#0b0c0e"/>
      <defs>
        <linearGradient id="fft" x1="28" y1="18" x2="72" y2="75" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3ee"/><stop offset="100%" stopColor="#818cf8"/>
        </linearGradient>
        <linearGradient id="ffr" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3ee"/><stop offset="100%" stopColor="#475569"/>
        </linearGradient>
        <linearGradient id="ffb" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#67e8f9"/><stop offset="100%" stopColor="#475569"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#0d0e11] border-t border-white/6 mt-16 sm:mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

        {/* Grid — 1 col mobile, 2 col sm, 4 col lg */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-10">

          {/* Brand — full width on mobile */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <Logo size={30} />
              <div>
                <div className="text-white font-black gym-font text-lg">FITNATION</div>
                <div className="text-[#22d3ee] font-bold text-[9px] tracking-[3px]">BY AJEET</div>
              </div>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Uniting a healthier world. Premium fitness training, nutrition guidance, and supplements — all under one roof.
            </p>
            {/* Real social links */}
            <div className="flex gap-2">
              <a href={`https://instagram.com/${GYM_INSTAGRAM}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/8 text-gray-400 hover:text-pink-400 hover:border-pink-400/30 transition-all text-xs min-h-0">
                <Instagram size={14} /> Instagram
              </a>
              <a href={`https://wa.me/${GYM_WA}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/8 text-gray-400 hover:text-green-400 hover:border-green-400/30 transition-all text-xs min-h-0">
                <MessageCircle size={14} /> WhatsApp
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">Explore</h4>
            <div className="space-y-2">
              {[
                { label: 'Exercises', path: '/exercises' },
                { label: 'Diet Plans', path: '/diet' },
                { label: 'Store',  path: '/store' },
                { label: 'Transformations', path: '/transformations' },
                { label: 'About', path: '/about' },
                { label: 'Enquiry', path: '/enquiry' },
              ].map(l => (
                <Link key={l.path} to={l.path}
                  className="block text-gray-500 text-sm hover:text-[#22d3ee] transition-colors py-0.5 min-h-0">{l.label}</Link>
              ))}
            </div>
          </div>

          {/* Members */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">Members</h4>
            <div className="space-y-2">
              {[
                { label: 'Login', path: '/login' },
                { label: 'Dashboard', path: '/dashboard' },
                { label: 'My Workout', path: '/my-workout' },
                { label: 'My Diet', path: '/my-diet' },
                { label: 'My Progress', path: '/my-progress' },
                { label: 'My Orders', path: '/my-orders' },
              ].map(l => (
                <Link key={l.path} to={l.path}
                  className="block text-gray-500 text-sm hover:text-[#22d3ee] transition-colors py-0.5 min-h-0">{l.label}</Link>
              ))}
            </div>
          </div>

          {/* Contact — full width on mobile sm */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">Contact</h4>
            <div className="space-y-2.5">
              <a href={`tel:${GYM_PHONE}`}
                className="flex items-center gap-2.5 text-gray-400 text-sm hover:text-[#22d3ee] transition-colors min-h-0 py-0.5">
                <Phone size={13} className="text-cyan-400 flex-shrink-0"/> {GYM_PHONE}
              </a>
              <a href={`https://wa.me/${GYM_WA}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-2.5 text-gray-400 text-sm hover:text-green-400 transition-colors min-h-0 py-0.5">
                <MessageCircle size={13} className="text-green-400 flex-shrink-0"/> Chat on WhatsApp
              </a>
              <a href={`https://instagram.com/${GYM_INSTAGRAM}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-2.5 text-gray-400 text-sm hover:text-pink-400 transition-colors min-h-0 py-0.5">
                <Instagram size={13} className="text-pink-400 flex-shrink-0"/> @{GYM_INSTAGRAM}
              </a>
              <div className="flex items-start gap-2.5 text-gray-500 text-sm pt-1">
                <Clock size={13} className="flex-shrink-0 mt-0.5 text-gray-600"/>
                <div>
                  <div>Mon–Sat: 5 AM – 11 AM</div>
                  <div>Mon–Sat: 4 PM – 10 PM</div>
                  <div className="text-red-400/70 text-xs mt-0.5">Sunday: Closed</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/6 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p className="text-gray-600 text-xs">© {new Date().getFullYear()} FITNATION BY AJEET. All rights reserved.</p>
          <p className="text-gray-700 text-xs italic">"Uniting a Healthier World"</p>
        </div>
      </div>
    </footer>
  );
}
