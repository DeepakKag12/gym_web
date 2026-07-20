import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import API, { cachedGet, bustCache } from '../../utils/api';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';

const emptyForm = { name: '', email: '', phone: '', password: '' };

export default function AdminTrainers() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [editData, setEditData] = useState(null); // null = add, object = edit
  const [form, setForm]         = useState(emptyForm);
  const [saving, setSaving]     = useState(false);

  const load = (force = false) => {
    if (force) bustCache('/trainers');
    cachedGet('/trainers', { cache: 180 })
      .then(r => setTrainers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditData(null); setForm(emptyForm); setModal(true); };
  const openEdit = (t) => {
    setEditData(t);
    setForm({ name: t.name, email: t.email, phone: t.phone, password: '' });
    setModal(true);
  };
  const closeModal = () => { setModal(false); setEditData(null); setForm(emptyForm); };

  const handleSave = async () => {
    if (!form.name || !form.email || !form.phone) { toast.error('Fill required fields'); return; }
    setSaving(true);
    try {
      if (editData) {
        // Edit: only send password if filled
        const payload = { name: form.name, email: form.email, phone: form.phone };
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
      bustCache('/trainers');
      toast.success('Trainer deleted');
      load(true);
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
            <div key={t._id} className="glass rounded-xl p-5 text-center card-hover relative">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-black font-bold text-xl mx-auto mb-3"
                style={{ background: 'linear-gradient(135deg, var(--cyan), #818cf8)' }}>
                {t.name?.[0]?.toUpperCase()}
              </div>
              <h3 className="font-semibold mb-0.5" style={{ color: 'var(--text)' }}>{t.name}</h3>
              <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>{t.email}</p>
              <p className="text-sm mb-3" style={{ color: 'var(--muted2)' }}>{t.phone}</p>
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
            <div className="space-y-4">
              {[
                { name: 'name',     label: 'Full Name *',  type: 'text',     placeholder: 'Trainer name' },
                { name: 'email',    label: 'Email *',      type: 'email',    placeholder: 'trainer@email.com' },
                { name: 'phone',    label: 'Phone *',      type: 'text',     placeholder: '+91 XXXXX XXXXX' },
                { name: 'password', label: editData ? 'New Password (leave blank to keep)' : 'Password', type: 'password', placeholder: editData ? 'Leave blank to keep current' : 'Set a password' },
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
