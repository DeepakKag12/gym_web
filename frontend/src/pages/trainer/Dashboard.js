import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../admin/AdminLayout';
import {
  Users, Dumbbell, Salad, TrendingUp, Calendar,
  UserCheck, ChevronRight, Activity
} from 'lucide-react';
import { cachedGet } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

function StatCard({ icon: Icon, label, value, color = 'text-cyan-400', bg = 'bg-cyan-400/10' }) {
  return (
    <div className="glass rounded-2xl p-5 flex items-center gap-4">
      <div className={`${bg} ${color} rounded-xl p-3`}>
        <Icon size={22} />
      </div>
      <div>
        <div className="text-white font-bold text-2xl">{value ?? '–'}</div>
        <div className="text-gray-500 text-sm">{label}</div>
      </div>
    </div>
  );
}

export default function TrainerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentMembers, setRecentMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      cachedGet('/analytics/summary', { cache: 120 }),
      cachedGet('/members', { cache: 60 }),
    ]).then(([sr, mr]) => {
      setStats(sr.data);
      setRecentMembers((mr.data || []).slice(0, 5));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const quickActions = [
    { to: '/admin/exercises',       icon: Dumbbell,   label: 'Manage Exercises',    color: 'text-cyan-400',   bg: 'bg-cyan-400/10' },
    { to: '/admin/diet',            icon: Salad,       label: 'Manage Diet Plans',   color: 'text-green-400',  bg: 'bg-green-400/10' },
    { to: '/admin/splits',          icon: Calendar,    label: 'Workout Splits',      color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { to: '/admin/transformations', icon: TrendingUp,  label: 'Transformations',     color: 'text-orange-400', bg: 'bg-orange-400/10' },
  ];

  return (
    <AdminLayout title="Trainer Dashboard">
      <div className="space-y-8">

        {/* Welcome */}
        <div className="glass-cyan rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-400/20 flex items-center justify-center text-2xl font-black text-white">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">Welcome back, {user?.name}!</h2>
              <p className="text-cyan-300/70 text-sm">Trainer Panel — Manage your clients' workouts and nutrition</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_,i) => <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users}     label="Total Members"   value={stats?.totalMembers}    color="text-cyan-400"   bg="bg-cyan-400/10" />
            <StatCard icon={UserCheck} label="Active Members"  value={stats?.activeMembers}   color="text-green-400"  bg="bg-green-400/10" />
            <StatCard icon={Dumbbell}  label="Total Exercises" value={stats?.totalExercises}  color="text-orange-400" bg="bg-orange-400/10" />
            <StatCard icon={Salad}     label="Diet Plans"      value={stats?.totalDietPlans}  color="text-purple-400" bg="bg-purple-400/10" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Activity size={16} className="text-cyan-400" /> Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map(({ to, icon: Icon, label, color, bg }) => (
                <Link key={to} to={to}
                  className="glass rounded-xl p-4 hover:border-cyan-500/30 border border-transparent transition-all group">
                  <div className={`${bg} ${color} rounded-xl p-2.5 w-fit mb-3`}>
                    <Icon size={18} />
                  </div>
                  <div className="text-white text-sm font-medium">{label}</div>
                  <ChevronRight size={14} className="text-gray-600 group-hover:text-cyan-400 transition-colors mt-1" />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Members */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Users size={16} className="text-cyan-400" /> Recent Members
              </h3>
              <Link to="/admin/members" className="text-cyan-400 text-xs hover:underline">View All</Link>
            </div>
            <div className="glass rounded-2xl overflow-hidden">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[...Array(4)].map((_,i) => <div key={i} className="h-10 rounded-lg bg-white/5 animate-pulse" />)}
                </div>
              ) : recentMembers.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">No members yet</div>
              ) : (
                <div className="divide-y divide-white/5">
                  {recentMembers.map(m => (
                    <div key={m._id} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                          {m.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white text-sm font-medium">{m.name}</div>
                          <div className="text-gray-500 text-xs">{m.membershipPlan || 'No plan'}</div>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        m.membershipStatus === 'active' ? 'bg-green-400/10 text-green-400' : 'bg-gray-500/10 text-gray-500'
                      }`}>{m.membershipStatus || 'inactive'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
