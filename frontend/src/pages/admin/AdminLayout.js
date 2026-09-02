import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Settings, LogOut, Menu, X, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar, ThemeToggle, PageTransition } from '../../components/ui';

/**
 * Admin / trainer shell.
 *
 * The menu is deliberately three items long. It used to list fifteen, which
 * meant reading the whole list to find anything. Everything else still exists
 * and is reachable from Settings → the tools page; only the daily path is in
 * front of you.
 *
 * The theme toggle sits in the top-right of every screen and is the panel's
 * only appearance control — there is no theme section in Settings, no density
 * or layout options, and nothing to configure before the panel is usable.
 */
function navFor(role) {
  // Trainers cannot open /admin (it is admin-only and would bounce them), so
  // their Home is the trainer dashboard.
  const home = role === 'trainer' ? '/trainer' : '/admin';
  return [
    { path: home,              icon: Home,     label: 'Home',     roles: ['admin', 'trainer'] },
    { path: '/admin/members',  icon: Users,    label: 'Users',    roles: ['admin'] },
    { path: '/admin/settings', icon: Settings, label: 'Settings', roles: ['admin', 'trainer'] },
  ].filter(l => l.roles.includes(role));
}

function isCurrent(pathname, linkPath) {
  if (linkPath === '/admin' || linkPath === '/trainer') return pathname === linkPath;
  return pathname.startsWith(linkPath);
}

function SideMenu({ onNavigate }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const links = navFor(user?.role);

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--p-border)' }}>
        <Link to="/" onClick={onNavigate} className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-[15px]"
            style={{ background: 'var(--p-accent)', color: '#fff' }}>F</span>
          <span className="min-w-0">
            <span className="block text-[15px] font-bold" style={{ color: 'var(--p-text)' }}>FitNation</span>
            <span className="block text-[13px]" style={{ color: 'var(--p-muted)' }}>Gym admin</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(link => {
          const Icon = link.icon;
          const active = isCurrent(location.pathname, link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={`panel-link ${active ? 'panel-link-on' : ''}`}
              style={{ fontSize: 15, padding: '11px 12px' }}
            >
              <Icon size={19} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3" style={{ borderTop: '1px solid var(--p-border)' }}>
        <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
          <Avatar name={user?.name} size={34} />
          <span className="min-w-0">
            <span className="block text-[14px] font-semibold truncate" style={{ color: 'var(--p-text)' }}>{user?.name}</span>
            <span className="block text-[12px] truncate" style={{ color: 'var(--p-muted)' }}>{user?.email}</span>
          </span>
        </div>
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="panel-link w-full"
          style={{ color: 'var(--p-danger)', fontSize: 15 }}
        >
          <LogOut size={19} /> Log out
        </button>
      </div>
    </div>
  );
}

/**
 * @param {string} title     What this screen is for, in plain words
 * @param {string} subtitle  One supporting line, optional
 * @param {node}   actions   The screen's main button(s)
 * @param {string} backTo    Shows a Back link instead of the menu button
 */
export default function AdminLayout({ title, subtitle, actions, backTo, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const tabs = navFor(user?.role);

  // Anything that is not one of the three destinations was reached from
  // Settings, so on mobile it gets a Back arrow instead of the menu button.
  const back = backTo ?? (tabs.some(t => isCurrent(location.pathname, t.path)) ? null : '/admin/settings');

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--p-bg)' }}>
      <aside className="hidden lg:flex w-56 flex-shrink-0 flex-col sticky top-0 h-screen panel-side">
        <SideMenu onNavigate={() => {}} />
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" style={{ background: 'var(--p-overlay)' }} onClick={() => setMenuOpen(false)} />
      )}
      <aside className={`fixed top-0 left-0 h-full w-72 z-50 flex flex-col panel-side transition-transform duration-200 lg:hidden ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <button onClick={() => setMenuOpen(false)} aria-label="Close menu"
          className="absolute top-3.5 right-3 p-2 rounded-lg" style={{ color: 'var(--p-muted)' }}>
          <X size={18} />
        </button>
        <SideMenu onNavigate={() => setMenuOpen(false)} />
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile bar — the toggle keeps the same top-right position it has on desktop */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center gap-2 px-3 py-2.5 panel-top">
          {back ? (
            <Link to={back} aria-label="Go back" className="p-2 rounded-lg" style={{ color: 'var(--p-text-2)' }}><ChevronLeft size={22} /></Link>
          ) : (
            <button onClick={() => setMenuOpen(true)} aria-label="Open menu" className="p-2 rounded-lg" style={{ color: 'var(--p-text-2)' }}><Menu size={22} /></button>
          )}
          <span className="text-[16px] font-semibold truncate flex-1" style={{ color: 'var(--p-text)' }}>{title}</span>
          <ThemeToggle />
        </header>

        <main className="flex-1 px-4 py-5 lg:px-8 lg:py-7 pb-24 lg:pb-8">
          <div className="hidden lg:flex flex-wrap items-start justify-between gap-3 mb-6">
            <div className="min-w-0">
              <h1 className="ui-page-title" style={{ fontSize: 26 }}>{title}</h1>
              {subtitle && <p className="ui-page-sub" style={{ fontSize: 15 }}>{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {actions}
              <ThemeToggle />
            </div>
          </div>
          {subtitle && <p className="lg:hidden ui-page-sub mb-4" style={{ fontSize: 15 }}>{subtitle}</p>}
          {actions && <div className="lg:hidden flex items-center gap-2 flex-wrap mb-4">{actions}</div>}

          {/* Keyed on the path so each screen animates in on arrival */}
          <PageTransition key={location.pathname}>{children}</PageTransition>
        </main>
      </div>

      {/* Mobile: the same three destinations, always reachable with one thumb */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 flex panel-bar" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const active = isCurrent(location.pathname, tab.path);
          return (
            <Link key={tab.path} to={tab.path} aria-current={active ? 'page' : undefined}
              className={`panel-tab ${active ? 'panel-tab-on' : ''}`} style={{ fontSize: 11 }}>
              <Icon size={22} strokeWidth={active ? 2.4 : 1.8} />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
