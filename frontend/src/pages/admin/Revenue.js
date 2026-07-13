import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  IndianRupee, TrendingUp, TrendingDown, ShoppingBag, Users,
  AlertCircle, CreditCard, Package, CheckCircle2, Clock,
} from 'lucide-react';
import API from '../../utils/api';
import AdminLayout from './AdminLayout';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const PLAN_COLORS = {
  monthly:      '#38bdf8',
  quarterly:    '#a78bfa',
  'half-yearly':'#34d399',
  yearly:       '#fb923c',
};
const METHOD_COLORS = { cod: '#f59e0b', online: '#22d3ee', upi: '#a78bfa' };

/* ── Stacked bar chart ── */
function StackedBarChart({ data }) {
  if (!data?.length) return <div className="text-gray-600 text-sm text-center py-8">No data yet</div>;

  const maxVal = Math.max(...data.map(d => d.totalRevenue || 0)) || 1;

  return (
    <div className="flex items-end gap-1 h-36 mt-2">
      {data.map((d, i) => {
        const total = d.totalRevenue || 0;
        const memH  = ((d.membershipRevenue || 0) / maxVal) * 100;
        const stoH  = ((d.storeRevenue      || 0) / maxVal) * 100;
        const isLast = i === data.length - 1;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5 min-w-0 group relative">
            {/* tooltip */}
            <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
              <div className="bg-[#1a1b23] border border-white/10 rounded-lg p-2 text-[10px] text-white whitespace-nowrap shadow-xl">
                <div className="font-semibold mb-0.5">{MONTHS[d.month - 1]} {d.year}</div>
                {d.membershipRevenue > 0 && <div className="text-sky-400">Membership: ₹{d.membershipRevenue.toLocaleString('en-IN')}</div>}
                {d.storeRevenue > 0      && <div className="text-amber-400">Store: ₹{d.storeRevenue.toLocaleString('en-IN')}</div>}
                <div className="text-white font-bold">Total: ₹{total.toLocaleString('en-IN')}</div>
              </div>
              <div className="w-1.5 h-1.5 bg-[#1a1b23] border-r border-b border-white/10 rotate-45 -mt-0.5" />
            </div>

            {/* bars */}
            <div className="w-full flex flex-col-reverse rounded-t overflow-hidden" style={{ height: `${Math.max((total / maxVal) * 100, total > 0 ? 4 : 0)}%` }}>
              {stoH > 0 && (
                <div className="w-full" style={{ height: `${(stoH / (memH + stoH)) * 100}%`, background: '#fb923c', opacity: isLast ? 1 : 0.65 }} />
              )}
              {memH > 0 && (
                <div className="w-full" style={{ height: `${(memH / (memH + stoH)) * 100}%`, background: '#38bdf8', opacity: isLast ? 1 : 0.65 }} />
              )}
            </div>
            <div className="text-gray-600 text-[9px] mt-0.5 truncate w-full text-center">{MONTHS[d.month - 1]}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Donut chart ── */
function DonutChart({ segments, size = 90, label }) {
  const total = segments.reduce((s, sg) => s + sg.value, 0);
  if (!total) return <div className="text-gray-600 text-xs text-center py-4">No data</div>;
  let angle = -90;
  const r = 38, cx = 50, cy = 50;
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox="0 0 100 100">
        {segments.map((seg, i) => {
          const frac  = seg.value / total;
          const sweep = frac * 360;
          const r1    = (angle * Math.PI) / 180;
          const r2    = ((angle + sweep) * Math.PI) / 180;
          const x1 = cx + r * Math.cos(r1), y1 = cy + r * Math.sin(r1);
          const x2 = cx + r * Math.cos(r2), y2 = cy + r * Math.sin(r2);
          const large = sweep > 180 ? 1 : 0;
          const d = `M${cx},${cy} L${x1},${y1} A${r},${r},0,${large},1,${x2},${y2} Z`;
          angle += sweep;
          return <path key={i} d={d} fill={seg.color} opacity="0.88" />;
        })}
        <circle cx={cx} cy={cy} r={r * 0.58} fill="#0d0d14" />
        {label && (
          <>
            <text x={cx} y={cy - 3} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">{label.top}</text>
            <text x={cx} y={cy + 9} textAnchor="middle" fill="#9ca3af" fontSize="7">{label.bot}</text>
          </>
        )}
      </svg>
    </div>
  );
}

/* ── KPI card ── */
function KpiCard({ icon: Icon, label, value, sub, color, trend }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon size={18} />
      </div>
      <div className="text-white font-bold text-2xl leading-tight mb-0.5">{value}</div>
      <div className="text-gray-400 text-xs mb-1">{label}</div>
      {sub && (
        <div className={`text-xs flex items-center gap-1 ${trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-500'}`}>
          {trend === 'up' && <TrendingUp size={11} />}
          {trend === 'down' && <TrendingDown size={11} />}
          {sub}
        </div>
      )}
    </motion.div>
  );
}

/* ── Horizontal progress bar ── */
function HBar({ label, value, max, color, right }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="w-24 text-gray-400 text-xs truncate flex-shrink-0">{label}</div>
      <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="text-white text-xs font-semibold w-24 text-right flex-shrink-0">{right}</div>
    </div>
  );
}

const fmt = n => `₹${(n || 0).toLocaleString('en-IN')}`;

export default function AdminRevenue() {
  const [data,    setData]    = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('overview'); // overview | membership | store | pending

  useEffect(() => {
    Promise.all([
      API.get('/analytics/revenue-full'),
      API.get('/analytics/summary'),
    ]).then(([r, s]) => {
      setData(r.data);
      setSummary(s.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <AdminLayout title="Revenue">
      <div className="flex justify-center py-24">
        <div className="w-10 h-10 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
      </div>
    </AdminLayout>
  );

  const totals  = data?.totals   || {};
  const months  = data?.months   || [];
  const plans   = data?.planBreakdown || [];
  const methods = data?.paymentMethodBreakdown || [];
  const products= data?.topProducts || [];
  const pending = data?.pendingFeeMembers || [];

  // month-over-month change for membership revenue (last 2 months)
  const lastTwo   = months.slice(-2);
  const momChange = lastTwo.length === 2 && lastTwo[0].membershipRevenue > 0
    ? (((lastTwo[1].membershipRevenue - lastTwo[0].membershipRevenue) / lastTwo[0].membershipRevenue) * 100).toFixed(1)
    : null;

  const planDonut = plans.map(p => ({ label: p._id, value: p.revenue, color: PLAN_COLORS[p._id] || '#6b7280' }));
  const methDonut = methods.map(m => ({ label: m._id, value: m.revenue, color: METHOD_COLORS[m._id] || '#6b7280' }));
  const maxPlanRev = Math.max(...plans.map(p => p.revenue), 1);
  const maxProdRev = Math.max(...products.map(p => p.revenue), 1);

  return (
    <AdminLayout title="Revenue">
      {/* ── Tab pills ── */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: 'overview',   label: '📊 Overview'   },
          { key: 'membership', label: '🏅 Membership' },
          { key: 'store',      label: '🛒 Store'      },
          { key: 'pending',    label: `⚠️ Pending (${pending.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              tab === t.key
                ? 'bg-green-400/20 text-green-400 border border-green-400/40'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ════════════ OVERVIEW ════════════ */}
      {tab === 'overview' && (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard icon={IndianRupee}  label="Total Revenue"       value={fmt(totals.totalRevenue)}
              color="bg-green-500/10 text-green-400"
              sub={`Last month ${fmt(summary?.lastMonthRevenue)}`} />
            <KpiCard icon={Users}        label="Membership Revenue"  value={fmt(totals.membershipRevenue)}
              color="bg-sky-500/10 text-sky-400"
              sub={momChange !== null ? `${momChange > 0 ? '+' : ''}${momChange}% vs prev month` : undefined}
              trend={momChange > 0 ? 'up' : momChange < 0 ? 'down' : undefined} />
            <KpiCard icon={ShoppingBag}  label="Store Revenue"       value={fmt(totals.storeRevenue)}
              color="bg-amber-500/10 text-amber-400"
              sub={`${methods.reduce((s,m)=>s+m.count,0)} paid orders`} />
            <KpiCard icon={AlertCircle}  label="Pending Fees"        value={fmt(totals.pendingFees)}
              color="bg-red-500/10 text-red-400"
              sub={`${totals.pendingFeeCount} member(s) unpaid`}
              trend={totals.pendingFeeCount > 0 ? 'down' : undefined} />
          </div>

          {/* This month + last month quick tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'This Month', value: summary?.monthlyRevenue, icon: TrendingUp,    c: 'text-green-400' },
              { label: 'Last Month', value: summary?.lastMonthRevenue,icon: Clock,         c: 'text-gray-400' },
              { label: 'All Orders', value: summary?.totalOrders,     icon: Package,       c: 'text-purple-400', isCount: true },
            ].map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="glass rounded-xl p-4 flex items-center gap-4">
                <t.icon size={20} className={t.c} />
                <div>
                  <div className="text-gray-500 text-xs">{t.label}</div>
                  <div className="text-white font-bold text-lg">{t.isCount ? t.value : fmt(t.value)}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stacked chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white font-semibold text-sm">Monthly Revenue (12 months)</span>
              <div className="flex items-center gap-4 text-[10px]">
                <span className="flex items-center gap-1 text-sky-400"><span className="w-2 h-2 rounded-sm inline-block" style={{ background: '#38bdf8' }} /> Membership</span>
                <span className="flex items-center gap-1 text-amber-400"><span className="w-2 h-2 rounded-sm inline-block" style={{ background: '#fb923c' }} /> Store</span>
              </div>
            </div>
            <div className="text-gray-500 text-xs mb-2">Hover bars for details</div>
            <StackedBarChart data={months} />
          </motion.div>

          {/* Revenue split */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
              className="glass rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users size={15} className="text-sky-400" />
                <span className="text-white font-semibold text-sm">Membership Plan Split</span>
              </div>
              <div className="flex items-center gap-5">
                <DonutChart segments={planDonut} size={90}
                  label={{ top: fmt(totals.membershipRevenue).replace('₹',''), bot: 'total' }} />
                <div className="flex-1 space-y-1">
                  {plans.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PLAN_COLORS[p._id] || '#6b7280' }} />
                      <span className="text-gray-300 capitalize flex-1">{p._id || '—'}</span>
                      <span className="text-gray-500">{p.count}×</span>
                      <span className="text-white font-semibold">{fmt(p.revenue)}</span>
                    </div>
                  ))}
                  {plans.length === 0 && <div className="text-gray-600 text-xs">No data</div>}
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}
              className="glass rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={15} className="text-amber-400" />
                <span className="text-white font-semibold text-sm">Payment Method Split</span>
              </div>
              <div className="flex items-center gap-5">
                <DonutChart segments={methDonut} size={90}
                  label={{ top: `${methods.reduce((s,m)=>s+m.count,0)}`, bot: 'orders' }} />
                <div className="flex-1 space-y-1">
                  {methods.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: METHOD_COLORS[m._id] || '#6b7280' }} />
                      <span className="text-gray-300 uppercase flex-1">{m._id || '—'}</span>
                      <span className="text-gray-500">{m.count}×</span>
                      <span className="text-white font-semibold">{fmt(m.revenue)}</span>
                    </div>
                  ))}
                  {methods.length === 0 && <div className="text-gray-600 text-xs">No store orders</div>}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* ════════════ MEMBERSHIP ════════════ */}
      {tab === 'membership' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Members',    val: summary?.totalMembers,   icon: Users,         c: 'bg-blue-500/10 text-blue-400' },
              { label: 'Active',           val: summary?.activeMembers,  icon: CheckCircle2,  c: 'bg-green-500/10 text-green-400' },
              { label: 'Expired',          val: summary?.expiredMembers, icon: AlertCircle,   c: 'bg-red-500/10 text-red-400' },
              { label: 'Expiring (7d)',    val: summary?.expiringIn7,    icon: Clock,         c: 'bg-yellow-500/10 text-yellow-400' },
            ].map((k, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="glass rounded-xl p-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${k.c}`}>
                  <k.icon size={18} />
                </div>
                <div className="text-white font-bold text-2xl">{k.val ?? 0}</div>
                <div className="text-gray-400 text-xs mt-0.5">{k.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Plan revenue bars */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass rounded-xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <IndianRupee size={15} className="text-sky-400" />
              <span className="text-white font-semibold text-sm">Revenue by Membership Plan</span>
            </div>
            {plans.length === 0
              ? <div className="text-gray-600 text-sm text-center py-6">No membership fee data yet</div>
              : plans.sort((a,b) => b.revenue - a.revenue).map((p, i) => (
                  <HBar key={i}
                    label={<span className="capitalize">{p._id || '—'}</span>}
                    value={p.revenue} max={maxPlanRev}
                    color={PLAN_COLORS[p._id] || '#6b7280'}
                    right={`${fmt(p.revenue)} · ${p.count} members`} />
                ))
            }
            <div className="mt-3 pt-3 border-t border-white/5 flex justify-between text-sm">
              <span className="text-gray-400">Total membership revenue</span>
              <span className="text-white font-bold">{fmt(totals.membershipRevenue)}</span>
            </div>
          </motion.div>

          {/* Monthly membership fee collected */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
            className="glass rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={15} className="text-sky-400" />
              <span className="text-white font-semibold text-sm">Membership Fees Collected / Month</span>
            </div>
            <div className="text-gray-500 text-xs mb-2">Last 12 months</div>
            {/* Simple bar chart for membership only */}
            {(() => {
              const mMax = Math.max(...months.map(m => m.membershipRevenue), 1);
              return (
                <div className="flex items-end gap-1 h-28">
                  {months.map((m, i) => {
                    const pct = (m.membershipRevenue / mMax) * 100;
                    const isLast = i === months.length - 1;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-0.5 min-w-0 group relative">
                        {m.membershipRevenue > 0 && (
                          <div className="absolute bottom-full mb-1 hidden group-hover:block z-10">
                            <div className="bg-[#1a1b23] border border-white/10 rounded px-2 py-1 text-[10px] text-white whitespace-nowrap shadow-xl">
                              {MONTHS[m.month-1]}: {fmt(m.membershipRevenue)}
                            </div>
                          </div>
                        )}
                        <div className="w-full rounded-t"
                          style={{ height: `${Math.max(pct, m.membershipRevenue > 0 ? 4 : 0)}%`,
                            background: '#38bdf8', opacity: isLast ? 1 : 0.55 }} />
                        <div className="text-gray-600 text-[9px]">{MONTHS[m.month-1]}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </motion.div>
        </>
      )}

      {/* ════════════ STORE ════════════ */}
      {tab === 'store' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <KpiCard icon={ShoppingBag}  label="Store Revenue"     value={fmt(totals.storeRevenue)}   color="bg-amber-500/10 text-amber-400" />
            <KpiCard icon={Package}      label="Total Orders"      value={summary?.totalOrders ?? 0}  color="bg-purple-500/10 text-purple-400" />
            <KpiCard icon={CreditCard}   label="This Month Orders" value={fmt(summary?.monthlyRevenue)} color="bg-cyan-500/10 text-cyan-400" />
          </div>

          {/* Top products */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="glass rounded-xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <Package size={15} className="text-amber-400" />
              <span className="text-white font-semibold text-sm">Top 5 Products by Revenue</span>
            </div>
            {products.length === 0
              ? <div className="text-gray-600 text-sm text-center py-6">No order data yet</div>
              : products.map((p, i) => (
                  <HBar key={i} label={p._id || '—'} value={p.revenue} max={maxProdRev}
                    color="#fb923c"
                    right={`${fmt(p.revenue)} · ${p.units} units`} />
                ))
            }
          </motion.div>

          {/* Payment method breakdown */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
            className="glass rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={15} className="text-cyan-400" />
              <span className="text-white font-semibold text-sm">Revenue by Payment Method</span>
            </div>
            <div className="flex items-start gap-6">
              <DonutChart segments={methDonut} size={96}
                label={{ top: `${methods.reduce((s,m)=>s+m.count,0)}`, bot: 'orders' }} />
              <div className="flex-1 space-y-2">
                {methods.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: METHOD_COLORS[m._id] || '#6b7280' }} />
                    <span className="text-gray-300 uppercase font-medium flex-1">{m._id || '—'}</span>
                    <span className="text-gray-500 text-xs">{m.count} orders</span>
                    <span className="text-white font-bold">{fmt(m.revenue)}</span>
                  </div>
                ))}
                {methods.length === 0 && <div className="text-gray-600 text-sm">No paid orders yet</div>}
              </div>
            </div>
          </motion.div>
        </>
      )}

      {/* ════════════ PENDING FEES ════════════ */}
      {tab === 'pending' && (
        <>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-5 mb-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle size={22} className="text-red-400" />
            </div>
            <div>
              <div className="text-white font-bold text-xl">{fmt(totals.pendingFees)}</div>
              <div className="text-gray-400 text-sm">Total pending fee collection from {pending.length} active member(s)</div>
            </div>
          </motion.div>

          {pending.length === 0 ? (
            <div className="glass rounded-xl p-16 text-center">
              <CheckCircle2 size={42} className="text-green-400 mx-auto mb-3" />
              <div className="text-white font-semibold text-lg">All fees collected!</div>
              <div className="text-gray-500 text-sm mt-1">No active members with unpaid fees.</div>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="glass rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left">
                      <th className="px-4 py-3 text-gray-400 font-medium text-xs">Member</th>
                      <th className="px-4 py-3 text-gray-400 font-medium text-xs">Phone</th>
                      <th className="px-4 py-3 text-gray-400 font-medium text-xs">Plan</th>
                      <th className="px-4 py-3 text-gray-400 font-medium text-xs">Due Amount</th>
                      <th className="px-4 py-3 text-gray-400 font-medium text-xs">Expires</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map((m, i) => {
                      const daysLeft = m.membershipEnd
                        ? Math.ceil((new Date(m.membershipEnd) - new Date()) / 86400000)
                        : null;
                      return (
                        <tr key={m._id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 font-bold text-xs flex-shrink-0">
                                {m.name?.[0]?.toUpperCase()}
                              </div>
                              <span className="text-white font-medium">{m.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-400">{m.phone}</td>
                          <td className="px-4 py-3">
                            <span className="capitalize text-xs px-2 py-0.5 rounded-full"
                              style={{ background: `${PLAN_COLORS[m.membershipPlan] || '#6b7280'}22`, color: PLAN_COLORS[m.membershipPlan] || '#9ca3af' }}>
                              {m.membershipPlan || '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-red-400 font-bold">{fmt(m.feeAmount)}</td>
                          <td className="px-4 py-3">
                            {daysLeft !== null ? (
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                daysLeft < 0 ? 'bg-red-500/20 text-red-400'
                                : daysLeft <= 3 ? 'bg-orange-500/20 text-orange-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {daysLeft < 0 ? 'Expired' : `${daysLeft}d left`}
                              </span>
                            ) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Footer total */}
              <div className="px-4 py-3 border-t border-white/10 flex justify-between items-center bg-white/2">
                <span className="text-gray-400 text-xs">{pending.length} member(s) with pending fees</span>
                <span className="text-red-400 font-bold">{fmt(totals.pendingFees)} total outstanding</span>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
