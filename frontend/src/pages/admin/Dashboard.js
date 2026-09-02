import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  UserPlus, Users, UserCheck, Sparkles, AlertTriangle, RefreshCw,
  ArrowRight, Ban, CalendarClock, FlaskConical, Activity,
} from 'lucide-react';
import { cachedGet, freshGet } from '../../utils/api';
import { DEMO_ENABLED, DEMO_USERS } from '../../utils/demoData';
import AdminLayout from './AdminLayout';
import {
  Card, Button, EmptyState, Skeleton, StatCard, Stagger, FadeIn, timeAgo,
} from '../../components/ui';

/**
 * The home screen answers one question: what is happening with my users?
 *
 * Three numbers and a list of what changed recently. No charts, no revenue
 * breakdown, no tiles that link to a report nobody opens — those pages still
 * exist and are one tap away under Settings.
 *
 * Everything is derived from the one user list the panel already loads, so the
 * numbers here can never disagree with the Users page. That mismatch is the
 * fastest way to make an admin stop trusting a dashboard.
 */

const DAY = 86400000;

function isDisabled(u) { return u.isActive === false; }
function isExpired(u) {
  return u.membershipStatus === 'expired' ||
    (u.membershipEnd && new Date(u.membershipEnd).getTime() < Date.now());
}
/** Active = allowed to sign in and their membership has not run out. */
function isActiveUser(u) { return !isDisabled(u) && !isExpired(u); }

/**
 * Recent activity, worked out from the user records themselves.
 *
 * The API has no activity log, and inventing one on the server was not part of
 * this change. Rather than show a fake feed, this reports things that are
 * genuinely true of the data: who joined, whose access is off, and whose
 * membership is about to end.
 */
function buildActivity(users) {
  const now = Date.now();
  const events = [];

  users.forEach(u => {
    if (u.createdAt) {
      events.push({
        id: `new-${u._id}`, at: new Date(u.createdAt).getTime(),
        icon: UserPlus, tone: 'ok',
        who: u.name, what: 'joined the gym',
      });
    }
    if (isDisabled(u)) {
      events.push({
        id: `off-${u._id}`, at: new Date(u.updatedAt || u.createdAt || now).getTime(),
        icon: Ban, tone: 'danger',
        who: u.name, what: 'cannot sign in',
      });
    }
    if (u.membershipEnd) {
      const left = Math.ceil((new Date(u.membershipEnd).getTime() - now) / DAY);
      if (left >= 0 && left <= 7) {
        // Sorted as if it had just happened so it stays near the top, but
        // labelled with when it is DUE — "6d ago" next to "ends in 1 day"
        // reads as a contradiction.
        events.push({
          id: `end-${u._id}`, at: now - (7 - left) * DAY,
          icon: CalendarClock, tone: 'warn',
          who: u.name,
          what: left === 0 ? 'membership ends today' : `membership ends in ${left} day${left > 1 ? 's' : ''}`,
          when: left === 0 ? 'Today' : `In ${left}d`,
        });
      }
    }
  });

  return events.sort((a, b) => b.at - a.at).slice(0, 8);
}

