import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Dumbbell, Plus, Trash2, Save, CheckCircle,
  Search, X, Play, ChevronDown, ChevronUp,
  Lock, RotateCcw, Video, Pencil
} from 'lucide-react';
import toast from 'react-hot-toast';
import API, { cachedGet } from '../../utils/api';

/* ──────────────────────────────────────────
   Constants & helpers
────────────────────────────────────────── */
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

const DAY_COLORS = {
  Monday:    'from-blue-500/12 to-transparent border-blue-500/20',
  Tuesday:   'from-purple-500/12 to-transparent border-purple-500/20',
  Wednesday: 'from-emerald-500/12 to-transparent border-emerald-500/20',
  Thursday:  'from-amber-500/12 to-transparent border-amber-500/20',
  Friday:    'from-red-500/12 to-transparent border-red-500/20',
  Saturday:  'from-pink-500/12 to-transparent border-pink-500/20',
  Sunday:    'from-gray-500/10 to-transparent border-gray-500/15',
};

const DIFF_COLORS = {
  beginner:     'text-emerald-400 bg-emerald-500/10',
  intermediate: 'text-amber-400 bg-amber-500/10',
  advanced:     'text-red-400 bg-red-500/10',
};

const MG_COLORS = {
  chest: 'bg-red-500/15 text-red-300',
  back: 'bg-blue-500/15 text-blue-300',
  shoulders: 'bg-purple-500/15 text-purple-300',
  arms: 'bg-amber-500/15 text-amber-300',
  biceps: 'bg-amber-500/15 text-amber-300',
  triceps: 'bg-orange-500/15 text-orange-300',
  legs: 'bg-green-500/15 text-green-300',
  glutes: 'bg-pink-500/15 text-pink-300',
  core: 'bg-cyan-500/15 text-cyan-300',
  abs: 'bg-cyan-500/15 text-cyan-300',
  cardio: 'bg-sky-500/15 text-sky-300',
  'full-body': 'bg-indigo-500/15 text-indigo-300',
  other: 'bg-gray-500/15 text-gray-300',
};

/** Best video URL from an exercise object */
function getVideoUrl(ex) {
  return ex?.videoUrl || ex?.video || '';
}

/** Check if URL is YouTube */
function isYouTube(url) {
  return url && (url.includes('youtube.com') || url.includes('youtu.be'));
}

/** Extract YouTube video ID */
function ytId(url) {
  const m = (url || '').match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : '';
}

