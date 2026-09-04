import API, { cachedGet, freshGet, bustCache } from '../../utils/api';
import { DAY, daysUntil, fmtDate } from '../../utils/membership';

/**
 * One place for everything the admin screens do to user accounts.
 *
 * Users and Members are two views of the same collection — a member is a user
 * with role 'member' — so the loading, the status rules and the write calls
 * live here rather than being written twice and drifting apart.
 */


export { DAY, daysUntil, fmtDate };

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

/**
 * Has the membership itself run out?
 *
 * Deliberately separate from statusOf(). That function answers "what badge does
 * this row show", where Disabled outranks everything — a disabled member cannot
 * train whatever their dates say. This one answers "does this membership need
 * renewing", which is still true of someone whose account is also switched off.
 * Counting only the enabled ones as expired quietly hid lapsed members from the
 * Expired total and from the Expired filter.
 */
export function isMembershipExpired(user) {
  if (user.role && user.role !== 'member') return false;   // staff hold no membership
  const left = daysUntil(user.membershipEnd);
  return left !== null && left < 0;
}

/**
 * Has this member been handed off to WhatsApp for their *current* reminder?
 *
 * "Sent at some point in the past" is not the question — a member reminded
 * three weeks ago for a renewal they have since let lapse still needs
 * contacting. So the stamp only counts if it is newer than the day the current
 * reminder window opened.
 */
export function whatsappPending(user, windowDays = 4) {
  const left = daysUntil(user.membershipEnd);
  if (left === null || left > windowDays) return false;   // not due a reminder yet
  if (!user.lastWhatsAppAt) return true;                  // never contacted

  // The window opened `windowDays` before expiry; anything stamped before that
  // belongs to a previous cycle.
  const windowOpened = new Date(user.membershipEnd).getTime() - windowDays * DAY;
  return new Date(user.lastWhatsAppAt).getTime() < windowOpened;
}

/** Filters offered on the Members screen. Each is a plain predicate. */
export const EXPIRY_FILTERS = [
  { value: 'all',      label: 'Everyone',        test: () => true },
  { value: 'active',   label: 'Active',          test: u => ['active', 'month', 'week', 'today'].includes(statusOf(u).key) },
  { value: 'today',    label: 'Expiring today',  test: u => statusOf(u).key === 'today' },
  { value: 'week',     label: 'This week',       test: u => { const d = daysUntil(u.membershipEnd); return d !== null && d >= 0 && d <= 7; } },
  { value: 'month',    label: 'This month',      test: u => { const d = daysUntil(u.membershipEnd); return d !== null && d >= 0 && d <= 30; } },
  { value: 'expired',  label: 'Expired',         test: isMembershipExpired },
  // The working list: due a reminder and not yet contacted on WhatsApp.
  { value: 'towhatsapp', label: 'To WhatsApp',    test: u => whatsappPending(u) },
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
    if (form.feePaid !== undefined) payload.feePaid = form.feePaid;
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

/* ── Manual WhatsApp ────────────────────────────────────────────────────── */

/**
 * Automated WhatsApp needs a registered WhatsApp Business sender, which needs
 * Meta verification. Until that exists, these helpers let the admin send the
 * same message by hand from the gym's own number: one tap opens WhatsApp with
 * the text already written.
 *
 * Email is never manual — it is always sent by the server, on both the
 * automatic and the admin-triggered path.
 */

/** Phone as E.164 digits (no +), assuming India for bare 10-digit numbers. */
export function toE164Digits(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return null;
  if (digits.length === 10) return `${91}${digits}`;
  if (digits.startsWith('00')) return digits.slice(2);
  return digits;
}

/** wa.me deep link, or null when there is no usable number. */
export function waLink(phone, text) {
  const to = toE164Digits(phone);
  if (!to) return null;
  return `https://wa.me/${to}?text=${encodeURIComponent(text)}`;
}

/** The sign-in details message, worded the same as the welcome email. */
export function buildCredentialsMessage({ name, email, password, usedPhone, loginUrl }) {
  const url = loginUrl || `${window.location.origin}/login`;
  return [
    `Hi ${name}! Your FitNation membership is active.`,
    '',
    `Sign in: ${url}`,
    `Email: ${email}`,
    usedPhone ? `Password: your mobile number (${password})` : `Password: ${password}`,
    '',
    'Please change your password after your first sign-in.',
  ].join('\n');
}

/**
 * Ask the server to send the renewal reminder.
 *
 * The email and the in-app notification go out server-side; the response also
 * carries the WhatsApp text and a wa.me link so the caller can open the chat.
 */
export async function sendReminder(member) {
  const { data } = await API.post(`/members/${member._id}/reminder`);
  return data;
}

/** Email every active member whose membership ends within the next 7 days. */
export async function runReminderSweep() {
  const { data } = await API.post('/members/bulk-reminder', {
    days: 7,
    channels: ['email'],
  });
  return data;
}
