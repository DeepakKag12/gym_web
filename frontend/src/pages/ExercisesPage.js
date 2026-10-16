import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Lock, Dumbbell, Zap, Play, X } from 'lucide-react';
import { cachedGet } from '../utils/api';
import { img } from '../utils/img';

/**
 * The public exercise library.
 *
 * Reorganised around the job the page is for — finding an exercise. Previously
 * more than half the first screen was a title before a single exercise showed,
 * the search box floated alone on an otherwise empty row, and every card
 * autoplayed a muted video, so a phone downloaded a dozen clips to render
 * thumbnails.
 *
 * Now: a compact header, and one aligned toolbar carrying search, muscle
 * group, difficulty and the result count.
 *
 * Cards play their clip on the grid, looping, so a member can see the movement
 * without opening anything. Only the cards actually on screen run: each one
 * waits for an IntersectionObserver before mounting a player and tears it down
 * on the way out, so scrolling a long library does not accumulate thirty live
 * players. Until then the card shows the still, which is what loads first.
 */

const MUSCLE_GROUPS = [
  { key: 'all', label: 'All' },
  { key: 'chest', label: 'Chest' },
  { key: 'back', label: 'Back' },
  { key: 'shoulders', label: 'Shoulders' },
  { key: 'arms', label: 'Arms' },
  { key: 'legs', label: 'Legs' },
  { key: 'core', label: 'Core' },
  { key: 'cardio', label: 'Cardio' },
  { key: 'fullbody', label: 'Full Body' },
];

const DIFFICULTIES = ['all', 'beginner', 'intermediate', 'advanced'];

const DIFF_MAP = {
  beginner:     { label: 'Beginner',     color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30' },
  intermediate: { label: 'Intermediate', color: 'text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30' },
  advanced:     { label: 'Advanced',     color: 'text-rose-700 dark:text-rose-300 bg-rose-500/15 border border-rose-500/30' },
};

const videoOf = ex => ex?.video || ex?.videoUrl || '';
const isYouTube = url => /(?:youtube\.com|youtu\.be)/.test(url || '');
const ytId = url => (String(url || '').match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/) || [])[1] || '';

/** Someone who asked their system for less motion should not get autoplay. */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  );
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return undefined;
    const on = e => setReduced(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

/**
 * True only while the element is on screen.
 *
 * Playback is tied to this rather than to page load, so a library of thirty
 * exercises runs the handful of players that are actually visible instead of
 * thirty at once — the difference between a few hundred KB and tens of MB on a
 * phone, and it stops when the card scrolls away.
 */
function useOnScreen(ref) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true); // No observer: better to play than to show nothing.
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: '120px' }, // Start just before it scrolls into view.
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return visible;
}



/**
 * An uploaded clip, looping silently.
 *
 * The autoPlay attribute alone is not enough: React sets `muted` as a property
 * rather than rendering the attribute, so Chrome can evaluate its autoplay
 * policy on a video it still considers unmuted and refuse to start. Muting the
 * element directly and calling play() removes that race.
 *
 * A browser is still entitled to say no. The promise is caught rather than left
 * to reject unhandled, and the card simply keeps showing its still.
 */
function LoopVideo({ src, poster }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    el.muted = true;
    const start = () => { const r = el.play(); if (r?.catch) r.catch(() => {}); };
    start();
    // Safari may not have enough buffered on the first attempt.
    el.addEventListener('canplay', start);
    return () => el.removeEventListener('canplay', start);
  }, [src]);

  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      autoPlay
      poster={poster || undefined}
      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
    />
  );
}

/**
 * The card's media: a looping, muted clip once the card is on screen.
 *
 * A YouTube link needs its iframe player — a <video> tag cannot play one — and
 * looping there requires playlist=<same id>, which is YouTube's own quirk.
 * An uploaded file is a plain <video>, which is far lighter.
 *
 * The still always renders underneath: it is what the member sees while the
 * player loads, and it is all they see if the clip is gone. Without the
 * onError the browser draws its torn-image glyph, which reads as a broken page
 * rather than a missing picture.
 *
 * Nothing here takes pointer events, so a click anywhere on the card still
 * opens the exercise instead of being swallowed by the player.
 */
