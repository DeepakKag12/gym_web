import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, X, UserCheck, UserX } from 'lucide-react';
import API, { cachedGet, bustCache, freshGet } from '../../utils/api';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';

const emptyForm = { name: '', email: '', phone: '', password: '', gender: '', specialization: '', isActive: true };

export default function AdminTrainers() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [editData, setEditData] = useState(null); // null = add, object = edit
  const [form, setForm]         = useState(emptyForm);
  const [saving, setSaving]     = useState(false);

  const load = (force = false) => {
    setLoading(true);
    const fetcher = force ? freshGet('/trainers', { cache: 180 }) : cachedGet('/trainers', { cache: 180 });
    fetcher.then(r => setTrainers(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditData(null); setForm(emptyForm); setModal(true); };
  const openEdit = (t) => {
    setEditData(t);
    setForm({ name: t.name, email: t.email, phone: t.phone, password: '', gender: t.gender || '', specialization: t.specialization || '', isActive: t.isActive !== false });
    setModal(true);
  };
  const closeModal = () => { setModal(false); setEditData(null); setForm(emptyForm); };

  const handleSave = async () => {
    if (!form.name || !form.email || !form.phone) { toast.error('Fill required fields'); return; }
    setSaving(true);
    try {
      if (editData) {
        // Edit: only send password if filled
        const payload = { name: form.name, email: form.email, phone: form.phone, gender: form.gender, specialization: form.specialization, isActive: form.isActive };
        if (form.password) payload.password = form.password;
        await API.put(`/trainers/${editData._id}`, payload);
        toast.success('Trainer updated!');
      } else {
        // Add new
        await API.post('/trainers', form);
        toast.success('Trainer added!');
      }
      bustCache('/trainers');
      closeModal();
      load(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this trainer?')) return;
    try {
      await API.delete(`/trainers/${id}`);
      setTrainers(prev => prev.filter(t => t._id !== id));
      bustCache('/trainers');
      toast.success('Trainer deleted');
    } catch {
      toast.error('Error deleting trainer');
    }
  };

  return (
    <AdminLayout title="Trainers">
      <div className="flex justify-end mb-6">
        <button onClick={openAdd} className="btn-fire flex items-center gap-2 text-sm py-2.5 px-4">
          <Plus size={16} /> Add Trainer
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--cyan)', borderTopColor: 'transparent' }} />
        </div>
      ) : trainers.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--muted)' }}>No trainers yet. Add one!</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {trainers.map(t => (
            <div key={t._id} className={`glass rounded-xl p-5 text-center card-hover relative ${t.isActive === false ? 'opacity-60' : ''}`}>
              {/* Active badge */}
              <div className="absolute top-3 right-3">
                {t.isActive !== false
                  ? <span className="flex items-center gap-1 text-[10px] text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full"><UserCheck size={9}/> Active</span>
                  : <span className="flex items-center gap-1 text-[10px] text-gray-500 bg-gray-500/10 border border-gray-500/20 px-2 py-0.5 rounded-full"><UserX size={9}/> Inactive</span>
                }
              </div>
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-black font-bold text-xl mx-auto mb-3"
                style={{ background: 'linear-gradient(135deg, var(--cyan), #818cf8)' }}>
                {t.name?.[0]?.toUpperCase()}
              </div>
              <h3 className="font-semibold mb-0.5" style={{ color: 'var(--text)' }}>{t.name}</h3>
              <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>{t.email}</p>
              <p className="text-sm mb-1" style={{ color: 'var(--muted2)' }}>{t.phone}</p>
              {t.gender && <p className="text-xs mb-1 capitalize" style={{ color: 'var(--muted)' }}>{t.gender}</p>}
              {t.specialization && <p className="text-xs mb-2 italic" style={{ color: 'var(--muted)' }}>{t.specialization}</p>}
              <div className="text-xs font-bold uppercase tracking-widest px-3 py-0.5 rounded-full inline-block mb-4"
                style={{ background: 'rgba(34,211,238,0.1)', color: 'var(--cyan)', border: '1px solid rgba(34,211,238,0.2)' }}>
                Trainer
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => openEdit(t)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                  style={{ background: 'rgba(34,211,238,0.1)', color: 'var(--cyan)', border: '1px solid rgba(34,211,238,0.2)' }}
                >
                  <Edit2 size={12} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(t._id)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {modal && (
        <div className="admin-modal-overlay">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="admin-modal-box"
            style={{ maxWidth: '480px' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-xl" style={{ color: 'var(--text)' }}>
                {editData ? 'Edit Trainer' : 'Add Trainer'}
              </h2>
              <button onClick={closeModal} className="icon-btn" style={{ color: 'var(--muted)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Fields */}
            <div className="space-y-3">
              {[
                { name: 'name',     label: 'Full Name *',  type: 'text',     placeholder: 'Trainer name' },
                { name: 'email',    label: 'Email *',      type: 'email',    placeholder: 'trainer@email.com' },
                { name: 'phone',    label: 'Phone *',      type: 'text',     placeholder: '+91 XXXXX XXXXX' },
                { name: 'password', label: editData ? 'New Password (leave blank to keep)' : 'Password *', type: 'password', placeholder: editData ? 'Leave blank to keep current' : 'Set a password' },
                { name: 'specialization', label: 'Specialization / Bio', type: 'text', placeholder: 'e.g. Strength Training, Fat Loss…' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-xs mb-1" style={{ color: 'var(--muted)' }}>{f.label}</label>
                  <input
                    className="input-dark text-sm py-2"
                    name={f.name}
                    type={f.type}
                    value={form[f.name]}
                    onChange={e => setForm({ ...form, [f.name]: e.target.value })}
                    placeholder={f.placeholder}
                  />
                </div>
              ))}
              {/* Gender */}
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--muted)' }}>Gender</label>
                <select className="input-dark text-sm py-2 w-full" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                  <option value="" style={{ background: '#111318', color: '#f1f5f9' }}>Select gender</option>
                  <option value="male"   style={{ background: '#111318', color: '#f1f5f9' }}>Male</option>
                  <option value="female" style={{ background: '#111318', color: '#f1f5f9' }}>Female</option>
                  <option value="other"  style={{ background: '#111318', color: '#f1f5f9' }}>Other</option>
                </select>
              </div>
              {/* Active toggle */}
              <div className="flex items-center justify-between py-1">
                <label className="text-xs" style={{ color: 'var(--muted)' }}>Active (visible to members)</label>
                <button type="button" onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                  className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${form.isActive ? 'bg-green-500' : 'bg-gray-700'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.isActive ? 'left-5.5' : 'left-0.5'}`}
                    style={{ left: form.isActive ? 'calc(100% - 18px)' : '2px' }} />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm rounded-lg"
                style={{ color: 'var(--muted)', border: '1px solid var(--border)' }}
              >
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-fire px-5 py-2 text-sm">
                {saving
                  ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin inline-block" />
                  : editData ? 'Save Changes' : 'Add Trainer'
                }
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
}
