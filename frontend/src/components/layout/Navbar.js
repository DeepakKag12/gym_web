import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useSocket } from '../../context/SocketContext';
import PillButton from '../ui/PillButton';

/**
 * OrisNavbar
 * Fully functional, high-performance navigation bar for FitNation.
 * Reconciles the minimalist Oris Dental layout aesthetics with the complete
 * fitness web application capabilities:
 * - Direct routing to Exercises, Diet, Store, Transformations, Plans, and About
 * - Real-time Shopping Cart count indicator
 * - Live unread chat messages counter
 * - Auth session state (Sign In vs Member/Trainer/Admin Dashboard + Logout)
 * - Kinetic Oris Pill CTA ("Join FitNation")
 * - Responsive mobile sliding drawer
 */

export default function Navbar({
  brandName = 'FITNATION BY AJEET',
  ctaText = 'Join FitNation',
  ctaHref = '#trial-form',
  className = '',
}) {
  const [visible, setVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastScrollY = useRef(0);

  const auth = useAuth?.() || {};
  const user = auth?.user || null;
  const logout = auth?.logout || (() => {});

  const cartContext = useCart?.() || {};
  const cartCount = cartContext?.count || 0;

  const socketContext = useSocket?.() || {};
  const unreadMessages = socketContext?.unreadCount || 0;

  const navigate = useNavigate();
  const location = useLocation();

  // Reveal header after preloader completes (or immediately on subpages)
  useEffect(() => {
    if (window.__orisLoaderFinished || location.pathname !== '/') {
      setVisible(true);
    } else {
      const onFinished = () => setVisible(true);
      window.addEventListener('oris-loader-finished', onFinished, { once: true });
      return () => window.removeEventListener('oris-loader-finished', onFinished);
    }
  }, [location.pathname]);

  // Intelligent scroll hiding & background transition
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY || 0;
      setScrolled(currentScrollY > 30);

      if (currentScrollY > 120) {
        if (currentScrollY > lastScrollY.current + 8) {
          setVisible(false);
          setMobileOpen(false);
        } else if (currentScrollY < lastScrollY.current - 8) {
          setVisible(true);
        }
      } else {
        setVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  const panelPath =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'trainer'
      ? '/trainer'
      : '/dashboard';

  const messagesPath = user?.role === 'admin' ? '/admin/messages' : '/my-messages';

  const navLinks = [
    { label: 'Workouts', path: '/exercises' },
    { label: 'Diet', path: '/diet' },
    { label: 'Store', path: '/store' },
    { label: 'Results', path: '/transformations' },
    { label: 'Plans', path: '#oris-plans', isHash: true },
    { label: 'About', path: '/about' },
  ];

  const handleLogoClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      if (window.scrollY > 0) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    setMobileOpen(false);
  };

  const handleCtaClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById('oris-form');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/enquiry');
    }
    setMobileOpen(false);
  };

  const handleHashClick = (e, hash) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const targetId = hash.replace(/^#/, '');
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
      setMobileOpen(false);
    }
  };

  // Scroll to hash if arriving on / with a hash target
  useEffect(() => {
    if (location.hash && location.pathname === '/') {
      const targetId = location.hash.replace(/^#/, '');
      const el = document.getElementById(targetId);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 120);
      }
    }
  }, [location.pathname, location.hash]);

  // Navbar is always rendered in solid frosted glass with high contrast so it is crystal-clear
  // on both pure white and light blue gradient sections.
  return (
    <>
      <header
        className={`fixed top-0 left-0 z-50 flex items-center w-full justify-between oris-paddx py-3 sm:py-3.5 transition-all duration-300 select-none ${
          visible ? 'translate-y-0' : '-translate-y-full'
        } bg-white/95 backdrop-blur-md ${
          scrolled
            ? 'shadow-md border-b border-slate-200/90'
            : 'shadow-xs border-b border-slate-200/70'
        } text-slate-800 ${className}`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      >
        {/* ── Left: Brand Wordmark (Smooth Top Scroll) ────────────────── */}
        <Link
          to="/"
          onClick={handleLogoClick}
          className="flex items-center gap-2 no-underline hover:opacity-90 transition-opacity flex-shrink-0 cursor-pointer group"
          aria-label="FitNation by Ajeet Home"
        >
          <div className="flex flex-col leading-tight">
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-lg sm:text-2xl lg:text-3xl font-black tracking-tight font-sans uppercase text-[#3365e2]">
                FITNATION
              </span>
              <span className="hidden min-[380px]:inline-block text-[10px] sm:text-xs font-bold tracking-wider uppercase px-1.5 sm:px-2 py-0.5 rounded-full border bg-[#3365e2]/10 text-[#3365e2] border-[#3365e2]/25">
                by Ajeet
              </span>
            </div>
          </div>
        </Link>

        {/* ── Center: Core Application Navigation Links (Desktop) ─────── */}
        <nav
          className="hidden lg:flex items-center gap-7 xl:gap-8 text-sm font-medium"
          aria-label="Main Navigation"
        >
          {navLinks.map((item) => {
            const isActive = location.pathname === item.path;
            const isHashOnHome = item.isHash && location.pathname === '/';
            const targetHref = item.isHash
              ? location.pathname === '/'
                ? item.path
                : `/${item.path}`
              : item.path;

            const linkClasses = `relative py-1 transition-colors duration-200 no-underline cursor-pointer select-none font-semibold ${
              isActive
                ? 'text-[#3365e2]'
                : 'text-slate-700 hover:text-[#3365e2]'
            }`;

            if (isHashOnHome) {
              return (
                <a
                  key={item.label}
                  href={item.path}
                  onClick={(e) => handleHashClick(e, item.path)}
                  className={linkClasses}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#3365e2] rounded-full" />
                  )}
                </a>
              );
            }

            return (
              <Link
                key={item.label}
                to={targetHref}
                className={linkClasses}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#3365e2] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Right: User Status, Cart & Uniform Pill CTA Buttons ──────── */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Cart Icon Button with Expanding Circular Hover & Live Count Badge */}
          <Link
            to="/cart"
            className="group relative inline-flex items-center justify-center w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] rounded-full border border-slate-300 text-slate-700 hover:border-[#3365e2] hover:text-[#3365e2] transition-all duration-300 cursor-pointer shadow-xs overflow-hidden flex-shrink-0"
            aria-label={`View Cart with ${cartCount} items`}
          >
            <span
              aria-hidden="true"
              className="absolute rounded-full pointer-events-none transition-transform duration-500 ease-out left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-0 group-hover:scale-100 w-[300%] aspect-square bg-[#3365e2]/15"
            />
            <ShoppingCart className="w-4 h-4 sm:w-[18px] sm:h-[18px] relative z-10 transition-transform duration-300 group-hover:scale-110" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 z-20 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-[#3365e2] rounded-full shadow-sm animate-pulse">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Logged-in Controls OR Sign-in PillButton */}
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Messages shortcut — visible on >= 640px, or accessed via mobile drawer */}
              <Link
                to={messagesPath}
                className="hidden sm:inline-flex group relative items-center justify-center w-[38px] h-[38px] sm:w-[40px] sm:h-[40px] rounded-full border border-slate-300 text-slate-700 hover:border-[#3365e2] hover:text-[#3365e2] transition-all duration-300 cursor-pointer shadow-xs overflow-hidden flex-shrink-0"
                aria-label="Messages"
              >
                <span
                  aria-hidden="true"
                  className="absolute rounded-full pointer-events-none transition-transform duration-500 ease-out group-hover:scale-100 scale-0 w-[300%] aspect-square bg-[#3365e2]/10"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    transitionTimingFunction: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)',
                  }}
                />
                <MessageSquare className="w-4 h-4 sm:w-[18px] sm:h-[18px] relative z-10 transition-transform duration-300 group-hover:scale-110" />
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 z-20 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                )}
              </Link>

              {/* Portal / Dashboard Kinetic Pill */}
              <PillButton
                size="nav"
                to={panelPath}
                btnText="Dashboard"
                bgColor="#3365e2"
                textColor="#ffffff"
                hoverBgColor="#ffffff"
                hoverTextColor="#3365e2"
                dotColor="#ffffff"
                className="inline-flex border border-[#3365e2] shadow-sm"
              />

              {/* Logout Kinetic Pill */}
              <PillButton
                size="nav"
                onClick={handleLogout}
                btnText="Sign Out"
                bgColor="#ef4444"
                textColor="#ffffff"
                hoverBgColor="#ffffff"
                hoverTextColor="#ef4444"
                dotColor="#ffffff"
                className="hidden md:inline-flex border border-rose-500 shadow-sm"
              />
            </div>
          ) : (
            <PillButton
              size="nav"
              to="/login"
              btnText="Sign In"
              bgColor="#3365e2"
              textColor="#ffffff"
              hoverBgColor="#ffffff"
              hoverTextColor="#3365e2"
              dotColor="#ffffff"
              className="inline-flex border border-[#3365e2] shadow-sm"
            />
          )}

          {/* Primary Oris Pill CTA Button — responsive on screens >= 640px */}
          <PillButton
            size="nav"
            btnText={ctaText}
            onClick={handleCtaClick}
            bgColor="#3365e2"
            textColor="#ffffff"
            hoverBgColor="#ffffff"
            hoverTextColor="#3365e2"
            dotColor="#ffffff"
            className="hidden sm:inline-flex border border-[#3365e2] shadow-sm"
          />

          {/* Mobile Hamburger Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden inline-flex items-center justify-center w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] rounded-full border border-slate-300 text-slate-800 hover:bg-black/5 transition-all duration-300 cursor-pointer flex-shrink-0"
            aria-label={mobileOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* ── Mobile Navigation Drawer ─────────────────────────────────── */}
      <div
        className={`lg:hidden fixed inset-x-0 top-0 z-40 pt-20 pb-6 px-4 sm:px-6 bg-white/95 backdrop-blur-xl border-b border-black/10 shadow-2xl transition-all duration-300 ease-out select-none max-h-[100dvh] overflow-y-auto ${
          mobileOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="flex flex-col gap-2 sm:gap-3">
          {navLinks.map((item) =>
            item.isHash && location.pathname === '/' ? (
              <a
                key={item.label}
                href={item.path}
                onClick={(e) => handleHashClick(e, item.path)}
                className="px-4 py-2.5 rounded-xl text-base font-semibold text-slate-800 hover:bg-[#3365e2]/10 hover:text-[#3365e2] transition-colors no-underline"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.label}
                to={item.path.startsWith('#') ? '/' + item.path : item.path}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-2.5 rounded-xl text-base font-semibold text-slate-800 hover:bg-[#3365e2]/10 hover:text-[#3365e2] transition-colors no-underline"
              >
                {item.label}
              </Link>
            )
          )}

          <div className="border-t border-black/10 my-2 pt-3 flex flex-col gap-2.5">
            <Link
              to="/cart"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-4 py-2.5 rounded-xl text-base font-semibold text-slate-800 hover:bg-[#3365e2]/10 hover:text-[#3365e2] no-underline"
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#3365e2]" />
                <span>Cart</span>
              </div>
              {cartCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-[#3365e2] text-white rounded-full">
                  {cartCount} items
                </span>
              )}
            </Link>

            {user && (
              <Link
                to={messagesPath}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-4 py-2.5 rounded-xl text-base font-semibold text-slate-800 hover:bg-[#3365e2]/10 hover:text-[#3365e2] no-underline"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#3365e2]" />
                  <span>Messages</span>
                </div>
                {unreadMessages > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500 text-white rounded-full">
                    {unreadMessages} new
                  </span>
                )}
              </Link>
            )}

            {/* Mobile Drawer Main Action PillButtons with Exact Kinetic Roll */}
            <div className="flex flex-col gap-2.5 pt-1">
              <PillButton
                size="nav"
                btnText={ctaText}
                onClick={handleCtaClick}
                bgColor="#3365e2"
                textColor="#ffffff"
                hoverBgColor="#ffffff"
                hoverTextColor="#3365e2"
                dotColor="#ffffff"
                className="w-full justify-center border border-[#3365e2] shadow-sm"
              />

              {user ? (
                <>
                  <PillButton
                    size="nav"
                    to={panelPath}
                    onClick={() => setMobileOpen(false)}
                    btnText={`Open ${user.role === 'admin' ? 'Admin' : user.role === 'trainer' ? 'Trainer' : 'Member'} Portal`}
                    bgColor="#15324d"
                    textColor="#ffffff"
                    hoverBgColor="#ffffff"
                    hoverTextColor="#15324d"
                    dotColor="#3365e2"
                    className="w-full justify-center border border-[#15324d] shadow-sm"
                  />

                  <PillButton
                    size="nav"
                    onClick={handleLogout}
                    btnText="Sign Out"
                    bgColor="#ef4444"
                    textColor="#ffffff"
                    hoverBgColor="#ffffff"
                    hoverTextColor="#ef4444"
                    dotColor="#ffffff"
                    className="w-full justify-center border border-[#ef4444] shadow-sm"
                  />
                </>
              ) : (
                <PillButton
                  size="nav"
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  btnText="Sign In to Your Account"
                  bgColor="#15324d"
                  textColor="#ffffff"
                  hoverBgColor="#ffffff"
                  hoverTextColor="#15324d"
                  dotColor="#3365e2"
                  className="w-full justify-center border border-[#15324d] shadow-sm"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export { Navbar as OrisNavbar };
