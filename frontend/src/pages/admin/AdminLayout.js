import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserSquare2, Tag, IndianRupee, Bell,
  BarChart3, Settings, LogOut, Menu, X, MoreHorizontal,
  ShoppingBag, Package, MessageSquare, Dumbbell, Utensils,
  Sparkles, Building2, ShieldCheck, Flame,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar, ThemeToggle, PageTransition } from '../../components/ui';

/**
 * Admin / trainer shell.
 *
 * Categorized navigation organized so the admin can manage the entire application:
 * People & Members, Billing & Store, Workouts & Diets, and System Settings.
 */
const NAV_SECTIONS = [
  {
    title: null,
    items: [
      { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'trainer'] },
    ],
  },
  {
    title: 'Members & People',
    items: [
      { path: '/admin/members',   icon: UserSquare2, label: 'Members',     roles: ['admin'] },
      { path: '/admin/users',     icon: Users,       label: 'All Users',   roles: ['admin'] },
      { path: '/admin/trainers',  icon: ShieldCheck, label: 'Trainers',    roles: ['admin'] },
      { path: '/admin/enquiries', icon: MessageSquare, label: 'Enquiries', roles: ['admin'] },
    ],
  },
  {
    title: 'Billing & Store',
    items: [
      { path: '/admin/payments',  icon: IndianRupee, label: 'Payments & Dues', roles: ['admin'] },
      { path: '/admin/orders',    icon: ShoppingBag, label: 'Store Orders',   roles: ['admin'] },
      { path: '/admin/store',     icon: Package,     label: 'Products & Stock', roles: ['admin'] },
      { path: '/admin/plans',     icon: Tag,         label: 'Membership Plans', roles: ['admin'] },
    ],
  },
  {
    title: 'Workout & Fitness',
    items: [
      { path: '/admin/splits',          icon: Flame,    label: 'Workout Splits', roles: ['admin', 'trainer'] },
      { path: '/admin/exercises',       icon: Dumbbell, label: 'Exercise Library', roles: ['admin', 'trainer'] },
      { path: '/admin/diet',            icon: Utensils, label: 'Diet Plans',     roles: ['admin', 'trainer'] },
      { path: '/admin/transformations', icon: Sparkles, label: 'Transformations', roles: ['admin', 'trainer'] },
    ],
  },
  {
    title: 'System & Reports',
    items: [
      { path: '/admin/analytics',     icon: BarChart3,   label: 'Reports & Stats', roles: ['admin'] },
      { path: '/admin/notifications', icon: Bell,        label: 'Notifications',   roles: ['admin'] },
      { path: '/admin/gym',           icon: Building2,   label: 'Gym Profile',     roles: ['admin'] },
      { path: '/admin/settings',      icon: Settings,    label: 'Settings',        roles: ['admin', 'trainer'] },
    ],
  },
];

function navSectionsFor(role) {
  return NAV_SECTIONS.map(sec => ({
    ...sec,
    items: sec.items
      .filter(it => it.roles.includes(role))
      .map(it => (role === 'trainer' && it.path === '/admin' ? { ...it, path: '/trainer' } : it)),
  })).filter(sec => sec.items.length > 0);
}


function isCurrent(pathname, linkPath) {
  if (linkPath === '/admin' || linkPath === '/trainer') return pathname === linkPath;
  return pathname.startsWith(linkPath);
}

function SideMenu({ onNavigate }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const sections = navSectionsFor(user?.role);

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--p-border)' }}>
        <Link to="/" onClick={onNavigate} className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-[15px]"
            style={{ background: 'var(--p-accent)', color: '#fff' }}>F</span>
          <span className="min-w-0">
            <span className="block text-[15px] font-bold" style={{ color: 'var(--p-text)' }}>FitNation</span>
            <span className="block text-[13px]" style={{ color: 'var(--p-muted)' }}>Gym admin</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
        {sections.map((sec, idx) => (
          <div key={idx} className="space-y-0.5">
            {sec.title && (
              <p className="px-3 pt-2 pb-1 text-[10.5px] font-bold uppercase tracking-wider"
                 style={{ color: 'var(--p-muted)' }}>
                {sec.title}
              </p>
            )}
            {sec.items.map(link => {
              const Icon = link.icon;
              const active = isCurrent(location.pathname, link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  className={`panel-link ${active ? 'panel-link-on' : ''}`}
                  style={{ fontSize: 13.5, padding: '7px 11px' }}
                >
                  <Icon size={16} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid var(--p-border)' }}>
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
          style={{ color: 'var(--p-danger)', fontSize: 14.5 }}
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
}

/**
 * @param {string} title     What this screen is for, in plain words
 * @param {string} subtitle  One supporting line, optional
 * @param {node}   actions   The screen's main button(s)
 */
export default function AdminLayout({ title, subtitle, actions, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  // Primary operational tabs for mobile / tablet bottom bar.
  // Puts Dashboard, Members, Payments, and Notifications directly at the admin's fingertips.
  const tabs = React.useMemo(() => {
    if (user?.role === 'trainer') {
      return [
        { path: '/trainer', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/splits', icon: Flame, label: 'Workouts' },
        { path: '/admin/diet', icon: Utensils, label: 'Diets' },
        { path: '/admin/exercises', icon: Dumbbell, label: 'Exercises' },
      ];
    }
    return [
      { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/admin/members', icon: UserSquare2, label: 'Members' },
      { path: '/admin/payments', icon: IndianRupee, label: 'Payments' },
      { path: '/admin/notifications', icon: Bell, label: 'Alerts' },
    ];
  }, [user?.role]);

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
        <div className="fixed inset-0 z-40 lg:hidden" style={{ background: 'var(--p-overlay)' }}
          onClick={() => setMenuOpen(false)} />
      )}
      <aside className={`fixed top-0 left-0 h-full w-72 z-50 flex flex-col panel-side transition-transform duration-200 lg:hidden ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <button onClick={() => setMenuOpen(false)} aria-label="Close menu"
          className="absolute top-3.5 right-3 p-2 rounded-lg z-10" style={{ color: 'var(--p-muted)' }}>
          <X size={18} />
        </button>
        <SideMenu onNavigate={() => setMenuOpen(false)} />
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden sticky top-0 z-30 flex items-center gap-2 px-3 py-2.5 panel-top">
          <button onClick={() => setMenuOpen(true)} aria-label="Open menu"
            className="p-2 rounded-lg" style={{ color: 'var(--p-text-2)' }}>
            <Menu size={22} />
          </button>
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

          <PageTransition key={location.pathname}>{children}</PageTransition>
        </main>
      </div>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 flex panel-bar"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const active = isCurrent(location.pathname, tab.path);
          return (
            <Link key={tab.path} to={tab.path} aria-current={active ? 'page' : undefined}
              className={`panel-tab ${active ? 'panel-tab-on' : ''}`} style={{ fontSize: 11 }}>
              <Icon size={21} strokeWidth={active ? 2.4 : 1.8} />
              {tab.label}
            </Link>
          );
        })}
        <button onClick={() => setMenuOpen(true)} className="panel-tab" style={{ fontSize: 11 }}>
          <MoreHorizontal size={21} strokeWidth={1.8} />
          More
        </button>
      </nav>
    </div>
  );
}
