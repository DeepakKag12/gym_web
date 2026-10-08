import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TrendingUp, Users, IndianRupee,
  UserCheck, Clock, RefreshCw, CreditCard, ShoppingBag,
  CheckCircle2, Percent, Printer
} from 'lucide-react';
import { bustCache, freshGet } from '../../utils/api';
import AdminLayout from './AdminLayout';
import { Card, Button, StatCard, Stagger, FadeIn, Skeleton, EmptyState } from '../../components/ui';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const PLAN_THEME = {
  monthly:     { label: 'Monthly',     color: '#0e7490', bg: 'rgba(14,116,144,0.12)' },
  quarterly:   { label: 'Quarterly',   color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  'half-yearly':{ label: 'Half-Yearly',color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  yearly:      { label: 'Yearly (VIP)',color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  standard:    { label: 'Standard',    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
};

const METHOD_LABELS = {
  cash:    { label: 'Cash (Desk Counter)', color: '#10b981' },
  upi:     { label: 'UPI (GPay / PhonePe)', color: '#0e7490' },
  card:    { label: 'Card (POS Machine)',   color: '#3b82f6' },
  online:  { label: 'Online Gateway',       color: '#8b5cf6' },
  other:   { label: 'Other Settlement',     color: '#f59e0b' },
};

function RevenueBarChart({ data, timeRange = 'all' }) {
  const displayData = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (timeRange === '6m') return data.slice(-6);
    if (timeRange === '3m') return data.slice(-3);
    return data.slice(-12);
  }, [data, timeRange]);

  if (displayData.length === 0) {
    return (
      <div className="py-12 text-center text-sm" style={{ color: 'var(--p-muted)' }}>
        No revenue records found for this period.
      </div>
    );
  }

  const maxTotal = Math.max(...displayData.map(d => d.totalRevenue || 0)) || 1;

  return (
    <div className="space-y-4 pt-2">
      {/* Legend */}
      <div className="flex items-center gap-5 text-xs flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm" style={{ background: 'var(--p-accent, #0e7490)' }} />
          <span style={{ color: 'var(--p-text-2)' }}>Membership Fees</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm" style={{ background: 'var(--p-ok, #10b981)' }} />
          <span style={{ color: 'var(--p-text-2)' }}>Store & Supplement Orders</span>
        </div>
      </div>

      {/* Bar Chart Canvas */}
      <div className="flex items-end gap-2 sm:gap-3.5 h-48 pt-6 pb-2" style={{ borderBottom: '1px solid var(--p-border)' }}>
        {displayData.map((d, i) => {
          const tot = d.totalRevenue || 0;
          const mem = d.membershipRevenue || 0;
          const store = d.storeRevenue || 0;
          const heightPct = Math.max(Math.round((tot / maxTotal) * 100), 5);
          const memHeightPct = tot > 0 ? (mem / tot) * 100 : 0;
          const storeHeightPct = tot > 0 ? (store / tot) * 100 : 0;
          const isLatest = i === displayData.length - 1;

          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end min-w-0 group relative">
              {/* Tooltip on hover */}
              <div
                className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 z-20 pointer-events-none p-2 rounded-lg text-xs shadow-lg whitespace-nowrap"
                style={{ background: 'var(--p-surface-2)', border: '1px solid var(--p-border)', color: 'var(--p-text)' }}
              >
                <div className="font-bold">{MONTH_NAMES[(d.month || 1) - 1]} {d.year}</div>
                <div className="text-[11px] text-primary font-medium">Memberships: ₹{mem.toLocaleString('en-IN')}</div>
                <div className="text-[11px] text-emerald-600">Store: ₹{store.toLocaleString('en-IN')}</div>
                <div className="font-semibold border-t pt-1 mt-1" style={{ borderColor: 'var(--p-border)' }}>
                  Total: ₹{tot.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Value Label */}
              <span className="text-[10px] font-semibold truncate" style={{ color: 'var(--p-text-2)' }}>
                {tot > 0 ? (tot >= 1000 ? `₹${(tot / 1000).toFixed(0)}k` : `₹${tot}`) : '₹0'}
              </span>

              {/* Stacked Bar */}
              <div
                className="w-full max-w-[42px] rounded-t-md overflow-hidden flex flex-col justify-end transition-all duration-300 shadow-sm"
                style={{
                  height: `${heightPct}%`,
                  opacity: isLatest ? 1 : 0.85,
                  background: 'var(--p-surface-2)',
                }}
              >
                {/* Store segment on top */}
                <div
                  style={{
                    height: `${storeHeightPct}%`,
                    background: 'var(--p-ok, #10b981)',
                  }}
                  title={`Store: ₹${store.toLocaleString('en-IN')}`}
                />
                {/* Membership segment on bottom */}
                <div
                  style={{
                    height: `${memHeightPct}%`,
                    background: 'var(--p-accent, #0e7490)',
                  }}
                  title={`Membership: ₹${mem.toLocaleString('en-IN')}`}
                />
              </div>

              {/* Month Label */}
              <span className={`text-[11px] truncate mt-1 ${isLatest ? 'font-bold' : ''}`} style={{ color: isLatest ? 'var(--p-text)' : 'var(--p-muted)' }}>
                {MONTH_NAMES[(d.month || 1) - 1]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminAnalytics() {
  const [summary, setSummary] = useState(null);
  const [fullData, setFullData] = useState(null);
  const [timeRange, setTimeRange] = useState('all'); // 'all', '6m', '3m'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (fresh = false) => {
    if (fresh) setRefreshing(true); else setLoading(true);
    try {
      const [sumRes, fullRes] = await Promise.allSettled([
        freshGet('/analytics/summary', { cache: 30 }),
        freshGet('/analytics/revenue-full', { cache: 30 }),
      ]);

      if (sumRes.status === 'fulfilled') {
        setSummary(sumRes.value.data);
      }
      if (fullRes.status === 'fulfilled') {
        setFullData(fullRes.value.data);
      }
    } catch (_) {
      // Keep existing data on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(false); }, [loadData]);

  const handleRefresh = () => {
    bustCache('/analytics');
    bustCache('/payments');
    bustCache('/orders');
    loadData(true);
  };

  const handlePrintReport = () => {
    window.print();
  };

  // Aggregated data
  const totalRevenue = summary?.revenue || fullData?.summary?.totalRevenue || 0;
  const storeRevenue = summary?.storeRevenue || fullData?.summary?.storeRevenue || 0;
  const membershipRevenue = summary?.membershipRevenue || fullData?.summary?.membershipRevenue || Math.max(0, totalRevenue - storeRevenue);
  const monthlyRevenue = summary?.monthlyRevenue || 0;
  const lastMonthRevenue = summary?.lastMonthRevenue || 0;
  const pendingFees = summary?.pendingFees || 0;
  const pendingFeeCount = summary?.pendingFeeCount || 0;

  // Month-over-month growth rate
  const momGrowth = useMemo(() => {
    if (!lastMonthRevenue || lastMonthRevenue <= 0) return null;
    const diff = monthlyRevenue - lastMonthRevenue;
    return Math.round((diff / lastMonthRevenue) * 100);
  }, [monthlyRevenue, lastMonthRevenue]);

  // Fee collection efficiency
  const collectionEfficiency = useMemo(() => {
    const totalDue = membershipRevenue + pendingFees;
    if (!totalDue || totalDue <= 0) return 100;
    return Math.min(100, Math.round((membershipRevenue / totalDue) * 100));
  }, [membershipRevenue, pendingFees]);

  // Payment methods breakdown
  const paymentMethods = useMemo(() => {
    const list = fullData?.paymentMethods || [];
    const total = list.reduce((s, m) => s + (m.revenue || 0), 0) || 1;
    return list.map(m => {
      const info = METHOD_LABELS[m._id?.toLowerCase()] || { label: m._id || 'Direct', color: '#6b7280' };
      return {
        ...m,
        label: info.label,
        color: info.color,
        percentage: Math.round(((m.revenue || 0) / total) * 100),
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [fullData]);

  // Plan popularity breakdown
  const planBreakdown = useMemo(() => {
    const list = fullData?.planBreakdown || [];
    const totalAthletes = list.reduce((s, p) => s + (p.count || 0), 0) || 1;
    return list.map(p => {
      const key = (p._id || 'standard').toLowerCase();
      const info = PLAN_THEME[key] || PLAN_THEME.standard;
      return {
        ...p,
        name: info.label,
        color: info.color,
        percentage: Math.round(((p.count || 0) / totalAthletes) * 100),
      };
    }).sort((a, b) => b.count - a.count);
  }, [fullData]);

  return (
    <AdminLayout
      title="Gym Intelligence & Financial Analytics"
      subtitle="Complete performance metrics on membership subscriptions, supplement sales, and counter payments"
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            icon={Printer}
            onClick={handlePrintReport}
            className="hidden sm:inline-flex"
          >
            Print Report
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={RefreshCw}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Updating…' : 'Refresh Metrics'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6 max-w-7xl">
        {/* Period Selector & Quick Filters */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border shadow-sm"
          style={{ background: 'var(--p-surface)', borderColor: 'var(--p-border)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--p-muted)' }}>
              Analysis Period:
            </span>
            <div className="flex items-center gap-1">
              {[
                { id: 'all', label: 'Last 12 Months' },
                { id: '6m', label: 'Last 6 Months' },
                { id: '3m', label: 'Last Quarter (3m)' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setTimeRange(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    timeRange === tab.id
                      ? 'shadow-sm'
                      : 'hover:bg-[var(--p-surface-2)]'
                  }`}
                  style={{
                    background: timeRange === tab.id ? 'var(--p-accent)' : 'transparent',
                    color: timeRange === tab.id ? '#ffffff' : 'var(--p-text-2)',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--p-muted)' }}>
            <span>Live Aggregation: <strong>Automatic Cache Sync</strong></span>
          </div>
        </div>

        {/* Primary Health Metric Cards — 4 Column Grid */}
        <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Gross Income"
            value={`₹${totalRevenue.toLocaleString('en-IN')}`}
            hint="Combined subscriptions + store"
            icon={IndianRupee}
            tone="accent"
            trend={momGrowth !== null ? `${momGrowth >= 0 ? '+' : ''}${momGrowth}% MoM` : 'All Time'}
            loading={loading}
          />
          <StatCard
            label="Current Month Revenue"
            value={`₹${monthlyRevenue.toLocaleString('en-IN')}`}
            hint={`Last month: ₹${lastMonthRevenue.toLocaleString('en-IN')}`}
            icon={TrendingUp}
            tone="ok"
            trend={monthlyRevenue > 0 ? 'Pacing Active' : 'Beginning'}
            loading={loading}
          />
          <StatCard
            label="Outstanding Dues"
            value={`₹${pendingFees.toLocaleString('en-IN')}`}
            hint={`${pendingFeeCount} members with pending balance`}
            icon={CreditCard}
            tone={pendingFees > 0 ? 'danger' : 'ok'}
            trend={pendingFees > 0 ? `${pendingFeeCount} due` : '100% Paid'}
            loading={loading}
          />
          <StatCard
            label="Active Athletes"
            value={summary?.activeMembers ?? 0}
            hint={`Of ${summary?.totalMembers ?? 0} total enrolled`}
            icon={UserCheck}
            tone="info"
            trend="Floor Active"
            loading={loading}
          />
        </Stagger>

        {/* Secondary Operational KPIs — 4 Column Grid */}
        <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Membership Fees"
            value={`₹${membershipRevenue.toLocaleString('en-IN')}`}
            hint={`${totalRevenue > 0 ? Math.round((membershipRevenue / totalRevenue) * 100) : 100}% of gross revenue`}
            icon={Users}
            tone="accent"
            trend="Subscriptions"
            loading={loading}
          />
          <StatCard
            label="Store Retail Sales"
            value={`₹${storeRevenue.toLocaleString('en-IN')}`}
            hint={`${summary?.totalOrders ?? fullData?.summary?.totalOrders ?? 0} customer orders fulfilled`}
            icon={ShoppingBag}
            tone="ok"
            trend="Supplements"
            loading={loading}
          />
          <StatCard
            label="Expiring in 7 Days"
            value={summary?.expiringIn7 ?? 0}
            hint="Urgent renewal window"
            icon={Clock}
            tone={(summary?.expiringIn7 ?? 0) > 0 ? 'warn' : 'ok'}
            trend={(summary?.expiringIn7 ?? 0) > 0 ? 'Needs Followup' : 'All Set'}
            loading={loading}
          />
          <StatCard
            label="Collection Efficiency"
            value={`${collectionEfficiency}%`}
            hint="Paid fees vs total billed"
            icon={Percent}
            tone={collectionEfficiency >= 90 ? 'ok' : 'warn'}
            trend="Health Score"
            loading={loading}
          />
        </Stagger>

        {/* Main Chart Section: Monthly Revenue Growth */}
        <FadeIn delay={0.08}>
          <Card
            title="Monthly Revenue Trend & Stream Comparison"
            subtitle="Side-by-side progression of membership fees and supplement store sales"
            padded={true}
          >
            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <Skeleton h={160} className="w-full" />
              </div>
            ) : (
              <RevenueBarChart
                data={fullData?.months || []}
                timeRange={timeRange}
              />
            )}
          </Card>
        </FadeIn>

        {/* Deep Dive Breakdown Section: 2 Columns */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Payment Channels Ledger */}
          <FadeIn delay={0.1}>
            <Card
              title="Payment Channel Distribution"
              subtitle="Incoming revenue collected via Cash, UPI, Cards, and Online"
              padded={true}
            >
              {loading ? (
                <div className="space-y-3 py-2">
                  <Skeleton h={32} />
                  <Skeleton h={32} />
                  <Skeleton h={32} />
                </div>
              ) : paymentMethods.length === 0 ? (
                <EmptyState icon={CreditCard} title="No payment records yet" hint="Processed payments will appear here." />
              ) : (
                <div className="space-y-4 pt-1">
                  {paymentMethods.map(m => (
                    <div key={m._id || 'other'} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold flex items-center gap-1.5" style={{ color: 'var(--p-text)' }}>
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: m.color }} />
                          {m.label}
                        </span>
                        <span className="font-bold" style={{ color: 'var(--p-text)' }}>
                          ₹{Number(m.revenue || 0).toLocaleString('en-IN')}
                          <span className="text-[11px] font-normal ml-1" style={{ color: 'var(--p-muted)' }}>
                            ({m.percentage}%) • {m.count} txns
                          </span>
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--p-surface-2)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.max(m.percentage, 3)}%`,
                            background: m.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </FadeIn>

          {/* Membership Plan Distribution */}
          <FadeIn delay={0.12}>
            <Card
              title="Membership Plan Popularity"
              subtitle="Athlete breakdown by subscription duration"
              padded={true}
            >
              {loading ? (
                <div className="space-y-3 py-2">
                  <Skeleton h={32} />
                  <Skeleton h={32} />
                  <Skeleton h={32} />
                </div>
              ) : planBreakdown.length === 0 ? (
                <EmptyState icon={Users} title="No member plans recorded" hint="Active memberships will appear here." />
              ) : (
                <div className="space-y-4 pt-1">
                  {planBreakdown.map(p => (
                    <div key={p._id || 'standard'} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold flex items-center gap-1.5" style={{ color: 'var(--p-text)' }}>
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                          {p.name}
                        </span>
                        <span className="font-bold" style={{ color: 'var(--p-text)' }}>
                          {p.count} Athlete{p.count !== 1 ? 's' : ''}
                          <span className="text-[11px] font-normal ml-1" style={{ color: 'var(--p-muted)' }}>
                            ({p.percentage}%) • ₹{Number(p.revenue || 0).toLocaleString('en-IN')}
                          </span>
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--p-surface-2)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.max(p.percentage, 3)}%`,
                            background: p.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </FadeIn>
        </div>

        {/* Financial Highlights & Health Summary */}
        <FadeIn delay={0.14}>
          <div
            className="p-5 rounded-2xl border shadow-sm flex flex-col md:flex-row items-center justify-between gap-4"
            style={{ background: 'var(--p-surface)', borderColor: 'var(--p-border)' }}
          >
            <div className="flex items-center gap-3.5">
              <span
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--p-ok-soft)', color: 'var(--p-ok)' }}
              >
                <CheckCircle2 size={24} />
              </span>
              <div>
                <h4 className="text-[15px] font-bold" style={{ color: 'var(--p-text)' }}>
                  Gym Financial Operations Status: Healthy
                </h4>
                <p className="text-[13px] mt-0.5" style={{ color: 'var(--p-text-2)' }}>
                  {collectionEfficiency}% fee collection efficiency. {summary?.activeMembers ?? 0} active athletes maintaining consistent workouts.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-shrink-0">
              <Button size="sm" variant="secondary" to="/admin/payments?tab=dues">
                Review Dues
              </Button>
              <Button size="sm" variant="primary" to="/admin/orders">
                Fulfill Orders
              </Button>
            </div>
          </div>
        </FadeIn>
      </div>
    </AdminLayout>
  );
}
