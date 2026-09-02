import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Dumbbell, Salad, TrendingUp, ShoppingBag, Package, Calendar, Settings,
  Bell, AlertTriangle, ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cachedGet } from '../../utils/api';
import MemberPage from '../../components/MemberPage';
import { Card, Badge, Button, EmptyState, Skeleton, STATUS_TONE, timeAgo } from '../../components/ui';

const DAY = 86400000;

/** The six places a member actually goes. Icons only for recognition, no colour party. */
const ACTIONS = [
  { to: '/my-workout',   icon: Dumbbell,   label: 'My workout',  hint: 'Split & planner' },
  { to: '/my-diet',      icon: Salad,      label: 'My diet',     hint: 'Assigned plans' },
  { to: '/my-progress',  icon: TrendingUp, label: 'Progress',    hint: 'Log your numbers' },
  { to: '/my-exercises', icon: Calendar,   label: 'Exercises',   hint: 'Assigned to me' },
  { to: '/store',        icon: ShoppingBag,label: 'Store',       hint: 'Supplements' },
  { to: '/my-orders',    icon: Package,    label: 'My orders',   hint: 'Order history' },
];

export default function MemberDashboard() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cachedGet('/notifications', { cache: 30 })
      .then(r => setNotifications(r.data.slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const daysLeft = user?.membershipEnd
    ? Math.ceil((new Date(user.membershipEnd) - new Date()) / DAY)
    : null;

  const progress = (() => {
    if (!user?.membershipStart || !user?.membershipEnd) return null;
    const total = new Date(user.membershipEnd) - new Date(user.membershipStart);
    const done = new Date() - new Date(user.membershipStart);
    if (total <= 0) return null;
    return Math.min(100, Math.max(0, (done / total) * 100));
  })();

  const expiringSoon = daysLeft !== null && daysLeft <= 7;

  return (
    <MemberPage
      title={`Hi ${user?.name?.split(' ')[0] || 'there'}`}
      subtitle="Here is where your membership stands"
      actions={<Button icon={Settings} size="sm" to="/settings">Profile</Button>}
    >
      {/* Membership */}
      <Card className="mb-4">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
          <div>
            <p className="ui-section-label">Membership</p>
            <p className="text-[18px] font-semibold capitalize mt-0.5" style={{ color: 'var(--p-text)' }}>
              {user?.membershipPlan || 'No plan'}
            </p>
          </div>
          <Badge tone={STATUS_TONE[user?.membershipStatus] || 'neutral'}>{user?.membershipStatus || 'pending'}</Badge>
        </div>

        {daysLeft !== null && (
          <>
            <div className="flex justify-between text-[13px] mb-1.5">
              <span style={{ color: 'var(--p-text-2)' }}>
                {daysLeft > 0 ? `${daysLeft} day${daysLeft === 1 ? '' : 's'} remaining` : 'Expired'}
              </span>
              <span style={{ color: 'var(--p-muted)' }}>
                until {new Date(user.membershipEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            {progress !== null && (
              <div style={{ height: 6, background: 'var(--p-surface-2)', borderRadius: 99, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${progress}%`, height: '100%', borderRadius: 99,
                    background: daysLeft <= 3 ? 'var(--p-danger)' : daysLeft <= 7 ? 'var(--p-warn)' : 'var(--p-accent)',
                  }}
                />
              </div>
            )}
          </>
        )}

        {expiringSoon && (
          <div
            className="flex items-start gap-2 mt-4 p-3 rounded-lg"
            style={{
              background: daysLeft > 0 ? 'var(--p-warn-soft)' : 'var(--p-danger-soft)',
              border: `1px solid ${daysLeft > 0 ? 'var(--p-warn-line)' : 'var(--p-danger-line)'}`,
            }}
          >
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" style={{ color: daysLeft > 0 ? 'var(--p-warn)' : 'var(--p-danger)' }} />
            <p className="text-[13px]" style={{ color: 'var(--p-text-2)' }}>
              {daysLeft > 0
                ? `Your membership ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}. Talk to the front desk to renew.`
                : 'Your membership has expired. Renew at the gym to keep training.'}
            </p>
          </div>
        )}
      </Card>

      {/* Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {ACTIONS.map(a => {
          const Icon = a.icon;
          return (
            <Link key={a.to} to={a.to} className="ui-card ui-card-link ui-card-pad">
              <Icon size={20} style={{ color: 'var(--p-accent)' }} />
              <p className="text-[14px] font-semibold mt-2.5" style={{ color: 'var(--p-text)' }}>{a.label}</p>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--p-muted)' }}>{a.hint}</p>
            </Link>
          );
        })}
      </div>

      {/* Latest notifications */}
      <Card
        title="Latest updates"
        padded={false}
        action={
          <Link to="/notifications" className="text-[13px] font-medium inline-flex items-center gap-1" style={{ color: 'var(--p-accent)' }}>
            See all <ArrowRight size={13} />
          </Link>
        }
      >
        <div className="px-5 py-2">
          {loading ? (
            <div className="py-3 space-y-3">{Array.from({ length: 2 }, (_, i) => <Skeleton key={i} h={40} />)}</div>
          ) : notifications.length === 0 ? (
            <EmptyState icon={Bell} title="Nothing new" hint="Messages from your gym will show up here." />
          ) : (
            <ul>
              {notifications.map((n, i) => (
                <li key={n._id} className="py-3" style={{ borderTop: i ? '1px solid var(--p-border)' : 'none' }}>
                  <div className="flex items-start gap-2">
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--p-accent)' }} />
                    )}
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium" style={{ color: 'var(--p-text)' }}>{n.title}</p>
                      <p className="text-[13px] mt-0.5 line-clamp-2" style={{ color: 'var(--p-text-2)' }}>{n.message}</p>
                      <p className="text-[12px] mt-1" style={{ color: 'var(--p-muted)' }}>{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </MemberPage>
  );
}
