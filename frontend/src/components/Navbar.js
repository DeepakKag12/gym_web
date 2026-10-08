import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Bell, Menu, X, LogOut, LayoutDashboard, Phone, Instagram, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { cachedGet } from '../utils/api';
import { isPanelRoute } from '../utils/routes';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import ThemeSwitch from './ThemeSwitch';


function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="44" stroke="url(#nr2)" strokeWidth="5" fill="none"/>
      <rect x="4"  y="46" width="18" height="8" rx="3" fill="url(#nb2)"/>
      <rect x="2"  y="42" width="6"  height="16" rx="2" fill="#176b45"/>
      <rect x="78" y="46" width="18" height="8" rx="3" fill="url(#nb2)"/>
      <rect x="92" y="42" width="6"  height="16" rx="2" fill="#176b45"/>
      <polygon points="50,18 28,75 72,75" fill="url(#nt2)"/>
      <polygon points="50,40 40,65 60,65" fill="#141211"/>
      <defs>
        <linearGradient id="nt2" x1="28" y1="18" x2="72" y2="75" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981"/><stop offset="100%" stopColor="#176b45"/>
        </linearGradient>
        <linearGradient id="nr2" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#176b45"/><stop offset="100%" stopColor="#141211"/>
        </linearGradient>
        <linearGradient id="nb2" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981"/><stop offset="100%" stopColor="#141211"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

