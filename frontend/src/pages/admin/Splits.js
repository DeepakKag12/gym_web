import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Trash2, Dumbbell, Users, Calendar, X,
  Search, ChevronDown, ChevronUp, Play, CheckSquare, Square
} from 'lucide-react';
import toast from 'react-hot-toast';
import API, { cachedGet, bustCache } from '../../utils/api';
import AdminLayout from './AdminLayout';

const DAYS  = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const GOALS = ['strength','muscle','fat_loss','endurance','general'];

const MG_COLORS = {
  chest: 'bg-red-500/15 text-red-300', back: 'bg-blue-500/15 text-blue-300',
  shoulders: 'bg-purple-500/15 text-purple-300', arms: 'bg-amber-500/15 text-amber-300',
  biceps: 'bg-amber-500/15 text-amber-300', triceps: 'bg-orange-500/15 text-orange-300',
  legs: 'bg-green-500/15 text-green-300', glutes: 'bg-pink-500/15 text-pink-300',
  core: 'bg-cyan-500/15 text-cyan-300', abs: 'bg-cyan-500/15 text-cyan-300',
  cardio: 'bg-sky-500/15 text-sky-300', 'full-body': 'bg-indigo-500/15 text-indigo-300',
  other: 'bg-gray-500/15 text-gray-300',
};

function getVideoUrl(ex) { return ex?.videoUrl || ex?.video || ''; }

