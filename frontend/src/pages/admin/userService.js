import API, { cachedGet, freshGet, bustCache } from '../../utils/api';

/**
 * One place for everything the admin screens do to user accounts.
 *
 * Users and Members are two views of the same collection — a member is a user
 * with role 'member' — so the loading, the status rules and the write calls
 * live here rather than being written twice and drifting apart.
 */

export const DAY = 86400000;

export const ROLES = {
  admin:   { label: 'Admin',   tone: 'accent',  hint: 'Full access to everything' },
  trainer: { label: 'Trainer', tone: 'info',    hint: 'Manages workouts, diets and their members' },
  member:  { label: 'Member',  tone: 'neutral', hint: 'Trains at the gym, sees only their own plans' },
};

export const PLANS = {
  monthly: '1 month',
  quarterly: '3 months',
  'half-yearly': '6 months',
  yearly: '12 months',
};

export const PLAN_MONTHS = { monthly: 1, quarterly: 3, 'half-yearly': 6, yearly: 12 };

export const fmtDate = d =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

/** Whole days from today until `d`. Negative once it is in the past. */
export function daysUntil(d) {
  if (!d) return null;
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);
  return Math.ceil((end.getTime() - Date.now()) / DAY);
}

/** Expiry date implied by a start date and a plan length. */
export function calcExpiry(start, plan) {
  if (!start || !plan) return '';
  const d = new Date(start);
  d.setMonth(d.getMonth() + (PLAN_MONTHS[plan] || 1));
  return d.toISOString().split('T')[0];
}

/**
 * The single source of truth for "what state is this account in".
 *
 * Order matters and encodes the business rules:
 *   1. Disabled beats everything — a disabled account cannot sign in whether
 *      or not its membership is still paid up.
 *   2. Staff have no membership, so they are never "expired".
 *   3. A membership with no end date has not started properly yet.
 */
export function statusOf(user) {
  if (user.isActive === false) {
    return { key: 'disabled', label: 'Disabled', tone: 'neutral' };
  }
  if (user.role && user.role !== 'member') {
    return { key: 'staff', label: 'Active', tone: 'ok' };
  }
  if (!user.membershipEnd) {
    return { key: 'pending', label: 'No membership', tone: 'warn' };
  }
  const left = daysUntil(user.membershipEnd);
  if (left < 0)  return { key: 'expired',  label: 'Expired',      tone: 'danger' };
  if (left === 0) return { key: 'today',   label: 'Ends today',   tone: 'danger' };
  if (left <= 7)  return { key: 'week',    label: `${left}d left`, tone: 'warn' };
  if (left <= 30) return { key: 'month',   label: `${left}d left`, tone: 'warn' };
  return { key: 'active', label: 'Active', tone: 'ok' };
}

/** Filters offered on the Members screen. Each is a plain predicate. */
export const EXPIRY_FILTERS = [
  { value: 'all',      label: 'Everyone',        test: () => true },
  { value: 'active',   label: 'Active',          test: u => ['active', 'month', 'week', 'today'].includes(statusOf(u).key) },
  { value: 'today',    label: 'Expiring today',  test: u => statusOf(u).key === 'today' },
  { value: 'week',     label: 'This week',       test: u => { const d = daysUntil(u.membershipEnd); return d !== null && d >= 0 && d <= 7; } },
  { value: 'month',    label: 'This month',      test: u => { const d = daysUntil(u.membershipEnd); return d !== null && d >= 0 && d <= 30; } },
  { value: 'expired',  label: 'Expired',         test: u => statusOf(u).key === 'expired' },
  { value: 'disabled', label: 'Disabled',        test: u => u.isActive === false },
];

/* ── Reads ──────────────────────────────────────────────────────────────── */

/**
 * Every account, from the two endpoints that hold them.
 *
 * /members returns role 'member' and /trainers returns role 'trainer'; neither
 * returns admins, so an admin's own account does not appear in these lists.
 * That is a backend gap, not something this function can paper over.
 */
export async function loadUsers({ force = false } = {}) {
  const get = force ? freshGet : cachedGet;
  const [m, t] = await Promise.all([
    get('/members', { cache: 60 }),
    get('/trainers', { cache: 180 }),
  ]);
  const members  = (Array.isArray(m.data) ? m.data : []).map(u => ({ ...u, role: u.role || 'member' }));
  const trainers = (Array.isArray(t.data) ? t.data : []).map(u => ({ ...u, role: 'trainer' }));
  return [...members, ...trainers]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

/** Clears every cache a write to a user could invalidate. */
export function bustUserCaches() {
  bustCache('/members');
  bustCache('/trainers');
  bustCache('analytics');
}

/* ── Writes ─────────────────────────────────────────────────────────────── */

const endpointFor = user => (user.role === 'trainer' ? '/trainers' : '/members');

/**
 * Creating an admin is not offered.
 *
 * Both create endpoints hardcode the role on the server, specifically so a
 * request body can never mint an admin. An "Admin" option in the form would
 * silently produce a member instead, which is worse than not offering it.
 * Promote an existing account with changeRole() instead.
 */
export async function createUser(form) {
  const payload = {
    name: form.name.trim(),
    email: form.email.trim().toLowerCase(),
    phone: String(form.phone || '').replace(/\D/g, '') || undefined,
    password: form.password,
  };

  if (form.role === 'trainer') {
    const { data } = await API.post('/trainers', payload);
    return data;
  }

  const { data } = await API.post('/members', {
    ...payload,
    membershipPlan: form.membershipPlan || 'monthly',
    membershipStart: form.membershipStart || new Date().toISOString().split('T')[0],
    feeAmount: form.feeAmount === '' || form.feeAmount == null ? undefined : Number(form.feeAmount),
  });
  return data;
}

export async function updateUser(user, form) {
  const payload = {
    name: form.name.trim(),
    email: form.email.trim().toLowerCase(),
    phone: String(form.phone || '').replace(/\D/g, '') || undefined,
  };
  if (form.password) payload.password = form.password;

  if (user.role === 'member') {
    if (form.membershipPlan)  payload.membershipPlan  = form.membershipPlan;
    if (form.membershipStart) payload.membershipStart = form.membershipStart;
    if (form.membershipEnd)   payload.membershipEnd   = form.membershipEnd;
    if (form.feeAmount !== '' && form.feeAmount != null) payload.feeAmount = Number(form.feeAmount);
  }

  const { data } = await API.put(`${endpointFor(user)}/${user._id}`, payload);
  return data;
}

export async function setUserActive(user, isActive) {
  const { data } = await API.put(`${endpointFor(user)}/${user._id}`, { isActive });
  return data;
}

export async function resetPassword(user, password) {
  // Both PUT handlers hash a supplied password before saving, so this is the
  // supported way to set one — there is no separate reset endpoint.
  const { data } = await API.put(`${endpointFor(user)}/${user._id}`, { password });
  return data;
}

export async function changeRole(user, role) {
  const { data } = await API.patch(`/members/${user._id}/role`, { role });
  return data;
}

export async function deleteUser(user) {
  await API.delete(`${endpointFor(user)}/${user._id}`);
}
