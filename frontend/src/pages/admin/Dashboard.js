import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserSquare2, CheckCircle2, CalendarClock, UserPlus,
  AlertTriangle, RefreshCw, ArrowRight, Ban, Activity, IndianRupee,
  ShoppingBag, CreditCard, Eye, Download, MessageSquare,
  Package, Send, Search, Bell, Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';
import {
  Card, Button, EmptyState, Skeleton, StatCard, Stagger, FadeIn, Badge, Avatar, timeAgo,
  PdfViewerModal, Modal, Field, Input, Select, Tabs,
} from '../../components/ui';
import API, { apiError, bustCache } from '../../utils/api';
import { downloadPdf } from '../../utils/pdf';
import { loadUsers, statusOf, isMembershipExpired, daysUntil, fmtDate } from './userService';

/**
 * Clean, Simple & Intuitive Admin Dashboard for Gym Owners and Managers.
 *
 * Designed for non-technical users on mobile phones, tablets, and desktop:
 * 1. 1-Tap Quick Action Buttons (Collect Payment, Add Member, Dues, Expiry Reminders)
 * 2. 4 Core Numbers (Total Income, Unpaid Dues, Active Members, Expiring This Week)
 * 3. Human-friendly Tabs: Overview, Unpaid Dues, Expiring Soon, and Store Orders
 * 4. Dedicated High-Definition Big Window PDF Viewer for member statements & invoices
 * 5. Clear separation of communications: Meta WhatsApp reminders in Members, broadcasts in Notifications
 */

