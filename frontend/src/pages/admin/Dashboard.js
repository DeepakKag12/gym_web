import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserSquare2, CheckCircle2, CalendarClock, UserPlus,
  AlertTriangle, RefreshCw, ArrowRight, Ban, Activity, IndianRupee,
  ShoppingBag, CreditCard, Eye, Download, MessageSquare,
  Package, TrendingUp,
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
 * Professional Gym Management Cockpit & Real-time Operations Dashboard.
 *
 * Clean, organized architecture:
 * 1. Actionable Quick Desk Toolbar (Payment collection, New member, Due settlements)
 * 2. Spacious Core Financial & Athlete Health KPIs (Zero overlapping, high-contrast)
 * 3. Operational Counter & Store Fulfillment Metrics
 * 4. Contextual Tabs: Overview, Financials & Dues, Counter Orders, and Expiring Renewals
 * 5. Instant Big Window PDF Viewer for member account statements and store invoices
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

  return (
    <AdminLayout
      title="Gym Operations Dashboard"
      subtitle="Real-time financial cockpit, athlete roster, pending dues, and store fulfillment"
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
        {/* Quick Actions Navigation Strip — Clean Non-Overlapping Pills */}
        <div
          className="flex flex-wrap items-center gap-2 p-3 rounded-xl border shadow-sm"
          style={{ background: 'var(--p-surface)', borderColor: 'var(--p-border)' }}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider px-1 text-gray-500" style={{ color: 'var(--p-muted)' }}>
            Quick Desk:
          </span>
          <button
            onClick={() => openQuickPay()}
            className="ui-action-chip hover:border-[var(--p-ok)] font-semibold cursor-pointer"
          >
            <IndianRupee size={14} style={{ color: 'var(--p-ok)' }} /> Collect Payment
          </button>
          <Link
            to="/admin/users?add=1"
            className="ui-action-chip hover:border-[var(--p-accent)] cursor-pointer"
          >
            <UserPlus size={14} style={{ color: 'var(--p-accent)' }} /> Add Member
          </Link>
          <Link
            to="/admin/payments?tab=dues"
            className="ui-action-chip hover:border-[var(--p-danger)] cursor-pointer"
          >
            <CreditCard size={14} style={{ color: 'var(--p-danger)' }} /> Collect Fee Dues
            {stats.dueCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10.5px] bg-red-500/20 text-red-500 font-bold">
                {stats.dueCount}
              </span>
            )}
          </Link>
          <Link
            to="/admin/orders"
            className="ui-action-chip hover:border-[var(--p-info)] cursor-pointer"
          >
            <ShoppingBag size={14} style={{ color: 'var(--p-info)' }} /> Store Orders
            {stats.pendingOrdersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10.5px] bg-blue-500/20 text-blue-500 font-bold">
                {stats.pendingOrdersCount}
              </span>
            )}
          </Link>
          <Link
            to="/admin/members?filter=week"
            className="ui-action-chip hover:border-[var(--p-warn)] cursor-pointer"
          >
            <CalendarClock size={14} style={{ color: 'var(--p-warn)' }} /> Expiring Soon
            {stats.upcoming.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10.5px] bg-amber-500/20 text-amber-500 font-bold">
                {stats.upcoming.length}
              </span>
            )}
          </Link>
          <Link
            to="/admin/enquiries"
            className="ui-action-chip hover:border-[var(--p-ok)] cursor-pointer"
          >
            <MessageSquare size={14} style={{ color: 'var(--p-ok)' }} /> Leads & Enquiries
            {stats.newEnquiriesCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10.5px] bg-emerald-500/20 text-emerald-500 font-bold">
                {stats.newEnquiriesCount}
              </span>
            )}
          </Link>
          <Link
            to="/admin/analytics"
            className="ui-action-chip hover:border-[var(--p-accent)] cursor-pointer"
          >
            <TrendingUp size={14} style={{ color: 'var(--p-accent)' }} /> Full Analytics
          </Link>
        </div>

        {/* Primary Core Health KPIs — Spacious 4-Column Grid (Zero Overlapping) */}
        <div>
          <div className="flex items-center justify-between mb-2.5 px-0.5">
            <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: 'var(--p-muted)' }}>
              Financial & Member Health
            </span>
            <Link to="/admin/analytics" className="text-xs font-medium hover:underline flex items-center gap-1" style={{ color: 'var(--p-accent)' }}>
              Deep Dive Analytics <ArrowRight size={12} />
            </Link>
          </div>
          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            <StatCard
              label="Total Revenue"
              value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`}
              hint={`₹${stats.monthlyRevenue.toLocaleString('en-IN')} this month`}
              icon={IndianRupee}
              tone="accent"
              trend={stats.monthlyRevenue > 0 ? `+₹${stats.monthlyRevenue.toLocaleString('en-IN')}/mo` : null}
              to="/admin/payments"
              loading={loading}
            />
            <StatCard
              label="Pending Fee Dues"
              value={`₹${stats.dueTotal.toLocaleString('en-IN')}`}
              hint={`${stats.dueCount} member${stats.dueCount !== 1 ? 's' : ''} with unpaid fee`}
              icon={CreditCard}
              tone={stats.dueCount > 0 ? 'danger' : 'ok'}
              trend={stats.dueCount > 0 ? `${stats.dueCount} pending` : 'All Clear'}
              to="/admin/payments?tab=dues"
              loading={loading}
            />
            <StatCard
              label="Active Athletes"
              value={stats.active}
              hint={`${stats.totalMembers} total registered members`}
              icon={UserSquare2}
              tone="ok"
              trend="Floor Active"
              to="/admin/members"
              loading={loading}
            />
            <StatCard
              label="Expiring Soon"
              value={stats.upcoming.length}
              hint="Within the next 7 days"
              icon={CalendarClock}
              tone={stats.upcoming.length > 0 ? 'warn' : 'ok'}
              trend={stats.upcoming.length > 0 ? `${stats.upcoming.length} urgent` : 'No Expiries'}
              to="/admin/members?filter=week"
              loading={loading}
            />
          </Stagger>
        </div>

        {/* Secondary Operations KPIs — Spacious 4-Column Grid */}
        <div>
          <div className="flex items-center justify-between mb-2.5 px-0.5">
            <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: 'var(--p-muted)' }}>
              Operations & Store Counters
            </span>
            <span className="text-xs" style={{ color: 'var(--p-muted)' }}>
              Automated Counter Sync
            </span>
          </div>
          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            <StatCard
              label="Store Orders"
              value={stats.pendingOrdersCount}
              hint={stats.readyOrdersCount > 0 ? `${stats.readyOrdersCount} ready for pickup` : 'Counter pickup orders'}
              icon={ShoppingBag}
              tone="info"
              trend="Counter Pickup"
              to="/admin/orders"
              loading={loading}
            />
            <StatCard
              label="New Signups (30d)"
              value={stats.newThisMonth}
              hint="Enrolled in last 30 days"
              icon={UserPlus}
              tone="ok"
              trend={stats.newThisMonth > 0 ? `+${stats.newThisMonth}` : null}
              to="/admin/users"
              loading={loading}
            />
            <StatCard
              label="Website Inquiries"
              value={stats.newEnquiriesCount}
              hint="Prospect leads awaiting reply"
              icon={MessageSquare}
              tone={stats.newEnquiriesCount > 0 ? 'accent' : 'ok'}
              trend={stats.newEnquiriesCount > 0 ? `${stats.newEnquiriesCount} new` : 'Resolved'}
              to="/admin/enquiries"
              loading={loading}
            />
            <StatCard
              label="Store Sales Volume"
              value={`₹${stats.storeRevenue.toLocaleString('en-IN')}`}
              hint="Supplements & fitness gear"
              icon={Package}
              tone="info"
              trend="Retail Gear"
              to="/admin/orders"
              loading={loading}
            />
          </Stagger>
        </div>

        {/* Workspace Navigation Tabs */}
        <div className="flex items-center justify-between border-b pb-2 pt-1 flex-wrap gap-2" style={{ borderColor: 'var(--p-border)' }}>
          <Tabs
            value={activeTab}
            onChange={setActiveTab}
            options={[
              { value: 'overview', label: 'Overview Cockpit' },
              { value: 'financials', label: `Dues & Ledger (${stats.dueCount})` },
              { value: 'orders', label: `Store Pickups (${stats.pendingOrdersCount})` },
              { value: 'expiring', label: `Expiring Renewals (${stats.upcoming.length})` },
            ]}
          />
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--p-muted)' }}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sync Active</span>
          </div>
        </div>

        {/* Critical Action Banner: Expiring Members (Immediate Attention) */}
        {!loading && stats.upcoming.length > 0 && (activeTab === 'overview' || activeTab === 'expiring') && (
          <FadeIn delay={0.04}>
            <Card
              title={`${stats.upcoming.length} membership${stats.upcoming.length > 1 ? 's' : ''} expiring within 7 days`}
              subtitle="Follow up via phone or WhatsApp, or renew directly with one click"
              padded={false}
              action={
                <Button size="sm" variant="outline" to="/admin/members?filter=week">
                  View all in Members <ArrowRight size={14} />
                </Button>
              }
            >
              <ul>
                {stats.upcoming.slice(0, 5).map((u, i) => {
                  const left = daysUntil(u.membershipEnd);
                  const cleanPhone = (u.phone || '').replace(/[^0-9]/g, '');
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
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/${cleanPhone}?text=Hi%20${encodeURIComponent(u.name)},%20your%20FitNation%20gym%20membership%20is%20expiring%20soon.%20Would%20you%20like%20to%20renew?`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 transition"
                            title="Send WhatsApp renewal message"
                          >
                            WhatsApp
                          </a>
                        )}
                        <Button size="sm" variant="primary" to={`/admin/members?edit=${u._id}`}>
                          Renew Plan
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </FadeIn>
        )}

        {/* Section: Unpaid Dues & Revenue Ledger */}
        {(activeTab === 'overview' || activeTab === 'financials') && (
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Unpaid Member Fee Dues */}
            <FadeIn delay={0.06}>
              <Card
                title="Unpaid fee dues & settlements"
                subtitle={stats.dueCount > 0 ? `Total outstanding: ₹${stats.dueTotal.toLocaleString('en-IN')}` : 'All member fees are fully settled'}
                padded={false}
                action={
                  <Button size="sm" variant="outline" to="/admin/payments?tab=dues">
                    Dues table <ArrowRight size={14} />
                  </Button>
                }
              >
                {loading ? (
                  <div className="p-4 space-y-3">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} h={44} />)}</div>
                ) : topDues.length === 0 ? (
                  <EmptyState icon={CheckCircle2} title="No outstanding dues" hint="Every active gym member's fee account is settled." />
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
                            onClick={() => openQuickPay(m._id)}
                            title="Collect Fee at Counter"
                            className="px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 font-semibold text-white bg-[var(--p-ok)] hover:opacity-90 transition cursor-pointer shadow-sm"
                          >
                            <IndianRupee size={13} /> Collect
                          </button>
                          <button
                            onClick={() => viewStatement(m)}
                            title="View PDF Statement in Big Window"
                            className="px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 font-medium border hover:border-[var(--p-accent)] transition cursor-pointer"
                            style={{ borderColor: 'var(--p-border)', color: 'var(--p-text-2)', background: 'var(--p-surface)' }}
                          >
                            <Eye size={13} /> Statement
                          </button>
                          <button
                            onClick={() => handleDownloadStatement(m)}
                            title="Download Statement PDF"
                            className="p-1.5 rounded-lg text-xs flex items-center justify-center border hover:border-[var(--p-accent)] transition cursor-pointer"
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

            {/* Revenue Stream Breakdown & Month-wise Analytics */}
            <FadeIn delay={0.08}>
              <Card
                title="Revenue Streams & Month-wise Collections"
                subtitle="Filter income by specific calendar month or view all-time ledger"
                padded={true}
                action={
                  <div className="flex items-center gap-2">
                    {paymentSummary?.series?.length > 0 && (
                      <select
                        value={selectedMonth}
                        onChange={e => setSelectedMonth(e.target.value)}
                        className="text-xs px-2.5 py-1 rounded-lg border bg-[var(--p-surface)] text-[var(--p-text)] border-[var(--p-border)] cursor-pointer"
                        aria-label="Select month for revenue view"
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
                      Full Ledger <ArrowRight size={13} />
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
                            12-Month Performance Trend
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
                            style={{
                              width: `${memPct}%`,
                              background: 'var(--p-accent)',
                            }}
                          />
                        </div>
                      </div>

                      {/* Store bar */}
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="font-semibold" style={{ color: 'var(--p-text-2)' }}>
                            Supplement & Counter Shop {selectedMonth !== 'all' ? `(${selectedMonth})` : ''}
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
                            style={{
                              width: `${storePct}%`,
                              background: 'var(--p-ok)',
                            }}
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
                            Pending Dues
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
        )}

        {/* Section: Counter Fulfillment & Store Orders */}
        {(activeTab === 'overview' || activeTab === 'orders') && (
          <FadeIn delay={0.09}>
            <Card
              title="Recent supplement & store counter orders"
              subtitle={stats.pendingOrdersCount > 0 ? `${stats.pendingOrdersCount} orders requiring packing or pickup` : 'Counter store order history'}
              padded={false}
              action={
                <Button size="sm" variant="outline" to="/admin/orders">
                  All orders board <ArrowRight size={14} />
                </Button>
              }
            >
              {loading ? (
                <div className="p-4 space-y-3">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} h={44} />)}</div>
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
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--p-surface-2)] transition"
                        style={{ borderTop: i ? '1px solid var(--p-border)' : 'none' }}
                      >
                        <span className="ui-stat-icon flex-shrink-0" style={{ background: 'var(--p-accent-soft)', color: 'var(--p-accent)', width: 34, height: 34 }}>
                          <Package size={16} />
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[13.5px] font-bold" style={{ color: 'var(--p-text)' }}>
                              #{orderNum}
                            </span>
                            <span className="text-[13px] font-medium truncate" style={{ color: 'var(--p-text-2)' }}>
                              {order.shippingAddress?.name || order.user?.name || 'Walk-in Customer'}
                            </span>
                            <Badge tone={statusTone}>
                              {order.orderStatus?.replace(/_/g, ' ') || 'placed'}
                            </Badge>
                          </div>
                          <span className="block text-[12px]" style={{ color: 'var(--p-muted)' }}>
                            {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''} • ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')} • {timeAgo(order.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => viewInvoice(order)}
                            title="View PDF Invoice in Big Window"
                            className="px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 font-semibold border hover:border-[var(--p-accent)] transition cursor-pointer"
                            style={{ borderColor: 'var(--p-border)', color: 'var(--p-text-2)', background: 'var(--p-surface)' }}
                          >
                            <Eye size={13} /> Invoice
                          </button>
                          <button
                            onClick={() => handleDownloadInvoice(order)}
                            title="Download PDF Invoice"
                            className="p-1.5 rounded-lg text-xs flex items-center justify-center border hover:border-[var(--p-accent)] transition cursor-pointer"
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

        {/* Section: Recent Registrations & Live Floor Activity */}
        {activeTab === 'overview' && (
          <div className="grid gap-5 lg:grid-cols-2">
            <FadeIn delay={0.1}>
              <Card
                title="New member registrations"
                subtitle="Athletes and trainees who recently enrolled"
                padded={false}
                action={
                  <Button size="sm" variant="outline" to="/admin/users">
                    All users <ArrowRight size={14} />
                  </Button>
                }
              >
                {loading ? (
                  <div className="p-4 space-y-3">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} h={44} />)}</div>
                ) : recentRegistrations.length === 0 ? (
                  <EmptyState icon={UserPlus} title="No users yet" hint="Add your first member to see them here.">
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
              <Card title="Live gym operations activity" subtitle="Real-time log of joins, fee events, and floor changes" padded={false}>
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
        )}

        <footer className="text-center pt-2 pb-4 text-xs" style={{ color: 'var(--p-muted)' }}>
          FitNation Gym Engine • Synchronized billing, instant PDF statements, counter store orders, and active athlete roster.
        </footer>
      </div>

      {/* Quick Collect Desk Payment Modal */}
      {quickPayOpen && (
        <Modal
          title="Collect Desk Payment / Settle Due"
          onClose={() => setQuickPayOpen(false)}
          width={480}
          footer={
            <>
              <Button onClick={() => setQuickPayOpen(false)} disabled={submittingPay}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleQuickPaySubmit} loading={submittingPay}>
                Record Payment
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Field label="Select Gym Member" required hint="Choose the member who made a payment">
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

            <div className="grid grid-cols-2 gap-3">
              <Field label="Amount (₹)" required hint="Received amount">
                <Input
                  type="number"
                  min="1"
                  placeholder="e.g. 1500"
                  value={quickPayForm.amount}
                  onChange={e => setQuickPayForm(prev => ({ ...prev, amount: e.target.value }))}
                />
              </Field>

              <Field label="Payment Mode">
                <Select
                  value={quickPayForm.method}
                  onChange={e => setQuickPayForm(prev => ({ ...prev, method: e.target.value }))}
                >
                  <option value="cash">Cash (Counter)</option>
                  <option value="upi">UPI (GPay/PhonePe)</option>
                  <option value="card">Card (POS Terminal)</option>
                  <option value="online">Online Transfer</option>
                  <option value="other">Other</option>
                </Select>
              </Field>
            </div>

            <Field label="Receipt Note" hint="Optional reference or receipt remarks">
              <Input
                placeholder="e.g. Monthly renewal / settlement"
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
