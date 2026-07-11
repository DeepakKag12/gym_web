import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, Edit2, Salad, Users } from 'lucide-react';
import API from '../../utils/api';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';

const GOALS = ['weight-loss','muscle-gain','maintenance','endurance','general'];
const MEAL_TYPES = ['breakfast','lunch','dinner','snack','pre-workout','post-workout'];

const emptyForm = {
  title: '', description: '', goal: 'general', totalCalories: '',
  totalProtein: '', isPublic: true, assignedTo: '',
};

function DietModal({ editData, members, onClose, onSaved }) {
  const [form, setForm] = useState(editData ? {
    ...emptyForm, ...editData,
    isPublic: editData.isPublic !== false,
    assignedTo: editData.assignedTo?.[0] || '',
  } : { ...emptyForm });
  const [meals, setMeals] = useState(editData?.meals || []);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const addMeal = () => setMeals(p => [...p, { mealType: 'breakfast', time: '', notes: '', items: [{ name: '', quantity: '', calories: '' }] }]);
  const updateMeal = (i, field, val) => setMeals(p => p.map((m, idx) => idx === i ? { ...m, [field]: val } : m));
  const removeMeal = (i) => setMeals(p => p.filter((_, idx) => idx !== i));
  const addItem = (mi) => setMeals(p => p.map((m, idx) => idx === mi ? { ...m, items: [...m.items, { name: '', quantity: '', calories: '' }] } : m));
  const updateItem = (mi, ii, f, v) => setMeals(p => p.map((m, idx) => idx === mi ? { ...m, items: m.items.map((it, j) => j === ii ? { ...it, [f]: v } : it) } : m));
  const removeItem = (mi, ii) => setMeals(p => p.map((m, idx) => idx === mi ? { ...m, items: m.items.filter((_, j) => j !== ii) } : m));

  const save = async () => {
    if (!form.title) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'assignedTo') fd.append(k, form.isPublic ? JSON.stringify([]) : JSON.stringify(form[k] ? [form[k]] : []));
        else fd.append(k, v);
      });
      fd.append('meals', JSON.stringify(meals));
      if (imageFile) fd.append('image', imageFile);

      if (editData) {
        await API.put(`/diet/${editData._id}`, { ...form, meals, assignedTo: form.isPublic ? [] : (form.assignedTo ? [form.assignedTo] : []) });
        toast.success('Diet plan updated!');
      } else {
        await API.post('/diet', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Diet plan created!');
      }
      onSaved();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center px-4 py-8 overflow-y-auto">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-[#111318] border border-white/10 rounded-2xl p-6 w-full max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-xl">{editData ? 'Edit Diet Plan' : 'Create Diet Plan'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div className="sm:col-span-2">
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Title *</label>
            <input className="input-dark text-sm" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Summer Shred Diet" />
          </div>
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Goal</label>
            <select className="input-dark text-sm" value={form.goal} onChange={e => setForm(p => ({ ...p, goal: e.target.value }))}>
              {GOALS.map(g => <option key={g} value={g} style={{ background: '#fff', color: '#111' }}>{g.replace(/-/g,' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Visibility</label>
            <div className="flex gap-4 h-10 items-center">
              {[['true','🌐 Public'],['false','🔒 Private']].map(([val, lbl]) => (
                <label key={val} className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-300">
                  <input type="radio" checked={String(form.isPublic) === val} onChange={() => setForm(p => ({ ...p, isPublic: val === 'true' }))} />
                  {lbl}
                </label>
              ))}
            </div>
          </div>
          {!form.isPublic && (
            <div>
              <label className="text-gray-400 text-xs font-medium block mb-1.5 flex items-center gap-1.5"><Users size={12}/> Assign to Member</label>
              <select className="input-dark text-sm" value={form.assignedTo} onChange={e => setForm(p => ({ ...p, assignedTo: e.target.value }))}>
                <option value="" style={{ background: '#fff', color: '#111' }}>— All private members —</option>
                {members.map(m => <option key={m._id} value={m._id} style={{ background: '#fff', color: '#111' }}>{m.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Total Calories</label>
            <input className="input-dark text-sm" type="number" value={form.totalCalories} onChange={e => setForm(p => ({ ...p, totalCalories: e.target.value }))} placeholder="2000 kcal" />
          </div>
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Total Protein</label>
            <input className="input-dark text-sm" value={form.totalProtein} onChange={e => setForm(p => ({ ...p, totalProtein: e.target.value }))} placeholder="150g" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Description</label>
            <textarea rows={2} className="input-dark text-sm resize-none" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description of this diet plan..." />
          </div>
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Cover Image</label>
            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="text-gray-400 text-xs" />
          </div>
        </div>

        {/* Meals builder */}
        <div className="border-t border-white/8 pt-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Meal Plan ({meals.length} meals)</h3>
            <button onClick={addMeal} className="btn-ghost text-xs py-1.5 px-3 gap-1.5">
              <Plus size={12} /> Add Meal
            </button>
          </div>
          <div className="space-y-3">
            {meals.map((meal, mi) => (
              <div key={mi} className="bg-white/3 border border-white/6 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <select className="input-dark text-xs py-1.5 flex-1" value={meal.mealType} onChange={e => updateMeal(mi, 'mealType', e.target.value)}>
                    {MEAL_TYPES.map(t => <option key={t} value={t} style={{ background: '#fff', color: '#111' }} className="capitalize">{t}</option>)}
                  </select>
                  <input className="input-dark text-xs py-1.5 w-24" placeholder="Time e.g. 8 AM" value={meal.time} onChange={e => updateMeal(mi, 'time', e.target.value)} />
                  <button onClick={() => removeMeal(mi)} className="text-red-400 hover:text-red-300 p-1 flex-shrink-0 transition-colors"><X size={14} /></button>
                </div>
                {meal.items.map((item, ii) => (
                  <div key={ii} className="flex gap-2 mb-2 items-center">
                    <input className="input-dark text-xs py-1.5 flex-1" placeholder="Food item (e.g. Oats)" value={item.name} onChange={e => updateItem(mi, ii, 'name', e.target.value)} />
                    <input className="input-dark text-xs py-1.5 w-20" placeholder="Qty" value={item.quantity} onChange={e => updateItem(mi, ii, 'quantity', e.target.value)} />
                    <input className="input-dark text-xs py-1.5 w-16" placeholder="kcal" type="number" value={item.calories} onChange={e => updateItem(mi, ii, 'calories', e.target.value)} />
                    {meal.items.length > 1 && (
                      <button onClick={() => removeItem(mi, ii)} className="text-gray-600 hover:text-red-400 flex-shrink-0 transition-colors"><X size={13} /></button>
                    )}
                  </div>
                ))}
                <div className="flex gap-3 mt-2">
                  <button onClick={() => addItem(mi)} className="text-[#22d3ee] text-xs hover:underline">+ Add item</button>
                  <input className="input-dark text-xs py-1 flex-1 ml-2" placeholder="Meal notes (optional)" value={meal.notes} onChange={e => updateMeal(mi, 'notes', e.target.value)} />
                </div>
              </div>
            ))}
            {meals.length === 0 && (
              <div className="text-center py-6 text-gray-600 text-sm">No meals added yet. Click "Add Meal" above.</div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="btn-ghost px-5 py-2.5 text-sm">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-fire px-6 py-2.5 text-sm">
            {saving ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : (editData ? 'Update Plan' : 'Create Plan')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminDiet() {
  const [plans, setPlans]   = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]   = useState(null); // null | 'new' | plan

  const load = () => {
    setLoading(true);
    Promise.all([API.get('/diet'), API.get('/members')])
      .then(([d, m]) => { setPlans(d.data); setMembers(m.data); })
      .catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const del = async (id) => {
    if (!window.confirm('Delete this plan?')) return;
    try { await API.delete(`/diet/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Error'); }
  };

  return (
    <AdminLayout title="Diet Plans">
      <div className="flex justify-end mb-5">
        <button onClick={() => setModal('new')} className="btn-fire text-sm py-2 px-4 gap-1.5">
          <Plus size={15} /> Add Diet Plan
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#22d3ee] border-t-transparent rounded-full animate-spin" /></div>
      ) : plans.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <Salad size={40} className="text-gray-700 mx-auto mb-3" />
          <div className="text-gray-500">No diet plans yet. Create your first one!</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((p, i) => (
            <motion.div key={p._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl overflow-hidden">
              {p.image && <img src={p.image} alt={p.title} className="w-full h-36 object-cover" />}
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold line-clamp-1">{p.title}</h3>
                    <span className="text-xs text-[#22d3ee] capitalize">{p.goal?.replace(/-/g, ' ')}</span>
                  </div>
                  <span className="text-[10px] text-gray-500 flex-shrink-0 ml-2">{p.isPublic ? '🌐' : '🔒'}</span>
                </div>
                <p className="text-gray-500 text-xs mt-2 line-clamp-2">{p.description}</p>
                <div className="flex gap-3 text-xs text-gray-600 mt-2">
                  {p.totalCalories && <span>🔥 {p.totalCalories} kcal</span>}
                  {p.totalProtein && <span>💪 {p.totalProtein} protein</span>}
                  <span>🍽️ {p.meals?.length || 0} meals</span>
                </div>
                <div className="flex gap-2 mt-3 border-t border-white/5 pt-3">
                  <button onClick={() => setModal(p)} className="flex-1 flex items-center justify-center gap-1.5 text-xs text-amber-400 hover:bg-amber-400/10 rounded-lg py-1.5 transition-all">
                    <Edit2 size={12} /> Edit
                  </button>
                  <button onClick={() => del(p._id)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <DietModal
            editData={modal === 'new' ? null : modal}
            members={members}
            onClose={() => setModal(null)}
            onSaved={() => { setModal(null); load(); }}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
