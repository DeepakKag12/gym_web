import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Dumbbell, Plus, Trash2, Save, CheckCircle,
  Search, X, Play, ChevronDown, ChevronUp, ExternalLink,
  Lock, RotateCcw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../../utils/api';

/* ──────────────────────────────────────────
   Constants & helpers
────────────────────────────────────────── */
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

function isYouTube(url) { return url && (url.includes('youtube.com') || url.includes('youtu.be')); }
function ytId(url) {
  const m = (url || '').match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : '';
}
function getVideoUrl(ex) { return ex?.videoUrl || ex?.video || ''; }

/* ──────────────────────────────────────────
   Exercise picker bottom-sheet
────────────────────────────────────────── */
function ExercisePicker({ day, existingIds, onAdd, onClose }) {
  const [exercises, setExercises] = useState([]);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('all');
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    API.get('/exercises')
      .then(r => setExercises(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const muscles = ['all', ...new Set(exercises.map(e => e.muscleGroup).filter(Boolean))];

  const filtered = exercises.filter(ex =>
    !existingIds.includes(ex._id) &&
    (filter === 'all' || ex.muscleGroup === filter) &&
    (ex.title?.toLowerCase().includes(search.toLowerCase()) ||
     ex.muscleGroup?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm px-0 sm:px-4">
      <motion.div
        initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full sm:max-w-lg bg-[#0d0d14] rounded-t-3xl sm:rounded-2xl border border-white/10 flex flex-col"
        style={{ maxHeight: '88vh' }}
      >
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 flex-shrink-0">
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <Plus size={15} className="text-[#22d3ee]" /> Add exercise to <span className="text-[#22d3ee]">{day}</span>
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-xl text-gray-500 hover:text-white hover:bg-white/8 transition-all">
            <X size={17} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pt-3 pb-2 flex-shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#22d3ee]/40 transition-colors"
              placeholder="Search by name or muscle…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Muscle filter pills */}
        <div className="px-4 pb-2 flex-shrink-0">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {muscles.map(m => (
              <button key={m} onClick={() => setFilter(m)}
                className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full capitalize transition-all ${
                  filter === m ? 'bg-[#22d3ee]/20 text-[#22d3ee] border border-[#22d3ee]/30' : 'bg-white/5 text-gray-500 border border-white/8 hover:text-gray-300'
                }`}>
                {m === 'all' ? 'All' : m}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise list */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1.5">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-[#22d3ee] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-600 text-sm">
              {exercises.length === 0 ? 'No exercises in library yet' : 'No matching exercises'}
            </div>
          ) : filtered.map(ex => {
            const vid = getVideoUrl(ex);
            return (
              <button key={ex._id} onClick={() => { onAdd(ex); onClose(); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/6 text-left transition-all border border-transparent hover:border-white/10 group">
                {/* Thumbnail */}
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden group-hover:bg-[#22d3ee]/10 transition-colors">
                  {ex.image ? (
                    <img src={ex.image} alt={ex.title} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <Dumbbell size={16} className="text-gray-500 group-hover:text-[#22d3ee]" />
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{ex.title}</div>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${MG_COLORS[ex.muscleGroup] || MG_COLORS.other}`}>{ex.muscleGroup}</span>
                    {ex.difficulty && <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${DIFF_COLORS[ex.difficulty]}`}>{ex.difficulty}</span>}
                    {ex.sets && <span className="text-[10px] text-gray-600">{ex.sets}×{ex.reps || '?'}</span>}
                    {vid && <span className="text-[10px] text-red-400">▶ video</span>}
                  </div>
                </div>
                <Plus size={14} className="text-gray-600 group-hover:text-[#22d3ee] flex-shrink-0 transition-colors" />
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

/* ──────────────────────────────────────────
   Single day card (editable mode)
────────────────────────────────────────── */
function DayCard({ dayData, dayIndex, editable, onAddExercise, onRemoveExercise, onNoteChange }) {
  const [open, setOpen] = useState(dayIndex < 2);
  const [showPicker, setShowPicker] = useState(false);
  const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const isToday = dayData.day === today;
  const exCount = dayData.exercises?.length || 0;

  return (
    <>
      <div className={`rounded-2xl border bg-gradient-to-br ${DAY_COLORS[dayData.day]} overflow-hidden`}>
        {/* Day header */}
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between p-4 text-left min-h-0"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${isToday ? 'bg-[#22d3ee] text-black' : 'bg-white/8 text-gray-300'}`}>
              {dayData.day.slice(0, 3)}
            </div>
            <div className="text-left">
              <div className="text-white font-semibold text-sm flex items-center gap-2">
                {dayData.day}
                {isToday && <span className="text-[10px] bg-[#22d3ee]/20 text-[#22d3ee] px-2 py-0.5 rounded-full font-medium">Today</span>}
              </div>
              <div className="text-gray-500 text-xs mt-0.5">
                {dayData.focus || (exCount > 0 ? `${exCount} exercise${exCount !== 1 ? 's' : ''}` : 'Rest day')}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {editable && (
              <button
                onClick={e => { e.stopPropagation(); setShowPicker(true); }}
                className="p-1.5 rounded-xl bg-[#22d3ee]/10 text-[#22d3ee] hover:bg-[#22d3ee]/25 transition-all"
              >
                <Plus size={13} />
              </button>
            )}
            {exCount > 0 && (
              <span className="text-xs text-gray-500 tabular-nums w-4 text-center">{exCount}</span>
            )}
            {open ? <ChevronUp size={15} className="text-gray-500" /> : <ChevronDown size={15} className="text-gray-500" />}
          </div>
        </button>

        {/* Expanded exercise list */}
        {open && (
          <div className="px-3 pb-4 space-y-2">
            {exCount === 0 ? (
              <div className={`text-center py-4 text-gray-600 text-xs border border-dashed border-white/8 rounded-xl ${editable ? '' : ''}`}>
                {editable ? (
                  <button onClick={() => setShowPicker(true)} className="flex flex-col items-center gap-1 w-full min-h-0">
                    <Plus size={16} className="opacity-30" />
                    <span>Tap + to add exercises</span>
                  </button>
                ) : (
                  '🌟 Rest & Recovery day'
                )}
              </div>
            ) : (
              dayData.exercises.map((ex, i) => {
                const vid = getVideoUrl(ex);
                return (
                  <div key={ex._id || i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-black/25 border border-white/5 group">
                    {/* Exercise thumbnail or icon */}
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {ex.image
                        ? <img src={ex.image} alt={ex.title} className="w-full h-full object-cover" />
                        : <Dumbbell size={13} className="text-[#22d3ee]" />
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-xs font-semibold truncate">{ex.title}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[9px] px-1 py-0.5 rounded-full capitalize ${MG_COLORS[ex.muscleGroup] || MG_COLORS.other}`}>{ex.muscleGroup}</span>
                        {ex.sets && <span className="text-[9px] text-gray-600">{ex.sets}×{ex.reps || '?'}</span>}
                        {ex.difficulty && <span className={`text-[9px] px-1 py-0.5 rounded-full capitalize ${DIFF_COLORS[ex.difficulty]}`}>{ex.difficulty}</span>}
                      </div>
                    </div>

                    {/* Video link */}
                    {vid && (
                      <a href={vid} target="_blank" rel="noreferrer"
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all flex-shrink-0"
                        onClick={e => e.stopPropagation()}
                        title="Watch video"
                      >
                        <Play size={11} />
                      </a>
                    )}

                    {/* Remove (editable only) */}
                    {editable && (
                      <button
                        onClick={() => onRemoveExercise(dayData.day, ex._id)}
                        className="p-1.5 rounded-lg text-gray-700 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                );
              })
            )}

            {/* Notes / focus row */}
            {editable ? (
              <input
                className="w-full bg-black/20 border border-white/8 rounded-xl px-3 py-2 text-xs text-gray-400 placeholder-gray-700 focus:outline-none focus:border-[#22d3ee]/30 transition-colors"
                placeholder={`${dayData.day} focus / notes (e.g. Chest + Triceps)`}
                value={dayData.notes || ''}
                onChange={e => onNoteChange(dayData.day, e.target.value)}
              />
            ) : (
              dayData.notes && (
                <div className="text-xs text-gray-600 italic border-t border-white/5 pt-2 mt-1">
                  💡 {dayData.notes}
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Exercise picker sheet */}
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

/* ──────────────────────────────────────────
   Skeleton loader
────────────────────────────────────────── */
function SkeletonDay() {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/2 p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/8" />
        <div className="flex-1">
          <div className="h-3.5 bg-white/8 rounded w-20 mb-1.5" />
          <div className="h-2.5 bg-white/5 rounded w-14" />
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   Main page: merges "My Workout" + "Planner"
────────────────────────────────────────── */
export default function MyWorkout() {
  const [tab, setTab]         = useState('planner'); // 'planner' | 'assigned'
  const [days, setDays]       = useState(DAYS.map(d => ({ day: d, exercises: [], notes: '' })));
  const [assignedSplit, setAssignedSplit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  // Load both planner + assigned split in parallel
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [plannerRes, assignedRes] = await Promise.allSettled([
        API.get('/splits/planner'),
        API.get('/splits/me'),
      ]);

      if (plannerRes.status === 'fulfilled' && plannerRes.value?.data?.days?.length) {
        const sorted = [...plannerRes.value.data.days].sort(
          (a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day)
        );
        setDays(sorted);
      }

      if (assignedRes.status === 'fulfilled' && assignedRes.value?.data) {
        setAssignedSplit(assignedRes.value.data);
        // If assigned split exists, default to showing it; otherwise show planner
        setTab(assignedRes.value.data ? 'assigned' : 'planner');
      }
    } catch {
      toast.error('Could not load workout data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* Planner edit handlers */
  const addExercise = (dayName, exercise) => {
    setDays(prev => prev.map(d =>
      d.day === dayName ? { ...d, exercises: [...(d.exercises || []), exercise] } : d
    ));
    setSaved(false);
  };

  const removeExercise = (dayName, exId) => {
    setDays(prev => prev.map(d =>
      d.day === dayName ? { ...d, exercises: d.exercises.filter(e => e._id !== exId) } : d
    ));
    setSaved(false);
  };

  const onNoteChange = (dayName, note) => {
    setDays(prev => prev.map(d => d.day === dayName ? { ...d, notes: note } : d));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = days.map(d => ({
        day: d.day,
        exercises: d.exercises.map(e => e._id),
        notes: d.notes || '',
        focus: d.notes || '',
      }));
      const res = await API.put('/splits/planner', { days: payload });
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

  /* Stats */
  const plannerStats = {
    total: days.reduce((s, d) => s + (d.exercises?.length || 0), 0),
    activeDays: days.filter(d => d.exercises?.length > 0).length,
  };

  const assignedDays = assignedSplit?.days
    ? [...assignedSplit.days].sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day))
    : [];

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20 pb-24 lg:pb-10">
      <div className="max-w-2xl mx-auto px-4 py-5">

        {/* ── Page header ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
          <h1 className="gym-font text-3xl sm:text-4xl text-white flex items-center gap-2">
            <Calendar size={28} className="text-[#22d3ee]" /> My Workout
          </h1>
          <p className="text-gray-500 text-sm mt-1">Your personal planner + trainer-assigned split</p>
        </motion.div>

        {/* ── Tab switcher ── */}
        <div className="flex gap-2 mb-5 bg-white/4 rounded-xl p-1">
          <button
            onClick={() => setTab('planner')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === 'planner' ? 'bg-[#22d3ee] text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            📅 My Planner
          </button>
          <button
            onClick={() => setTab('assigned')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
              tab === 'assigned' ? 'bg-[#22d3ee] text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Lock size={12} /> Assigned
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {DAYS.map(d => <SkeletonDay key={d} />)}
          </div>
        ) : (
          <>
            {/* ═══ PLANNER TAB ═══ */}
            {tab === 'planner' && (
              <>
                {/* Stats + save row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Dumbbell size={12} className="text-[#22d3ee]" />
                      <span className="font-bold text-white">{plannerStats.total}</span> exercises
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Calendar size={12} className="text-emerald-400" />
                      <span className="font-bold text-white">{plannerStats.activeDays}</span> active days
                    </div>
                  </div>
                  <button
                    onClick={save}
                    disabled={saving || saved}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-xs transition-all ${
                      saved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-[#22d3ee]/15 text-[#22d3ee] border border-[#22d3ee]/30 hover:bg-[#22d3ee]/25'
                    }`}
                  >
                    {saving ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      : saved ? <><CheckCircle size={13} /> Saved!</>
                      : <><Save size={13} /> Save Plan</>}
                  </button>
                </div>

                <div className="space-y-2.5">
                  {days.map((dayData, i) => (
                    <motion.div key={dayData.day} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <DayCard
                        dayData={dayData}
                        dayIndex={i}
                        editable
                        onAddExercise={addExercise}
                        onRemoveExercise={removeExercise}
                        onNoteChange={onNoteChange}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Floating Save FAB on mobile */}
                {!saved && plannerStats.total > 0 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={save}
                    disabled={saving}
                    className="fixed bottom-20 right-4 lg:hidden z-30 flex items-center gap-2 px-4 py-3 rounded-full font-bold text-sm bg-[#22d3ee] text-black shadow-xl shadow-[#22d3ee]/25"
                  >
                    {saving
                      ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      : <><Save size={14} /> Save</>}
                  </motion.button>
                )}
              </>
            )}

            {/* ═══ ASSIGNED TAB ═══ */}
            {tab === 'assigned' && (
              <>
                {!assignedSplit ? (
                  <div className="glass rounded-2xl p-10 text-center">
                    <Lock size={36} className="text-gray-700 mx-auto mb-3" />
                    <div className="text-gray-400 font-medium mb-1">No assigned split yet</div>
                    <div className="text-gray-600 text-sm mb-4">Ask your trainer to assign a workout split to you.</div>
                    <button onClick={() => setTab('planner')} className="btn-fire text-sm px-5 py-2.5">
                      Use My Planner →
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Split info */}
                    <div className="glass rounded-2xl p-4 mb-4 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-white font-bold">{assignedSplit.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-[#22d3ee]/15 text-[#22d3ee] px-2 py-0.5 rounded-full capitalize">
                            {assignedSplit.goal?.replace('_', ' ')}
                          </span>
                          {assignedSplit.isDefault && (
                            <span className="text-xs bg-gray-500/15 text-gray-400 px-2 py-0.5 rounded-full">Default</span>
                          )}
                        </div>
                      </div>
                      <button onClick={load} className="p-2 rounded-xl text-gray-500 hover:text-[#22d3ee] hover:bg-[#22d3ee]/8 transition-all">
                        <RotateCcw size={15} />
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {assignedDays.map((dayData, i) => (
                        <motion.div key={dayData.day} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                          <DayCard
                            dayData={dayData}
                            dayIndex={i}
                            editable={false}
                            onAddExercise={() => {}}
                            onRemoveExercise={() => {}}
                            onNoteChange={() => {}}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
