import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Dumbbell, Plus, Trash2, Save, CheckCircle,
  Search, X, Play, ChevronDown, ChevronUp, Video
} from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../utils/api';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const DAY_COLORS = {
  Monday:    'from-blue-500/15 to-blue-600/5 border-blue-500/25',
  Tuesday:   'from-purple-500/15 to-purple-600/5 border-purple-500/25',
  Wednesday: 'from-emerald-500/15 to-emerald-600/5 border-emerald-500/25',
  Thursday:  'from-amber-500/15 to-amber-600/5 border-amber-500/25',
  Friday:    'from-red-500/15 to-red-600/5 border-red-500/25',
  Saturday:  'from-pink-500/15 to-pink-600/5 border-pink-500/25',
  Sunday:    'from-gray-500/15 to-gray-600/5 border-gray-500/20',
};
const DIFF_COLORS = {
  beginner:     'text-emerald-400 bg-emerald-500/10',
  intermediate: 'text-amber-400   bg-amber-500/10',
  advanced:     'text-red-400     bg-red-500/10',
};
const MG_COLORS = {
  chest: 'bg-red-500/15 text-red-300', back: 'bg-blue-500/15 text-blue-300',
  shoulders: 'bg-purple-500/15 text-purple-300', arms: 'bg-amber-500/15 text-amber-300',
  biceps: 'bg-amber-500/15 text-amber-300', triceps: 'bg-orange-500/15 text-orange-300',
  legs: 'bg-green-500/15 text-green-300', glutes: 'bg-pink-500/15 text-pink-300',
  core: 'bg-cyan-500/15 text-cyan-300', abs: 'bg-cyan-500/15 text-cyan-300',
  cardio: 'bg-sky-500/15 text-sky-300', 'full-body': 'bg-indigo-500/15 text-indigo-300',
  other: 'bg-gray-500/15 text-gray-300',
};

