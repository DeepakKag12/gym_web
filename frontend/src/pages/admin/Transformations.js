import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, X } from 'lucide-react';
import API from '../../utils/api';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';

const emptyForm = { title: '', description: '', duration: '', weightLost: '', muscleGained: '', isPublic: true, member: '' };

export default function AdminTransformations() {
  const [transformations, setTransformations] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [beforeFile, setBeforeFile] = useState(null);
  const [afterFile, setAfterFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    API.get('/transformations/all').then(r => setTransformations(r.data)).catch(() => {}).finally(() => setLoading(false));
    API.get('/members').then(r => setMembers(r.data)).catch(() => {});
  };
  useEffect(load, []);

  const handleSave = async () => {
    if (!form.title || !form.member || !beforeFile || !afterFile) { toast.error('Fill all required fields and upload both images'); return; }
    setSaving(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      data.append('beforeImage', beforeFile);
      data.append('afterImage', afterFile);
      await API.post('/transformations', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Transformation added!');
      setModal(false); setForm(emptyForm); setBeforeFile(null); setAfterFile(null); load();
    } catch { toast.error('Error saving'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    try { await API.delete(`/transformations/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Error'); }
  };

  return (
    <AdminLayout title="Transformations">
      <div className="flex justify-end mb-6">
        <button onClick={() => { setModal(true); setForm(emptyForm); }} className="btn-fire flex items-center gap-2 text-sm py-2.5 px-4">
          <Plus size={16} /> Add Transformation
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : transformations.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No transformations yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {transformations.map(t => (
            <div key={t._id} className="glass rounded-xl overflow-hidden">
              <div className="grid grid-cols-2 gap-0.5">
                <div className="relative"><img src={t.beforeImage} alt="Before" className="w-full h-44 object-cover" /><div className="absolute bottom-1 left-1 text-xs bg-red-500/80 text-white px-2 py-0.5 rounded-full">BEFORE</div></div>
                <div className="relative"><img src={t.afterImage} alt="After" className="w-full h-44 object-cover" /><div className="absolute bottom-1 right-1 text-xs bg-green-500/80 text-white px-2 py-0.5 rounded-full">AFTER</div></div>
              </div>
              <div className="p-4 flex items-start justify-between">
                <div>
                  <h3 className="text-white font-semibold">{t.title}</h3>
                  <p className="text-gray-500 text-xs">{t.member?.name}</p>
                  <div className="flex gap-2 mt-1 text-xs">
                    {t.duration && <span className="text-gray-400">{t.duration}</span>}
                    {t.weightLost && <span className="text-red-400">↓ {t.weightLost}</span>}
                    {t.muscleGained && <span className="text-green-400">↑ {t.muscleGained}</span>}
                  </div>
                </div>
                <button onClick={() => handleDelete(t._id)} className="text-red-400 p-1.5 hover:bg-red-400/10 rounded-lg"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0d0d14] border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-xl">Add Transformation</h2>
              <button onClick={() => setModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-xs block mb-1">Member *</label>
                <select className="input-dark text-sm py-2" value={form.member} onChange={e => setForm({ ...form, member: e.target.value })}>
                  <option value="">Select member</option>
                  {members.map(m => <option key={m._id} value={m._id} className="bg-[#0d0d14]">{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1">Title *</label>
                <input className="input-dark text-sm py-2" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. John's 3-Month Transformation" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-gray-400 text-xs block mb-1">Duration</label>
                  <input className="input-dark text-sm py-2" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="3 months" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs block mb-1">Weight Lost</label>
                  <input className="input-dark text-sm py-2" value={form.weightLost} onChange={e => setForm({ ...form, weightLost: e.target.value })} placeholder="10 kg" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs block mb-1">Muscle Gained</label>
                  <input className="input-dark text-sm py-2" value={form.muscleGained} onChange={e => setForm({ ...form, muscleGained: e.target.value })} placeholder="5 kg" />
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1">Description</label>
                <textarea className="input-dark text-sm min-h-[70px]" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 text-xs block mb-1">Before Photo *</label>
                  <input type="file" accept="image/*" onChange={e => setBeforeFile(e.target.files[0])} className="text-gray-400 text-xs" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs block mb-1">After Photo *</label>
                  <input type="file" accept="image/*" onChange={e => setAfterFile(e.target.files[0])} className="text-gray-400 text-xs" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isPublic} onChange={e => setForm({ ...form, isPublic: e.target.checked })} />
                <span className="text-gray-300 text-sm">Make Public</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setModal(false)} className="px-4 py-2 text-gray-400 border border-white/10 rounded-lg text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-fire px-5 py-2 text-sm">
                {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" /> : 'Save'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
}
