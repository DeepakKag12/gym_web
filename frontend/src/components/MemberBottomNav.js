import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Salad, TrendingUp, Bell, Dumbbell } from 'lucide-react';
import { cachedGet } from '../utils/api';

// The five tabs a member needs on a phone.
const TABS = [
  { path: '/dashboard',     icon: LayoutDashboard, label: 'Home' },
  { path: '/my-workout',    icon: Dumbbell,        label: 'Workout' },
  { path: '/my-diet',       icon: Salad,           label: 'Diet' },
  { path: '/my-progress',   icon: TrendingUp,      label: 'Progress' },
  { path: '/notifications', icon: Bell,            label: 'Alerts' },
];

// Pages that keep the bar visible even though they are not tabs themselves.
const ALSO_SHOW = ['/my-orders', '/my-exercises', '/store', '/cart', '/settings'];

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
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex panel-bar"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {TABS.map(tab => {
        const Icon = tab.icon;
        const active = location.pathname === tab.path;
        return (
          <Link
            key={tab.path}
            to={tab.path}
            aria-current={active ? 'page' : undefined}
            className={`panel-tab ${active ? 'panel-tab-on' : ''}`}
          >
            <span className="relative">
              <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
              {tab.path === '/notifications' && unread > 0 && (
                <span className="panel-dot">{unread > 9 ? '9+' : unread}</span>
              )}
            </span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
