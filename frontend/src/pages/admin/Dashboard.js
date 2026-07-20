import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, ShoppingBag, MessageSquare, Package, TrendingUp, Bell, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cachedGet } from '../../utils/api';
import AdminLayout from './AdminLayout';

const StatCard = ({ icon, label, value, color, link }) => (
  <Link to={link || '#'} className="glass rounded-xl p-5 hover:border-orange-500/30 transition-all block group">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
    </div>
    <div className="text-white font-bold text-3xl mb-1">{value}</div>
    <div className="text-gray-400 text-sm">{label}</div>
  </Link>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({ members: 0, expiring: 0, orders: 0, enquiries: 0 });
  const [recentMembers, setRecentMembers] = useState([]);
  const [expiringMembers, setExpiringMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      cachedGet('/members', { cache: 60 }),
      cachedGet('/orders', { cache: 60 }),
      cachedGet('/enquiries', { cache: 60 }),
    ]).then(([m, o, e]) => {
      const members = m.data;
      const now = new Date();
      const expiring = members.filter(mem => {
        if (!mem.membershipEnd) return false;
        const days = Math.ceil((new Date(mem.membershipEnd) - now) / (1000 * 60 * 60 * 24));
        return days <= 7 && days >= 0;
      });
      setStats({ members: members.length, expiring: expiring.length, orders: o.data.length, enquiries: e.data.filter(eq => eq.status === 'new').length });
      setRecentMembers(members.slice(0, 5));
      setExpiringMembers(expiring.slice(0, 5));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
              <StatCard icon={<Users size={20} className="text-blue-400" />} label="Total Members" value={stats.members} color="bg-blue-400/10" link="/admin/members" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <StatCard icon={<AlertCircle size={20} className="text-yellow-400" />} label="Expiring (7 days)" value={stats.expiring} color="bg-yellow-400/10" link="/admin/members" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <StatCard icon={<Package size={20} className="text-green-400" />} label="Total Orders" value={stats.orders} color="bg-green-400/10" link="/admin/orders" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <StatCard icon={<MessageSquare size={20} className="text-purple-400" />} label="New Enquiries" value={stats.enquiries} color="bg-purple-400/10" link="/admin/enquiries" />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Members */}
            <div className="glass rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold">Recent Members</h2>
                <Link to="/admin/members" className="text-orange-400 text-xs hover:underline">View all →</Link>
              </div>
              {recentMembers.length === 0 ? (
                <div className="text-gray-500 text-sm text-center py-8">No members yet</div>
              ) : (
                <div className="space-y-3">
                  {recentMembers.map(m => (
                    <div key={m._id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {m.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium truncate">{m.name}</div>
                        <div className="text-gray-500 text-xs">{m.membershipPlan} · {m.membershipStatus}</div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        m.membershipStatus === 'active' ? 'bg-green-500/20 text-green-400' :
                        m.membershipStatus === 'expired' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>{m.membershipStatus}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Expiring Memberships */}
            <div className="glass rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold flex items-center gap-2"><Bell size={18} className="text-yellow-400" /> Expiring Soon</h2>
              </div>
              {expiringMembers.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-gray-500">
                  <CheckCircle size={32} className="text-green-400 mb-2" />
                  <span className="text-sm">No memberships expiring in 7 days</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {expiringMembers.map(m => {
                    const daysLeft = Math.ceil((new Date(m.membershipEnd) - new Date()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={m._id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                        <div className="w-9 h-9 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-bold text-sm flex-shrink-0">
                          {m.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-medium truncate">{m.name}</div>
                          <div className="text-gray-500 text-xs">{m.phone}</div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          daysLeft <= 3 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>{daysLeft}d left</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
