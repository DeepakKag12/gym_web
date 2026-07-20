import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Package, IndianRupee, Activity, BarChart2, UserCheck, Clock, RefreshCw } from 'lucide-react';
import { bustCache, freshGet } from '../../utils/api';
import AdminLayout from './AdminLayout';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function MiniBarChart({ data, valueKey, labelFn, color = '#3b82f6', height = 100 }) {
  if (!data || data.length === 0) return <div className="text-gray-600 text-sm text-center py-6">No data yet</div>;
  const maxVal = Math.max(...data.map(d => d[valueKey] || 0)) || 1;
  return (
    <div className="flex items-end gap-1.5 h-28 mt-3">
      {data.map((d, i) => {
        const pct = ((d[valueKey] || 0) / maxVal) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <div className="text-gray-500 text-[10px] font-medium w-full text-center truncate">
              {d[valueKey] > 0 ? (d[valueKey] >= 1000 ? `₹${(d[valueKey]/1000).toFixed(1)}k` : d[valueKey]) : ''}
            </div>
            <div className="w-full rounded-t-md transition-all" style={{ height: `${Math.max(pct, 4)}%`, background: color, opacity: i === data.length - 1 ? 1 : 0.55 }} />
            <div className="text-gray-600 text-[10px] w-full text-center truncate">{labelFn(d)}</div>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ segments, size = 100 }) {
  let total = segments.reduce((s, seg) => s + seg.value, 0);
  if (!total) return <div className="text-gray-600 text-sm text-center py-4">No data</div>;
  let angle = -90;
  const r = 40, cx = 50, cy = 50;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {segments.map((seg, i) => {
        const frac = seg.value / total;
        const sweep = frac * 360;
        const rad1 = (angle * Math.PI) / 180;
        const rad2 = ((angle + sweep) * Math.PI) / 180;
        const x1 = cx + r * Math.cos(rad1), y1 = cy + r * Math.sin(rad1);
        const x2 = cx + r * Math.cos(rad2), y2 = cy + r * Math.sin(rad2);
        const large = sweep > 180 ? 1 : 0;
        const d = `M${cx},${cy} L${x1},${y1} A${r},${r},0,${large},1,${x2},${y2} Z`;
        angle += sweep;
        return <path key={i} d={d} fill={seg.color} opacity="0.85" />;
      })}
      <circle cx={cx} cy={cy} r={r * 0.55} fill="#0d0d14" />
    </svg>
  );
}

const PLAN_COLORS = { monthly: '#38bdf8', quarterly: '#a78bfa', 'half-yearly': '#34d399', yearly: '#fb923c' };

export default function AdminAnalytics() {
  const [summary,        setSummary]        = useState(null);
  const [revenueMonthly, setRevenueMonthly] = useState([]);
  const [membershipStats,setMembershipStats] = useState([]);
  const [newMembers,     setNewMembers]      = useState([]);
  const [loading,        setLoading]         = useState(true);
  const [refreshing,     setRefreshing]      = useState(false);

  const loadData = useCallback(async (fresh = false) => {
    // Always treat as fresh on initial load — client cache must not serve stale analytics
    const getter = fresh ? freshGet : freshGet;
    if (fresh) setRefreshing(true); else setLoading(true);
    try {
      const [s, r, m, n] = await Promise.all([
        getter('/analytics/summary',            { cache: 60 }),
        getter('/analytics/revenue-monthly',    { cache: 60 }),
        getter('/analytics/membership-stats',   { cache: 60 }),
        getter('/analytics/new-members-monthly',{ cache: 60 }),
      ]);
      setSummary(s.data);
      setRevenueMonthly(r.data);
      setMembershipStats(m.data);
      setNewMembers(n.data);
    } catch (e) {
      // keep existing data on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(false); }, [loadData]);

  const handleRefresh = () => {
    bustCache('analytics');
    bustCache('members');
    loadData(true);
  };

  const revData = revenueMonthly.map(d => ({ ...d, revenue: d.revenue || 0 }));
  const memData = newMembers.map(d => ({ ...d, count: d.count || 0 }));

  const planSegments = membershipStats.map(p => ({
    label: p._id || 'unknown', value: p.count, color: PLAN_COLORS[p._id] || '#6b7280'
  }));

  return (
    <AdminLayout title="Analytics & Revenue">
      {/* Refresh button */}
      <div className="flex justify-end mb-5">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-xs hover:border-white/20 hover:text-white transition-all disabled:opacity-50"
        >
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing…' : 'Refresh Data'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Users, label: 'Total Members', value: summary?.totalMembers ?? 0, color: 'bg-blue-500/10 text-blue-400' },
              { icon: UserCheck, label: 'Active Members', value: summary?.activeMembers ?? 0, color: 'bg-green-500/10 text-green-400' },
              { icon: Clock, label: 'Expiring (7d)', value: summary?.expiringIn7 ?? 0, color: 'bg-yellow-500/10 text-yellow-400' },
              { icon: Package, label: 'Total Orders', value: summary?.totalOrders ?? 0, color: 'bg-purple-500/10 text-purple-400' },
            ].map((k, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="glass rounded-xl p-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${k.color}`}>
                  <k.icon size={18} />
                </div>
                <div className="text-white font-bold text-3xl mb-1">{k.value}</div>
                <div className="text-gray-400 text-sm">{k.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Revenue KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="glass rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <IndianRupee size={16} className="text-green-400" />
                <span className="text-gray-400 text-sm">Total Revenue</span>
              </div>
              <div className="text-white font-bold text-3xl">₹{(summary?.revenue || 0).toLocaleString('en-IN')}</div>
              <div className="text-gray-600 text-xs mt-1">From paid orders</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="glass rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Activity size={16} className="text-cyan-400" />
                <span className="text-gray-400 text-sm">This Month</span>
              </div>
              <div className="text-white font-bold text-3xl">₹{(summary?.monthlyRevenue || 0).toLocaleString('en-IN')}</div>
              <div className="text-gray-600 text-xs mt-1">Current month revenue</div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="glass rounded-xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <BarChart2 size={16} className="text-blue-400" />
                <span className="text-white font-semibold text-sm">Monthly Revenue (₹)</span>
              </div>
              <div className="text-gray-500 text-xs mb-2">Last 6 months</div>
              <MiniBarChart data={revData} valueKey="revenue" color="#3b82f6"
                labelFn={d => MONTHS[(d._id?.month || 1) - 1]} />
            </motion.div>

            {/* New Members Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
              className="glass rounded-xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <Users size={16} className="text-purple-400" />
                <span className="text-white font-semibold text-sm">New Members/Month</span>
              </div>
              <div className="text-gray-500 text-xs mb-2">Last 6 months</div>
              <MiniBarChart data={memData} valueKey="count" color="#a78bfa"
                labelFn={d => MONTHS[(d._id?.month || 1) - 1]} />
            </motion.div>
          </div>

          {/* Membership Plan Distribution */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="glass rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-green-400" />
              <span className="text-white font-semibold text-sm">Membership Plan Distribution</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <DonutChart segments={planSegments} size={110} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 w-full sm:w-auto">
                {planSegments.map((seg, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: seg.color }} />
                    <span className="text-gray-300 text-sm capitalize">{seg.label}</span>
                    <span className="text-white font-semibold ml-auto sm:ml-2">{seg.value}</span>
                  </div>
                ))}
                {planSegments.length === 0 && <div className="text-gray-600 text-sm col-span-2">No members yet</div>}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AdminLayout>
  );
}