const navLinks = [
  { label: 'Exercises', path: '/exercises' },
  { label: 'Diet',      path: '/diet' },
  { label: 'Transform', path: '/transformations' },
  { label: 'Store',     path: '/store' },
  { label: 'About',     path: '/about' },
  { label: 'Enquiry',   path: '/enquiry' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  // Gym contact details come from the settings an admin edits, not constants.
  const site = useSettings();
  const { isDark } = useTheme();
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Inside the panel the bar is always solid — a transparent bar over a light
  // page leaves the links floating with nothing behind them.
  const inPanel = isPanelRoute(location.pathname);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    if (user) {
      cachedGet('/notifications', { cache: 30 })
        .then(r => setUnread(r.data.filter(n => !n.isRead).length))
        .catch(() => {});
    }
  }, [user, location.pathname]);

  // close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path) => location.pathname === path;
  const panelPath = user?.role === 'admin' ? '/admin' : user?.role === 'trainer' ? '/trainer' : '/dashboard';

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || inPanel ? 'nav-float' : 'bg-transparent'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0 group min-h-0">
              <motion.div whileHover={{ rotate: 10 }} transition={{ type: 'spring', stiffness: 300 }}>
                <Logo size={30} />
              </motion.div>
              <div className="leading-none">
                <div className={`font-black gym-font text-base sm:text-lg tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>FITNATION</div>
                <div className="text-primary font-bold text-[8px] sm:text-[9px] tracking-[3px]">BY AJEET</div>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navLinks.map(l => (
                <Link key={l.path} to={l.path}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all relative min-h-0 ${
                    isActive(l.path)
                      ? 'text-primary'
                      : (isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-950')
                  }`}>
                  {l.label}
                  {isActive(l.path) && (
                    <motion.div layoutId="nav-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            {/* Desktop Right Actions */}
            <div className="hidden lg:flex items-center gap-2">
              <ThemeSwitch />
              <Link to="/cart" className={`relative p-2 rounded-xl transition-all min-h-0 ${
                isDark ? 'text-gray-400 hover:text-white hover:bg-white/8' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
              }`}>
                <ShoppingCart size={19} />
                {count > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                    {count}
                  </motion.span>
                )}
              </Link>

              {user ? (
                <>
                  <Link to="/notifications" className={`relative p-2 rounded-xl transition-all min-h-0 ${
                    isDark ? 'text-gray-400 hover:text-white hover:bg-white/8' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
                  }`}>
                    <Bell size={19} />
                    {unread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">{unread}</span>
                    )}
                  </Link>
                  <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border ${
                    isDark ? 'border-white/8 bg-white/4' : 'border-slate-300 bg-white/80 shadow-xs'
                  }`}>
                    <div className="w-7 h-7 rounded-full bg-stone-700 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="leading-none">
                      <div className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{user.name?.split(' ')[0]}</div>
                      <div className={`text-[9px] capitalize ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{user.role}</div>
                    </div>
                  </div>
                  <Link to={panelPath} className={`btn-secondary text-xs px-3.5 py-2 gap-1.5 min-h-0 ${
                    isDark ? 'border-white/10 hover:border-white/20' : 'border-slate-300 hover:border-slate-400'
                  }`}>
                    <LayoutDashboard size={13} /> Panel
                  </Link>
                  <Link to="/settings" className={`p-2 rounded-xl transition-all min-h-0 ${
                    isDark ? 'text-gray-400 hover:text-white hover:bg-white/8' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
                  }`}>
                    <Settings size={17} />
                  </Link>
                  <button onClick={handleLogout} className="p-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/8 transition-all min-h-0">
                    <LogOut size={17} />
                  </button>
                </>
              ) : (
                <Link to="/login" className="btn-fire text-sm px-5 py-2 min-h-0">Sign In</Link>
              )}
            </div>

            {/* Mobile — cart + bell + hamburger */}
            <div className="flex items-center gap-1 lg:hidden">
              {user && unread > 0 && (
                <Link to="/notifications" className={`relative p-2 min-h-0 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </Link>
              )}
              <Link to="/cart" className={`relative p-2 min-h-0 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                <ShoppingCart size={20} />
                {count > 0 && (
                  <span className="absolute top-1 right-0.5 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">{count}</span>
                )}
              </Link>
              <ThemeSwitch size={20} />
              <button onClick={() => setMobileOpen(!mobileOpen)}
                className={`p-2 rounded-xl transition-all min-h-0 ${
                  isDark ? 'text-gray-400 hover:text-white hover:bg-white/8' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
                }`}>
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Full-Sheet Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-[var(--color-border)] bg-[var(--color-bg)]/98 backdrop-blur-2xl max-h-[calc(100vh-56px)] overflow-y-auto"
            >
              <div className="px-4 py-3 space-y-1">
                {/* Nav links */}
                <Link to="/"
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive('/')
                      ? 'text-primary bg-primary/10'
                      : (isDark ? 'text-gray-300 hover:text-white hover:bg-white/5' : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/50')
                  }`}>
                  Home
                </Link>
                {navLinks.map(l => (
                  <Link key={l.path} to={l.path}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive(l.path)
                        ? 'text-primary bg-primary/10'
                        : (isDark ? 'text-gray-300 hover:text-white hover:bg-white/5' : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/50')
                    }`}>
                    {l.label}
                  </Link>
                ))}
              </div>

              {/* Divider */}
              <div className={`border-t mx-4 ${isDark ? 'border-white/8' : 'border-slate-200'}`} />

              {/* Auth section */}
              <div className="px-4 py-3 space-y-2">
                {user ? (
                  <>
                    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl ${isDark ? 'bg-white/4' : 'bg-slate-200/50'}`}>
                      <div className="w-9 h-9 rounded-full bg-stone-700 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{user.name}</div>
                        <div className={`text-xs capitalize ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{user.role}</div>
                      </div>
                    </div>
                    <Link to={panelPath} className={`btn-secondary w-full py-3 text-sm flex items-center justify-center gap-2 ${
                      isDark ? 'border-white/10' : 'border-slate-300'
                    }`}>
                       <LayoutDashboard size={15} />
                       {user.role === 'member' ? 'My Dashboard' : `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Panel`}
                     </Link>
                     <Link to="/settings" className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-white rounded-xl hover:bg-white/5 transition-all">
                       <Settings size={15} className="text-gray-400" /> Settings
                     </Link>
                     <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-red-400 flex items-center gap-2 rounded-xl hover:bg-red-500/8 transition-all">
                      <LogOut size={15} /> Sign Out
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="block">
                    <button className="btn-fire w-full py-3 text-sm">Sign In</button>
                  </Link>
                )}
              </div>

              {/* Quick contact strip */}
              <div className="border-t border-white/8 mx-4" />
              <div className="px-4 py-3 flex gap-3 pb-5">
                <a href={site.telHref}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 text-sm text-gray-300 hover:bg-white/10 transition-all border border-white/8">
                  <Phone size={14} className="text-primary" /> Call
                </a>
                <a href={site.waHref} target="_blank" rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500/10 text-sm text-green-300 hover:bg-green-500/20 transition-all border border-green-500/20">
                  WhatsApp
                </a>
                <a href={site.instagramHref} target="_blank" rel="noreferrer"
                  className="flex items-center justify-center w-12 rounded-xl bg-white/5 text-pink-400 hover:bg-white/10 transition-all border border-white/8">
                  <Instagram size={16} />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
