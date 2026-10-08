import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Dumbbell, Salad, TrendingUp, ShoppingBag, Package, Calendar, Settings,
  Bell, AlertTriangle, ArrowRight, IndianRupee, UserCheck, Play,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { cachedGet } from '../../utils/api';
import MemberPage from '../../components/MemberPage';
import { Card, Badge, Button, EmptyState, Skeleton, STATUS_TONE, timeAgo } from '../../components/ui';
import { daysUntil, fmtDate, daysLeftLabel, expiryTone, membershipProgress } from '../../utils/membership';

const ACTIONS = [
  { to: '/my-workout',   icon: Dumbbell,   label: 'My Workout',   hint: 'Split & daily routine' },
  { to: '/my-diet',      icon: Salad,      label: 'My Diet',      hint: 'Nutrition & meals' },
  { to: '/my-progress',  icon: TrendingUp, label: 'Body Progress',hint: 'Weight & measurements' },
  { to: '/my-exercises', icon: Calendar,   label: 'Exercises',    hint: 'Form & video guides' },
  { to: '/store',        icon: ShoppingBag,label: 'Gym Store',    hint: 'Supplements & gear' },
  { to: '/my-orders',    icon: Package,    label: 'My Orders',    hint: 'Counter pickups & bills' },
];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function MemberDashboard() {
  const { user } = useAuth();
  const settings = useSettings();
  const [notifications, setNotifications] = useState([]);
  const [todayRoutine, setTodayRoutine] = useState(null);
  const [assignedDiet, setAssignedDiet] = useState(null);
  const [loading, setLoading] = useState(true);

  const todayDayName = DAYS[new Date().getDay()];

  useEffect(() => {
    let alive = true;
    Promise.allSettled([
      cachedGet('/notifications', { cache: 30 }),
      cachedGet('/splits/me', { cache: 60 }),
      cachedGet('/diet/my', { cache: 60 }),
    ]).then(([notifRes, splitRes, dietRes]) => {
      if (!alive) return;
      if (notifRes.status === 'fulfilled') {
        setNotifications((notifRes.value.data || []).slice(0, 3));
      }
      if (splitRes.status === 'fulfilled' && splitRes.value.data?.days) {
        const found = splitRes.value.data.days.find(d => d.day === todayDayName);
        if (found) setTodayRoutine(found);
      }
      if (dietRes.status === 'fulfilled' && Array.isArray(dietRes.value.data) && dietRes.value.data.length > 0) {
        setAssignedDiet(dietRes.value.data[0]);
      }
    }).finally(() => alive && setLoading(false));

    return () => { alive = false; };
  }, [todayDayName]);

  const daysLeft = daysUntil(user?.membershipEnd);
  const progress = membershipProgress(user?.membershipStart, user?.membershipEnd);
  const tone = expiryTone(user?.membershipEnd);
  const needsRenewal = daysLeft !== null && daysLeft <= 7;

  // Due calculation
  const hasDue = Number(user?.feeDueAmount) > 0 || (user?.feePaid === false && Number(user?.feeAmount) > 0);
  const dueAmount = Number(user?.feeDueAmount) > 0 ? Number(user?.feeDueAmount) : Number(user?.feeAmount || 0);

  return (
    <MemberPage
      title={`Hi, ${user?.name?.split(' ')[0] || 'Athlete'}`}
      subtitle="Welcome to your personal training cockpit"
      actions={<Button icon={Settings} size="sm" to="/settings">Account</Button>}
    >
      {/* Outstanding Balance Alert Banner */}
      {hasDue && (
        <Card className="mb-4 border-l-4 border-l-red-500" style={{ background: 'var(--p-surface)' }}>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-start gap-3">
              <span className="p-2 rounded-xl flex items-center justify-center" style={{ background: 'var(--p-danger-soft)', color: 'var(--p-danger)' }}>
                <IndianRupee size={20} />
              </span>
              <div>
                <p className="text-[14px] font-bold" style={{ color: 'var(--p-text)' }}>
                  Outstanding Membership Fee: ₹{dueAmount.toLocaleString('en-IN')}
                </p>
                <p className="text-[12.5px] mt-0.5" style={{ color: 'var(--p-text-2)' }}>
                  Please settle at the front desk or via UPI.
                  {settings?.upiId && (
                    <span className="ml-1 font-semibold text-[var(--p-accent)]">
                      UPI ID: {settings.upiId}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <Badge tone="danger">Payment Due</Badge>
          </div>
        </Card>
      )}

      {/* Membership Status & Expiry Bar */}
      <Card className="mb-4">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
          <div>
            <p className="ui-section-label">Active Plan</p>
            <p className="text-[18px] font-semibold capitalize mt-0.5" style={{ color: 'var(--p-text)' }}>
              {user?.membershipPlan || 'General Membership'}
            </p>
            {user?.assignedTrainer?.name && (
              <p className="text-[12.5px] mt-1 flex items-center gap-1.5" style={{ color: 'var(--p-text-2)' }}>
                <UserCheck size={14} style={{ color: 'var(--p-accent)' }} />
                Trainer: <strong style={{ color: 'var(--p-text)' }}>{user.assignedTrainer.name}</strong>
              </p>
            )}
          </div>
          <Badge tone={STATUS_TONE[user?.membershipStatus] || 'neutral'}>{user?.membershipStatus || 'active'}</Badge>
        </div>

        {daysLeft !== null && (
          <>
            <div className="flex justify-between text-[13px] mb-1.5">
              <span style={{ color: 'var(--p-text-2)' }}>{daysLeftLabel(user.membershipEnd)}</span>
              <span style={{ color: 'var(--p-muted)' }}>Valid until {fmtDate(user.membershipEnd)}</span>
            </div>
            {progress !== null && (
              <div style={{ height: 6, background: 'var(--p-surface-2)', borderRadius: 99, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${progress}%`, height: '100%', borderRadius: 99,
                    background: tone === 'danger' ? 'var(--p-danger)'
                      : tone === 'warn' ? 'var(--p-warn)' : 'var(--p-accent)',
                  }}
                />
              </div>
            )}
          </>
        )}

        {needsRenewal && (() => {
          const urgent = daysLeft <= 0;
          const line = daysLeft < 0
            ? `Your membership expired ${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? '' : 's'} ago. Renew at the gym to keep training.`
            : daysLeft === 0
              ? 'Your membership ends today. Renew at the front desk to keep training without interruption.'
              : `Your membership ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}. Talk to the front desk to renew.`;
          return (
            <div
              className="flex items-start gap-2 mt-4 p-3 rounded-lg"
              style={{
                background: urgent ? 'var(--p-danger-soft)' : 'var(--p-warn-soft)',
                border: `1px solid ${urgent ? 'var(--p-danger-line)' : 'var(--p-warn-line)'}`,
              }}
            >
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5"
                style={{ color: urgent ? 'var(--p-danger)' : 'var(--p-warn)' }} />
              <p className="text-[13px]" style={{ color: 'var(--p-text-2)' }}>{line}</p>
            </div>
          );
        })()}
      </Card>

      {/* Today's Workout & Nutrition Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {/* Today's Workout Routine Card */}
        <Card padded={true} className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="ui-section-label">Today's Workout</span>
              <Badge tone="accent">{todayDayName}</Badge>
            </div>
            <h3 className="text-[16px] font-bold" style={{ color: 'var(--p-text)' }}>
              {todayRoutine?.focus || 'Scheduled Workout'}
            </h3>
            <p className="text-[13px] mt-1" style={{ color: 'var(--p-muted)' }}>
              {todayRoutine?.exercises?.length
                ? `${todayRoutine.exercises.length} exercises programmed for today`
                : 'Tap below to check your workout split and exercises'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--p-border)' }}>
            <Link
              to="/my-workout"
              className="text-[13px] font-semibold flex items-center gap-1.5 transition hover:opacity-80"
              style={{ color: 'var(--p-accent)' }}
            >
              <Play size={14} /> Open Today's Routine <ArrowRight size={13} />
            </Link>
            <span className="text-xs" style={{ color: 'var(--p-muted)' }}>Weekly Split</span>
          </div>
        </Card>

        {/* Assigned Diet Plan Highlight */}
        <Card padded={true} className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="ui-section-label">Nutrition Target</span>
              <Badge tone={assignedDiet ? 'ok' : 'neutral'}>
                {assignedDiet ? 'Trainer Assigned' : 'General'}
              </Badge>
            </div>
            <h3 className="text-[16px] font-bold" style={{ color: 'var(--p-text)' }}>
              {assignedDiet?.title || 'Daily Nutrition Plan'}
            </h3>
            <p className="text-[13px] mt-1" style={{ color: 'var(--p-muted)' }}>
              {assignedDiet?.targetCalories
                ? `Target: ${assignedDiet.targetCalories} kcal · ${assignedDiet.meals?.length || 0} meals structured`
                : 'Follow balanced protein and hydration targets for peak performance'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--p-border)' }}>
            <Link
              to="/my-diet"
              className="text-[13px] font-semibold flex items-center gap-1.5 transition hover:opacity-80"
              style={{ color: 'var(--p-ok)' }}
            >
              <Salad size={14} /> View Meal Breakdown <ArrowRight size={13} />
            </Link>
            <span className="text-xs" style={{ color: 'var(--p-muted)' }}>Macros & Meals</span>
          </div>
        </Card>
      </div>

      {/* Six Main Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {ACTIONS.map(a => {
          const Icon = a.icon;
          return (
            <Link key={a.to} to={a.to} className="ui-card ui-card-link ui-card-pad group">
              <Icon size={20} className="transition-colors group-hover:text-[var(--p-text)]" style={{ color: 'var(--p-text-2)' }} />
              <p className="text-[14px] font-semibold mt-2.5" style={{ color: 'var(--p-text)' }}>{a.label}</p>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--p-muted)' }}>{a.hint}</p>
            </Link>
          );
        })}
      </div>

      {/* Latest Notifications / Announcements */}
      <Card
        title="Gym Announcements & Updates"
        padded={false}
        action={
          <Link to="/notifications" className="text-[13px] font-medium inline-flex items-center gap-1 hover:text-[var(--p-text)] transition-colors" style={{ color: 'var(--p-text-2)' }}>
            See all <ArrowRight size={13} />
          </Link>
        }
      >
        <div className="px-5 py-2">
          {loading ? (
            <div className="py-3 space-y-3">{Array.from({ length: 2 }, (_, i) => <Skeleton key={i} h={40} />)}</div>
          ) : notifications.length === 0 ? (
            <EmptyState icon={Bell} title="No unread messages" hint="Gym announcements and reminders will appear here." />
          ) : (
            <ul>
              {notifications.map((n, i) => (
                <li key={n._id} className="py-3" style={{ borderTop: i ? '1px solid var(--p-border)' : 'none' }}>
                  <div className="flex items-start gap-2">
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--p-warn)' }} />
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
