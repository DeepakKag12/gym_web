/**
 * Membership dates and status — shared by the admin panel and the member area.
 *
 * These rules were written twice: once in the admin screens and once on the
 * member dashboard, each with its own arithmetic. They disagreed. On the last
 * day of a membership the admin saw "Ends today" while the member was told
 * "1 day remaining", because one rounded up a partial day and the other did
 * not. A member and the person renewing them must never see different numbers.
 */

export const DAY = 86400000;

/**
 * Calendar days from today until `d`: 0 today, 1 tomorrow, -1 yesterday.
 *
 * Compared date-to-date rather than by elapsed milliseconds. Measuring "now"
 * against the end of the day and rounding up reports 1 for something expiring
 * today, which is how the two screens drifted apart.
 */
export function daysUntil(d) {
  if (!d) return null;
  const end = new Date(d);
  if (Number.isNaN(end.getTime())) return null;
  end.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - today.getTime()) / DAY);
}

export const fmtDate = d =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

/** How many days are left, said the way a person would say it. */
export function daysLeftLabel(membershipEnd) {
  const left = daysUntil(membershipEnd);
  if (left === null) return 'No end date set';
  if (left < 0) return `Expired ${Math.abs(left)} day${Math.abs(left) === 1 ? '' : 's'} ago`;
  if (left === 0) return 'Ends today';
  if (left === 1) return '1 day remaining';
  return `${left} days remaining`;
}

/** Tone for a progress bar or badge, from days remaining. */
export function expiryTone(membershipEnd) {
  const left = daysUntil(membershipEnd);
  if (left === null) return 'neutral';
  if (left < 0) return 'danger';
  if (left <= 3) return 'danger';
  if (left <= 7) return 'warn';
  return 'ok';
}

/** How far through the membership we are, 0–100, or null if it cannot be known. */
export function membershipProgress(start, end) {
  if (!start || !end) return null;
  const total = new Date(end) - new Date(start);
  if (!(total > 0)) return null;
  const done = Date.now() - new Date(start);
  return Math.min(100, Math.max(0, (done / total) * 100));
}
