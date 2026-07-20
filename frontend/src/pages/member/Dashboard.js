import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Dumbbell, Salad, ShoppingBag, CheckCircle, AlertCircle, TrendingUp, Package, Calendar, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cachedGet } from '../../utils/api';

const QUICK_ACTIONS = [
  { icon: <Dumbbell size={22} className="text-cyan-400" />,    label: 'My Workout',   sub: 'Planner + split', path: '/my-workout',   border: 'hover:border-cyan-500/30' },
  { icon: <TrendingUp size={22} className="text-green-400" />, label: 'Progress',     sub: 'Log & track',     path: '/my-progress',  border: 'hover:border-green-500/30' },
  { icon: <Salad size={22} className="text-teal-400" />,       label: 'My Diet',      sub: 'Assigned plans',  path: '/my-diet',      border: 'hover:border-teal-500/30' },
  { icon: <ShoppingBag size={22} className="text-purple-400" />,label: 'Store',       sub: 'Supplements',     path: '/store',        border: 'hover:border-purple-500/30' },
  { icon: <Package size={22} className="text-amber-400" />,    label: 'My Orders',    sub: 'Order history',   path: '/my-orders',    border: 'hover:border-amber-500/30' },
  { icon: <Calendar size={22} className="text-pink-400" />,    label: 'My Exercises', sub: 'Assigned to me',  path: '/my-exercises', border: 'hover:border-pink-500/30' },
  { icon: <Settings size={22} className="text-orange-400" />,  label: 'Settings',     sub: 'Edit profile',    path: '/settings',     border: 'hover:border-orange-500/30' },
];

export default function MemberDashboard() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    cachedGet('/notifications', { cache: 30 }).then(r => {
      setNotifications(r.data.slice(0, 5));
      setUnreadCount(r.data.filter(n => !n.isRead).length);
    }).catch(() => {});
  }, []);

  const daysLeft = user?.membershipEnd
    ? Math.ceil((new Date(user.membershipEnd) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const membershipProgress = () => {
    if (!user?.membershipStart || !user?.membershipEnd) return 0;
    const total = new Date(user.membershipEnd) - new Date(user.membershipStart);
    const elapsed = new Date() - new Date(user.membershipStart);
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20 pb-24 lg:pb-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="gym-font text-3xl sm:text-4xl text-white mb-1">
            Welcome, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 💪
          </h1>
          <p className="text-gray-400 text-sm">Your fitness journey dashboard</p>
        </motion.div>

        {/* Membership Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-5 sm:p-6 mb-6 border border-blue-500/20">
          <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
            <div>
              <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Membership</div>
              <h2 className="text-white font-bold text-xl capitalize">{user?.membershipPlan || 'N/A'} Plan</h2>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold capitalize flex-shrink-0 ${
              user?.membershipStatus === 'active' ? 'bg-green-500/20 text-green-400' :
              user?.membershipStatus === 'expired' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
            }`}>{user?.membershipStatus || 'pending'}</span>
          </div>

          {daysLeft !== null && (
            <>
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Progress</span>
                <span className={daysLeft <= 3 ? 'text-red-400 font-bold' : daysLeft <= 7 ? 'text-yellow-400 font-bold' : 'text-gray-300'}>
                  {daysLeft > 0 ? `${daysLeft} days remaining` : 'Expired'}
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-sky-400 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${membershipProgress()}%` }} />
              </div>
            </>
          )}

          {daysLeft !== null && daysLeft <= 7 && daysLeft > 0 && (
            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
              <AlertCircle size={16} className="text-yellow-400 flex-shrink-0" />
              <span className="text-yellow-300 text-sm">Your membership expires in {daysLeft} day(s). Please renew soon!</span>
            </div>
          )}
          {daysLeft !== null && daysLeft <= 0 && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <span className="text-red-300 text-sm">Your membership has expired. Contact the gym to renew.</span>
            </div>
          )}

          {user?.membershipEnd && (
            <div className="flex flex-wrap gap-4 text-xs text-gray-400">
              {user.membershipStart && <span>Start: <span className="text-white">{new Date(user.membershipStart).toLocaleDateString('en-IN')}</span></span>}
              <span>End: <span className="text-white">{new Date(user.membershipEnd).toLocaleDateString('en-IN')}</span></span>
              {user.feeAmount && <span>Fee: <span className="text-blue-400 font-semibold">₹{user.feeAmount}</span></span>}
              {user.assignedTrainer && <span>Trainer: <span className="text-white">{user.assignedTrainer.name || 'Assigned'}</span></span>}
            </div>
          )}
        </motion.div>

        {/* Quick actions grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {QUICK_ACTIONS.map((a, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.07 }}>
              <Link to={a.path}
                className={`glass rounded-xl p-4 flex items-center gap-3 transition-all border border-transparent ${a.border} group`}>
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                  {a.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-white font-semibold text-sm truncate">{a.label}</div>
                  <div className="text-gray-500 text-xs truncate">{a.sub}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Bell size={18} className="text-blue-400" />
              Recent Notifications
              {unreadCount > 0 && (
                <span className="bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{unreadCount}</span>
              )}
            </h2>
            <Link to="/notifications" className="text-blue-400 text-xs hover:underline">View all →</Link>
          </div>
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-gray-500">
              <CheckCircle size={32} className="text-green-400 mb-2" />
              <span className="text-sm">All caught up! No new notifications.</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {notifications.map(n => (
                <div key={n._id} className={`flex items-start gap-3 p-3 rounded-lg border ${n.isRead ? 'border-white/5' : 'border-blue-500/20 bg-blue-500/5'}`}>
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.isRead ? 'bg-gray-600' : 'bg-blue-500'}`} />
                  <div className="min-w-0">
                    <div className="text-white text-sm font-semibold truncate">{n.title}</div>
                    <div className="text-gray-400 text-xs mt-0.5 line-clamp-2">{n.message}</div>
                    <div className="text-gray-600 text-xs mt-1">{new Date(n.createdAt).toLocaleString('en-IN')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