/* Exercise picker modal */
function ExercisePicker({ day, existingIds, onAdd, onClose }) {
  const [exercises, setExercises] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/exercises').then(r => setExercises(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = exercises.filter(ex =>
    !existingIds.includes(ex._id) &&
    (ex.title?.toLowerCase().includes(search.toLowerCase()) ||
     ex.muscleGroup?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-4 pb-0 sm:pb-4">
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        className="w-full max-w-lg bg-[#111318] rounded-t-2xl sm:rounded-2xl border border-white/10 flex flex-col"
        style={{ maxHeight: '80vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
          <h3 className="text-white font-bold text-base flex items-center gap-2">
            <Plus size={16} className="text-[#22d3ee]" /> Add to {day}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white p-1 rounded-lg"><X size={18} /></button>
        </div>
        {/* Search */}
        <div className="p-3 border-b border-white/5 flex-shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#22d3ee]/40"
              placeholder="Search exercises…" value={search} onChange={e => setSearch(e.target.value)} autoFocus />
          </div>
        </div>
        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {loading ? (
            <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-[#22d3ee] border-t-transparent rounded-full animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">No exercises found</div>
          ) : filtered.map(ex => (
            <button key={ex._id} onClick={() => { onAdd(ex); onClose(); }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-left transition-all border border-transparent hover:border-white/10 group">
              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-[#22d3ee]/10 transition-colors">
                <Dumbbell size={15} className="text-gray-400 group-hover:text-[#22d3ee]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">{ex.title}</div>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${MG_COLORS[ex.muscleGroup] || MG_COLORS.other}`}>{ex.muscleGroup}</span>
                  {ex.difficulty && <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${DIFF_COLORS[ex.difficulty]}`}>{ex.difficulty}</span>}
                  {ex.sets && <span className="text-[10px] text-gray-600">{ex.sets}×{ex.reps || '?'}</span>}
                </div>
              </div>
              <Plus size={14} className="text-gray-600 group-hover:text-[#22d3ee] flex-shrink-0" />
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* Single day card */
function DayCard({ dayData, dayIndex, onAddExercise, onRemoveExercise, onNoteChange }) {
  const [open, setOpen] = useState(dayIndex < 2);
  const [showPicker, setShowPicker] = useState(false);
  const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const isToday = dayData.day === today;

  return (
    <>
      <div className={`rounded-2xl border bg-gradient-to-br ${DAY_COLORS[dayData.day]} overflow-hidden`}>
        {/* Day header */}
        <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between p-4 text-left">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${isToday ? 'bg-[#22d3ee] text-black' : 'bg-white/8 text-gray-300'}`}>
              {dayData.day.slice(0, 3)}
            </div>
            <div>
              <div className="text-white font-semibold text-sm flex items-center gap-2">
                {dayData.day}
                {isToday && <span className="text-[10px] bg-[#22d3ee]/20 text-[#22d3ee] px-2 py-0.5 rounded-full">Today</span>}
              </div>
              <div className="text-gray-500 text-xs">
                {dayData.exercises?.length ? `${dayData.exercises.length} exercise${dayData.exercises.length !== 1 ? 's' : ''}` : 'Rest day'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={e => { e.stopPropagation(); setShowPicker(true); }}
              className="p-1.5 rounded-xl bg-[#22d3ee]/10 text-[#22d3ee] hover:bg-[#22d3ee]/20 transition-all">
              <Plus size={14} />
            </button>
            {open ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
          </div>
        </button>

        {/* Expanded content */}
        {open && (
          <div className="px-4 pb-4">
            {/* Exercise list */}
            {dayData.exercises?.length === 0 ? (
              <div className="text-center py-5 text-gray-600 text-sm border border-dashed border-white/10 rounded-xl mb-3">
                <Dumbbell size={20} className="mx-auto mb-1.5 opacity-30" />
                <div>No exercises. Tap <strong className="text-[#22d3ee]">+</strong> to add.</div>
              </div>
            ) : (
              <div className="space-y-2 mb-3">
                {dayData.exercises.map((ex, i) => (
                  <div key={ex._id || i} className="flex items-center gap-3 p-3 rounded-xl bg-black/25 border border-white/5 group">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                      <Dumbbell size={13} className="text-[#22d3ee]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{ex.title}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${MG_COLORS[ex.muscleGroup] || MG_COLORS.other}`}>{ex.muscleGroup}</span>
                        {ex.sets && <span className="text-[10px] text-gray-600">{ex.sets}×{ex.reps || '?'}</span>}
                      </div>
                    </div>
                    {(ex.videoUrl || ex.video) && (
                      <a href={ex.videoUrl || ex.video} target="_blank" rel="noreferrer"
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all flex-shrink-0">
                        <Play size={12} />
                      </a>
                    )}
                    <button onClick={() => onRemoveExercise(dayData.day, ex._id)}
                      className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* Notes */}
            <input
              className="w-full bg-black/20 border border-white/8 rounded-xl px-3 py-2 text-sm text-gray-300 placeholder-gray-700 focus:outline-none focus:border-[#22d3ee]/30 transition-colors"
              placeholder={`${dayData.day} focus / notes (optional)`}
              value={dayData.notes || ''}
              onChange={e => onNoteChange(dayData.day, e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Exercise picker */}
      <AnimatePresence>
        {showPicker && (
          <ExercisePicker
            day={dayData.day}
            existingIds={dayData.exercises?.map(e => e._id) || []}
            onAdd={(ex) => onAddExercise(dayData.day, ex)}
            onClose={() => setShowPicker(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Main page ─────────────────────────── */
export default function WeeklyPlanner() {
  const [days, setDays] = useState(DAYS.map(d => ({ day: d, exercises: [], notes: '' })));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    API.get('/splits/planner')
      .then(r => {
        if (r.data?.days?.length) {
          // Sort by DAYS order
          const sorted = [...r.data.days].sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day));
          setDays(sorted);
        }
      })
      .catch(() => toast.error('Could not load planner'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const addExercise = (dayName, exercise) => {
    setDays(prev => prev.map(d =>
      d.day === dayName
        ? { ...d, exercises: [...(d.exercises || []), exercise] }
        : d
    ));
  };

  const removeExercise = (dayName, exId) => {
    setDays(prev => prev.map(d =>
      d.day === dayName
        ? { ...d, exercises: d.exercises.filter(e => e._id !== exId) }
        : d
    ));
  };

  const onNoteChange = (dayName, note) => {
    setDays(prev => prev.map(d => d.day === dayName ? { ...d, notes: note } : d));
  };

  const save = async () => {
    setSaving(true);
    try {
      // Send only exercise IDs (not full objects) to the server
      const payload = days.map(d => ({
        day: d.day,
        exercises: d.exercises.map(e => e._id),
        notes: d.notes || '',
        focus: d.notes || '',
      }));
      const res = await API.put('/splits/planner', { days: payload });
      // Restore populated data from response
      if (res.data?.days?.length) {
        const sorted = [...res.data.days].sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day));
        setDays(sorted);
      }
      setSaved(true);
      toast.success('Weekly plan saved! 💪');
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error('Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  const totalExercises = days.reduce((s, d) => s + (d.exercises?.length || 0), 0);
  const activeDays = days.filter(d => d.exercises?.length > 0).length;

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20 pb-24 lg:pb-8">
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="gym-font text-3xl sm:text-4xl text-white flex items-center gap-2">
                <Calendar size={30} className="text-[#22d3ee]" /> My Weekly Planner
              </h1>
              <p className="text-gray-400 text-sm mt-1">Build your personal workout schedule</p>
            </div>
            <button
              onClick={save}
              disabled={saving || loading}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex-shrink-0 ${
                saved ? 'bg-emerald-500 text-white' : 'btn-fire'
              }`}
            >
              {saving ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                : saved ? <><CheckCircle size={15} /> Saved!</>
                : <><Save size={15} /> Save</>}
            </button>
          </div>

          {/* Stats row */}
          {!loading && (
            <div className="flex gap-4 mt-4">
              <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2">
                <Dumbbell size={14} className="text-[#22d3ee]" />
                <span className="text-white font-bold">{totalExercises}</span>
                <span className="text-gray-500 text-xs">exercises</span>
              </div>
              <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2">
                <Calendar size={14} className="text-emerald-400" />
                <span className="text-white font-bold">{activeDays}</span>
                <span className="text-gray-500 text-xs">active days</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Day cards */}
        {loading ? (
          <div className="space-y-3">
            {DAYS.map(d => (
              <div key={d} className="rounded-2xl border border-white/5 bg-white/2 p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5" />
                  <div className="flex-1">
                    <div className="h-3.5 bg-white/5 rounded w-24 mb-1.5" />
                    <div className="h-2.5 bg-white/5 rounded w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {days.map((dayData, i) => (
              <motion.div key={dayData.day} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <DayCard
                  dayData={dayData}
                  dayIndex={i}
                  onAddExercise={addExercise}
                  onRemoveExercise={removeExercise}
                  onNoteChange={onNoteChange}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Save FAB on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-20 right-4 lg:hidden z-30"
        >
          <button
            onClick={save}
            disabled={saving}
            className={`flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm shadow-xl transition-all ${
              saved ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-[#22d3ee] text-black shadow-[#22d3ee]/30'
            }`}
          >
            {saving ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              : saved ? <><CheckCircle size={15} /> Saved!</>
              : <><Save size={15} /> Save Plan</>}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
