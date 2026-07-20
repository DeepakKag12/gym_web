import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import { Bell, CheckCheck, RefreshCw, User, MessageSquare, AlertCircle, Info, Gift } from 'lucide-react';
import API, { cachedGet, bustCache, freshGet } from '../../utils/api';

const TYPE_META = {
  fee_reminder:  { icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'Fee Reminder' },
  plan_expiry:   { icon: AlertCircle, color: 'text-red-400',    bg: 'bg-red-400/10',    label: 'Plan Expiry' },
  welcome:       { icon: Gift,        color: 'text-cyan-400',   bg: 'bg-cyan-400/10',   label: 'Welcome' },
  announcement:  { icon: Info,        color: 'text-blue-400',   bg: 'bg-blue-400/10',   label: 'Announcement' },
  message:       { icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-400/10', label: 'Message' },
};

function getTypeMeta(type) {
  return TYPE_META[type] || { icon: Bell, color: 'text-gray-400', bg: 'bg-gray-400/10', label: type || 'Notification' };
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AdminNotifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | unread | read
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', type: 'announcement', memberId: '' });
  const [members, setMembers] = useState([]);
  const [showCompose, setShowCompose] = useState(false);

  const load = useCallback(async (force = false) => {
    setLoading(true);
    try {
      const nf = force ? freshGet('/notifications/admin/all', { cache: 30 }) : cachedGet('/notifications/admin/all', { cache: 30 });
      const mf = cachedGet('/members', { cache: 60 });
      const [nr, mr] = await Promise.all([nf, mf]);
      setNotifs(nr.data);
      setMembers(mr.data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = notifs.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read')   return n.isRead;
    return true;
  });

  const markRead = async (id) => {
    await API.put(`/notifications/${id}/read`);
    bustCache('/notifications/admin/all');
    setNotifs(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
  };

  const markAllRead = async () => {
    await API.put('/notifications/admin/mark-all-read');
    bustCache('/notifications/admin/all');
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const send = async () => {
    if (!form.title || !form.message) return;
    setSending(true);
    try {
      await API.post('/notifications/admin/send', form);
      bustCache('/notifications/admin/all');
      setForm({ title: '', message: '', type: 'announcement', memberId: '' });
      setShowCompose(false);
      load(true);
    } catch {}
    setSending(false);
  };

  const unreadCount = notifs.filter(n => !n.isRead).length;

  return (
    <AdminLayout title="Notifications">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-white font-bold text-xl flex items-center gap-2">
              <Bell size={22} className="text-cyan-400" /> All Notifications
              {unreadCount > 0 && (
                <span className="text-xs bg-cyan-400/20 text-cyan-400 px-2 py-0.5 rounded-full">{unreadCount} unread</span>
              )}
            </h2>
            <p className="text-gray-500 text-sm mt-0.5">View and manage all member notifications</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => load(true)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
              <RefreshCw size={15} /> Refresh
            </button>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                <CheckCheck size={15} /> Mark all read
              </button>
            )}
            <button onClick={() => setShowCompose(v => !v)} className="btn-fire text-sm px-4 py-2">
              + Send Notification
            </button>
          </div>
        </div>

        {/* Compose */}
        {showCompose && (
          <div className="glass rounded-2xl p-6 space-y-4">
            <h3 className="text-white font-semibold">Compose Notification</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-xs mb-1">Title *</label>
                <input className="input-dark w-full" placeholder="Notification title" value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Type</label>
                <select className="input-dark w-full" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  {Object.entries(TYPE_META).map(([k, v]) => <option key={k} value={k} style={{ background: '#fff', color: '#111' }}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Send To</label>
                <select className="input-dark w-full" value={form.memberId} onChange={e => setForm(p => ({ ...p, memberId: e.target.value }))}>
                  <option value="" style={{ background: '#fff', color: '#111' }}>All Members (Broadcast)</option>
                  {members.map(m => <option key={m._id} value={m._id} style={{ background: '#fff', color: '#111' }}>{m.name} ({m.email})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Message *</label>
                <textarea className="input-dark w-full resize-none" rows={2} placeholder="Notification message"
                  value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowCompose(false)} className="btn-outline text-sm px-4 py-2">Cancel</button>
              <button onClick={send} disabled={sending} className="btn-fire text-sm px-4 py-2">
                {sending ? 'Sending…' : 'Send'}
              </button>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2">
          {['all','unread','read'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${filter === f ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10'}`}>
              {f}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">{[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
          ))}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Bell size={40} className="mx-auto mb-3 opacity-30" />
            <p>No notifications found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(n => {
              const meta = getTypeMeta(n.type);
              const Icon = meta.icon;
              return (
                <div key={n._id} className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${n.isRead ? 'bg-white/3 border-white/5' : 'bg-cyan-500/5 border-cyan-500/20'}`}>
                  <div className={`${meta.bg} ${meta.color} rounded-xl p-2.5 flex-shrink-0`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-semibold text-sm">{n.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>{meta.label}</span>
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />}
                    </div>
                    <p className="text-gray-400 text-sm mt-0.5 line-clamp-2">{n.message}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                      {n.member?.name && <span className="flex items-center gap-1"><User size={11} />{n.member.name}</span>}
                      <span>{timeAgo(n.createdAt)}</span>
                      {n.sentVia && n.sentVia.length > 0 && <span>via {n.sentVia.join(', ')}</span>}
                    </div>
                  </div>
                  {!n.isRead && (
                    <button onClick={() => markRead(n._id)} className="text-gray-500 hover:text-cyan-400 transition-colors flex-shrink-0 p-1">
                      <CheckCheck size={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
