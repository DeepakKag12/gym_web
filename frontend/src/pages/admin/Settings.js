import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Dumbbell, CalendarDays, Salad, Sparkles, ShoppingBag, Package, Tag,
  Bell, MessageSquare, IndianRupee, BarChart3, UserCheck, User, LogOut, ChevronRight, Building2, AlertTriangle,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Modal, Field, Input, Check as CheckRow } from '../../components/ui';
import API, { apiError } from '../../utils/api';
import toast from 'react-hot-toast';
import { useState } from 'react';

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


/**
 * Clearing reporting data is destructive and cannot be undone, so it asks for
 * three separate things: which data, the word DELETE, and the admin's own
 * password. Being signed in is not enough — a session left open on the gym
 * counter should never be one click away from erasing the books.
 *
 * Members, trainers and their memberships are never in scope. This clears the
 * record of money and messages, not the people.
 */
const SCOPES = [
  { key: 'payments',      label: 'Payments',      hint: 'Membership fees and renewal records' },
  { key: 'orders',        label: 'Shop orders',   hint: 'Every order and its payment status' },
  { key: 'notifications', label: 'Notifications', hint: 'The whole message history' },
  { key: 'enquiries',     label: 'Enquiries',     hint: 'Website enquiries and your replies' },
];

function ResetDataModal({ onClose }) {
  const [picked, setPicked] = useState({});
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const scopes = SCOPES.filter(s => picked[s.key]).map(s => s.key);
  const ready = scopes.length > 0 && password && confirm === 'DELETE';

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      const { data } = await API.post('/analytics/reset', { password, confirm, scopes });
      toast.success(data.message);
      onClose();
    } catch (err) {
      setError(apiError(err, 'Could not clear the data.'));
    } finally { setBusy(false); }
  };

  return (
    <Modal
      title="Clear reporting data"
      onClose={busy ? () => {} : onClose}
      width={480}
      footer={
        <>
          <Button onClick={onClose} disabled={busy}>Cancel</Button>
          <Button variant="primary" onClick={run} loading={busy} disabled={!ready}
            style={{ background: 'var(--p-danger)' }}>
            Delete permanently
          </Button>
        </>
      }
    >
      <p className="text-[14px] mb-4 p-3 rounded-lg" style={{
        background: 'var(--p-danger-soft)', border: '1px solid var(--p-danger-line)', color: 'var(--p-text)',
      }}>
        This cannot be undone. Your members, trainers and their memberships are
        <strong> not </strong> affected — only the records below.
      </p>

      <div className="space-y-2 mb-4">
        {SCOPES.map(s => (
          <CheckRow
            key={s.key}
            checked={Boolean(picked[s.key])}
            onChange={v => setPicked(p => ({ ...p, [s.key]: v }))}
            label={s.label}
            hint={s.hint}
          />
        ))}
      </div>

      <Field label="Type DELETE to confirm" required>
        <Input value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="DELETE" />
      </Field>

      <div className="mt-3">
        <Field label="Your password" required error={error}
          hint="Re-entered so an unattended session cannot do this">
          <Input type="password" value={password} autoComplete="current-password"
            onChange={e => { setPassword(e.target.value); setError(null); }} />
        </Field>
      </div>
    </Modal>
  );
}

export default function AdminSettings() {
  const { user, logout } = useAuth();
  const [resetOpen, setResetOpen] = useState(false);
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
          {user?.role === 'admin' && (
            <div className="mt-5">
              <h2 className="text-[15px] font-semibold mb-2" style={{ color: 'var(--p-danger)' }}>
                Danger zone
              </h2>
              <Card>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <p className="text-[14.5px] font-medium" style={{ color: 'var(--p-text)' }}>
                      Clear reporting data
                    </p>
                    <p className="text-[13px] mt-0.5" style={{ color: 'var(--p-text-2)' }}>
                      Wipes payments, orders, notifications or enquiries. Members are not touched.
                    </p>
                  </div>
                  <Button icon={AlertTriangle} onClick={() => setResetOpen(true)}
                    style={{ color: 'var(--p-danger)', borderColor: 'var(--p-danger-line)' }}>
                    Clear data
                  </Button>
                </div>
              </Card>
            </div>
          )}

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

      {resetOpen && <ResetDataModal onClose={() => setResetOpen(false)} />}
    </AdminLayout>
  );
}
