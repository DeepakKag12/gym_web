import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, UserSquare2, CheckCircle2, XCircle, CalendarClock, UserPlus,
  AlertTriangle, RefreshCw, ArrowRight, Ban, Activity,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import {
  Card, Button, EmptyState, Skeleton, StatCard, Stagger, FadeIn, Badge, Avatar, timeAgo,
} from '../../components/ui';
import { apiError } from '../../utils/api';
import { loadUsers, statusOf, isMembershipExpired, daysUntil, fmtDate } from './userService';

/**
 * The gym at a glance.
 *
 * Six numbers and three short lists — no charts. Everything is derived from
 * the same user list the Users and Members screens load, so a count here can
 * never disagree with the list it links to. A dashboard reading 24 next to a
 * page showing 23 is worse than no dashboard.
 */

function ActivityRow({ icon: Icon, tone, who, what, when, first }) {
  const color = { ok: 'var(--p-ok)', warn: 'var(--p-warn)', danger: 'var(--p-danger)', info: 'var(--p-info)' }[tone];
  const soft = { ok: 'var(--p-ok-soft)', warn: 'var(--p-warn-soft)', danger: 'var(--p-danger-soft)', info: 'var(--p-info-soft)' }[tone];
  return (
    <li className="flex items-center gap-3 px-4 py-3" style={{ borderTop: first ? 'none' : '1px solid var(--p-border)' }}>
      <span className="ui-stat-icon" style={{ background: soft, color, width: 32, height: 32 }}>
        <Icon size={15} />
      </span>
      <span className="flex-1 min-w-0 text-[14px]" style={{ color: 'var(--p-text-2)' }}>
        <strong style={{ color: 'var(--p-text)', fontWeight: 600 }}>{who}</strong> {what}
      </span>
      <span className="text-[12px] flex-shrink-0" style={{ color: 'var(--p-muted)' }}>{when}</span>
    </li>
  );
}

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback((force = false) => {
    setLoading(true);
    setError(null);
    loadUsers({ force })
      .then(setUsers)
      .catch(err => setError(apiError(err, 'Could not load your gym data.')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => {
    const members = users.filter(u => u.role === 'member');
    const active = members.filter(u => ['active', 'month', 'week', 'today'].includes(statusOf(u).key));
    // Counts lapsed memberships whether or not the account is also disabled —
    // both still need renewing.
    const expired = members.filter(isMembershipExpired);
    const upcoming = members.filter(u => {
      const d = daysUntil(u.membershipEnd);
      return d !== null && d >= 0 && d <= 7;
    });
    const monthAgo = Date.now() - 30 * 86400000;
    return {
      totalUsers: users.length,
      totalMembers: members.length,
      active: active.length,
      expired: expired.length,
      upcoming,
      newThisMonth: users.filter(u => u.createdAt && new Date(u.createdAt).getTime() >= monthAgo).length,
    };
  }, [users]);

  /** Newest accounts — "who just joined", the thing an admin checks daily. */
  const recentRegistrations = useMemo(
    () => [...users]
      .filter(u => u.createdAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5),
    [users],
  );

  /**
   * Activity is derived from the records themselves. The API has no audit log,
   * and rather than invent a feed this reports what is genuinely true of the
   * data: who joined, whose access is off, whose membership is ending.
   */
  const activity = useMemo(() => {
    const events = [];
    users.forEach(u => {
      if (u.createdAt) {
        events.push({
          id: `new-${u._id}`, sort: new Date(u.createdAt).getTime(),
          icon: UserPlus, tone: 'ok', who: u.name, what: `joined as a ${u.role}`,
          when: timeAgo(u.createdAt),
        });
      }
      if (u.isActive === false) {
        events.push({
          id: `off-${u._id}`, sort: new Date(u.updatedAt || u.createdAt || Date.now()).getTime(),
          icon: Ban, tone: 'danger', who: u.name, what: 'is disabled and cannot sign in', when: '—',
        });
      }
      const left = daysUntil(u.membershipEnd);
      if (u.role === 'member' && left !== null && left >= 0 && left <= 7) {
        events.push({
          id: `end-${u._id}`, sort: Date.now() - (7 - left) * 3600000,
          icon: CalendarClock, tone: 'warn', who: u.name,
          what: left === 0 ? 'membership ends today' : `membership ends in ${left} day${left > 1 ? 's' : ''}`,
          when: left === 0 ? 'Today' : `In ${left}d`,
        });
      }
    });
    return events.sort((a, b) => b.sort - a.sort).slice(0, 7);
  }, [users]);

  if (error) {
    return (
      <AdminLayout title="Dashboard">
        <Card>
          <EmptyState icon={AlertTriangle} title="Could not load the dashboard" hint={error}>
            <Button variant="primary" icon={RefreshCw} onClick={() => load(true)}>Try again</Button>
          </EmptyState>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="How your gym is doing right now"
      actions={<Button variant="primary" icon={UserPlus} to="/admin/users?add=1">Add user</Button>}
    >
      <div className="space-y-4 max-w-5xl">
        <Stagger className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <StatCard label="Total users"    value={stats.totalUsers}      hint="Every account"      icon={Users}         tone="accent" loading={loading} />
          <StatCard label="Total members"  value={stats.totalMembers}    hint="Gym members only"   icon={UserSquare2}   tone="info"   loading={loading} />
          <StatCard label="Active"         value={stats.active}          hint="Membership running" icon={CheckCircle2}  tone="ok"     loading={loading} />
          <StatCard label="Expired"        value={stats.expired}         hint="Needs renewing"     icon={XCircle}       tone="danger" loading={loading} />
          <StatCard label="Expiring soon"  value={stats.upcoming.length} hint="Within 7 days"      icon={CalendarClock} tone="warn"   loading={loading} />
          <StatCard label="New this month" value={stats.newThisMonth}    hint="Joined in 30 days"  icon={UserPlus}      tone="accent" loading={loading} />
        </Stagger>

        {/* Anything ending this week is the one thing worth acting on today */}
        {!loading && stats.upcoming.length > 0 && (
          <FadeIn delay={0.05}>
            <Card
              title={`${stats.upcoming.length} membership${stats.upcoming.length > 1 ? 's' : ''} ending within 7 days`}
              padded={false}
              action={<Button size="sm" to="/admin/members?filter=week">See all <ArrowRight size={14} /></Button>}
            >
              <ul>
                {stats.upcoming.slice(0, 4).map((u, i) => {
                  const left = daysUntil(u.membershipEnd);
                  return (
                    <li key={u._id} className="flex items-center gap-3 px-4 py-3"
                      style={{ borderTop: i ? '1px solid var(--p-border)' : 'none' }}>
                      <Avatar name={u.name} size={32} />
                      <span className="flex-1 min-w-0">
                        <span className="block text-[14px] font-semibold truncate" style={{ color: 'var(--p-text)' }}>{u.name}</span>
                        <span className="block text-[12px]" style={{ color: 'var(--p-muted)' }}>Ends {fmtDate(u.membershipEnd)}</span>
                      </span>
                      <Badge tone={left <= 1 ? 'danger' : 'warn'}>{left === 0 ? 'Today' : `${left}d left`}</Badge>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </FadeIn>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <FadeIn delay={0.1}>
            <Card title="Recent registrations" padded={false}
              action={<Button size="sm" to="/admin/users">All users <ArrowRight size={14} /></Button>}>
              {loading ? (
                <div className="p-4 space-y-3">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} h={40} />)}</div>
              ) : recentRegistrations.length === 0 ? (
                <EmptyState icon={UserPlus} title="Nobody yet" hint="Users you add will appear here.">
                  <Button variant="primary" icon={UserPlus} to="/admin/users?add=1">Add user</Button>
                </EmptyState>
              ) : (
                <ul>
                  {recentRegistrations.map((u, i) => (
                    <li key={u._id} className="flex items-center gap-3 px-4 py-3"
                      style={{ borderTop: i ? '1px solid var(--p-border)' : 'none' }}>
                      <Avatar name={u.name} size={32} />
                      <span className="flex-1 min-w-0">
                        <span className="block text-[14px] font-semibold truncate" style={{ color: 'var(--p-text)' }}>{u.name}</span>
                        <span className="block text-[12px] truncate" style={{ color: 'var(--p-muted)' }}>{u.email}</span>
                      </span>
                      <span className="text-[12px] flex-shrink-0" style={{ color: 'var(--p-muted)' }}>{timeAgo(u.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </FadeIn>

          <FadeIn delay={0.15}>
            <Card title="Recent activity" padded={false}>
              {loading ? (
                <div className="p-4 space-y-3">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} h={40} />)}</div>
              ) : activity.length === 0 ? (
                <EmptyState icon={Activity} title="Nothing has happened yet"
                  hint="Joins, disabled accounts and upcoming expiries show up here." />
              ) : (
                <ul>{activity.map((e, i) => <ActivityRow key={e.id} {...e} first={i === 0} />)}</ul>
              )}
            </Card>
          </FadeIn>
        </div>

        <p className="text-[12px] text-center pt-1" style={{ color: 'var(--p-muted)' }}>
          Counts cover members and trainers.{' '}
          <Link to="/admin/users" style={{ color: 'var(--p-accent)' }}>Admin accounts</Link>{' '}
          are not returned by the API and are not included.
        </p>
      </div>
    </AdminLayout>
  );
}