/** YouTube thumbnail URL */
function ytThumb(url) {
  const id = ytId(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : '';
}

/* ──────────────────────────────────────────
   Inline video player component
────────────────────────────────────────── */
function VideoModal({ url, title, onClose }) {
  const isYT = isYouTube(url);
  const id = isYT ? ytId(url) : '';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0d0d14] rounded-2xl overflow-hidden border border-white/10"
      >
        <div className="flex items-center justify-between p-3 border-b border-white/8">
          <span className="text-white text-sm font-semibold truncate pr-4">{title}</span>
          <button onClick={onClose} className="p-1.5 rounded-xl text-gray-500 hover:text-white hover:bg-white/8 transition-all flex-shrink-0">
            <X size={17} />
          </button>
        </div>
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          {isYT && id ? (
            <iframe
              src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
              className="absolute inset-0 w-full h-full border-0"
              allow="autoplay; encrypted-media; fullscreen"
              title={title}
            />
          ) : (
            <video
              src={url}
              className="absolute inset-0 w-full h-full object-contain bg-black"
              controls
              autoPlay
              playsInline
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────
   Exercise picker bottom-sheet
────────────────────────────────────────── */
function ExercisePicker({ day, existingIds, onAdd, onClose }) {
  const [exercises, setExercises] = useState([]);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('all');
  const [loading, setLoading]     = useState(true);
  const searchRef = useRef(null);

  useEffect(() => {
    cachedGet('/exercises', { cache: 90 })
      .then(r => setExercises(r.data || []))
      .catch(() => setExercises([]))
      .finally(() => setLoading(false));
    // Auto-focus search after sheet opens
    setTimeout(() => searchRef.current?.focus(), 350);
  }, []);

  // All unique muscle groups in this exercise list
  const muscles = ['all', ...new Set(exercises.map(e => e.muscleGroup).filter(Boolean))];

  // Filter out already-added exercises + apply search + muscle filter
  const existingSet = new Set(existingIds.map(id => String(id)));
  const filtered = exercises.filter(ex => {
    if (existingSet.has(String(ex._id))) return false;
    if (filter !== 'all' && ex.muscleGroup !== filter) return false;
    const q = search.toLowerCase();
    return (
      !q ||
      ex.title?.toLowerCase().includes(q) ||
      ex.muscleGroup?.toLowerCase().includes(q) ||
      ex.difficulty?.toLowerCase().includes(q)
    );
  });

  const MUSCLE_LABELS = {
    all: 'All', chest: 'Chest', back: 'Back', shoulders: 'Shoulders',
    arms: 'Arms', biceps: 'Biceps', triceps: 'Triceps', legs: 'Legs',
    glutes: 'Glutes', core: 'Core', abs: 'Abs', cardio: 'Cardio',
    'full-body': 'Full Body', other: 'Other',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm px-0 sm:px-4">
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 80 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="w-full sm:max-w-lg bg-[#0d0d14] rounded-t-3xl sm:rounded-2xl border border-white/10 flex flex-col"
        style={{ maxHeight: '90vh' }}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 flex-shrink-0">
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <Plus size={15} className="text-[#22d3ee]" />
            Add to <span className="text-[#22d3ee]">{day}</span>
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-xl text-gray-500 hover:text-white hover:bg-white/8 transition-all min-h-0">
            <X size={17} />
          </button>
        </div>

        {/* Search bar */}
        <div className="px-4 pt-3 pb-2 flex-shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input
              ref={searchRef}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-9 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#22d3ee]/40 transition-colors"
              placeholder="Search by name, muscle, difficulty…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white min-h-0">
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Muscle filter pills */}
        <div className="px-4 pb-2 flex-shrink-0">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {muscles.map(m => (
              <button key={m} onClick={() => setFilter(m)}
                className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full capitalize transition-all min-h-0 ${
                  filter === m
                    ? 'bg-[#22d3ee]/20 text-[#22d3ee] border border-[#22d3ee]/30'
                    : 'bg-white/5 text-gray-500 border border-white/8 hover:text-gray-300'
                }`}>
                {MUSCLE_LABELS[m] || m}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        {!loading && (
          <div className="px-4 pb-1 flex-shrink-0">
            <span className="text-gray-600 text-xs">
              {filtered.length} exercise{filtered.length !== 1 ? 's' : ''}
              {filter !== 'all' ? ` in ${MUSCLE_LABELS[filter] || filter}` : ''}
              {search ? ` matching "${search}"` : ''}
            </span>
          </div>
        )}

        {/* Exercise list */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <div className="w-7 h-7 border-2 border-[#22d3ee] border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-600 text-xs">Loading exercises…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Dumbbell size={32} className="text-gray-700 mx-auto mb-2" />
              <div className="text-gray-500 text-sm">
                {exercises.length === 0
                  ? 'No exercises in library yet'
                  : search
                    ? `No results for "${search}"`
                    : `No ${filter} exercises available`}
              </div>
              {(search || filter !== 'all') && (
                <button
                  onClick={() => { setSearch(''); setFilter('all'); }}
                  className="mt-3 text-xs text-[#22d3ee] hover:underline min-h-0"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            filtered.map(ex => {
              const vid = getVideoUrl(ex);
              const thumb = isYouTube(vid) ? ytThumb(vid) : (ex.image || '');
              return (
                <button
                  key={ex._id}
                  onClick={() => { onAdd(ex); onClose(); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/6 text-left transition-all border border-transparent hover:border-white/10 group min-h-0"
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-xl bg-[#111] flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/8">
                    {thumb ? (
                      <img src={thumb} alt={ex.title} className="w-full h-full object-cover" />
                    ) : (
                      <Dumbbell size={18} className="text-gray-600 group-hover:text-[#22d3ee] transition-colors" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-semibold truncate group-hover:text-[#22d3ee] transition-colors">
                      {ex.title}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${MG_COLORS[ex.muscleGroup] || MG_COLORS.other}`}>
                        {ex.muscleGroup}
                      </span>
                      {ex.difficulty && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${DIFF_COLORS[ex.difficulty]}`}>
                          {ex.difficulty}
                        </span>
                      )}
                      {ex.sets && (
                        <span className="text-[10px] text-gray-600">{ex.sets}×{ex.reps || '?'}</span>
                      )}
                    </div>
                  </div>

                  {/* Video / Add indicators */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {vid && (
                      <span className="text-[9px] bg-red-500/15 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                        <Video size={8} /> video
                      </span>
                    )}
                    <div className="w-6 h-6 rounded-full bg-[#22d3ee]/10 border border-[#22d3ee]/20 flex items-center justify-center group-hover:bg-[#22d3ee]/25 transition-colors">
                      <Plus size={12} className="text-[#22d3ee]" />
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ──────────────────────────────────────────
   Inline video thumbnail — same style as ExercisesPage card
   Auto-plays muted in the card; tap the ▶ button to open full modal
────────────────────────────────────────── */
function ExerciseVideoThumb({ vid, image, title }) {
  if (!vid && !image) return (
    <div className="absolute inset-0 flex items-center justify-center">
      <Dumbbell size={22} className="text-gray-700" />
    </div>
  );
  if (vid) {
    if (isYouTube(vid)) {
      const id = ytId(vid);
      return id ? (
        <iframe
          src={`https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&modestbranding=1&playsinline=1`}
          className="absolute inset-0 w-full h-full border-0 pointer-events-none"
          allow="autoplay; muted"
          title={title}
        />
      ) : null;
    }
    return (
      <video
        src={vid}
        autoPlay muted loop playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
    );
  }
  return <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover" />;
}

/* ──────────────────────────────────────────
   Single exercise card (inside a day card)
   — shows video/thumbnail like ExercisesPage
────────────────────────────────────────── */
function ExerciseRow({ ex, index, editable, onRemove }) {
  const [showVideo, setShowVideo] = useState(false);
  const vid = getVideoUrl(ex);

  return (
    <>
      <div className="rounded-xl bg-black/30 border border-white/8 overflow-hidden group">
        {/* ── Video / image thumbnail ── */}
        <div className="relative overflow-hidden bg-[#0f1218]" style={{ paddingBottom: '52%' }}>
          <ExerciseVideoThumb vid={vid} image={ex.image} title={ex.title} />
          {/* gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10" />
          {/* video badge */}
          {vid && (
            <div className="absolute top-1.5 right-1.5 z-10 bg-[#22d3ee] rounded-full p-0.5">
              <Video size={9} className="text-black" />
            </div>
          )}
          {/* muscle group badge */}
          <div className="absolute top-1.5 left-1.5 z-10">
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full capitalize ${MG_COLORS[ex.muscleGroup] || MG_COLORS.other}`}>
              {ex.muscleGroup}
            </span>
          </div>
        </div>

        {/* ── Info row ── */}
        <div className="flex items-center gap-2 px-2.5 py-2">
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-semibold truncate">{ex.title}</div>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              {ex.sets && (
                <span className="text-[9px] text-gray-500">{ex.sets}×{ex.reps || '?'}</span>
              )}
              {ex.difficulty && (
                <span className={`text-[9px] px-1 py-0.5 rounded-full capitalize ${DIFF_COLORS[ex.difficulty] || ''}`}>
                  {ex.difficulty}
                </span>
              )}
            </div>
          </div>

          {/* Play button (opens full video modal) */}
          {vid && (
            <button
              onClick={() => setShowVideo(true)}
              className="p-1.5 rounded-lg bg-[#22d3ee]/10 text-[#22d3ee] hover:bg-[#22d3ee]/25 transition-all flex-shrink-0 min-h-0"
              title="Watch exercise video"
            >
              <Play size={11} />
            </button>
          )}

          {/* Remove (editable only) */}
          {editable && (
            <button
              onClick={() => onRemove(ex._id || ex)}
              className="p-1.5 rounded-lg text-gray-700 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0 min-h-0"
              title="Remove from this day"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Full video modal */}
      <AnimatePresence>
        {showVideo && (
          <VideoModal url={vid} title={ex.title} onClose={() => setShowVideo(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

/* ──────────────────────────────────────────
   Single day card
────────────────────────────────────────── */
function DayCard({ dayData, dayIndex, editable, onAddExercise, onRemoveExercise, onNoteChange }) {
  const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const isToday = dayData.day === today;
  const exCount = dayData.exercises?.length || 0;
  const [open, setOpen] = useState(isToday || dayIndex < 2);
  const [showPicker, setShowPicker] = useState(false);

  return (
    <>
      <div className={`rounded-2xl border bg-gradient-to-br ${DAY_COLORS[dayData.day] || 'border-white/8'} overflow-hidden`}>
        {/* ── Day header (tap to expand) ── */}
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between p-4 text-left min-h-0"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
              isToday ? 'bg-[#22d3ee] text-black' : 'bg-white/8 text-gray-300'
            }`}>
              {dayData.day.slice(0, 3).toUpperCase()}
            </div>
            <div className="text-left">
              <div className="text-white font-semibold text-sm flex items-center gap-2">
                {dayData.day}
                {isToday && (
                  <span className="text-[9px] bg-[#22d3ee]/20 text-[#22d3ee] px-2 py-0.5 rounded-full font-semibold">TODAY</span>
                )}
              </div>
              <div className="text-gray-500 text-xs mt-0.5 truncate max-w-[160px]">
                {dayData.focus || dayData.notes
                  ? (dayData.focus || dayData.notes)
                  : exCount > 0
                    ? `${exCount} exercise${exCount !== 1 ? 's' : ''}`
                    : 'Rest day'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {editable && (
              <button
                type="button"
                onClick={e => { e.stopPropagation(); setShowPicker(true); }}
                className="p-1.5 rounded-xl bg-[#22d3ee]/10 text-[#22d3ee] hover:bg-[#22d3ee]/25 transition-all min-h-0"
                title={`Add exercise to ${dayData.day}`}
              >
                <Plus size={14} />
              </button>
            )}
            {exCount > 0 && (
              <span className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded-full tabular-nums">
                {exCount}
              </span>
            )}
            {open
              ? <ChevronUp size={15} className="text-gray-500" />
              : <ChevronDown size={15} className="text-gray-500" />}
          </div>
        </button>

        {/* ── Expanded body ── */}
        {open && (
          <div className="px-3 pb-3 space-y-2">
            {exCount === 0 ? (
              <div className="text-center py-5 border border-dashed border-white/8 rounded-xl">
                {editable ? (
                  <button
                    type="button"
                    onClick={() => setShowPicker(true)}
                    className="flex flex-col items-center gap-1.5 w-full min-h-0 text-gray-600 hover:text-gray-400 transition-colors"
                  >
                    <Plus size={18} className="opacity-40" />
                    <span className="text-xs">Tap to add exercises</span>
                  </button>
                ) : (
                  <span className="text-gray-600 text-xs">🌟 Rest & Recovery</span>
                )}
              </div>
            ) : (
              dayData.exercises.map((ex, i) => (
                <ExerciseRow
                  key={ex._id || `ex-${i}`}
                  ex={ex}
                  index={i}
                  editable={editable}
                  onRemove={(exId) => onRemoveExercise(dayData.day, exId)}
                />
              ))
            )}

            {/* Notes / focus input (editable) or display (read-only) */}
            {editable ? (
              <div className="flex items-center gap-2 mt-1">
                <Pencil size={11} className="text-gray-600 flex-shrink-0" />
                <input
                  className="flex-1 bg-transparent border-b border-white/8 py-1.5 text-xs text-gray-400 placeholder-gray-700 focus:outline-none focus:border-[#22d3ee]/30 transition-colors"
                  placeholder={`Focus note (e.g. Chest + Triceps)`}
                  value={dayData.notes || dayData.focus || ''}
                  onChange={e => onNoteChange(dayData.day, e.target.value)}
                />
              </div>
            ) : (
              (dayData.notes || dayData.focus) ? (
                <div className="text-[11px] text-gray-600 italic border-t border-white/5 pt-2">
                  💡 {dayData.notes || dayData.focus}
                </div>
              ) : null
            )}
          </div>
        )}
      </div>

      {/* Exercise picker sheet */}
      <AnimatePresence>
        {showPicker && (
          <ExercisePicker
            day={dayData.day}
            existingIds={(dayData.exercises || []).map(e => e._id || e)}
            onAdd={ex => onAddExercise(dayData.day, ex)}
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
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 bg-white/8 rounded w-24" />
          <div className="h-2.5 bg-white/5 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   Main page
────────────────────────────────────────── */
export default function MyWorkout() {
  const [tab, setTab]               = useState('planner'); // 'planner' | 'assigned'
  const [days, setDays]             = useState(
    DAYS.map(d => ({ day: d, exercises: [], notes: '', focus: '' }))
  );
  const [assignedSplit, setAssigned] = useState(null);
  const [loading, setLoading]        = useState(true);
  const [saving, setSaving]          = useState(false);
  const [saved, setSaved]            = useState(false);
  const savedTimer = useRef(null);

  /* ── Load planner + assigned split ── */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [plannerRes, assignedRes] = await Promise.allSettled([
        API.get('/splits/planner'),
        API.get('/splits/me'),
      ]);

      if (plannerRes.status === 'fulfilled' && plannerRes.value?.data?.days?.length) {
        const raw = plannerRes.value.data.days;
        // Sort by day order and ensure all 7 days are present
        const map = Object.fromEntries(raw.map(d => [d.day, d]));
        const sorted = DAYS.map(d => map[d] || { day: d, exercises: [], notes: '', focus: '' });
        setDays(sorted);
      }

      if (assignedRes.status === 'fulfilled' && assignedRes.value?.data) {
        setAssigned(assignedRes.value.data);
        // If trainer has assigned a split, show it first; else show planner
        setTab(assignedRes.value.data ? 'assigned' : 'planner');
      }
    } catch {
      toast.error('Could not load workout data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => () => clearTimeout(savedTimer.current), []);

  /* ── Planner edit handlers ── */
  const addExercise = useCallback((dayName, exercise) => {
    setDays(prev => prev.map(d =>
      d.day === dayName
        ? { ...d, exercises: [...(d.exercises || []), exercise] }
        : d
    ));
    setSaved(false);
  }, []);

  const removeExercise = useCallback((dayName, exId) => {
    setDays(prev => prev.map(d =>
      d.day === dayName
        ? { ...d, exercises: d.exercises.filter(e => String(e._id || e) !== String(exId)) }
        : d
    ));
    setSaved(false);
  }, []);

  const onNoteChange = useCallback((dayName, note) => {
    setDays(prev => prev.map(d =>
      d.day === dayName ? { ...d, notes: note, focus: note } : d
    ));
    setSaved(false);
  }, []);

  /* ── Save planner to backend ── */
  const save = async () => {
    setSaving(true);
    try {
      // Send exercise IDs (not full objects) — handle both populated objects and plain IDs
      const payload = days.map(d => ({
        day:       d.day,
        exercises: (d.exercises || []).map(e => e._id || e).filter(Boolean),
        notes:     d.notes || d.focus || '',
        focus:     d.notes || d.focus || '',
      }));

      const res = await API.put('/splits/planner', { days: payload });

      if (res.data?.days?.length) {
        // Re-populate from server response (has full exercise objects)
        const map = Object.fromEntries(res.data.days.map(d => [d.day, d]));
        const sorted = DAYS.map(d => map[d] || { day: d, exercises: [], notes: '', focus: '' });
        setDays(sorted);
      }

      setSaved(true);
      clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSaved(false), 3500);
      toast.success('Workout plan saved! 💪', {
        style: { background: '#0d1117', color: '#e2e8f0', border: '1px solid rgba(34,211,238,0.2)' },
        iconTheme: { primary: '#22d3ee', secondary: '#000' },
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  /* ── Computed stats ── */
  const plannerStats = {
    total:      days.reduce((s, d) => s + (d.exercises?.length || 0), 0),
    activeDays: days.filter(d => (d.exercises?.length || 0) > 0).length,
  };

  const assignedDays = assignedSplit?.days
    ? (() => {
        const map = Object.fromEntries(assignedSplit.days.map(d => [d.day, d]));
        return DAYS.map(d => map[d]).filter(Boolean);
      })()
    : [];

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20 pb-28 lg:pb-10">
      <div className="max-w-2xl mx-auto px-4 py-5">

        {/* ── Page header ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
          <h1 className="gym-font text-3xl sm:text-4xl text-white flex items-center gap-2.5">
            <Calendar size={28} className="text-[#22d3ee]" /> My Workout
          </h1>
          <p className="text-gray-500 text-sm mt-1">Personal planner + trainer-assigned split</p>
        </motion.div>

        {/* ── Tab switcher ── */}
        <div className="flex gap-1.5 mb-5 bg-white/4 rounded-xl p-1">
          <button
            type="button"
            onClick={() => setTab('planner')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all min-h-0 ${
              tab === 'planner' ? 'bg-[#22d3ee] text-black shadow-md shadow-[#22d3ee]/20' : 'text-gray-400 hover:text-white'
            }`}
          >
            📅 My Planner
          </button>
          <button
            type="button"
            onClick={() => setTab('assigned')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 min-h-0 ${
              tab === 'assigned' ? 'bg-[#22d3ee] text-black shadow-md shadow-[#22d3ee]/20' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Lock size={11} /> Assigned
          </button>
        </div>

        {/* ── Loading skeleton ── */}
        {loading ? (
          <div className="space-y-3">
            {DAYS.map(d => <SkeletonDay key={d} />)}
          </div>
        ) : (
          <>
            {/* ══════════════════════════════
                PLANNER TAB
            ══════════════════════════════ */}
            {tab === 'planner' && (
              <>
                {/* Stats + save row */}
                <div className="flex items-center justify-between mb-4 gap-3">
                  <div className="flex gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Dumbbell size={11} className="text-[#22d3ee]" />
                      <span className="font-bold text-white">{plannerStats.total}</span>
                      <span>exercises</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Calendar size={11} className="text-emerald-400" />
                      <span className="font-bold text-white">{plannerStats.activeDays}</span>
                      <span>days active</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={save}
                    disabled={saving || saved}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-xs transition-all min-h-0 ${
                      saved
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-[#22d3ee]/15 text-[#22d3ee] border border-[#22d3ee]/25 hover:bg-[#22d3ee]/25'
                    }`}
                  >
                    {saving
                      ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      : saved
                        ? <><CheckCircle size={13} /> Saved!</>
                        : <><Save size={13} /> Save Plan</>
                    }
                  </button>
                </div>

                {/* Day cards */}
                <div className="space-y-2.5">
                  {days.map((dayData, i) => (
                    <motion.div
                      key={dayData.day}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
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

                {/* Floating save FAB (mobile) */}
                <AnimatePresence>
                  {!saved && plannerStats.total > 0 && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.75, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.75, y: 20 }}
                      type="button"
                      onClick={save}
                      disabled={saving}
                      className="fixed bottom-20 right-4 lg:hidden z-30 flex items-center gap-2 px-4 py-3 rounded-full font-bold text-sm bg-[#22d3ee] text-black shadow-2xl shadow-[#22d3ee]/30"
                    >
                      {saving
                        ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        : <><Save size={14} /> Save</>
                      }
                    </motion.button>
                  )}
                </AnimatePresence>
              </>
            )}

            {/* ══════════════════════════════
                ASSIGNED TAB
            ══════════════════════════════ */}
            {tab === 'assigned' && (
              <>
                {!assignedSplit ? (
                  <div className="glass rounded-2xl p-10 text-center">
                    <Lock size={36} className="text-gray-700 mx-auto mb-3" />
                    <div className="text-gray-400 font-semibold mb-1">No assigned split yet</div>
                    <div className="text-gray-600 text-sm mb-5">
                      Ask your trainer to assign a workout split to you.
                    </div>
                    <button
                      type="button"
                      onClick={() => setTab('planner')}
                      className="btn-fire text-sm px-5 py-2.5"
                    >
                      Use My Planner →
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Split info banner */}
                    <div className="glass rounded-2xl p-4 mb-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-white font-bold text-base">{assignedSplit.title}</div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs bg-[#22d3ee]/15 text-[#22d3ee] px-2 py-0.5 rounded-full capitalize">
                              {(assignedSplit.goal || 'general').replace('_', ' ')}
                            </span>
                            {assignedSplit.isDefault && (
                              <span className="text-xs bg-gray-500/15 text-gray-400 px-2 py-0.5 rounded-full">
                                Default split
                              </span>
                            )}
                            <span className="text-xs text-gray-600">
                              {assignedDays.reduce((s, d) => s + (d.exercises?.length || 0), 0)} exercises total
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={load}
                          className="p-2 rounded-xl text-gray-500 hover:text-[#22d3ee] hover:bg-[#22d3ee]/8 transition-all min-h-0"
                          title="Refresh"
                        >
                          <RotateCcw size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Day cards (read-only) */}
                    <div className="space-y-2.5">
                      {assignedDays.map((dayData, i) => (
                        <motion.div
                          key={dayData.day}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                        >
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
