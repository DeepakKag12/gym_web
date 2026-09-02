/**
 * Sample data for previewing and testing the admin panel.
 *
 * IMPORTANT — this never silently stands in for real data. A real admin
 * looking at a page while the backend is down must not be shown twenty-four
 * invented users and believe them. It is used only when:
 *
 *   • REACT_APP_DEMO_DATA=true is set (explicit opt-in), or
 *   • the app is running under `npm start` (development)
 *
 * and even then the screen shows a "Sample data" notice. Production builds
 * without the flag show the real empty state or the real error instead.
 */

export const DEMO_ENABLED =
  process.env.REACT_APP_DEMO_DATA === 'true' || process.env.NODE_ENV === 'development';

const DAY = 86400000;
const daysAgo = n => new Date(Date.now() - n * DAY).toISOString();
const daysAhead = n => new Date(Date.now() + n * DAY).toISOString();

/* ── Users ───────────────────────────────────────────────────────────────── */
/** Shaped like the API's member objects so the screens need no special case. */
export const DEMO_USERS = [
  {
    _id: 'demo-1', name: 'Ajeet Kumar', email: 'ajeet@fitnation.in', phone: '9589730151',
    role: 'admin', isActive: true, createdAt: daysAgo(720),
    membershipPlan: 'yearly', membershipStart: daysAgo(720), membershipEnd: daysAhead(300), feeAmount: 0,
  },
  {
    _id: 'demo-2', name: 'Priya Menon', email: 'priya.menon@gmail.com', phone: '9812345670',
    role: 'trainer', isActive: true, createdAt: daysAgo(410),
    membershipPlan: 'yearly', membershipStart: daysAgo(410), membershipEnd: daysAhead(180), feeAmount: 0,
  },
  {
    _id: 'demo-3', name: 'Rahul Sharma', email: 'rahul.sharma@gmail.com', phone: '9823451178',
    role: 'member', isActive: true, createdAt: daysAgo(186),
    membershipPlan: 'half-yearly', membershipStart: daysAgo(186), membershipEnd: daysAhead(4), feeAmount: 7500,
  },
  {
    _id: 'demo-4', name: 'Sneha Iyer', email: 'sneha.iyer@outlook.com', phone: '9700123456',
    role: 'member', isActive: true, createdAt: daysAgo(92),
    membershipPlan: 'quarterly', membershipStart: daysAgo(92), membershipEnd: daysAhead(1), feeAmount: 4200,
  },
  {
    _id: 'demo-5', name: 'Vikram Singh', email: 'vikram.singh@gmail.com', phone: '9945671230',
    role: 'member', isActive: true, createdAt: daysAgo(58),
    membershipPlan: 'quarterly', membershipStart: daysAgo(58), membershipEnd: daysAhead(32), feeAmount: 4200,
  },
  {
    _id: 'demo-6', name: 'Ananya Rao', email: 'ananya.rao@gmail.com', phone: '9663451209',
    role: 'trainer', isActive: true, createdAt: daysAgo(240),
    membershipPlan: 'yearly', membershipStart: daysAgo(240), membershipEnd: daysAhead(125), feeAmount: 0,
  },
  {
    _id: 'demo-7', name: 'Mohit Verma', email: 'mohit.verma@yahoo.com', phone: '9877612340',
    role: 'member', isActive: false, createdAt: daysAgo(310),
    membershipPlan: 'monthly', membershipStart: daysAgo(310), membershipEnd: daysAgo(40), feeAmount: 1500,
  },
  {
    _id: 'demo-8', name: 'Kavya Nair', email: 'kavya.nair@gmail.com', phone: '9812009876',
    role: 'member', isActive: true, createdAt: daysAgo(21),
    membershipPlan: 'monthly', membershipStart: daysAgo(21), membershipEnd: daysAhead(9), feeAmount: 1500,
  },
  {
    _id: 'demo-9', name: 'Imran Qureshi', email: 'imran.q@gmail.com', phone: '9700456781',
    role: 'member', isActive: true, createdAt: daysAgo(12),
    membershipPlan: 'quarterly', membershipStart: daysAgo(12), membershipEnd: daysAhead(78), feeAmount: 4200,
  },
  {
    _id: 'demo-10', name: 'Deepak Kag', email: 'deepak.kag@gmail.com', phone: '9589001122',
    role: 'member', isActive: true, createdAt: daysAgo(6),
    membershipPlan: 'monthly', membershipStart: daysAgo(6), membershipEnd: daysAhead(24), feeAmount: 1500,
  },
  {
    _id: 'demo-11', name: 'Ritu Agarwal', email: 'ritu.agarwal@gmail.com', phone: '9812774411',
    role: 'member', isActive: false, createdAt: daysAgo(150),
    membershipPlan: 'monthly', membershipStart: daysAgo(150), membershipEnd: daysAgo(12), feeAmount: 1500,
  },
  {
    _id: 'demo-12', name: 'Sameer Joshi', email: 'sameer.joshi@gmail.com', phone: '9922334455',
    role: 'member', isActive: true, createdAt: daysAgo(3),
    membershipPlan: 'yearly', membershipStart: daysAgo(3), membershipEnd: daysAhead(362), feeAmount: 14000,
  },
];

/* ── Recent activity ─────────────────────────────────────────────────────── */
export const DEMO_ACTIVITY = [
  { _id: 'a1', type: 'user_added',      user: 'Sameer Joshi',  text: 'joined on a 12-month membership', at: daysAgo(0.1) },
  { _id: 'a2', type: 'user_added',      user: 'Deepak Kag',    text: 'joined on a 1-month membership',  at: daysAgo(0.9) },
  { _id: 'a3', type: 'membership_ends', user: 'Sneha Iyer',    text: 'membership ends tomorrow',        at: daysAgo(1.2) },
  { _id: 'a4', type: 'user_disabled',   user: 'Ritu Agarwal',  text: 'was disabled after non-payment',  at: daysAgo(2.4) },
  { _id: 'a5', type: 'user_added',      user: 'Imran Qureshi', text: 'joined on a 3-month membership',  at: daysAgo(4) },
  { _id: 'a6', type: 'user_updated',    user: 'Vikram Singh',  text: 'was moved to a 3-month plan',     at: daysAgo(6) },
  { _id: 'a7', type: 'membership_ends', user: 'Rahul Sharma',  text: 'membership ends in 4 days',       at: daysAgo(7) },
  { _id: 'a8', type: 'user_added',      user: 'Kavya Nair',    text: 'joined on a 1-month membership',  at: daysAgo(9) },
];

/* ── Dashboard numbers, derived so they always agree with the user list ──── */
export function demoStats(users = DEMO_USERS) {
  const monthAgo = Date.now() - 30 * DAY;
  return {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive !== false).length,
    newUsers: users.filter(u => new Date(u.createdAt).getTime() >= monthAgo).length,
  };
}