function Thumb({ ex }) {
  const url = videoOf(ex);
  const yt = isYouTube(url) ? ytId(url) : '';
  const file = url && !isYouTube(url) ? url : '';
  const poster = yt
    ? `https://img.youtube.com/vi/${yt}/hqdefault.jpg`
    : (ex.image ? img(ex.image, 600) : '');

  const [failed, setFailed] = useState(false);
  const ref = useRef(null);
  const onScreen = useOnScreen(ref);
  const reduced = usePrefersReducedMotion();
  const play = onScreen && !reduced && Boolean(file);

  return (
    <span ref={ref} className="absolute inset-0 block overflow-hidden bg-slate-950">
      {poster && !failed ? (
        <img
          src={poster}
          alt={ex.title}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <span className="absolute inset-0 grid place-items-center bg-slate-900">
          <Dumbbell size={36} className="text-slate-600" />
        </span>
      )}

      {/* Dark gradient overlay for text & badges readability */}
      <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

      {/* Direct uploaded clip looping */}
      {play && file && <LoopVideo src={file} poster={poster} />}
    </span>
  );
}

function ExCard({ ex, index }) {
  const diff = DIFF_MAP[ex.difficulty] || DIFF_MAP.beginner;
  const hasVideo = Boolean(videoOf(ex));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.035, duration: 0.35 }}
      className="h-full"
    >
      <Link
        to={`/exercises/${ex._id}`}
        className="ex-card group block h-full flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(51,101,226,0.14)] hover:border-[#3365e2]/50 hover:-translate-y-1.5 transition-all duration-300"
      >
        <div className="relative overflow-hidden bg-slate-950 aspect-[16/10]">
          <Thumb ex={ex} />

          <span className="absolute top-2.5 left-2.5 z-10 text-[10px] bg-black/85 backdrop-blur-md text-white px-2.5 py-1 rounded-full capitalize font-bold tracking-wider border border-white/20 shadow-xs">
            {ex.muscleGroup}
          </span>

          <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1.5 z-10 pointer-events-none">
            {hasVideo && (
              <span className="inline-flex items-center gap-1 bg-[#3365e2] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                <Play size={10} className="text-white fill-white" /> Video
              </span>
            )}
            {!ex.isPublic && (
              <span className="flex items-center gap-1 bg-black/85 backdrop-blur-md rounded-full px-2.5 py-1 text-[10px] text-amber-400 font-bold border border-amber-400/25">
                <Lock size={10} /> Members
              </span>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
          <div>
            <h3 className="text-slate-900 font-black text-base mb-1.5 line-clamp-1 group-hover:text-[#3365e2] transition-colors leading-snug">
              {ex.title}
            </h3>
            {ex.description && (
              <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed font-normal mb-3">
                {ex.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
            <span className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-full capitalize ${diff.color}`}>
              {diff.label}
            </span>
            {ex.sets ? (
              <span className="text-slate-800 bg-[#eff4fe] px-2.5 py-1 rounded-lg border border-[#3365e2]/20 text-[11px] font-black flex items-center gap-1 tabular-nums">
                <Zap size={11} className="text-[#3365e2]" />{ex.sets}×{ex.reps}
              </span>
            ) : ex.equipmentNeeded ? (
              <span className="text-slate-500 text-[11px] font-medium truncate max-w-[120px]">
                {ex.equipmentNeeded}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function useDebounce(value, delay) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeMuscle, setActiveMuscle] = useState(searchParams.get('muscle') || 'all');
  const [difficulty, setDifficulty] = useState('all');
  const debouncedSearch = useDebounce(search, 200);

  useEffect(() => {
    setLoading(true);
    const params = activeMuscle !== 'all' ? `?muscleGroup=${activeMuscle}` : '';
    cachedGet(`/exercises${params}`, { cache: 90 })
      .then(r => setExercises(Array.isArray(r.data) ? r.data : []))
      .catch(() => setExercises([]))
      .finally(() => setLoading(false));
  }, [activeMuscle]);

  // Keep the muscle group in the URL so a filtered view can be shared or
  // reloaded — the homepage already links in with ?muscle=.
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (activeMuscle === 'all') next.delete('muscle'); else next.set('muscle', activeMuscle);
    setSearchParams(next, { replace: true });
  }, [activeMuscle]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return exercises.filter(e => {
      if (difficulty !== 'all' && e.difficulty !== difficulty) return false;
      if (!q) return true;
      return e.title?.toLowerCase().includes(q) || e.muscleGroup?.toLowerCase().includes(q);
    });
  }, [exercises, debouncedSearch, difficulty]);

  const clearAll = () => { setSearch(''); setActiveMuscle('all'); setDifficulty('all'); };
  const filtering = search || activeMuscle !== 'all' || difficulty !== 'all';

  return (
    <div className="min-h-screen bg-white text-oris-secondary relative font-sans selection:bg-[#3365e2] selection:text-white">
      {/* ── Landing Page White & Blue Hero Header ── */}
      <div className="relative overflow-hidden pt-28 sm:pt-36 pb-16 sm:pb-20 bg-[linear-gradient(to_bottom,#ffffff_0%,#eff6ff_20%,#bfdbfe_45%,#60a5fa_70%,#3365e2_100%)] text-slate-900 border-b border-[#3365e2]/20">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#15324d_1.2px,transparent_1.2px)] [background-size:24px_24px] pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#3365e2]/30 text-[#3365e2] text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#3365e2] animate-pulse" />
              <span>Certified Movement &amp; Periodization Atlas</span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-3 uppercase">
              ATHLETIC WORKOUT &amp; <span className="text-[#3365e2]">EXERCISE ATLAS</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-700 max-w-2xl mx-auto leading-relaxed font-medium">
              Periodized movement library with biomechanical execution cues, target muscle breakdowns, and HD video coaching.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="bg-[#f8fafc] text-slate-800 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-6 py-10 pb-20">
        {/* One toolbar: search, difficulty and the count on a single line */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1" style={{ minWidth: 240 }}>
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              className="bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#3365e2] focus:ring-2 focus:ring-[#3365e2]/20 rounded-xl py-2.5 text-sm w-full outline-none transition-all shadow-xs"
              style={{ paddingLeft: 38 }}
              placeholder="Search exercises by name or muscle..."
              aria-label="Search exercises"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
            className="bg-white border border-slate-300 text-slate-800 focus:border-[#3365e2] focus:ring-2 focus:ring-[#3365e2]/20 rounded-xl py-2.5 px-3 text-sm capitalize outline-none transition-all shadow-xs cursor-pointer"
            style={{ width: 170 }}
            aria-label="Filter by difficulty"
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
          >
            {DIFFICULTIES.map(d => (
              <option key={d} value={d}>{d === 'all' ? 'Any difficulty' : d}</option>
            ))}
          </select>

          {filtering && (
            <button onClick={clearAll} className="text-slate-500 hover:text-[#3365e2] text-sm px-3 py-2 flex items-center gap-1.5 font-semibold transition-colors cursor-pointer">
              <X size={14} /> Clear
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
          {MUSCLE_GROUPS.map(mg => (
            <button
              key={mg.key}
              onClick={() => setActiveMuscle(mg.key)}
              aria-pressed={activeMuscle === mg.key}
              className={`cat-pill flex-shrink-0 ${activeMuscle === mg.key ? 'active' : ''}`}
            >
              {mg.label}
            </button>
          ))}
        </div>

        <p className="text-gray-500 text-sm mb-5 mt-2">
          {loading
            ? 'Loading exercises…'
            : `${filtered.length} exercise${filtered.length === 1 ? '' : 's'}`}
        </p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="ex-card animate-pulse rounded-[22px] overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e1526]">
                <div style={{ aspectRatio: '4 / 3' }} className="bg-slate-200 dark:bg-gray-800/50" />
                <div className="p-4 space-y-2.5">
                  <div className="h-4 bg-slate-200 dark:bg-gray-800/70 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-gray-800/50 rounded w-full" />
                  <div className="h-3 bg-slate-200 dark:bg-gray-800/50 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Dumbbell size={44} className="text-gray-400 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-slate-800 dark:text-gray-200 font-bold text-lg">No exercises match</p>
            <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">
              {filtering ? 'Try a different search or filter.' : 'Nothing has been added yet.'}
            </p>
            {filtering && (
              <button onClick={clearAll} className="btn-outline text-xs uppercase font-bold tracking-wider px-6 py-2.5 mt-5 rounded-full">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {filtered.map((ex, i) => <ExCard key={ex._id} ex={ex} index={i} />)}
          </div>
        )}
      </div>
    </div>
  </div>
  );
}
