import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Dumbbell, Salad, ShoppingBag, TrendingUp,
  MessageSquare, Package, UserCheck, LogOut, ChevronRight,
  BarChart2, Tag, Calendar, Menu, Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function FitnationLogoSm({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="44" stroke="url(#aring)" strokeWidth="5" fill="none" />
      <rect x="4"  y="46" width="18" height="8" rx="3" fill="url(#abarb)" />
      <rect x="2"  y="42" width="6"  height="16" rx="2" fill="#90caf9" />
      <rect x="78" y="46" width="18" height="8" rx="3" fill="url(#abarb)" />
      <rect x="92" y="42" width="6"  height="16" rx="2" fill="#90caf9" />
      <polygon points="50,18 28,75 72,75" fill="url(#atri)" />
      <polygon points="50,40 40,65 60,65" fill="#0d0d14" />
      <defs>
        <linearGradient id="atri" x1="28" y1="18" x2="72" y2="75" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" /><stop offset="100%" stopColor="#1565c0" />
        </linearGradient>
        <linearGradient id="aring" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#90caf9" /><stop offset="100%" stopColor="#455a64" />
        </linearGradient>
        <linearGradient id="abarb" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#90caf9" /><stop offset="100%" stopColor="#607d8b" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const adminLinks = [
  { path: '/admin',                  icon: LayoutDashboard, label: 'Dashboard',       roles: ['admin'] },
  { path: '/admin/members',          icon: Users,           label: 'Members',         roles: ['admin'] },
  { path: '/admin/trainers',         icon: UserCheck,       label: 'Trainers',        roles: ['admin'] },
  { path: '/admin/exercises',        icon: Dumbbell,        label: 'Exercises',       roles: ['admin','trainer'] },
  { path: '/admin/splits',           icon: Calendar,        label: 'Workout Splits',  roles: ['admin','trainer'] },
  { path: '/admin/diet',             icon: Salad,           label: 'Diet Plans',      roles: ['admin','trainer'] },
  { path: '/admin/store',            icon: ShoppingBag,     label: 'Store',           roles: ['admin'] },
  { path: '/admin/orders',           icon: Package,         label: 'Orders',          roles: ['admin'] },
  { path: '/admin/plans',            icon: Tag,             label: 'Plans',           roles: ['admin'] },
  { path: '/admin/transformations',  icon: TrendingUp,      label: 'Transformations', roles: ['admin','trainer'] },
  { path: '/admin/enquiries',        icon: MessageSquare,   label: 'Enquiries',       roles: ['admin'] },
  { path: '/admin/analytics',        icon: BarChart2,       label: 'Analytics',       roles: ['admin'] },
  { path: '/admin/notifications',    icon: Bell,            label: 'Notifications',   roles: ['admin'] },
];

function SidebarContent({ onLinkClick }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const filteredLinks = adminLinks.filter(l => l.roles.includes(user?.role));

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-white/10">
        <Link to="/" onClick={onLinkClick} className="flex items-center gap-2">
          <FitnationLogoSm size={30} />
          <div>
            <div className="text-white font-black gym-font text-sm">FITNATION</div>
            <div className="text-sky-400 text-xs capitalize">{user?.role} Panel</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto space-y-1">
        {filteredLinks.map(link => {
          const Icon = link.icon;
          const active = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={onLinkClick}
              className={`sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active ? 'active' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={17} />
              {link.label}
              {active && <ChevronRight size={14} className="ml-auto opacity-60" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-white text-sm font-semibold truncate">{user?.name}</div>
            <div className="text-gray-500 text-xs capitalize">{user?.role}</div>
          </div>
        </div>
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="w-full flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex relative">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 bg-[#0d0d14] border-r border-white/10 flex-col sticky top-0 h-screen">
        <SidebarContent onLinkClick={() => {}} />
      </aside>

      {/* Mobile Sidebar Drawer */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#0d0d14] border-r border-white/10 flex flex-col z-50 transform transition-transform duration-300 lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent onLinkClick={() => setSidebarOpen(false)} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto min-w-0">
        {/* Mobile Top Bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-[#0d0d14] border-b border-white/10 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all"
          >
            <Menu size={22} />
          </button>
          <span className="text-white font-semibold text-sm">{title || 'Admin Panel'}</span>
        </div>

        <div className="p-4 lg:p-8">
          {title && <h1 className="hidden lg:block text-white font-bold text-2xl mb-6">{title}</h1>}
          {children}
        </div>
      </main>
    </div>
  );
}
