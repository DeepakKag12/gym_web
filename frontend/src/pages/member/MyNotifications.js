import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, CheckCheck } from 'lucide-react';
import API, { bustCache } from '../../utils/api';
import toast from 'react-hot-toast';

const TYPE_COLORS = {
  'fee-reminder': 'bg-yellow-500/10 border-yellow-500/20',
  'membership-expired': 'bg-red-500/10 border-red-500/20',
  'diet-assigned': 'bg-green-500/10 border-green-500/20',
  'exercise-assigned': 'bg-orange-500/10 border-orange-500/20',
  'general': 'bg-blue-500/10 border-blue-500/20',
};

export default function MyNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => API.get('/notifications').then(r => setNotifications(r.data)).catch(() => {}).finally(() => setLoading(false));
  useEffect(load, []);

  const markRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      bustCache('notifications');
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch { toast.error('Error'); }
  };

  const markAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
      bustCache('notifications');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch { toast.error('Error'); }
  };

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20 pb-24 lg:pb-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white font-bold text-3xl flex items-center gap-3">
              <Bell className="text-orange-500" size={28} /> Notifications
            </h1>
            {unread > 0 && <p className="text-orange-400 text-sm mt-1">{unread} unread</p>}
          </div>
          {unread > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-2 text-gray-400 hover:text-orange-400 text-sm border border-white/10 px-4 py-2 rounded-lg transition-all">
              <CheckCheck size={16} /> Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No notifications yet</div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n, i) => (
              <motion.div
                key={n._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                  n.isRead ? 'border-white/5 bg-transparent' : `${TYPE_COLORS[n.type] || 'bg-white/3 border-white/10'}`
                }`}
                onClick={() => { if (!n.isRead) markRead(n._id); }}
              >
                <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${n.isRead ? 'bg-gray-700' : 'bg-orange-500'}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-white font-semibold text-sm">{n.title}</div>
                    {!n.isRead && (
                      <button onClick={(e) => { e.stopPropagation(); markRead(n._id); }} className="text-orange-400 hover:text-orange-300">
                        <Check size={16} />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-1 leading-relaxed">{n.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-gray-600 text-xs">{new Date(n.createdAt).toLocaleString()}</span>
                    {n.sentVia?.includes('whatsapp') && <span className="text-green-400 text-xs">📱 WhatsApp</span>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
