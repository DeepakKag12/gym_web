import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Bell, Menu, X, LogOut, LayoutDashboard, Phone, Instagram, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { cachedGet } from '../utils/api';

const GYM_PHONE     = '9589730151';
const GYM_WA        = '919589730151';
const GYM_INSTAGRAM = 'fitnation.by.ajeet';

function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="44" stroke="url(#nr2)" strokeWidth="5" fill="none"/>
      <rect x="4"  y="46" width="18" height="8" rx="3" fill="url(#nb2)"/>
      <rect x="2"  y="42" width="6"  height="16" rx="2" fill="#67e8f9"/>
      <rect x="78" y="46" width="18" height="8" rx="3" fill="url(#nb2)"/>
      <rect x="92" y="42" width="6"  height="16" rx="2" fill="#67e8f9"/>
      <polygon points="50,18 28,75 72,75" fill="url(#nt2)"/>
      <polygon points="50,40 40,65 60,65" fill="#0b0c0e"/>
      <defs>
        <linearGradient id="nt2" x1="28" y1="18" x2="72" y2="75" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3ee"/><stop offset="100%" stopColor="#818cf8"/>
        </linearGradient>
        <linearGradient id="nr2" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3ee"/><stop offset="100%" stopColor="#475569"/>
        </linearGradient>
        <linearGradient id="nb2" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#67e8f9"/><stop offset="100%" stopColor="#475569"/>
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
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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
  const panelPath = user?.role === 'trainer' ? '/trainer' : '/admin';

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'nav-float shadow-lg shadow-black/30' : 'bg-transparent'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0 group min-h-0">
              <motion.div whileHover={{ rotate: 10 }} transition={{ type: 'spring', stiffness: 300 }}>
                <Logo size={30} />
              </motion.div>
              <div className="leading-none">
                <div className="text-white font-black gym-font text-base sm:text-lg tracking-widest">FITNATION</div>
                <div className="text-[#22d3ee] font-bold text-[8px] sm:text-[9px] tracking-[3px]">BY AJEET</div>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navLinks.map(l => (
                <Link key={l.path} to={l.path}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all relative min-h-0 ${
                    isActive(l.path) ? 'text-[#22d3ee]' : 'text-gray-400 hover:text-white'
                  }`}>
                  {l.label}
                  {isActive(l.path) && (
                    <motion.div layoutId="nav-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#22d3ee] rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            {/* Desktop Right Actions */}
            <div className="hidden lg:flex items-center gap-2">
              <Link to="/cart" className="relative p-2 rounded-xl text-gray-400 hover:text-[#22d3ee] hover:bg-white/5 transition-all min-h-0">
                <ShoppingCart size={19} />
                {count > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#22d3ee] text-black text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                    {count}
                  </motion.span>
                )}
              </Link>

              {user ? (
                <>
                  <Link to="/notifications" className="relative p-2 rounded-xl text-gray-400 hover:text-[#22d3ee] hover:bg-white/5 transition-all min-h-0">
                    <Bell size={19} />
                    {unread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">{unread}</span>
                    )}
                  </Link>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-white/8 bg-white/4">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#22d3ee] to-[#818cf8] flex items-center justify-center text-black font-bold text-xs flex-shrink-0">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="leading-none">
                      <div className="text-white text-xs font-semibold">{user.name?.split(' ')[0]}</div>
                      <div className="text-[#22d3ee] text-[9px] capitalize">{user.role}</div>
                    </div>
                  </div>
                  <Link to={panelPath} className="btn-fire text-xs px-4 py-2 gap-1.5 min-h-0">
                    <LayoutDashboard size={13} /> Panel
                  </Link>
                  <Link to="/settings" className="p-2 rounded-xl text-gray-400 hover:text-[#22d3ee] hover:bg-white/5 transition-all min-h-0">
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
                <Link to="/notifications" className="relative p-2 text-gray-400 min-h-0">
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </Link>
              )}
              <Link to="/cart" className="relative p-2 text-gray-400 min-h-0">
                <ShoppingCart size={20} />
                {count > 0 && (
                  <span className="absolute top-1 right-0.5 w-4 h-4 bg-[#22d3ee] text-black text-[9px] font-bold rounded-full flex items-center justify-center">{count}</span>
                )}
              </Link>
              <button onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/8 transition-all min-h-0">
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
              className="lg:hidden border-t border-white/8 bg-[#0b0c0e]/97 backdrop-blur-2xl max-h-[calc(100vh-56px)] overflow-y-auto"
            >
              <div className="px-4 py-3 space-y-1">
                {/* Nav links */}
                <Link to="/"
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/') ? 'text-[#22d3ee] bg-[#22d3ee]/8' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}>
                  Home
                </Link>
                {navLinks.map(l => (
                  <Link key={l.path} to={l.path}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive(l.path) ? 'text-[#22d3ee] bg-[#22d3ee]/8' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}>
                    {l.label}
                  </Link>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-white/8 mx-4" />

              {/* Auth section */}
              <div className="px-4 py-3 space-y-2">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/4">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#22d3ee] to-[#818cf8] flex items-center justify-center text-black font-bold flex-shrink-0">
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white text-sm font-semibold">{user.name}</div>
                        <div className="text-[#22d3ee] text-xs capitalize">{user.role}</div>
                      </div>
                    </div>
                    <Link to={panelPath} className="btn-fire w-full py-3 text-sm flex items-center justify-center gap-2">
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
                <a href={`tel:${GYM_PHONE}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 text-sm text-gray-300 hover:bg-white/10 transition-all border border-white/8">
                  <Phone size={14} className="text-cyan-400" /> Call
                </a>
                <a href={`https://wa.me/${GYM_WA}`} target="_blank" rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500/10 text-sm text-green-300 hover:bg-green-500/20 transition-all border border-green-500/20">
                  WhatsApp
                </a>
                <a href={`https://instagram.com/${GYM_INSTAGRAM}`} target="_blank" rel="noreferrer"
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
