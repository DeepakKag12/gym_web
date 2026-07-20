import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit2, Trash2, Bell, X,
  MessageSquare, Send, Users, Clock
} from 'lucide-react';
import API, { cachedGet, bustCache, freshGet } from '../../utils/api';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';

/* ─── constants ─────────────────────────── */
const PLANS = ['monthly', 'quarterly', 'half-yearly', 'yearly'];
const PLAN_MONTHS = { monthly: 1, quarterly: 3, 'half-yearly': 6, yearly: 12 };

const PLAN_LABELS = { monthly: '1 Month', quarterly: '3 Months', 'half-yearly': '6 Months', yearly: '12 Months' };

const emptyForm = {
  name: '', email: '', phone: '', whatsapp: '', password: '',
  membershipPlan: 'monthly', membershipStart: new Date().toISOString().split('T')[0],
  membershipEnd: '', feeAmount: '', assignedTrainer: '',
  gender: '', dob: '', address: '', membershipStatus: 'active',
};

/* ─── auto-calculate expiry ─────────────── */
function calcExpiry(start, plan) {
  if (!start || !plan) return '';
  const d = new Date(start);
  d.setMonth(d.getMonth() + (PLAN_MONTHS[plan] || 1));
  return d.toISOString().split('T')[0];
}

/* ─── status badge ──────────────────────── */
function StatusBadge({ status }) {
  const map = {
    active:  'bg-emerald-500/15 text-emerald-400',
    expired: 'bg-red-500/15 text-red-400',
    pending: 'bg-amber-500/15 text-amber-400',
  };
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${map[status] || map.pending}`}>
      {status}
    </span>
  );
}

/* ─── Member add/edit modal ─────────────── */
function MemberModal({ editData, trainers, onClose, onSaved }) {
  const [form, setForm] = useState(editData ? {
    name: editData.name, email: editData.email, phone: editData.phone,
    whatsapp: editData.whatsapp || '', password: '',
    membershipPlan: editData.membershipPlan || 'monthly',
    membershipStart: editData.membershipStart?.split('T')[0] || '',
    membershipEnd: editData.membershipEnd?.split('T')[0] || '',
    feeAmount: editData.feeAmount || '', assignedTrainer: editData.assignedTrainer?._id || '',
    gender: editData.gender || '', dob: editData.dob?.split('T')[0] || '',
    address: editData.address || '', membershipStatus: editData.membershipStatus || 'active',
  } : { ...emptyForm });

  const [saving, setSaving] = useState(false);

  /* auto-fill expiry when plan or start changes */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const next = { ...prev, [name]: value };
      if ((name === 'membershipPlan' || name === 'membershipStart') && !editData) {
        next.membershipEnd = calcExpiry(next.membershipStart, next.membershipPlan);
      }
      return next;
    });
  };

  const save = async () => {
    if (!form.name || !form.phone) { toast.error('Name and phone are required'); return; }
    if (!editData && !form.email) { toast.error('Email is required'); return; }
    setSaving(true);
    try {
      if (editData) {
        await API.put(`/members/${editData._id}`, form);
        toast.success('Member updated!');
        onSaved();
      } else {
        await API.post('/members', form);
        // Show credentials popup instead of closing immediately
        onSaved({ name: form.name, email: form.email, password: form.password || form.phone, phone: form.phone });
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const expiryPreview = form.membershipStart && form.membershipPlan
    ? calcExpiry(form.membershipStart, form.membershipPlan) : '';

  return (
    <div className="admin-modal-overlay">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="admin-modal-box">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-xl">{editData ? 'Edit Member' : 'Add New Member'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        {/* Membership plan auto-expiry preview */}
        {!editData && expiryPreview && (
          <div className="mb-4 flex items-center gap-2 bg-[#22d3ee]/8 border border-[#22d3ee]/20 rounded-xl px-4 py-3 text-sm">
            <Clock size={14} className="text-[#22d3ee] flex-shrink-0" />
            <span className="text-gray-300">
              <span className="text-[#22d3ee] font-semibold">{PLAN_LABELS[form.membershipPlan]}</span> membership — expires automatically on{' '}
              <span className="text-white font-semibold">{new Date(expiryPreview).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Personal details */}
          <div className="sm:col-span-2">
            <p className="text-[#22d3ee] text-xs font-semibold uppercase tracking-wider mb-3">Personal Details</p>
          </div>
          {[
            { name: 'name',     label: 'Full Name *',          type: 'text',     placeholder: 'John Doe' },
            { name: 'email',    label: `Email${editData ? '' : ' *'}`,type: 'email',  placeholder: 'john@gmail.com' },
            { name: 'phone',    label: 'Phone *',              type: 'tel',      placeholder: '9876543210' },
            { name: 'whatsapp', label: 'WhatsApp No',          type: 'tel',      placeholder: 'Same as phone or different' },
            { name: 'password', label: editData ? 'New Password (leave blank)' : 'Password (default: phone)', type: 'password', placeholder: '••••••••' },
            { name: 'dob',      label: 'Date of Birth',        type: 'date' },
            { name: 'address',  label: 'Address',              type: 'text',     placeholder: '123 Street, City' },
          ].map(f => (
            <div key={f.name}>
              <label className="text-gray-400 text-xs font-medium block mb-1.5">{f.label}</label>
              <input className="input-dark text-sm" name={f.name} type={f.type} value={form[f.name]}
                onChange={handleChange} placeholder={f.placeholder} />
            </div>
          ))}
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Gender</label>
            <select className="input-dark text-sm" name="gender" value={form.gender} onChange={handleChange}>
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Membership */}
          <div className="sm:col-span-2 pt-2">
            <p className="text-[#22d3ee] text-xs font-semibold uppercase tracking-wider mb-3">Membership Details</p>
          </div>
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Membership Plan *</label>
            <select className="input-dark text-sm" name="membershipPlan" value={form.membershipPlan} onChange={handleChange}>
              {PLANS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)} ({PLAN_LABELS[p]})</option>)}
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Joining Date *</label>
            <input className="input-dark text-sm" name="membershipStart" type="date" value={form.membershipStart} onChange={handleChange} />
          </div>
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-1.5">
              Expiry Date <span className="text-gray-600">(auto-calculated)</span>
            </label>
            <input className="input-dark text-sm" name="membershipEnd" type="date" value={form.membershipEnd} onChange={handleChange} />
          </div>
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Fee Amount (₹)</label>
            <input className="input-dark text-sm" name="feeAmount" type="number" value={form.feeAmount} onChange={handleChange} placeholder="1500" />
          </div>
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Assign Trainer</label>
            <select className="input-dark text-sm" name="assignedTrainer" value={form.assignedTrainer} onChange={handleChange}>
              <option value="">No trainer assigned</option>
              {trainers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>
          {editData && (
            <div>
              <label className="text-gray-400 text-xs font-medium block mb-1.5">Membership Status</label>
              <select className="input-dark text-sm" name="membershipStatus" value={form.membershipStatus} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="btn-ghost px-5 py-2.5 text-sm">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-fire px-6 py-2.5 text-sm">
            {saving ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : (editData ? 'Update Member' : 'Add Member')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Notification modal ────────────────── */
function NotifModal({ member, onClose }) {
  const [form, setForm] = useState({ title: '', message: '', doWhatsApp: true });
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!form.title || !form.message) { toast.error('Fill title and message'); return; }
    setSending(true);
    try {
      await API.post(`/members/${member._id}/send-notification`, {
        title: form.title, message: form.message, sendWhatsApp: form.doWhatsApp
      });
      toast.success('Notification sent!');
      onClose();
    } catch { toast.error('Failed to send'); }
    finally { setSending(false); }
  };

  return (
    <div className="admin-modal-overlay">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="admin-modal-box" style={{ maxWidth: '480px' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <Bell size={18} className="text-[#22d3ee]" /> Send to {member.name}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Title</label>
            <input className="input-dark text-sm" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Fee Reminder" />
          </div>
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Message</label>
            <textarea rows={4} className="input-dark text-sm resize-none" value={form.message}
              onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              placeholder={`Dear ${member.name}, your membership...`} />
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/8 border border-green-500/20">
            <input type="checkbox" id="wa" checked={form.doWhatsApp}
              onChange={e => setForm(p => ({ ...p, doWhatsApp: e.target.checked }))}
              className="w-4 h-4 accent-green-400" />
            <label htmlFor="wa" className="text-green-300 text-sm cursor-pointer flex items-center gap-2">
              <MessageSquare size={14} /> Also send WhatsApp message to {member.whatsapp || member.phone}
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onClose} className="btn-ghost px-5 py-2.5 text-sm">Cancel</button>
          <button onClick={send} disabled={sending} className="btn-fire px-5 py-2.5 text-sm gap-2">
            {sending ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              : <><Send size={14} /> Send</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Bulk reminder modal ───────────────── */
function BulkReminderModal({ onClose }) {
  const [days, setDays] = useState(7);
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);

  const send = async () => {
    setSending(true);
    try {
      const res = await API.post('/members/bulk-reminder', { days: Number(days), customMessage: msg || undefined });
      toast.success(res.data.message);
      onClose();
    } catch { toast.error('Failed'); }
    finally { setSending(false); }
  };

  return (
    <div className="admin-modal-overlay">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="admin-modal-box" style={{ maxWidth: '480px' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <Users size={18} className="text-[#22d3ee]" /> Bulk Reminder
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Send to members expiring within</label>
            <select className="input-dark text-sm" value={days} onChange={e => setDays(e.target.value)}>
              <option value={3}>3 days</option>
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Custom message (optional — leave blank for default)</label>
            <textarea rows={3} className="input-dark text-sm resize-none" value={msg}
              onChange={e => setMsg(e.target.value)} placeholder="Dear [member], your membership..." />
          </div>
          <p className="text-gray-600 text-xs">This sends both a website notification and a WhatsApp message to all matching members.</p>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onClose} className="btn-ghost px-5 py-2.5 text-sm">Cancel</button>
          <button onClick={send} disabled={sending} className="btn-fire px-5 py-2.5 text-sm gap-2">
            {sending ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <><Send size={14} /> Send Bulk</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── MAIN PAGE ─────────────────────────── */
export default function AdminMembers() {
  const [members, setMembers]   = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [memberModal, setMemberModal]   = useState(null); // null | 'new' | member-object
  const [notifTarget, setNotifTarget]   = useState(null); // member object
  const [bulkModal, setBulkModal]       = useState(false);
  const [credentials, setCredentials]   = useState(null); // { name, email, password, phone }

  const load = useCallback((force = false) => {
    setLoading(true);
    const mf = force ? freshGet('/members', { cache: 60 })   : cachedGet('/members', { cache: 60 });
    const tf = force ? freshGet('/trainers', { cache: 180 }) : cachedGet('/trainers', { cache: 180 });
    Promise.all([mf, tf])
      .then(([m, t]) => { setMembers(m.data); setTrainers(t.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  const del = async (id) => {
    if (!window.confirm('Delete this member? This cannot be undone.')) return;
    try {
      await API.delete(`/members/${id}`);
      setMembers(prev => prev.filter(m => m._id !== id));
      bustCache('/members');
      toast.success('Deleted');
    } catch { toast.error('Error deleting'); }
  };

  const filtered = members.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = m.name?.toLowerCase().includes(q) || m.phone?.includes(q) || m.email?.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'all' || m.membershipStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total:   members.length,
    active:  members.filter(m => m.membershipStatus === 'active').length,
    expired: members.filter(m => m.membershipStatus === 'expired').length,
    expiring: members.filter(m => {
      if (!m.membershipEnd) return false;
      const d = Math.ceil((new Date(m.membershipEnd) - new Date()) / 86400000);
      return d >= 0 && d <= 7;
    }).length,
  };

  return (
    <AdminLayout title="Members">
      {/* Stats strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total',    value: stats.total,    color: 'text-[#22d3ee]' },
          { label: 'Active',   value: stats.active,   color: 'text-emerald-400' },
          { label: 'Expired',  value: stats.expired,  color: 'text-red-400' },
          { label: 'Expiring', value: stats.expiring, color: 'text-amber-400' },
        ].map((s, i) => (
          <div key={i} className="glass rounded-xl px-3 py-2.5 flex items-center gap-2">
            <span className={`font-black text-2xl ${s.color}`}>{s.value}</span>
            <span className="text-gray-500 text-xs leading-tight">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input className="input-dark pl-9 py-2 text-sm w-full" placeholder="Search name, phone, email…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <select className="input-dark py-2 text-sm flex-1 sm:w-36" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="pending">Pending</option>
          </select>
          <button onClick={() => setBulkModal(true)} className="btn-ghost text-sm py-2 px-3 gap-1.5 flex-shrink-0 flex items-center">
            <Bell size={14} />
            <span className="hidden sm:inline">Bulk</span>
          </button>
          <button onClick={() => setMemberModal('new')} className="btn-fire text-sm py-2 px-4 gap-1.5 flex-shrink-0">
            <Plus size={15} /> Add
          </button>
        </div>
      </div>

      {/* Member cards */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#22d3ee] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-gray-600">No members found</div>
      ) : (
        <>
          <div className="space-y-3">
            {filtered.map(m => {
              const daysLeft = m.membershipEnd
                ? Math.ceil((new Date(m.membershipEnd) - new Date()) / 86400000) : null;
              return (
                <div key={m._id} className="glass rounded-2xl p-4">
                  {/* Name + status row */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#22d3ee] to-[#818cf8] flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
                      {m.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-semibold text-sm">{m.name}</span>
                        <StatusBadge status={m.membershipStatus} />
                      </div>
                      <div className="text-gray-500 text-xs mt-0.5 truncate">{m.email}</div>
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-3 text-xs">
                    <div>
                      <span className="text-gray-600">Phone: </span>
                      <span className="text-gray-300">{m.phone}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Plan: </span>
                      <span className="text-gray-300 capitalize">{m.membershipPlan}</span>
                      {m.feeAmount && <span className="text-[#22d3ee] font-semibold ml-1">₹{m.feeAmount}</span>}
                    </div>
                    <div>
                      <span className="text-gray-600">Joined: </span>
                      <span className="text-gray-300">{m.membershipStart ? new Date(m.membershipStart).toLocaleDateString('en-IN') : '—'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Expires: </span>
                      <span className={daysLeft !== null && daysLeft <= 7 && daysLeft >= 0 ? (daysLeft <= 3 ? 'text-red-400 font-bold' : 'text-amber-400 font-bold') : 'text-gray-300'}>
                        {m.membershipEnd ? new Date(m.membershipEnd).toLocaleDateString('en-IN') : '—'}
                        {daysLeft !== null && daysLeft >= 0 && daysLeft <= 7 && ` (${daysLeft}d)`}
                      </span>
                    </div>
                    {m.assignedTrainer?.name && (
                      <div className="col-span-2">
                        <span className="text-gray-600">Trainer: </span>
                        <span className="text-gray-300">{m.assignedTrainer.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-3 border-t border-white/5">
                    <button onClick={() => setNotifTarget(m)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs text-[#22d3ee] hover:bg-[#22d3ee]/10 rounded-xl py-2 transition-all border border-[#22d3ee]/20">
                      <Bell size={13} /> Notify
                    </button>
                    <button onClick={() => setMemberModal(m)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs text-amber-400 hover:bg-amber-400/10 rounded-xl py-2 transition-all border border-amber-400/20">
                      <Edit2 size={13} /> Edit
                    </button>
                    <button onClick={() => del(m._id)}
                      className="flex items-center justify-center gap-1.5 text-xs text-red-400 hover:bg-red-400/10 rounded-xl py-2 px-3 transition-all border border-red-400/20">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-gray-600 text-xs text-center">
            Showing {filtered.length} of {members.length} members
          </div>
        </>
      )}

      {/* Member modal */}
      <AnimatePresence>
        {memberModal && (
          <MemberModal
            editData={memberModal === 'new' ? null : memberModal}
            trainers={trainers}
            onClose={() => setMemberModal(null)}
            onSaved={(creds) => {
              setMemberModal(null);
              // Bust analytics + members cache so Revenue/Analytics pages show fresh numbers
              bustCache('analytics');
              bustCache('orders');
              load(true);
              if (creds) setCredentials(creds); // show credentials popup for new member
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Credentials popup ── */}
      <AnimatePresence>
        {credentials && (
          <div className="admin-modal-overlay" style={{ background: 'rgba(0,0,0,0.85)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm rounded-2xl p-6"
              style={{ background: 'var(--bg2)', border: '1px solid var(--border-cyan)' }}
            >
              {/* Header */}
              <div className="text-center mb-5">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-black font-bold text-2xl mx-auto mb-3"
                  style={{ background: 'linear-gradient(135deg, var(--cyan), #818cf8)' }}>
                  ✓
                </div>
                <h2 className="font-bold text-xl mb-1" style={{ color: 'var(--text)' }}>Member Added!</h2>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>Share these login credentials with <strong style={{ color: 'var(--cyan)' }}>{credentials.name}</strong></p>
              </div>

              {/* Credentials box */}
              <div className="rounded-xl p-4 mb-5 space-y-3"
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--muted)' }}>Login URL</p>
                  <p className="font-mono text-sm font-bold" style={{ color: 'var(--cyan)' }}>{window.location.origin}/login</p>
                </div>
                <div className="h-px" style={{ background: 'var(--border)' }} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--muted)' }}>Email</p>
                  <p className="font-mono text-sm font-bold" style={{ color: 'var(--text)' }}>{credentials.email}</p>
                </div>
                <div className="h-px" style={{ background: 'var(--border)' }} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--muted)' }}>Password</p>
                  <p className="font-mono text-sm font-bold" style={{ color: 'var(--text)' }}>{credentials.password}</p>
                  <p className="text-[10px] mt-1" style={{ color: 'var(--muted)' }}>Default password is phone number unless custom was set</p>
                </div>
              </div>

              {/* WhatsApp share button */}
              <a
                href={`https://wa.me/91${credentials.phone}?text=${encodeURIComponent(
                  `🏋️ *FITNATION BY AJEET*\n\nHi ${credentials.name}! Your gym membership is now active.\n\n*Login Details:*\n🌐 ${window.location.origin}/login\n📧 Email: ${credentials.email}\n🔑 Password: ${credentials.password}\n\nDownload the app or visit our website to access your workout plans, diet plans and more!\n\n_Welcome to FitNation! 💪_`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm mb-3 transition-all"
                style={{ background: '#22c55e', color: '#fff' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Send via WhatsApp
              </a>

              <button
                onClick={() => setCredentials(null)}
                className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ border: '1px solid var(--border)', color: 'var(--muted)' }}
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notification modal */}
      <AnimatePresence>
        {notifTarget && <NotifModal member={notifTarget} onClose={() => setNotifTarget(null)} />}
      </AnimatePresence>

      {/* Bulk reminder modal */}
      <AnimatePresence>
        {bulkModal && <BulkReminderModal onClose={() => setBulkModal(false)} />}
      </AnimatePresence>
    </AdminLayout>
  );
}
