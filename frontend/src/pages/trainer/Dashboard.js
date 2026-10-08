import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../admin/AdminLayout';
import {
  Users, Dumbbell, Salad, TrendingUp, Calendar,
  UserCheck, ChevronRight, Activity, ArrowRight, Sparkles,
} from 'lucide-react';
import { cachedGet } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import {
  Card, Badge, Avatar, Button, Skeleton, StatCard, Stagger, FadeIn,
} from '../../components/ui';

export default function TrainerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentMembers, setRecentMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      cachedGet('/analytics/trainer-summary', { cache: 120 }),
      cachedGet('/members/roster', { cache: 60 }),
    ]).then(([sr, mr]) => {
      setStats(sr.data || null);
      setRecentMembers((mr.data || []).slice(0, 6));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const quickActions = [
    { to: '/admin/exercises',       icon: Dumbbell,   label: 'Exercise Library',   hint: 'Demonstrations & videos', tone: 'accent' },
    { to: '/admin/diet',            icon: Salad,      label: 'Diet Plans',         hint: 'Nutritional meal sheets', tone: 'ok' },
    { to: '/admin/splits',          icon: Calendar,   label: 'Workout Splits',     hint: 'Weekly exercise programs', tone: 'info' },
    { to: '/admin/transformations', icon: TrendingUp, label: 'Transformations',    hint: 'Client success stories',  tone: 'warn' },
  ];

  return (
    <AdminLayout
      title="Trainer Cockpit"
      subtitle={`Welcome back, ${user?.name || 'Coach'}. Manage workouts, nutrition, and athletes.`}
    >
      <div className="space-y-6 max-w-6xl">
        {/* Welcome Coach Card */}
        <Card padded={true} className="border-l-4" style={{ borderLeftColor: 'var(--p-accent)' }}>
          <div className="flex items-center gap-4 flex-wrap">
            <Avatar name={user?.name} size={52} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-[18px] font-bold" style={{ color: 'var(--p-text)' }}>
                  Coach {user?.name}
                </h2>
                <Badge tone="accent">Certified Trainer</Badge>
              </div>
              <p className="text-[13px] mt-0.5" style={{ color: 'var(--p-muted)' }}>
                {user?.specialization ? `Specialization: ${user.specialization} • ` : ''}
                Empower members with tailored workout programming and meal schedules.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" to="/admin/exercises">Add Exercise</Button>
              <Button size="sm" variant="primary" to="/admin/splits">Create Split</Button>
            </div>
          </div>
        </Card>

        {/* Primary Stats Grid */}
        <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            icon={Users}
            label="Total Members"
            value={stats?.totalMembers ?? '–'}
            hint="Enrolled athletes"
            tone="info"
            loading={loading}
          />
          <StatCard
            icon={UserCheck}
            label="Active Members"
            value={stats?.activeMembers ?? '–'}
            hint="Active gym passes"
            tone="ok"
            loading={loading}
          />
          <StatCard
            icon={Dumbbell}
            label="Total Exercises"
            value={stats?.totalExercises ?? '–'}
            hint="Video & form database"
            tone="accent"
            to="/admin/exercises"
            loading={loading}
          />
          <StatCard
            icon={Salad}
            label="Diet Plans"
            value={stats?.totalDietPlans ?? '–'}
            hint="Published diet guides"
            tone="warn"
            to="/admin/diet"
            loading={loading}
          />
        </Stagger>

        {/* 2-Column Operational Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Quick Program Tools */}
          <FadeIn delay={0.08}>
            <Card title="Program Tools & Management" padded={true}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quickActions.map(({ to, icon: Icon, label, hint }) => (
                  <Link
                    key={to}
                    to={to}
                    className="ui-card ui-card-link ui-card-pad group transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="ui-stat-icon" style={{ background: 'var(--p-accent-soft)', color: 'var(--p-accent)', width: 34, height: 34 }}>
                        <Icon size={17} />
                      </span>
                      <ChevronRight size={14} style={{ color: 'var(--p-muted)' }} />
                    </div>
                    <div className="text-[14px] font-semibold" style={{ color: 'var(--p-text)' }}>{label}</div>
                    <div className="text-[12px] mt-0.5" style={{ color: 'var(--p-muted)' }}>{hint}</div>
                  </Link>
                ))}
              </div>
            </Card>
          </FadeIn>

          {/* Member Roster Peek */}
          <FadeIn delay={0.1}>
            <Card
              title="Recent Gym Members"
              subtitle="Athletes on floor"
              padded={false}
              action={<Button size="sm" to="/admin/members">All members <ArrowRight size={14} /></Button>}
            >
              {loading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} h={38} />)}
                </div>
              ) : recentMembers.length === 0 ? (
                <div className="p-8 text-center" style={{ color: 'var(--p-muted)' }}>No members registered yet</div>
              ) : (
                <ul>
                  {recentMembers.map((m, i) => (
                    <li
                      key={m._id}
                      className="flex items-center justify-between px-4 py-3 hover:bg-[var(--p-surface-2)] transition"
                      style={{ borderTop: i ? '1px solid var(--p-border)' : 'none' }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={m.name} size={32} />
                        <div className="min-w-0">
                          <div className="text-[14px] font-semibold truncate" style={{ color: 'var(--p-text)' }}>{m.name}</div>
                          <div className="text-[12px] capitalize" style={{ color: 'var(--p-muted)' }}>{m.membershipPlan || 'Standard'}</div>
                        </div>
                      </div>
                      <Badge tone={m.membershipStatus === 'active' ? 'ok' : 'neutral'}>
                        {m.membershipStatus || 'active'}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </FadeIn>
        </div>
      </div>
    </AdminLayout>
  );
}
