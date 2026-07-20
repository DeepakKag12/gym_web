import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Salad, TrendingUp, Bell, Dumbbell } from 'lucide-react';
import API from '../utils/api';

// 5 primary tabs a member needs most on mobile
const MEMBER_NAV = [
  { path: '/dashboard',     icon: LayoutDashboard, label: 'Home' },
  { path: '/my-workout',    icon: Dumbbell,        label: 'Workout' },
  { path: '/my-diet',       icon: Salad,           label: 'Diet' },
  { path: '/my-progress',   icon: TrendingUp,      label: 'Progress' },
  { path: '/notifications', icon: Bell,            label: 'Alerts' },
];

export default function MemberBottomNav() {
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    API.get('/notifications')
      .then(r => setUnread(r.data.filter(n => !n.isRead).length))
      .catch(() => {});
  }, [location.pathname]);

  // Only show on member-relevant pages
  const memberPaths = MEMBER_NAV.map(n => n.path);
  const alsoShow = ['/my-orders', '/my-exercises', '/store', '/cart'];
  const visible = [...memberPaths, ...alsoShow].some(p => location.pathname.startsWith(p));
  if (!visible) return null;

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d0d14]/95 backdrop-blur-md border-t border-white/10"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch">
        {MEMBER_NAV.map(link => {
          const Icon = link.icon;
          const active = location.pathname === link.path;
          const isNotif = link.path === '/notifications';
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 relative transition-all ${
                active ? 'text-[#22d3ee]' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <div className="relative">
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                {isNotif && unread > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-[14px] h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium leading-tight">{link.label}</span>
              {active && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#22d3ee] rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