function ActivityRow({ event, first }) {
  const Icon = event.icon;
  const color = {
    ok: 'var(--p-ok)', warn: 'var(--p-warn)', danger: 'var(--p-danger)', info: 'var(--p-info)',
  }[event.tone];
  const soft = {
    ok: 'var(--p-ok-soft)', warn: 'var(--p-warn-soft)', danger: 'var(--p-danger-soft)', info: 'var(--p-info-soft)',
  }[event.tone];

  return (
    <li
      className="flex items-center gap-3 px-4 py-3.5"
      style={{ borderTop: first ? 'none' : '1px solid var(--p-border)' }}
    >
      <span className="ui-stat-icon" style={{ background: soft, color, width: 34, height: 34 }}>
        <Icon size={16} />
      </span>
      <span className="flex-1 min-w-0 text-[14px]" style={{ color: 'var(--p-text-2)' }}>
        <strong style={{ color: 'var(--p-text)', fontWeight: 600 }}>{event.who}</strong> {event.what}
      </span>
      <span className="text-[12px] flex-shrink-0" style={{ color: 'var(--p-muted)' }}>
        {event.when ?? timeAgo(new Date(event.at).toISOString())}
      </span>
    </li>
  );
}

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const load = useCallback((force = false) => {
    setLoading(true);
    setError(null);
    const get = force ? freshGet : cachedGet;

    // The same two endpoints the Users page merges, so "Total users" here and
    // the count at the bottom of that list can never disagree.
    Promise.all([
      get('/members', { cache: 60 }),
      get('/trainers', { cache: 180 }),
    ])
      .then(([m, t]) => {
        const list = [
          ...(Array.isArray(m.data) ? m.data : []),
          ...(Array.isArray(t.data) ? t.data : []),
        ];
        // An empty gym is a real state, not a failure — only stand in sample
        // data when previewing, and say so on screen when we do.
        if (list.length === 0 && DEMO_ENABLED) {
          setUsers(DEMO_USERS);
          setIsDemo(true);
        } else {
          setUsers(list);
          setIsDemo(false);
        }
      })
      .catch(err => {
        if (DEMO_ENABLED) {
          setUsers(DEMO_USERS);
          setIsDemo(true);
          return;
        }
        setError(err.response?.data?.message || 'Could not load your users. Check your connection and try again.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => {
    const monthAgo = Date.now() - 30 * DAY;
    return {
      total: users.length,
      active: users.filter(isActiveUser).length,
      isNew: users.filter(u => u.createdAt && new Date(u.createdAt).getTime() >= monthAgo).length,
    };
  }, [users]);

  const activity = useMemo(() => buildActivity(users), [users]);

  if (error) {
    return (
      <AdminLayout title="Home">
        <Card>
          <EmptyState icon={AlertTriangle} title="Something went wrong" hint={error}>
            <Button variant="primary" icon={RefreshCw} onClick={() => load(true)}>Try again</Button>
          </EmptyState>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Home"
      subtitle="How your gym is doing right now"
      actions={<Button variant="primary" icon={UserPlus} to="/admin/members?add=1">Add user</Button>}
    >
      <div className="space-y-4 max-w-4xl">
        {isDemo && (
          <div className="ui-demo-note">
            <FlaskConical size={15} className="flex-shrink-0" />
            Showing sample data — no real users were found.
          </div>
        )}

        {/* Three numbers, each with a plain-language line saying what it counts */}
        <Stagger className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total users"
            value={stats.total}
            hint="Everyone on your books"
            icon={Users}
            tone="accent"
            loading={loading}
          />
          <StatCard
            label="Active users"
            value={stats.active}
            hint="Can sign in, membership running"
            icon={UserCheck}
            tone="ok"
            loading={loading}
          />
          <StatCard
            label="New users"
            value={stats.isNew}
            hint="Joined in the last 30 days"
            icon={Sparkles}
            tone="info"
            loading={loading}
          />
        </Stagger>

        {/* What has been happening */}
        <FadeIn delay={0.12}>
          <Card
            title="Recent activity"
            padded={false}
            action={
              <Button size="sm" to="/admin/members">
                All users <ArrowRight size={14} />
              </Button>
            }
          >
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} h={44} />)}
              </div>
            ) : activity.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="Nothing has happened yet"
                hint="Add your first user and their activity will show up here."
              >
                <Button variant="primary" icon={UserPlus} to="/admin/members?add=1">Add user</Button>
              </EmptyState>
            ) : (
              <ul>
                {activity.map((event, i) => (
                  <ActivityRow key={event.id} event={event} first={i === 0} />
                ))}
              </ul>
            )}
          </Card>
        </FadeIn>
      </div>
    </AdminLayout>
  );
}