function ActivityRow({ icon: Icon, tone, who, what, when, first }) {
  const color = { ok: 'var(--p-ok)', warn: 'var(--p-warn)', danger: 'var(--p-danger)', info: 'var(--p-info)' }[tone] || 'var(--p-text)';
  const soft = { ok: 'var(--p-ok-soft)', warn: 'var(--p-warn-soft)', danger: 'var(--p-danger-soft)', info: 'var(--p-info-soft)' }[tone] || 'var(--p-surface-2)';
  return (
    <li className="flex items-center gap-3 px-4 py-3" style={{ borderTop: first ? 'none' : '1px solid var(--p-border)' }}>
      <span className="ui-stat-icon flex-shrink-0" style={{ background: soft, color, width: 34, height: 34 }}>
        <Icon size={15} />
      </span>
      <span className="flex-1 min-w-0 text-[13.5px]" style={{ color: 'var(--p-text-2)' }}>
        <strong style={{ color: 'var(--p-text)', fontWeight: 600 }}>{who}</strong> {what}
      </span>
      <span className="text-[12px] flex-shrink-0" style={{ color: 'var(--p-muted)' }}>{when}</span>
    </li>
  );
}

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [dueData, setDueData] = useState({ members: [], total: 0 });
  const [orders, setOrders] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfModal, setPdfModal] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Search filter for dedicated dues/expiring tabs
  const [duesSearch, setDuesSearch] = useState('');
  const [expiringSearch, setExpiringSearch] = useState('');

  // Quick Desk Payment Modal
  const [quickPayOpen, setQuickPayOpen] = useState(false);
  const [quickPayForm, setQuickPayForm] = useState({
    member: '',
    amount: '',
    method: 'cash',
    note: 'Desk fee payment',
  });
  const [submittingPay, setSubmittingPay] = useState(false);

  const load = useCallback((force = false) => {
    setLoading(true);
    setError(null);

    Promise.allSettled([
      loadUsers({ force }),
      API.get('/payments/due'),
      API.get('/orders'),
      API.get('/analytics/summary'),
      API.get('/payments/summary'),
      API.get('/enquiries'),
    ]).then(([usersRes, dueRes, ordersRes, analyticsRes, paySumRes, enquiriesRes]) => {
      if (usersRes.status === 'fulfilled') {
        setUsers(usersRes.value || []);
      } else {
        setError(apiError(usersRes.reason, 'Could not load gym records.'));
      }

      if (dueRes.status === 'fulfilled') {
        setDueData(dueRes.value.data || { members: [], total: 0 });
      }

      if (ordersRes.status === 'fulfilled') {
        setOrders(Array.isArray(ordersRes.value.data) ? ordersRes.value.data : []);
      }

      if (analyticsRes.status === 'fulfilled') {
        setSummaryData(analyticsRes.value.data || null);
      }

      if (paySumRes.status === 'fulfilled') {
        setPaymentSummary(paySumRes.value.data || null);
      }

      if (enquiriesRes.status === 'fulfilled') {
        setEnquiries(Array.isArray(enquiriesRes.value.data) ? enquiriesRes.value.data : []);
      }
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => {
    const members = users.filter(u => u.role === 'member');
    const active = members.filter(u => ['active', 'month', 'week', 'today'].includes(statusOf(u).key));
    const expired = members.filter(isMembershipExpired);
    const upcoming = members.filter(u => {
      const d = daysUntil(u.membershipEnd);
      return d !== null && d >= 0 && d <= 7;
    });
    const monthAgo = Date.now() - 30 * 86400000;

    const pendingOrders = orders.filter(o => ['placed', 'confirmed', 'processing'].includes(o.orderStatus));
    const readyOrders = orders.filter(o => ['ready', 'ready_for_pickup'].includes(o.orderStatus));
    const newEnquiries = enquiries.filter(e => e.status === 'new');

    const totalRevenue = summaryData?.revenue ?? summaryData?.totalRevenue ?? orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + (o.totalAmount || 0), 0);
    const monthlyRevenue = summaryData?.monthlyRevenue ?? 0;
    const storeRevenue = summaryData?.storeRevenue ?? 0;
    const membershipRevenue = summaryData?.membershipRevenue ?? Math.max(0, totalRevenue - storeRevenue);

    return {
      totalUsers: users.length,
      totalMembers: members.length,
      active: active.length,
      expired: expired.length,
      upcoming,
      newThisMonth: users.filter(u => u.createdAt && new Date(u.createdAt).getTime() >= monthAgo).length,
      dueTotal: dueData.total || 0,
      dueCount: dueData.members?.length || 0,
      pendingOrdersCount: pendingOrders.length + readyOrders.length,
      readyOrdersCount: readyOrders.length,
      newEnquiriesCount: newEnquiries.length,
      totalRevenue,
      monthlyRevenue,
      storeRevenue,
      membershipRevenue,
    };
  }, [users, dueData, orders, summaryData, enquiries]);

  /** Newest accounts */
  const recentRegistrations = useMemo(
    () => [...users]
      .filter(u => u.createdAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5),
    [users],
  );

  /** Top members with unpaid dues */
  const topDues = useMemo(
    () => [...(dueData.members || [])]
      .sort((a, b) => (b.dueAmount || 0) - (a.dueAmount || 0))
      .slice(0, 6),
    [dueData],
  );

  /** Filtered dues for dedicated tab */
  const filteredDues = useMemo(() => {
    const list = dueData.members || [];
    if (!duesSearch.trim()) return list;
    const q = duesSearch.toLowerCase().trim();
    return list.filter(m =>
      (m.name || '').toLowerCase().includes(q) ||
      (m.phone || '').includes(q) ||
      (m.email || '').toLowerCase().includes(q)
    );
  }, [dueData.members, duesSearch]);

  /** Filtered expiring for dedicated tab */
  const filteredExpiring = useMemo(() => {
    const list = stats.upcoming || [];
    if (!expiringSearch.trim()) return list;
    const q = expiringSearch.toLowerCase().trim();
    return list.filter(m =>
      (m.name || '').toLowerCase().includes(q) ||
      (m.phone || '').includes(q) ||
      (m.membershipPlan || '').toLowerCase().includes(q)
    );
  }, [stats.upcoming, expiringSearch]);

  /** Recent store orders */
  const recentOrders = useMemo(
    () => [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6),
    [orders],
  );

  /** Real activity feed derived from state */
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
          icon: Ban, tone: 'danger', who: u.name, what: 'is disabled from signing in', when: 'Disabled',
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

  // Open statement in Big Window PDF Modal
  const viewStatement = (m) => {
    setPdfModal({
      title: `Account Statement: ${m.name}`,
      subtitle: `Plan: ${(m.membershipPlan || 'Standard').toUpperCase()} · Phone: ${m.phone || '—'} · Ref: STM-${m._id.slice(-6).toUpperCase()}`,
      endpoint: `/payments/${m._id}/statement`,
      fileName: `${(m.name || 'member').replace(/[^a-z0-9]/gi, '-')}-statement.pdf`,
    });
  };

  const handleDownloadStatement = (m) => {
    downloadPdf({
      endpoint: `/payments/${m._id}/statement`,
      defaultFilename: `${(m.name || 'member').replace(/[^a-z0-9]/gi, '-')}-statement.pdf`,
      toastMessage: `Statement for ${m.name} downloaded.`,
    });
  };

  // Open order invoice in Big Window PDF Modal
  const viewInvoice = (order) => {
    const num = order._id.toString().slice(-6).toUpperCase();
    const custName = order.shippingAddress?.name || order.user?.name || 'Customer';
    setPdfModal({
      title: `Invoice: Order #${num}`,
      subtitle: `Customer: ${custName} · Total: ₹${Number(order.totalAmount || 0).toLocaleString('en-IN')} · Status: ${(order.orderStatus || 'placed').toUpperCase()}`,
      endpoint: `/orders/${order._id}/invoice`,
      fileName: `invoice-ORD-${num}.pdf`,
    });
  };

  const handleDownloadInvoice = (order) => {
    const num = order._id.toString().slice(-6).toUpperCase();
    downloadPdf({
      endpoint: `/orders/${order._id}/invoice`,
      defaultFilename: `invoice-ORD-${num}.pdf`,
      toastMessage: `Invoice for Order #${num} downloaded.`,
    });
  };

  const openQuickPay = (memberId = '') => {
    const dueMember = dueData.members?.find(m => m._id === memberId);
    setQuickPayForm({
      member: memberId,
      amount: dueMember ? String(dueMember.dueAmount || '') : '',
      method: 'cash',
      note: dueMember ? 'Desk fee settlement' : 'Counter payment',
    });
    setQuickPayOpen(true);
  };

  const handleQuickPaySubmit = async () => {
    if (!quickPayForm.member) {
      toast.error('Please select which member paid.');
      return;
    }
    const amt = Number(quickPayForm.amount);
    if (!amt || amt <= 0) {
      toast.error('Please enter a payment amount greater than zero.');
      return;
    }
    setSubmittingPay(true);
    try {
      const res = await API.post('/payments', {
        member: quickPayForm.member,
        amount: amt,
        method: quickPayForm.method || 'cash',
        note: quickPayForm.note || 'Desk counter payment',
        kind: 'adjustment',
      });
      toast.success(res.data?.message || `Payment of ₹${amt.toLocaleString('en-IN')} recorded!`);
      setQuickPayOpen(false);
      bustCache('/payments');
      bustCache('/payments/due');
      bustCache('/analytics');
      load(true);
    } catch (err) {
      toast.error(apiError(err, 'Could not record payment.'));
    } finally {
      setSubmittingPay(false);
    }
  };

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

  const selectedMemberDue = dueData.members?.find(m => m._id === quickPayForm.member);

  return (
    <AdminLayout
      title="Gym Overview"
      subtitle="Today at a glance — collections, active members, renewals, and quick actions"
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => load(true)}>
            Refresh
          </Button>
          <Button variant="outline" size="sm" icon={IndianRupee} onClick={() => openQuickPay()}>
            Collect Payment
          </Button>
          <Button variant="primary" size="sm" icon={UserPlus} to="/admin/users?add=1">
            Add Member
          </Button>
        </div>
      }
    >
      <div className="space-y-6 max-w-7xl">
        {/* Simple & Helpful Quick Desk Actions — Clear, touch-friendly 1-click tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => openQuickPay()}
            className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-xl border transition-all text-center group cursor-pointer shadow-sm hover:border-[var(--p-ok)] hover:bg-[var(--p-surface-2)] min-h-[64px]"
            style={{ background: 'var(--p-surface)', borderColor: 'var(--p-border)' }}
          >
            <span className="w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105"
              style={{ background: 'var(--p-ok-soft)', color: 'var(--p-ok)' }}>
              <IndianRupee size={16} />
            </span>
            <span className="text-[12.5px] font-bold block" style={{ color: 'var(--p-text)' }}>Collect Payment</span>
            <span className="text-[11px] block mt-0.5" style={{ color: 'var(--p-muted)' }}>Quick cash / UPI</span>
          </button>

          <Link
            to="/admin/users?add=1"
            className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-xl border transition-all text-center group cursor-pointer shadow-sm hover:border-[var(--p-accent)] hover:bg-[var(--p-surface-2)] min-h-[64px]"
            style={{ background: 'var(--p-surface)', borderColor: 'var(--p-border)' }}
          >
            <span className="w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105"
              style={{ background: 'var(--p-accent-soft)', color: 'var(--p-accent)' }}>
              <UserPlus size={16} />
            </span>
            <span className="text-[12.5px] font-bold block" style={{ color: 'var(--p-text)' }}>Add Member</span>
            <span className="text-[11px] block mt-0.5" style={{ color: 'var(--p-muted)' }}>New registration</span>
          </Link>

          <button
            type="button"
            onClick={() => setActiveTab('expiring')}
            className={`flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-xl border transition-all text-center group cursor-pointer shadow-sm min-h-[64px] ${
              activeTab === 'expiring' ? 'ring-2 ring-amber-500' : 'hover:border-[var(--p-warn)] hover:bg-[var(--p-surface-2)]'
            }`}
            style={{ background: 'var(--p-surface)', borderColor: 'var(--p-border)' }}
          >
            <div className="relative mb-1.5">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
                style={{ background: 'var(--p-warn-soft)', color: 'var(--p-warn)' }}>
                <CalendarClock size={16} />
              </span>
              {stats.upcoming.length > 0 && (
                <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-500 text-white">
                  {stats.upcoming.length}
                </span>
              )}
            </div>
            <span className="text-[12.5px] font-bold block" style={{ color: 'var(--p-text)' }}>Expiring Soon</span>
            <span className="text-[11px] block mt-0.5" style={{ color: 'var(--p-muted)' }}>Next 7 days</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dues')}
            className={`flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-xl border transition-all text-center group cursor-pointer shadow-sm min-h-[64px] ${
              activeTab === 'dues' ? 'ring-2 ring-red-500' : 'hover:border-[var(--p-danger)] hover:bg-[var(--p-surface-2)]'
            }`}
            style={{ background: 'var(--p-surface)', borderColor: 'var(--p-border)' }}
          >
            <div className="relative mb-1.5">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
                style={{ background: 'var(--p-danger-soft)', color: 'var(--p-danger)' }}>
                <CreditCard size={16} />
              </span>
              {stats.dueCount > 0 && (
                <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-red-500 text-white">
                  {stats.dueCount}
                </span>
              )}
            </div>
            <span className="text-[12.5px] font-bold block" style={{ color: 'var(--p-text)' }}>Unpaid Dues</span>
            <span className="text-[11px] block mt-0.5" style={{ color: 'var(--p-muted)' }}>Pending fees</span>
          </button>

          <Link
            to="/admin/notifications"
            className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-xl border transition-all text-center group cursor-pointer shadow-sm hover:border-[var(--p-accent)] hover:bg-[var(--p-surface-2)] min-h-[64px]"
            style={{ background: 'var(--p-surface)', borderColor: 'var(--p-border)' }}
          >
            <span className="w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105"
              style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
              <Bell size={16} />
            </span>
            <span className="text-[12.5px] font-bold block" style={{ color: 'var(--p-text)' }}>Notifications</span>
            <span className="text-[11px] block mt-0.5" style={{ color: 'var(--p-muted)' }}>Send WhatsApp / Email</span>
          </Link>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-xl border transition-all text-center group cursor-pointer shadow-sm min-h-[64px] ${
              activeTab === 'orders' ? 'ring-2 ring-blue-500' : 'hover:border-[var(--p-info)] hover:bg-[var(--p-surface-2)]'
            }`}
            style={{ background: 'var(--p-surface)', borderColor: 'var(--p-border)' }}
          >
            <div className="relative mb-1.5">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
                style={{ background: 'var(--p-info-soft)', color: 'var(--p-info)' }}>
                <ShoppingBag size={16} />
              </span>
              {stats.pendingOrdersCount > 0 && (
                <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-blue-500 text-white">
                  {stats.pendingOrdersCount}
                </span>
              )}
            </div>
            <span className="text-[12.5px] font-bold block" style={{ color: 'var(--p-text)' }}>Store Orders</span>
            <span className="text-[11px] block mt-0.5" style={{ color: 'var(--p-muted)' }}>Counter pickups</span>
          </button>
        </div>

        {/* Clear Guidance Card: Where to send notifications (Zero Confusion) */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border"
          style={{ background: 'rgba(23, 107, 69, 0.06)', borderColor: 'rgba(23, 107, 69, 0.25)' }}
        >
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--p-ok)', color: '#fff' }}>
              <Sparkles size={14} />
            </span>
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--p-text)' }}>
              <strong>Official WhatsApp Alerts:</strong> Send membership renewal alerts from <strong>Members</strong> and broadcast gym announcements from <strong>Notifications</strong>.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
            <Link
              to="/admin/members?filter=week"
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border flex items-center justify-center gap-1 transition flex-1 sm:flex-initial"
              style={{ background: 'var(--p-surface)', borderColor: 'var(--p-border)', color: 'var(--p-text)' }}
            >
              <UserSquare2 size={13} style={{ color: 'var(--p-warn)' }} /> Expiry in Members
            </Link>
            <Link
              to="/admin/notifications"
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-white flex items-center justify-center gap-1 transition flex-1 sm:flex-initial"
              style={{ background: 'var(--p-accent)' }}
            >
              <Send size={13} /> Open Notifications
            </Link>
          </div>
        </div>

        {/* Primary 4 Core Numbers — Clean, non-technical, high readability */}
        <div>
          <div className="flex items-center justify-between mb-2.5 px-0.5">
            <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: 'var(--p-muted)' }}>
              Key Gym Metrics
            </span>
            <Link to="/admin/analytics" className="text-xs font-medium hover:underline flex items-center gap-1" style={{ color: 'var(--p-accent)' }}>
              Reports & Stats <ArrowRight size={12} />
            </Link>
          </div>
          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            <StatCard
              label="Total Income Collected"
              value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`}
              hint={`₹${stats.monthlyRevenue.toLocaleString('en-IN')} collected this month`}
              icon={IndianRupee}
              tone="accent"
              trend={stats.monthlyRevenue > 0 ? `+₹${stats.monthlyRevenue.toLocaleString('en-IN')} this month` : null}
              to="/admin/payments"
              loading={loading}
            />
            <StatCard
              label="Unpaid Fee Dues"
              value={`₹${stats.dueTotal.toLocaleString('en-IN')}`}
              hint={`${stats.dueCount} member${stats.dueCount !== 1 ? 's' : ''} have pending fees`}
              icon={CreditCard}
              tone={stats.dueCount > 0 ? 'danger' : 'ok'}
              trend={stats.dueCount > 0 ? `${stats.dueCount} pending` : 'All Settled'}
              onClick={() => setActiveTab('dues')}
              loading={loading}
            />
            <StatCard
              label="Active Members"
              value={stats.active}
              hint={`${stats.totalMembers} total registered members`}
              icon={UserSquare2}
              tone="ok"
              trend="Currently Active"
              to="/admin/members"
              loading={loading}
            />
            <StatCard
              label="Expiring Soon (7 Days)"
              value={stats.upcoming.length}
              hint={stats.upcoming.length > 0 ? `${stats.upcoming.length} renewals due this week` : 'No plans expiring this week'}
              icon={CalendarClock}
              tone={stats.upcoming.length > 0 ? 'warn' : 'ok'}
              trend={stats.upcoming.length > 0 ? `${stats.upcoming.length} need renewal` : 'All Good'}
              onClick={() => setActiveTab('expiring')}
              loading={loading}
            />
          </Stagger>
        </div>

        {/* Compact Secondary Summary Strip (Orders, Enquiries, New Signups) */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 rounded-xl border text-xs"
          style={{ background: 'var(--p-surface)', borderColor: 'var(--p-border)' }}
        >
          <Link
            to="/admin/orders"
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[var(--p-surface-2)] transition"
          >
            <span className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--p-info-soft)', color: 'var(--p-info)' }}>
              <ShoppingBag size={13} />
            </span>
            <div className="min-w-0">
              <span className="block font-bold text-[13px]" style={{ color: 'var(--p-text)' }}>
                {stats.pendingOrdersCount} Store Orders
              </span>
              <span className="block text-[11px] truncate" style={{ color: 'var(--p-muted)' }}>
                {stats.readyOrdersCount > 0 ? `${stats.readyOrdersCount} ready for pickup` : 'Counter pickups'}
              </span>
            </div>
          </Link>

          <Link
            to="/admin/enquiries"
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[var(--p-surface-2)] transition"
          >
            <span className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--p-ok-soft)', color: 'var(--p-ok)' }}>
              <MessageSquare size={13} />
            </span>
            <div className="min-w-0">
              <span className="block font-bold text-[13px]" style={{ color: 'var(--p-text)' }}>
                {stats.newEnquiriesCount} New Enquiries
              </span>
              <span className="block text-[11px] truncate" style={{ color: 'var(--p-muted)' }}>
                Website prospect leads
              </span>
            </div>
          </Link>

          <Link
            to="/admin/users"
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[var(--p-surface-2)] transition"
          >
            <span className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--p-accent-soft)', color: 'var(--p-accent)' }}>
              <UserPlus size={13} />
            </span>
            <div className="min-w-0">
              <span className="block font-bold text-[13px]" style={{ color: 'var(--p-text)' }}>
                {stats.newThisMonth} Joined This Month
              </span>
              <span className="block text-[11px] truncate" style={{ color: 'var(--p-muted)' }}>
                Last 30 days enrollments
              </span>
            </div>
          </Link>

          <Link
            to="/admin/orders"
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[var(--p-surface-2)] transition"
          >
            <span className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#eab308' }}>
              <Package size={13} />
            </span>
            <div className="min-w-0">
              <span className="block font-bold text-[13px]" style={{ color: 'var(--p-text)' }}>
                ₹{stats.storeRevenue.toLocaleString('en-IN')} Store Sales
              </span>
              <span className="block text-[11px] truncate" style={{ color: 'var(--p-muted)' }}>
                Supplements & gear
              </span>
            </div>
          </Link>
        </div>

        {/* Workspace Navigation Tabs — Plain, human-friendly names */}
        <div className="flex items-center justify-between border-b pb-2 pt-1 flex-wrap gap-2" style={{ borderColor: 'var(--p-border)' }}>
          <Tabs
            value={activeTab}
            onChange={setActiveTab}
            options={[
              { value: 'overview', label: 'Overview' },
              { value: 'dues', label: `Unpaid Dues (${stats.dueCount})` },
              { value: 'expiring', label: `Expiring Soon (${stats.upcoming.length})` },
              { value: 'orders', label: `Store Orders (${stats.pendingOrdersCount})` },
            ]}
          />
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--p-muted)' }}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Data Sync</span>
          </div>
        </div>

        {/* ── TAB 1: OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Action Alert Banner: Expiring Members (Immediate Attention) */}
            {!loading && stats.upcoming.length > 0 && (
              <FadeIn delay={0.04}>
                <Card
                  title={`⚠️ ${stats.upcoming.length} membership${stats.upcoming.length > 1 ? 's' : ''} expiring within 7 days`}
                  subtitle="Send official Meta WhatsApp reminders in Members, or renew plan directly below"
                  padded={false}
                  action={
                    <Button size="sm" variant="primary" icon={Send} to="/admin/members?filter=week">
                      Send Reminders in Members
                    </Button>
                  }
                >
                  <ul>
                    {stats.upcoming.slice(0, 4).map((u, i) => {
                      const left = daysUntil(u.membershipEnd);
                      return (
                        <li
                          key={u._id}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--p-surface-2)] transition"
                          style={{ borderTop: i ? '1px solid var(--p-border)' : 'none' }}
                        >
                          <Avatar name={u.name} size={34} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[14px] font-semibold truncate" style={{ color: 'var(--p-text)' }}>
                                {u.name}
                              </span>
                              <Badge tone={left <= 1 ? 'danger' : 'warn'}>
                                {left === 0 ? 'Expires Today' : `${left} day${left > 1 ? 's' : ''} left`}
                              </Badge>
                            </div>
                            <span className="block text-[12px] truncate" style={{ color: 'var(--p-muted)' }}>
                              Ends {fmtDate(u.membershipEnd)} • Plan: {(u.membershipPlan || 'Standard').toUpperCase()} • {u.phone || 'No phone'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button size="sm" variant="primary" to={`/admin/members?edit=${u._id}`}>
                              Renew Plan
                            </Button>
                            <Button size="sm" variant="outline" to="/admin/members?filter=week">
                              View
                            </Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </Card>
              </FadeIn>
            )}

            {/* Unpaid Dues & Revenue Summary Grid */}
            <div className="grid gap-5 lg:grid-cols-2">
              {/* Top Unpaid Member Fee Dues */}
              <FadeIn delay={0.06}>
                <Card
                  title="Members with Pending Fees"
                  subtitle={stats.dueCount > 0 ? `Total outstanding: ₹${stats.dueTotal.toLocaleString('en-IN')}` : 'All member fees are fully settled'}
                  padded={false}
                  action={
                    <Button size="sm" variant="outline" onClick={() => setActiveTab('dues')}>
                      View all dues ({stats.dueCount}) <ArrowRight size={14} />
                    </Button>
                  }
                >
                  {loading ? (
                    <div className="p-4 space-y-3">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} h={44} />)}</div>
                  ) : topDues.length === 0 ? (
                    <EmptyState icon={CheckCircle2} title="No outstanding dues" hint="Great news! Every active gym member's fee account is settled." />
                  ) : (
                    <ul>
                      {topDues.map((m, i) => (
                        <li
                          key={m._id}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--p-surface-2)] transition"
                          style={{ borderTop: i ? '1px solid var(--p-border)' : 'none' }}
                        >
                          <Avatar name={m.name} size={34} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[14px] font-semibold truncate" style={{ color: 'var(--p-text)' }}>
                                {m.name}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-500/15 text-red-500 border border-red-500/20">
                                ₹{Number(m.dueAmount || 0).toLocaleString('en-IN')} Due
                              </span>
                            </div>
                            <span className="block text-[12px] truncate" style={{ color: 'var(--p-muted)' }}>
                              {m.phone || 'No phone'} • Plan: {(m.membershipPlan || 'Standard').toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => openQuickPay(m._id)}
                              title="Collect Fee at Counter"
                              className="px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 font-semibold text-white bg-[var(--p-ok)] hover:opacity-90 transition cursor-pointer shadow-sm min-h-[32px]"
                            >
                              <IndianRupee size={13} /> Collect
                            </button>
                            <button
                              type="button"
                              onClick={() => viewStatement(m)}
                              title="View PDF Statement"
                              className="px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 font-medium border hover:border-[var(--p-accent)] transition cursor-pointer min-h-[32px]"
                              style={{ borderColor: 'var(--p-border)', color: 'var(--p-text-2)', background: 'var(--p-surface)' }}
                            >
                              <Eye size={13} /> Statement
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadStatement(m)}
                              title="Download Statement PDF"
                              className="p-1.5 rounded-lg text-xs flex items-center justify-center border hover:border-[var(--p-accent)] transition cursor-pointer min-h-[32px] min-w-[32px]"
                              style={{ borderColor: 'var(--p-border)', color: 'var(--p-muted)', background: 'var(--p-surface)' }}
                            >
                              <Download size={13} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </FadeIn>

              {/* Monthly Collections & Income Breakdown */}
              <FadeIn delay={0.08}>
                <Card
                  title="Income Breakdown"
                  subtitle="Membership fees vs supplement store sales"
                  padded={true}
                  action={
                    <div className="flex items-center gap-2">
                      {paymentSummary?.series?.length > 0 && (
                        <select
                          value={selectedMonth}
                          onChange={e => setSelectedMonth(e.target.value)}
                          className="text-xs px-2.5 py-1 rounded-lg border bg-[var(--p-surface)] text-[var(--p-text)] border-[var(--p-border)] cursor-pointer"
                          aria-label="Select month for income view"
                        >
                          <option value="all">All Time Combined</option>
                          {paymentSummary.series.map(s => (
                            <option key={s.month} value={s.month}>
                              {s.month} ({`₹${(s.total || 0).toLocaleString('en-IN')}`})
                            </option>
                          ))}
                        </select>
                      )}
                      <Button size="sm" variant="outline" to="/admin/payments">
                        Ledger <ArrowRight size={13} />
                      </Button>
                    </div>
                  }
                >
                  {(() => {
                    const activeSeries = selectedMonth === 'all'
                      ? null
                      : paymentSummary?.series?.find(s => s.month === selectedMonth);

                    const displayTotal = activeSeries ? activeSeries.total : stats.totalRevenue;
                    const displayMem = activeSeries ? activeSeries.membership : stats.membershipRevenue;
                    const displayStore = activeSeries ? activeSeries.store : stats.storeRevenue;
                    const memPct = displayTotal > 0 ? Math.round((displayMem / displayTotal) * 100) : 100;
                    const storePct = displayTotal > 0 ? Math.round((displayStore / displayTotal) * 100) : 0;

                    return (
                      <div className="space-y-4">
                        {/* Month-wise Trend Micro-Bars if series exists */}
                        {paymentSummary?.series?.length > 1 && (
                          <div className="p-3 rounded-xl border mb-3" style={{ background: 'var(--p-surface-2)', borderColor: 'var(--p-border)' }}>
                            <span className="text-[11px] font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--p-muted)' }}>
                              Recent Months Income
                            </span>
                            <div className="flex items-end gap-1.5 h-14 pt-1">
                              {paymentSummary.series.map(s => {
                                const maxRev = Math.max(...paymentSummary.series.map(x => x.total || 0), 1);
                                const heightPct = Math.max(12, Math.round(((s.total || 0) / maxRev) * 100));
                                const isCur = selectedMonth === s.month;
                                return (
                                  <button
                                    key={s.month}
                                    type="button"
                                    onClick={() => setSelectedMonth(s.month)}
                                    title={`${s.month}: ₹${s.total.toLocaleString('en-IN')}`}
                                    className={`flex-1 flex flex-col justify-end items-center h-full group cursor-pointer transition-all rounded ${
                                      isCur ? 'ring-2 ring-orange-500' : 'hover:opacity-80'
                                    }`}
                                  >
                                    <div
                                      className="w-full rounded-t transition-all"
                                      style={{
                                        height: `${heightPct}%`,
                                        background: isCur ? 'var(--p-accent)' : 'var(--p-border-2)',
                                      }}
                                    />
                                    <span className="text-[9px] mt-1 text-gray-400 block truncate w-full text-center">
                                      {s.month.slice(5)}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Membership bar */}
                        <div>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="font-semibold" style={{ color: 'var(--p-text-2)' }}>
                              Membership Fees {selectedMonth !== 'all' ? `(${selectedMonth})` : ''}
                            </span>
                            <span className="font-bold" style={{ color: 'var(--p-text)' }}>
                              ₹{displayMem.toLocaleString('en-IN')}
                              <span className="text-[11px] font-normal ml-1" style={{ color: 'var(--p-muted)' }}>
                                ({memPct}%)
                              </span>
                            </span>
                          </div>
                          <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--p-surface-2)' }}>
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${memPct}%`, background: 'var(--p-accent)' }}
                            />
                          </div>
                        </div>

                        {/* Store bar */}
                        <div>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="font-semibold" style={{ color: 'var(--p-text-2)' }}>
                              Supplements & Shop {selectedMonth !== 'all' ? `(${selectedMonth})` : ''}
                            </span>
                            <span className="font-bold" style={{ color: 'var(--p-text)' }}>
                              ₹{displayStore.toLocaleString('en-IN')}
                              <span className="text-[11px] font-normal ml-1" style={{ color: 'var(--p-muted)' }}>
                                ({storePct}%)
                              </span>
                            </span>
                          </div>
                          <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--p-surface-2)' }}>
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${storePct}%`, background: 'var(--p-ok)' }}
                            />
                          </div>
                        </div>

                        {/* Summary Metric Boxes */}
                        <div className="pt-3 border-t grid grid-cols-2 gap-3" style={{ borderColor: 'var(--p-border)' }}>
                          <div className="p-3.5 rounded-xl border text-center" style={{ borderColor: 'var(--p-border)', background: 'var(--p-surface-2)' }}>
                            <span className="text-[11px] font-semibold block uppercase tracking-wider" style={{ color: 'var(--p-muted)' }}>
                              {selectedMonth === 'all' ? 'This Month Volume' : `${selectedMonth} Total`}
                            </span>
                            <span className="text-[18px] font-bold block mt-0.5" style={{ color: 'var(--p-text)' }}>
                              ₹{(selectedMonth === 'all' ? stats.monthlyRevenue : displayTotal).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="p-3.5 rounded-xl border text-center" style={{ borderColor: 'var(--p-border)', background: 'var(--p-surface-2)' }}>
                            <span className="text-[11px] font-semibold block uppercase tracking-wider" style={{ color: 'var(--p-muted)' }}>
                              Unpaid Dues
                            </span>
                            <span className="text-[18px] font-bold block mt-0.5" style={{ color: 'var(--p-danger)' }}>
                              ₹{stats.dueTotal.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </Card>
              </FadeIn>
            </div>

            {/* Recent Registrations & Gym Activity */}
            <div className="grid gap-5 lg:grid-cols-2">
              <FadeIn delay={0.1}>
                <Card
                  title="New Members Joined"
                  subtitle="Recently enrolled members in the gym"
                  padded={false}
                  action={
                    <Button size="sm" variant="outline" to="/admin/members">
                      All members <ArrowRight size={14} />
                    </Button>
                  }
                >
                  {loading ? (
                    <div className="p-4 space-y-3">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} h={44} />)}</div>
                  ) : recentRegistrations.length === 0 ? (
                    <EmptyState icon={UserPlus} title="No members yet" hint="Add your first member to see them here.">
                      <Button variant="primary" icon={UserPlus} to="/admin/users?add=1">Add member</Button>
                    </EmptyState>
                  ) : (
                    <ul>
                      {recentRegistrations.map((u, i) => (
                        <li
                          key={u._id}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--p-surface-2)] transition"
                          style={{ borderTop: i ? '1px solid var(--p-border)' : 'none' }}
                        >
                          <Avatar name={u.name} size={34} />
                          <span className="flex-1 min-w-0">
                            <span className="block text-[14px] font-semibold truncate" style={{ color: 'var(--p-text)' }}>{u.name}</span>
                            <span className="block text-[12px] truncate" style={{ color: 'var(--p-muted)' }}>{u.email || u.phone || 'No contact'} • Role: {u.role}</span>
                          </span>
                          <span className="text-[12px] flex-shrink-0" style={{ color: 'var(--p-muted)' }}>{timeAgo(u.createdAt)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </FadeIn>

              <FadeIn delay={0.12}>
                <Card title="Recent Gym Activity" subtitle="Real-time log of joins and member updates" padded={false}>
                  {loading ? (
                    <div className="p-4 space-y-3">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} h={44} />)}</div>
                  ) : activity.length === 0 ? (
                    <EmptyState icon={Activity} title="No activity recorded" hint="Gym operational events will show up here automatically." />
                  ) : (
                    <ul>{activity.map((e, i) => <ActivityRow key={e.id} {...e} first={i === 0} />)}</ul>
                  )}
                </Card>
              </FadeIn>
            </div>
          </div>
        )}

        {/* ── TAB 2: UNPAID DUES ── */}
        {activeTab === 'dues' && (
          <FadeIn delay={0.04}>
            <Card
              title="Unpaid Fee Dues & Settlements"
              subtitle={`Total outstanding: ₹${stats.dueTotal.toLocaleString('en-IN')} from ${stats.dueCount} members`}
              padded={false}
              action={
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="primary" icon={IndianRupee} onClick={() => openQuickPay()}>
                    Collect Payment
                  </Button>
                  <Button size="sm" variant="outline" to="/admin/payments?tab=dues">
                    Full Ledger <ArrowRight size={13} />
                  </Button>
                </div>
              }
            >
              <div className="p-3 border-b flex items-center gap-3" style={{ borderColor: 'var(--p-border)' }}>
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--p-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search member by name or phone..."
                    value={duesSearch}
                    onChange={e => setDuesSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border bg-[var(--p-surface)] text-[var(--p-text)] border-[var(--p-border)] focus:outline-none focus:ring-1 focus:ring-[var(--p-accent)]"
                  />
                </div>
                <span className="text-xs font-medium" style={{ color: 'var(--p-muted)' }}>
                  {filteredDues.length} {filteredDues.length === 1 ? 'member' : 'members'}
                </span>
              </div>

              {loading ? (
                <div className="p-4 space-y-3">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} h={48} />)}</div>
              ) : filteredDues.length === 0 ? (
                <EmptyState
                  icon={CheckCircle2}
                  title={duesSearch ? 'No members found' : 'No outstanding dues'}
                  hint={duesSearch ? 'Try a different search keyword.' : 'All gym members have fully settled fees.'}
                />
              ) : (
                <ul>
                  {filteredDues.map((m, i) => (
                    <li
                      key={m._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-[var(--p-surface-2)] transition"
                      style={{ borderTop: i ? '1px solid var(--p-border)' : 'none' }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={m.name} size={38} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[14.5px] font-bold truncate" style={{ color: 'var(--p-text)' }}>
                              {m.name}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[11.5px] font-bold bg-red-500/15 text-red-500 border border-red-500/20">
                              ₹{Number(m.dueAmount || 0).toLocaleString('en-IN')} Due
                            </span>
                          </div>
                          <span className="block text-[12px] truncate mt-0.5" style={{ color: 'var(--p-muted)' }}>
                            {m.phone || 'No phone'} • Plan: {(m.membershipPlan || 'Standard').toUpperCase()} • Ref: #{m._id.slice(-6).toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => openQuickPay(m._id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[var(--p-ok)] hover:opacity-90 transition flex items-center gap-1.5 cursor-pointer shadow-sm min-h-[34px]"
                        >
                          <IndianRupee size={13} /> Collect Fee
                        </button>
                        <button
                          type="button"
                          onClick={() => viewStatement(m)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border hover:border-[var(--p-accent)] transition flex items-center gap-1.5 cursor-pointer min-h-[34px]"
                          style={{ borderColor: 'var(--p-border)', color: 'var(--p-text-2)', background: 'var(--p-surface)' }}
                        >
                          <Eye size={13} /> Statement
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadStatement(m)}
                          className="p-2 rounded-lg text-xs flex items-center justify-center border hover:border-[var(--p-accent)] transition cursor-pointer min-h-[34px] min-w-[34px]"
                          style={{ borderColor: 'var(--p-border)', color: 'var(--p-muted)', background: 'var(--p-surface)' }}
                        >
                          <Download size={13} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </FadeIn>
        )}

        {/* ── TAB 3: EXPIRING SOON ── */}
        {activeTab === 'expiring' && (
          <FadeIn delay={0.04}>
            <Card
              title="Memberships Expiring Soon (Next 7 Days)"
              subtitle={`${stats.upcoming.length} member${stats.upcoming.length !== 1 ? 's' : ''} require plan renewal`}
              padded={false}
              action={
                <Button size="sm" variant="primary" icon={Send} to="/admin/members?filter=week">
                  Open in Members (Meta WhatsApp)
                </Button>
              }
            >
              {/* Guidance alert */}
              <div
                className="p-3.5 m-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                style={{ background: 'rgba(234, 179, 8, 0.08)', borderColor: 'rgba(234, 179, 8, 0.25)' }}
              >
                <div className="flex items-center gap-2">
                  <CalendarClock size={16} className="text-amber-500 flex-shrink-0" />
                  <span style={{ color: 'var(--p-text)' }}>
                    Need to send automated WhatsApp reminder messages? Click below to dispatch pre-approved Meta alerts directly from the <strong>Members</strong> section.
                  </span>
                </div>
                <Link
                  to="/admin/members?filter=week"
                  className="px-3 py-1.5 rounded-lg font-bold text-white bg-amber-500 hover:bg-amber-600 transition flex items-center gap-1 flex-shrink-0 justify-center"
                >
                  <Send size={12} /> Send Reminders in Members
                </Link>
              </div>

              <div className="p-3 border-b flex items-center gap-3" style={{ borderColor: 'var(--p-border)' }}>
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--p-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search expiring members by name or phone..."
                    value={expiringSearch}
                    onChange={e => setExpiringSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border bg-[var(--p-surface)] text-[var(--p-text)] border-[var(--p-border)] focus:outline-none focus:ring-1 focus:ring-[var(--p-accent)]"
                  />
                </div>
                <span className="text-xs font-medium" style={{ color: 'var(--p-muted)' }}>
                  {filteredExpiring.length} {filteredExpiring.length === 1 ? 'member' : 'members'}
                </span>
              </div>

              {loading ? (
                <div className="p-4 space-y-3">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} h={48} />)}</div>
              ) : filteredExpiring.length === 0 ? (
                <EmptyState
                  icon={CheckCircle2}
                  title={expiringSearch ? 'No members found' : 'No memberships expiring soon'}
                  hint={expiringSearch ? 'Try a different search term.' : 'All members have active plans extending beyond the next 7 days.'}
                />
              ) : (
                <ul>
                  {filteredExpiring.map((u, i) => {
                    const left = daysUntil(u.membershipEnd);
                    return (
                      <li
                        key={u._id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-[var(--p-surface-2)] transition"
                        style={{ borderTop: i ? '1px solid var(--p-border)' : 'none' }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar name={u.name} size={38} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[14.5px] font-bold truncate" style={{ color: 'var(--p-text)' }}>
                                {u.name}
                              </span>
                              <Badge tone={left <= 1 ? 'danger' : 'warn'}>
                                {left === 0 ? 'Expires Today' : `${left} day${left > 1 ? 's' : ''} left`}
                              </Badge>
                            </div>
                            <span className="block text-[12px] truncate mt-0.5" style={{ color: 'var(--p-muted)' }}>
                              Ends {fmtDate(u.membershipEnd)} • Plan: {(u.membershipPlan || 'Standard').toUpperCase()} • Phone: {u.phone || 'No phone'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                          <Button size="sm" variant="primary" to={`/admin/members?edit=${u._id}`}>
                            Renew Plan
                          </Button>
                          <Button size="sm" variant="outline" to="/admin/members?filter=week">
                            Open in Members
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </FadeIn>
        )}

        {/* ── TAB 4: STORE ORDERS ── */}
        {activeTab === 'orders' && (
          <FadeIn delay={0.04}>
            <Card
              title="Store & Counter Orders"
              subtitle={`${stats.pendingOrdersCount} orders requiring counter pickup or fulfillment`}
              padded={false}
              action={
                <Button size="sm" variant="outline" to="/admin/orders">
                  All orders board <ArrowRight size={14} />
                </Button>
              }
            >
              {loading ? (
                <div className="p-4 space-y-3">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} h={48} />)}</div>
              ) : recentOrders.length === 0 ? (
                <EmptyState icon={ShoppingBag} title="No orders yet" hint="Member supplement and merchandise purchases will show here." />
              ) : (
                <ul>
                  {recentOrders.map((order, i) => {
                    const orderNum = order._id.toString().slice(-6).toUpperCase();
                    const statusTone = {
                      placed: 'warn',
                      confirmed: 'info',
                      processing: 'info',
                      ready: 'accent',
                      ready_for_pickup: 'accent',
                      collected: 'ok',
                      delivered: 'ok',
                      cancelled: 'danger',
                    }[order.orderStatus] || 'neutral';

                    return (
                      <li
                        key={order._id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-[var(--p-surface-2)] transition"
                        style={{ borderTop: i ? '1px solid var(--p-border)' : 'none' }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="ui-stat-icon flex-shrink-0" style={{ background: 'var(--p-accent-soft)', color: 'var(--p-accent)', width: 38, height: 38 }}>
                            <Package size={17} />
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[14px] font-bold" style={{ color: 'var(--p-text)' }}>
                                #{orderNum}
                              </span>
                              <span className="text-[13.5px] font-medium truncate" style={{ color: 'var(--p-text-2)' }}>
                                {order.shippingAddress?.name || order.user?.name || 'Walk-in Customer'}
                              </span>
                              <Badge tone={statusTone}>
                                {order.orderStatus?.replace(/_/g, ' ') || 'placed'}
                              </Badge>
                            </div>
                            <span className="block text-[12px] mt-0.5" style={{ color: 'var(--p-muted)' }}>
                              {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''} • ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')} • {timeAgo(order.createdAt)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => viewInvoice(order)}
                            className="px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 font-semibold border hover:border-[var(--p-accent)] transition cursor-pointer min-h-[34px]"
                            style={{ borderColor: 'var(--p-border)', color: 'var(--p-text-2)', background: 'var(--p-surface)' }}
                          >
                            <Eye size={13} /> Invoice
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadInvoice(order)}
                            className="p-2 rounded-lg text-xs flex items-center justify-center border hover:border-[var(--p-accent)] transition cursor-pointer min-h-[34px] min-w-[34px]"
                            style={{ borderColor: 'var(--p-border)', color: 'var(--p-muted)', background: 'var(--p-surface)' }}
                          >
                            <Download size={13} />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </FadeIn>
        )}

        <footer className="text-center pt-2 pb-4 text-xs" style={{ color: 'var(--p-muted)' }}>
          FitNation Gym • Easy fee settlements, official Meta WhatsApp notifications, and members management.
        </footer>
      </div>

      {/* Quick Collect Desk Payment Modal — Simple, Touch-Friendly for Non-Tech Admin */}
      {quickPayOpen && (
        <Modal
          title="Collect Member Payment"
          onClose={() => setQuickPayOpen(false)}
          width={480}
          footer={
            <>
              <Button onClick={() => setQuickPayOpen(false)} disabled={submittingPay}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleQuickPaySubmit} loading={submittingPay}>
                {quickPayForm.amount ? `Record ₹${Number(quickPayForm.amount).toLocaleString('en-IN')}` : 'Record Payment'}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Field label="Select Member" required hint="Choose the gym member who is paying">
              <Select
                value={quickPayForm.member}
                onChange={e => {
                  const mId = e.target.value;
                  const foundDue = dueData.members?.find(m => m._id === mId);
                  setQuickPayForm(prev => ({
                    ...prev,
                    member: mId,
                    amount: foundDue ? String(foundDue.dueAmount || '') : prev.amount,
                  }));
                }}
              >
                <option value="">-- Choose Member --</option>
                {users.filter(u => u.role === 'member').map(m => {
                  const hasDue = dueData.members?.find(d => d._id === m._id);
                  return (
                    <option key={m._id} value={m._id}>
                      {m.name} {hasDue ? `(₹${hasDue.dueAmount} Due)` : ''} - {m.phone || m.email || ''}
                    </option>
                  );
                })}
              </Select>
            </Field>

            {selectedMemberDue && (
              <div className="p-3 rounded-lg border flex items-center justify-between text-xs"
                style={{ background: 'var(--p-danger-soft)', borderColor: 'rgba(239, 68, 68, 0.25)', color: 'var(--p-danger)' }}>
                <span>Outstanding Due on Account:</span>
                <span className="font-bold text-[14px]">₹{Number(selectedMemberDue.dueAmount || 0).toLocaleString('en-IN')}</span>
              </div>
            )}

            <div>
              <Field label="Payment Amount (₹)" required hint="Amount received from member">
                <Input
                  type="number"
                  min="1"
                  placeholder="e.g. 1500"
                  value={quickPayForm.amount}
                  onChange={e => setQuickPayForm(prev => ({ ...prev, amount: e.target.value }))}
                />
              </Field>

              {/* Quick Amount Presets */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {selectedMemberDue && (
                  <button
                    type="button"
                    onClick={() => setQuickPayForm(prev => ({ ...prev, amount: String(selectedMemberDue.dueAmount || '') }))}
                    className="px-2.5 py-1 rounded text-xs font-semibold border transition cursor-pointer"
                    style={{ background: 'var(--p-surface-2)', borderColor: 'var(--p-border)', color: 'var(--p-danger)' }}
                  >
                    Full Due (₹{selectedMemberDue.dueAmount})
                  </button>
                )}
                {[500, 1000, 1500, 2000, 3000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setQuickPayForm(prev => ({ ...prev, amount: String(amt) }))}
                    className="px-2.5 py-1 rounded text-xs font-semibold border transition cursor-pointer"
                    style={{ background: 'var(--p-surface-2)', borderColor: 'var(--p-border)', color: 'var(--p-text-2)' }}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Payment Mode Selector */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--p-text)' }}>
                Payment Method
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 'cash', label: 'Cash' },
                  { value: 'upi', label: 'UPI / GPay' },
                  { value: 'card', label: 'Card (POS)' },
                  { value: 'online', label: 'Online' },
                ].map(opt => {
                  const sel = quickPayForm.method === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setQuickPayForm(prev => ({ ...prev, method: opt.value }))}
                      className={`py-2 px-1 rounded-lg text-xs font-semibold border transition text-center cursor-pointer ${
                        sel ? 'ring-2 ring-[var(--p-accent)] border-[var(--p-accent)] text-white' : 'hover:border-[var(--p-border-2)]'
                      }`}
                      style={{
                        background: sel ? 'var(--p-accent)' : 'var(--p-surface-2)',
                        color: sel ? '#fff' : 'var(--p-text)',
                        borderColor: 'var(--p-border)',
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <Field label="Receipt Note" hint="Optional reference or remarks">
              <Input
                placeholder="e.g. Monthly fee / Counter settlement"
                value={quickPayForm.note}
                onChange={e => setQuickPayForm(prev => ({ ...prev, note: e.target.value }))}
              />
            </Field>
          </div>
        </Modal>
      )}

      {/* High-Definition Big Window PDF Preview Modal */}
      {pdfModal && (
        <PdfViewerModal
          title={pdfModal.title}
          subtitle={pdfModal.subtitle}
          endpoint={pdfModal.endpoint}
          fileName={pdfModal.fileName}
          onClose={() => setPdfModal(null)}
        />
      )}
    </AdminLayout>
  );
}
