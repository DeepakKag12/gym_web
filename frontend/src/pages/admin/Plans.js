import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Tag, CheckCircle, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import API, { cachedGet, bustCache } from '../../utils/api';
import AdminLayout from './AdminLayout';

function PlanModal({ plan, onClose, onSaved }) {
  const [form, setForm] = useState(plan ? { ...plan, features: plan.features?.join('\n') || '' } : {
    name: '', slug: '', durationDays: '', price: '', features: '', isPopular: false, isActive: true
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, features: form.features.split('\n').filter(Boolean), durationDays: Number(form.durationDays), price: Number(form.price) };
      if (plan) { await API.put(`/plans/${plan._id}`, payload); toast.success('Plan updated'); }
      else { await API.post('/plans', payload); toast.success('Plan created'); }
      onSaved();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="admin-modal-overlay">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="admin-modal-box" style={{ maxWidth: '480px' }}>
        <h2 className="text-white font-bold text-xl mb-5">{plan ? 'Edit' : 'Add'} Membership Plan</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Plan Name *</label>
              <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input-dark w-full" placeholder="Monthly" />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Slug *</label>
              <input required value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} className="input-dark w-full" placeholder="monthly" />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Duration (days) *</label>
              <input required type="number" value={form.durationDays} onChange={e => setForm(p => ({ ...p, durationDays: e.target.value }))} className="input-dark w-full" placeholder="30" />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Price (₹) *</label>
              <input required type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} className="input-dark w-full" placeholder="999" />
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Features (one per line)</label>
            <textarea value={form.features} onChange={e => setForm(p => ({ ...p, features: e.target.value }))} rows={4} className="input-dark w-full resize-none text-sm" placeholder="Full gym access&#10;1 trainer session/week&#10;Locker facility" />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isPopular} onChange={e => setForm(p => ({ ...p, isPopular: e.target.checked }))} className="w-4 h-4" />
              <span className="text-gray-300 text-sm">Mark as Popular</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4" />
              <span className="text-gray-300 text-sm">Active</span>
            </label>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving} className="btn-fire text-sm px-5 py-2">{saving ? 'Saving...' : 'Save Plan'}</button>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-all">Cancel</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function AdminPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const fetchPlans = (force = false) => {
    if (force) bustCache('/plans');
    setLoading(true);
    cachedGet('/plans', { cache: 300 }).then(r => setPlans(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(fetchPlans, []);

  const deletePlan = async (id) => {
    if (!window.confirm('Delete this plan?')) return;
    try {
      await API.delete(`/plans/${id}`);
      bustCache('/plans');
      setPlans(prev => prev.filter(p => p._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
  };

  return (
    <AdminLayout title="Membership Plans">
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-400 text-sm">Define your gym's membership tiers and pricing</p>
        <button onClick={() => setModal('new')} className="btn-fire flex items-center gap-2 text-sm px-4 py-2">
          <Plus size={15} /> Add Plan
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : plans.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Tag size={40} className="text-gray-600 mx-auto mb-3" />
          <div className="text-gray-400">No plans defined. Add your first membership plan!</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map((plan, i) => (
            <motion.div key={plan._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className={`glass rounded-2xl p-5 relative ${plan.isPopular ? 'border-blue-500/40' : ''}`}>
              {plan.isPopular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-semibold px-3 py-0.5 rounded-full flex items-center gap-1">
                  <Star size={11} /> Popular
                </div>
              )}
              <div className="flex items-start justify-between mb-3 mt-1">
                <div>
                  <div className="text-white font-bold text-lg">{plan.name}</div>
                  <div className="text-gray-500 text-xs">{plan.durationDays} days</div>
                </div>
                <div className="text-right">
                  <div className="text-blue-400 font-bold text-xl">₹{plan.price?.toLocaleString('en-IN')}</div>
                  {!plan.isActive && <span className="text-xs text-gray-600">Inactive</span>}
                </div>
              </div>
              <ul className="space-y-1.5 mb-4">
                {(plan.features || []).map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-gray-300 text-xs">
                    <CheckCircle size={12} className="text-green-400 mt-0.5 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2 pt-2 border-t border-white/10">
                <button onClick={() => setModal(plan)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-400 transition-colors">
                  <Edit2 size={13} /> Edit
                </button>
                <button onClick={() => deletePlan(plan._id)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 transition-colors ml-auto">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {modal && (
        <PlanModal plan={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSaved={() => { bustCache('/plans'); setModal(null); fetchPlans(true); }} />
      )}
    </AdminLayout>
  );
}
