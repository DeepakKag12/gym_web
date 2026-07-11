import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Dumbbell, Users, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../utils/api';
import AdminLayout from './AdminLayout';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const GOALS = ['strength','muscle','fat_loss','endurance','general'];

function SplitModal({ split, exercises, onClose, onSaved }) {
  const [form, setForm] = useState(split ? { ...split, days: split.days || [] } : {
    title: '', goal: 'general', isDefault: false, member: '', days: DAYS.map(d => ({ day: d, focus: '', exercises: [], notes: '' }))
  });
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState([]);

  useEffect(() => { API.get('/members').then(r => setMembers(r.data)).catch(() => {}); }, []);

  const updateDay = (dayName, field, value) => {
    setForm(prev => ({
      ...prev,
      days: prev.days.map(d => d.day === dayName ? { ...d, [field]: value } : d)
    }));
  };

  const toggleExercise = (dayName, exId) => {
    const day = form.days.find(d => d.day === dayName);
    const exIds = day.exercises.map(e => e._id || e);
    const updated = exIds.includes(exId) ? exIds.filter(id => id !== exId) : [...exIds, exId];
    updateDay(dayName, 'exercises', updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (split) { await API.put(`/splits/${split._id}`, form); toast.success('Split updated'); }
      else { await API.post('/splits', form); toast.success('Split created'); }
      onSaved();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center overflow-y-auto p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0d0d14] border border-white/10 rounded-2xl p-6 w-full max-w-2xl my-8">
        <h2 className="text-white font-bold text-xl mb-5">{split ? 'Edit' : 'Create'} Workout Split</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Title *</label>
              <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="input-dark w-full" placeholder="e.g. Push Pull Legs" />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Goal</label>
              <select value={form.goal} onChange={e => setForm(p => ({ ...p, goal: e.target.value }))} className="input-dark w-full capitalize">
                {GOALS.map(g => <option key={g} value={g} className="capitalize">{g.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Assign to Member (leave blank = default)</label>
              <select value={form.member} onChange={e => setForm(p => ({ ...p, member: e.target.value }))} className="input-dark w-full">
                <option value="">-- All Members (Default) --</option>
                {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isDefault} onChange={e => setForm(p => ({ ...p, isDefault: e.target.checked }))} className="w-4 h-4" />
                <span className="text-gray-300 text-sm">Set as Default Plan</span>
              </label>
            </div>
          </div>

          {/* Days */}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {(form.days || []).map(day => (
              <div key={day.day} className="bg-white/3 border border-white/5 rounded-xl p-4">
                <div className="font-semibold text-white text-sm mb-2">{day.day}</div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input placeholder="Focus (e.g. Chest + Triceps)" value={day.focus} onChange={e => updateDay(day.day, 'focus', e.target.value)} className="input-dark text-xs" />
                  <input placeholder="Notes" value={day.notes} onChange={e => updateDay(day.day, 'notes', e.target.value)} className="input-dark text-xs" />
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {exercises.map(ex => {
                    const ids = (day.exercises || []).map(e => e._id || e);
                    const selected = ids.includes(ex._id);
                    return (
                      <button type="button" key={ex._id} onClick={() => toggleExercise(day.day, ex._id)}
                        className={`text-xs px-2 py-0.5 rounded-full border transition-all ${selected ? 'bg-blue-500/30 border-blue-500/50 text-blue-300' : 'border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300'}`}>
                        {ex.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-fire text-sm px-5 py-2">{saving ? 'Saving...' : 'Save Split'}</button>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-all">Cancel</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function AdminSplits() {
  const [splits, setSplits] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'new' | split-object

  const fetchAll = () => {
    setLoading(true);
    Promise.all([API.get('/splits'), API.get('/exercises')])
      .then(([s, e]) => { setSplits(s.data); setExercises(e.data); })
      .catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(fetchAll, []);

  const deleteSplit = async (id) => {
    if (!window.confirm('Delete this split?')) return;
    await API.delete(`/splits/${id}`);
    setSplits(prev => prev.filter(s => s._id !== id));
    toast.success('Deleted');
  };

  return (
    <AdminLayout title="Workout Splits">
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-400 text-sm">Create and assign weekly workout splits to members</p>
        <button onClick={() => setModal('new')} className="btn-fire flex items-center gap-2 text-sm px-4 py-2">
          <Plus size={15} /> New Split
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : splits.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Calendar size={40} className="text-gray-600 mx-auto mb-3" />
          <div className="text-gray-400">No splits yet. Create your first workout split!</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {splits.map((split, i) => (
            <motion.div key={split._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-white font-bold text-base">{split.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full capitalize">{split.goal?.replace('_', ' ')}</span>
                    {split.isDefault && <span className="text-xs bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full">Default</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setModal(split)} className="p-1.5 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"><Edit2 size={14} /></button>
                  <button onClick={() => deleteSplit(split._id)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                <Users size={12} /> {split.member ? <span className="text-gray-300">{split.member.name}</span> : 'All Members'}
              </div>
              <div className="flex flex-wrap gap-1">
                {(split.days || []).map(d => (
                  <div key={d.day} className={`text-xs px-1.5 py-0.5 rounded-md ${d.exercises?.length > 0 ? 'bg-white/10 text-gray-300' : 'bg-white/3 text-gray-600'}`}>
                    {d.day.slice(0, 3)} {d.exercises?.length > 0 ? `(${d.exercises.length})` : ''}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {modal && (
        <SplitModal
          split={modal === 'new' ? null : modal}
          exercises={exercises}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchAll(); }}
        />
      )}
    </AdminLayout>
  );
}
