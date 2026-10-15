import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Bell, Menu, X, LogOut, LayoutDashboard, Phone, Instagram, Settings, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useCart } from '../context/CartContext';
import { cachedGet } from '../utils/api';
import { isPanelRoute } from '../utils/routes';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import ThemeSwitch from './ThemeSwitch';


function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <circle cx="50" cy="50" r="44" stroke="var(--primary, #16a34a)" strokeWidth="5" fill="none"/>
      <rect x="4"  y="46" width="18" height="8" rx="2" fill="var(--primary, #16a34a)"/>
      <rect x="2"  y="42" width="6"  height="16" rx="2" fill="var(--primary, #16a34a)"/>
      <rect x="78" y="46" width="18" height="8" rx="2" fill="var(--primary, #16a34a)"/>
      <rect x="92" y="42" width="6"  height="16" rx="2" fill="var(--primary, #16a34a)"/>
      <polygon points="50,18 28,75 72,75" fill="var(--primary, #16a34a)"/>
      <polygon points="50,42 42,65 58,65" fill="var(--bg, #0a0c10)"/>
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

  const { unreadCount: unreadMessages } = useSocket();
  const messagesPath = user?.role === 'admin' ? '/admin/messages' : '/my-messages';

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
            <Link to="/" className="flex items-center gap-2 flex-shrink-0 group min-h-0" aria-label="FitNation by Ajeet Home">
              <div className="group-hover:opacity-90 transition-opacity">
                <Logo size={30} />
              </div>
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
              <Link to="/cart" aria-label="Shopping Cart" className={`relative p-2 rounded-xl transition-all min-h-0 ${
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
                  <Link to={messagesPath} aria-label="Live Messages & Chat" className={`relative p-2 rounded-xl transition-all min-h-0 ${
                    isDark ? 'text-gray-400 hover:text-white hover:bg-white/8' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
                  }`} title="Live Messages & Chat">
                    <MessageSquare size={19} />
                    {unreadMessages > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                        {unreadMessages}
                      </span>
                    )}
                  </Link>
                  <Link to="/notifications" aria-label="Notifications" className={`relative p-2 rounded-xl transition-all min-h-0 ${
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
                  <Link to="/settings" aria-label="Account Settings" className={`p-2 rounded-xl transition-all min-h-0 ${
                    isDark ? 'text-gray-400 hover:text-white hover:bg-white/8' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
                  }`}>
                    <Settings size={17} />
                  </Link>
                  <button onClick={handleLogout} aria-label="Sign Out" className="p-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/8 transition-all min-h-0">
                    <LogOut size={17} />
                  </button>
                </>
              ) : (
                <Link to="/login" className="btn-primary text-sm px-5 py-2 min-h-0">Sign In</Link>
              )}
            </div>

            {/* Mobile — cart + messages + bell + hamburger */}
            <div className="flex items-center gap-1 lg:hidden">
              {user && (
                <Link to={messagesPath} aria-label="Chat" className={`relative p-2 min-h-0 ${isDark ? 'text-gray-400' : 'text-slate-600'}`} title="Chat">
                  <MessageSquare size={20} />
                  {unreadMessages > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
                  )}
                </Link>
              )}
              {user && unread > 0 && (
                <Link to="/notifications" aria-label="Notifications" className={`relative p-2 min-h-0 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </Link>
              )}
              <Link to="/cart" aria-label="Cart" className={`relative p-2 min-h-0 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                <ShoppingCart size={20} />
                {count > 0 && (
                  <span className="absolute top-1 right-0.5 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">{count}</span>
                )}
              </Link>
              <ThemeSwitch size={20} />
              <button onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
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
              className="lg:hidden border-t border-[var(--border)] bg-[var(--bg)] shadow-xl max-h-[calc(100vh-56px)] overflow-y-auto"
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
