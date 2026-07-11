import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, X } from 'lucide-react';
import API from '../../utils/api';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';

const emptyForm = { name: '', email: '', phone: '', password: '' };

export default function AdminTrainers() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => API.get('/trainers').then(r => setTrainers(r.data)).catch(() => {}).finally(() => setLoading(false));
  useEffect(load, []);

  const handleSave = async () => {
    if (!form.name || !form.email || !form.phone) { toast.error('Fill required fields'); return; }
    setSaving(true);
    try {
      await API.post('/trainers', form);
      toast.success('Trainer added!');
      setModal(false); setForm(emptyForm); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  return (
    <AdminLayout title="Trainers">
      <div className="flex justify-end mb-6">
        <button onClick={() => { setModal(true); setForm(emptyForm); }} className="btn-fire flex items-center gap-2 text-sm py-2.5 px-4">
          <Plus size={16} /> Add Trainer
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {trainers.map(t => (
            <div key={t._id} className="glass rounded-xl p-5 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                {t.name?.[0]?.toUpperCase()}
              </div>
              <h3 className="text-white font-semibold">{t.name}</h3>
              <p className="text-gray-500 text-xs">{t.email}</p>
              <p className="text-gray-400 text-sm mt-1">{t.phone}</p>
              <div className="mt-2 text-xs bg-orange-500/20 text-orange-400 rounded-full px-3 py-0.5 inline-block">Trainer</div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0d0d14] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-xl">Add Trainer</h2>
              <button onClick={() => setModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              {[
                { name: 'name', label: 'Name *', type: 'text', placeholder: 'Trainer name' },
                { name: 'email', label: 'Email *', type: 'email', placeholder: 'trainer@email.com' },
                { name: 'phone', label: 'Phone *', type: 'text', placeholder: '+91 XXXXX XXXXX' },
                { name: 'password', label: 'Password', type: 'password', placeholder: 'Set a password' },
              ].map(f => (
                <div key={f.name}>
                  <label className="text-gray-400 text-xs block mb-1">{f.label}</label>
                  <input className="input-dark text-sm py-2" name={f.name} type={f.type} value={form[f.name]} onChange={e => setForm({ ...form, [f.name]: e.target.value })} placeholder={f.placeholder} />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setModal(false)} className="px-4 py-2 text-gray-400 border border-white/10 rounded-lg text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-fire px-5 py-2 text-sm">
                {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" /> : 'Add Trainer'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
}
