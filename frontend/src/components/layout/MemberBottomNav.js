import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Salad, TrendingUp, Bell, Dumbbell } from 'lucide-react';
import { cachedGet } from '../../utils/api';

// The five tabs a member needs on a phone.
const TABS = [
  { path: '/dashboard',     icon: LayoutDashboard, label: 'Home' },
  { path: '/my-workout',    icon: Dumbbell,        label: 'Workout' },
  { path: '/my-diet',       icon: Salad,           label: 'Diet' },
  { path: '/my-progress',   icon: TrendingUp,      label: 'Progress' },
  { path: '/notifications', icon: Bell,            label: 'Alerts' },
];

// Pages that keep the bar visible even though they are not tabs themselves.
const ALSO_SHOW = ['/my-orders', '/my-exercises', '/store', '/cart', '/settings', '/my-messages'];

export default function MemberBottomNav() {
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    cachedGet('/notifications', { cache: 30 })
      .then(r => setUnread(r.data.filter(n => !n.isRead).length))
      .catch(() => {});
  }, [location.pathname]);

  const visible = [...TABS.map(t => t.path), ...ALSO_SHOW].some(p => location.pathname.startsWith(p));
  if (!visible) return null;

  return (
    <nav
      aria-label="Member navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex panel-bar"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {TABS.map(tab => {
        const Icon = tab.icon;
        const active = location.pathname === tab.path;
        const hasUnread = tab.path === '/notifications' && unread > 0;

        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={`flex-1 flex flex-col items-center justify-center py-2 text-[11px] font-medium transition-all relative no-underline ${
              active
                ? 'text-[#3365e2] font-bold'
                : 'text-slate-400 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
              {hasUnread && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </div>
            <span className="mt-1 leading-none">{tab.label}</span>
            {active && (
              <span className="absolute bottom-0.5 w-5 h-0.5 bg-[#3365e2] rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
