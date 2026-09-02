import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Dumbbell, CalendarDays, Salad, Sparkles, ShoppingBag, Package, Tag,
  Bell, MessageSquare, IndianRupee, BarChart3, UserCheck, User, LogOut, ChevronRight, Building2,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { Card, Button } from '../../components/ui';

/**
 * Everything that is not a daily job lives here.
 *
 * These pages used to sit in the sidebar, fifteen items deep. Each one is now
 * described by what it lets you DO, not by what it is called internally — the
 * admin should not have to guess what "Splits" or "Transformations" means.
 */
const GROUPS = [
  {
    title: 'Workouts and food',
    roles: ['admin', 'trainer'],
    items: [
      { to: '/admin/exercises',       icon: Dumbbell,     label: 'Exercises',      hint: 'Add exercises with photos and videos' },
      { to: '/admin/splits',          icon: CalendarDays, label: 'Workout plans',  hint: 'Build weekly routines for members' },
      { to: '/admin/diet',            icon: Salad,        label: 'Diet plans',     hint: 'Create meal plans and give them to members' },
      { to: '/admin/transformations', icon: Sparkles,     label: 'Success stories', hint: 'Before and after photos shown on your website' },
    ],
  },
  {
    title: 'Shop',
    roles: ['admin'],
    items: [
      { to: '/admin/store',  icon: ShoppingBag, label: 'Products',        hint: 'Supplements and gear you sell' },
      { to: '/admin/orders', icon: Package,     label: 'Orders',          hint: 'What members have bought' },
      { to: '/admin/plans',  icon: Tag,         label: 'Membership prices', hint: 'What each membership costs' },
    ],
  },
  {
    title: 'Messages',
    roles: ['admin'],
    items: [
      { to: '/admin/notifications', icon: Bell,          label: 'Sent messages', hint: 'Everything sent to members, and what reached them' },
      { to: '/admin/enquiries',     icon: MessageSquare, label: 'Enquiries',     hint: 'People asking about joining your gym' },
    ],
  },
  {
    title: 'Money and staff',
    roles: ['admin'],
    items: [
      { to: '/admin/revenue',   icon: IndianRupee, label: 'Earnings',  hint: 'What your gym has earned' },
      { to: '/admin/analytics', icon: BarChart3,   label: 'Reports',   hint: 'Member numbers over time' },
      { to: '/admin/trainers',  icon: UserCheck,   label: 'Trainers',  hint: 'Add trainers and see who they train' },
    ],
  },
];

function ToolRow({ item, last }) {
  const Icon = item.icon;
  return (
    <li style={{ borderTop: last ? 'none' : '1px solid var(--p-border)' }}>
      <Link to={item.to} className="flex items-center gap-3 px-4 py-3.5" style={{ minHeight: 64 }}>
        <span className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--p-surface-2)', color: 'var(--p-accent)' }}>
          <Icon size={19} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-[15px] font-medium" style={{ color: 'var(--p-text)' }}>{item.label}</span>
          <span className="block text-[13px]" style={{ color: 'var(--p-text-2)' }}>{item.hint}</span>
        </span>
        <ChevronRight size={18} style={{ color: 'var(--p-muted)' }} />
      </Link>
    </li>
  );
}

export default function AdminSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const groups = GROUPS
    .filter(g => g.roles.includes(user?.role))
    .map(g => ({ ...g, items: g.items }));

  return (
    <AdminLayout title="Settings" subtitle="Everything else you can manage">
      <div className="space-y-5 max-w-2xl">
        {groups.map(group => (
          <div key={group.title}>
            <h2 className="text-[15px] font-semibold mb-2" style={{ color: 'var(--p-text)' }}>{group.title}</h2>
            <Card padded={false}>
              <ul>
                {group.items.map((item, i) => <ToolRow key={item.to} item={item} last={i === 0} />)}
              </ul>
            </Card>
          </div>
        ))}

        <div>
          <h2 className="text-[15px] font-semibold mb-2" style={{ color: 'var(--p-text)' }}>Your gym</h2>
          <Card padded={false}>
            <ul>
              <ToolRow last item={{
                to: '/admin/gym', icon: Building2, label: 'Gym details',
                hint: 'Phone, WhatsApp, Instagram and hours shown across the website',
              }} />
            </ul>
          </Card>
        </div>

        <div>
          <h2 className="text-[15px] font-semibold mb-2" style={{ color: 'var(--p-text)' }}>Your account</h2>
          <Card padded={false}>
            <ul>
              <ToolRow last item={{ to: '/settings', icon: User, label: 'My profile', hint: 'Change your name, photo or password' }} />
            </ul>
          </Card>
          <Button
            block
            className="mt-3"
            icon={LogOut}
            onClick={() => { logout(); navigate('/'); }}
            style={{ color: 'var(--p-danger)' }}
          >
            Log out
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