/* ── Exercise selector for a single day ── */
function DayExerciseSelector({ day, allExercises, selectedIds, onChange }) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState('');
  const [mgFilter, setMgFilter] = useState('all');

  const muscles = ['all', ...new Set(allExercises.map(e => e.muscleGroup).filter(Boolean))];

  const filtered = allExercises.filter(ex =>
    (mgFilter === 'all' || ex.muscleGroup === mgFilter) &&
    ex.title?.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (exId) => {
    const next = selectedIds.includes(exId)
      ? selectedIds.filter(id => id !== exId)
      : [...selectedIds, exId];
    onChange(next);
  };

  const selectedExercises = allExercises.filter(ex => selectedIds.includes(ex._id));
  const vid = (ex) => getVideoUrl(ex);

  return (
    <div className="rounded-xl border border-white/8 bg-white/2 overflow-hidden">
      {/* Day header row */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/4 transition-all min-h-0"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center text-xs font-bold text-gray-400 flex-shrink-0">
            {day.slice(0,3)}
          </div>
          <span className="text-white text-sm font-semibold">{day}</span>
          {selectedIds.length > 0 && (
            <span className="text-xs bg-[#22d3ee]/15 text-[#22d3ee] px-2 py-0.5 rounded-full">
              {selectedIds.length} exercise{selectedIds.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {open ? <ChevronUp size={15} className="text-gray-500" /> : <ChevronDown size={15} className="text-gray-500" />}
      </button>

      {/* Selected exercises chips */}
      {!open && selectedExercises.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {selectedExercises.map(ex => (
            <div key={ex._id} className="flex items-center gap-1 bg-white/6 border border-white/10 rounded-lg px-2 py-0.5">
              <span className="text-xs text-gray-300 max-w-[120px] truncate">{ex.title}</span>
              {vid(ex) && (
                <a href={vid(ex)} target="_blank" rel="noreferrer" className="text-red-400 hover:text-red-300 ml-1" onClick={e => e.stopPropagation()}>
                  <Play size={9} />
                </a>
              )}
              <button type="button" onClick={() => toggle(ex._id)} className="text-gray-600 hover:text-red-400 ml-0.5">
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Expanded picker */}
      {open && (
        <div className="border-t border-white/8">
          {/* Search + muscle filter */}
          <div className="p-3 space-y-2 bg-black/10">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
              <input
                className="w-full bg-white/5 border border-white/8 rounded-xl py-2 pl-8 pr-3 text-xs text-white placeholder-gray-700 focus:outline-none focus:border-[#22d3ee]/30"
                placeholder="Search exercises…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
              {muscles.map(m => (
                <button key={m} type="button" onClick={() => setMgFilter(m)}
                  className={`flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full capitalize transition-all ${
                    mgFilter === m ? 'bg-[#22d3ee]/20 text-[#22d3ee] border border-[#22d3ee]/25' : 'bg-white/5 text-gray-600 border border-white/8 hover:text-gray-400'
                  }`}>
                  {m === 'all' ? 'All' : m}
                </button>
              ))}
            </div>
          </div>

          {/* Exercise list */}
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="text-center py-6 text-gray-600 text-xs">No exercises found</div>
            ) : filtered.map(ex => {
              const selected = selectedIds.includes(ex._id);
              const exVid = vid(ex);
              return (
                <label key={ex._id}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-white/4 transition-all border-b border-white/4 last:border-0 ${selected ? 'bg-[#22d3ee]/4' : ''}`}>
                  <input type="checkbox" checked={selected} onChange={() => toggle(ex._id)} className="hidden" />
                  <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-all ${selected ? 'bg-[#22d3ee] border-[#22d3ee]' : 'border-white/20'}`}>
                    {selected && <span className="text-black text-[10px] font-black">✓</span>}
                  </div>
                  {/* Thumb */}
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {ex.image
                      ? <img src={ex.image} alt={ex.title} className="w-full h-full object-cover" />
                      : <Dumbbell size={13} className="text-gray-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-xs font-medium truncate">{ex.title}</div>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className={`text-[9px] px-1 py-0.5 rounded-full capitalize ${MG_COLORS[ex.muscleGroup] || MG_COLORS.other}`}>{ex.muscleGroup}</span>
                      {ex.sets && <span className="text-[9px] text-gray-600">{ex.sets}×{ex.reps || '?'}</span>}
                    </div>
                  </div>
                  {exVid && (
                    <a href={exVid} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex-shrink-0 transition-all" onClick={e => e.stopPropagation()}>
                      <Play size={10} />
                    </a>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Split create/edit modal ── */
function SplitModal({ split, exercises, onClose, onSaved }) {
  const [form, setForm] = useState(split ? {
    title: split.title,
    goal: split.goal || 'general',
    isDefault: split.isDefault || false,
    member: split.member?._id || split.member || '',
    days: DAYS.map(d => {
      const existing = split.days?.find(sd => sd.day === d);
      return {
        day: d,
        focus: existing?.focus || '',
        notes: existing?.notes || '',
        exercises: (existing?.exercises || []).map(e => e._id || e),
      };
    }),
  } : {
    title: '', goal: 'general', isDefault: false, member: '',
    days: DAYS.map(d => ({ day: d, focus: '', exercises: [], notes: '' })),
  });

  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState([]);
  const [activeDay, setActiveDay] = useState(null); // null = show all days collapsed

  useEffect(() => {
    cachedGet('/members', { cache: 60 }).then(r => setMembers(r.data)).catch(() => {});
  }, []);

  const updateDayExercises = (dayName, ids) => {
    setForm(prev => ({
      ...prev,
      days: prev.days.map(d => d.day === dayName ? { ...d, exercises: ids } : d),
    }));
  };

  const updateDayField = (dayName, field, value) => {
    setForm(prev => ({
      ...prev,
      days: prev.days.map(d => d.day === dayName ? { ...d, [field]: value } : d),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Split title is required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        member: form.member || undefined,
        days: form.days.map(d => ({ ...d })),
      };
      if (split) {
        await API.put(`/splits/${split._id}`, payload);
        toast.success('Split updated');
      } else {
        await API.post('/splits', payload);
        toast.success('Split created');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const totalExercises = form.days.reduce((s, d) => s + d.exercises.length, 0);

  return (
    <div className="admin-modal-overlay">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="admin-modal-box w-full"
        style={{ maxWidth: '680px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h2 className="text-white font-bold text-lg">{split ? 'Edit' : 'Create'} Workout Split</h2>
            {totalExercises > 0 && (
              <p className="text-gray-500 text-xs mt-0.5">{totalExercises} exercises across {form.days.filter(d => d.exercises.length > 0).length} days</p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white p-1 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Top fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 flex-shrink-0">
            <div>
              <label className="text-gray-400 text-xs font-medium block mb-1">Split Title *</label>
              <input
                required
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className="input-dark w-full text-sm"
                placeholder="e.g. Push Pull Legs"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-medium block mb-1">Goal</label>
              <select
                value={form.goal}
                onChange={e => setForm(p => ({ ...p, goal: e.target.value }))}
                className="input-dark w-full text-sm capitalize"
              >
                {GOALS.map(g => <option key={g} value={g} style={{ background: '#111', color: '#fff' }}>{g.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs font-medium block mb-1">Assign to Member</label>
              <select
                value={form.member}
                onChange={e => setForm(p => ({ ...p, member: e.target.value, isDefault: e.target.value ? false : p.isDefault }))}
                className="input-dark w-full text-sm"
              >
                <option value="" style={{ background: '#111', color: '#fff' }}>— Default (all members) —</option>
                {members.map(m => <option key={m._id} value={m._id} style={{ background: '#111', color: '#fff' }}>{m.name}</option>)}
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div onClick={() => setForm(p => ({ ...p, isDefault: !p.isDefault }))}
                  className={`w-10 h-5 rounded-full transition-all flex-shrink-0 relative ${form.isDefault ? 'bg-[#22d3ee]' : 'bg-white/15'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.isDefault ? 'left-5' : 'left-0.5'}`} />
                </div>
                <span className="text-gray-300 text-sm">Set as Default Plan</span>
              </label>
            </div>
          </div>

          {/* Day exercise selectors (scrollable) */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            <p className="text-gray-500 text-xs mb-2">Click a day to expand and select exercises. Use the ▶ button to preview videos.</p>
            {form.days.map(d => (
              <DayExerciseSelector
                key={d.day}
                day={d.day}
                allExercises={exercises}
                selectedIds={d.exercises}
                onChange={(ids) => updateDayExercises(d.day, ids)}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-white/8 flex-shrink-0">
            <button type="button" onClick={onClose} className="btn-ghost px-5 py-2.5 text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-fire px-6 py-2.5 text-sm">
              {saving
                ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                : split ? 'Update Split' : 'Create Split'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ── Main page ── */
export default function AdminSplits() {
  const [splits, setSplits]     = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null); // null | 'new' | split-object

  const fetchAll = useCallback((force = false) => {
    if (force) { bustCache('/splits'); bustCache('/exercises'); }
    setLoading(true);
    Promise.all([cachedGet('/splits', { cache: 60 }), cachedGet('/exercises', { cache: 90 })])
      .then(([s, e]) => { setSplits(s.data); setExercises(e.data); })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);
  useEffect(fetchAll, [fetchAll]);

  const deleteSplit = async (id) => {
    if (!window.confirm('Delete this split?')) return;
    try {
      await API.delete(`/splits/${id}`);
      bustCache('/splits');
      setSplits(prev => prev.filter(s => s._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
  };

  return (
    <AdminLayout title="Workout Splits">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <p className="text-gray-400 text-sm">Create and assign weekly workout splits to members.</p>
        <button onClick={() => setModal('new')} className="btn-fire flex items-center gap-2 text-sm px-4 py-2.5 flex-shrink-0">
          <Plus size={15} /> New Split
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#22d3ee] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : splits.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Calendar size={40} className="text-gray-600 mx-auto mb-3" />
          <div className="text-gray-400 font-medium mb-1">No workout splits yet</div>
          <div className="text-gray-600 text-sm mb-4">Create your first split and assign it to members.</div>
          <button onClick={() => setModal('new')} className="btn-fire text-sm px-5 py-2.5">
            <Plus size={14} className="mr-1.5" /> Create Split
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {splits.map((split, i) => {
            const dayCount  = split.days?.filter(d => d.exercises?.length > 0).length || 0;
            const exTotal   = split.days?.reduce((s, d) => s + (d.exercises?.length || 0), 0) || 0;
            return (
              <motion.div
                key={split._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl p-5 flex flex-col gap-3"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-bold text-base truncate">{split.title}</div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs bg-[#22d3ee]/15 text-[#22d3ee] px-2 py-0.5 rounded-full capitalize">
                        {split.goal?.replace('_', ' ')}
                      </span>
                      {split.isDefault && (
                        <span className="text-xs bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full">Default</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => setModal(split)} className="p-1.5 text-gray-500 hover:text-[#22d3ee] hover:bg-[#22d3ee]/10 rounded-lg transition-all">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => deleteSplit(split._id)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Member */}
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Users size={11} />
                  {split.member ? (
                    <span className="text-gray-300">{split.member.name}</span>
                  ) : (
                    <span>All Members</span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex gap-3 text-xs text-gray-600">
                  <span><span className="text-white font-semibold">{dayCount}</span> active days</span>
                  <span><span className="text-white font-semibold">{exTotal}</span> exercises</span>
                </div>

                {/* Day pills */}
                <div className="flex flex-wrap gap-1">
                  {DAYS.map(d => {
                    const dayData = split.days?.find(sd => sd.day === d);
                    const count   = dayData?.exercises?.length || 0;
                    return (
                      <div key={d} className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                        count > 0 ? 'bg-[#22d3ee]/10 text-[#22d3ee]' : 'bg-white/4 text-gray-700'
                      }`}>
                        {d.slice(0,3)}{count > 0 ? ` (${count})` : ''}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <SplitModal
            split={modal === 'new' ? null : modal}
            exercises={exercises}
            onClose={() => setModal(null)}
            onSaved={() => { bustCache('/splits'); setModal(null); fetchAll(true); }}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
