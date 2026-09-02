import React, { useEffect, useMemo, useState } from 'react';
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
 * Now: a compact header, one aligned toolbar carrying search, muscle group,
 * difficulty and the result count, and cards that show a still and play on
 * demand.
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
  beginner:     { label: 'Beginner',     color: 'text-emerald-400 bg-emerald-500/10' },
  intermediate: { label: 'Intermediate', color: 'text-amber-400 bg-amber-500/10' },
  advanced:     { label: 'Advanced',     color: 'text-red-400 bg-red-500/10' },
};

const videoOf = ex => ex?.video || ex?.videoUrl || '';
const isYouTube = url => /(?:youtube\.com|youtu\.be)/.test(url || '');
const ytId = url => (String(url || '').match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/) || [])[1] || '';

/**
 * A still, not a running video.
 *
 * YouTube publishes a thumbnail per video, so a link costs one image rather
 * than an embedded player. An uploaded file falls back to its poster image, and
 * anything with neither gets an icon — the previous placeholder rendered a
 * broken-file glyph, which looked like a bug rather than an absence.
 */
function Thumb({ ex }) {
  const url = videoOf(ex);
  const poster = isYouTube(url)
    ? (ytId(url) ? `https://img.youtube.com/vi/${ytId(url)}/hqdefault.jpg` : '')
    : (ex.image ? img(ex.image, 500) : '');

  // A poster can fail: a deleted YouTube video, a moved Cloudinary asset, a
  // blocked host. Without this the browser draws its torn-image glyph, which
  // reads as a broken page rather than a missing picture.
  const [failed, setFailed] = useState(false);

  if (poster && !failed) {
    return (
      <img
        src={poster}
        alt=""
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    );
  }
  return (
    <span className="absolute inset-0 grid place-items-center">
      <Dumbbell size={30} className="text-gray-700" />
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
      // Capped so the last card in a long list is not held back by its index.
      transition={{ delay: Math.min(index, 8) * 0.035, duration: 0.35 }}
    >
      <Link to={`/exercises/${ex._id}`} className="ex-card group block h-full flex flex-col">
        <div className="relative overflow-hidden bg-[#0f1218]" style={{ aspectRatio: '4 / 3' }}>
          <Thumb ex={ex} />

          <span className="absolute top-2.5 left-2.5 z-10 text-[11px] bg-black/60 backdrop-blur-sm text-on-photo px-2 py-0.5 rounded-full capitalize font-medium">
            {ex.muscleGroup}
          </span>

          <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1 z-10 pointer-events-none">
            {hasVideo && (
              <span className="grid place-items-center bg-[#22d3ee] rounded-full" style={{ width: 20, height: 20 }}>
                <Play size={10} className="text-black" style={{ marginLeft: 1 }} />
              </span>
            )}
            {!ex.isPublic && (
              <span className="flex items-center gap-1 bg-black/60 rounded-full px-2 py-0.5 text-[11px] text-amber-400">
                <Lock size={10} /> Members
              </span>
            )}
          </div>
        </div>

        {/* flex-1 + mt-auto keeps the meta row on the baseline whether or not
            the description runs to two lines, so a row of cards lines up. */}
        <div className="p-3.5 flex flex-col flex-1">
          <h3 className="text-white font-semibold text-sm mb-1 line-clamp-1 group-hover:text-[#22d3ee] transition-colors">
            {ex.title}
          </h3>
          {ex.description && (
            <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">{ex.description}</p>
          )}
          <div className="flex items-center justify-between mt-auto pt-3">
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold capitalize ${diff.color}`}>
              {diff.label}
            </span>
            {ex.sets ? (
              <span className="text-gray-600 text-[11px] flex items-center gap-1">
                <Zap size={10} className="text-[#22d3ee]" />{ex.sets}×{ex.reps}
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
    <div className="min-h-screen bg-[#0b0c0e] pt-16">
      {/* Compact header — it used to fill more than half the first screen
          before a single exercise appeared. */}
      <div className="relative overflow-hidden py-10 sm:py-14">
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=60"
          alt="" loading="lazy"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0c0e]/60 to-[#0b0c0e]" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <span className="section-pill">Exercise Library</span>
            <h1 className="gym-font text-4xl sm:text-5xl md:text-6xl text-on-photo mt-2">
              WORKOUT <span className="gradient-text">LIBRARY</span>
            </h1>
            <p className="text-gray-400 mt-2 text-base">Video-guided exercises for every muscle group</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-16">
        {/* One toolbar: search, difficulty and the count on a single line,
            rather than a narrow box adrift on an empty row. */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1" style={{ minWidth: 240 }}>
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            />
            <input
              className="input-dark py-2.5 text-sm w-full"
              style={{ paddingLeft: 38 }}
              placeholder="Search exercises"
              aria-label="Search exercises"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
            className="input-dark py-2.5 text-sm capitalize"
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
            <button onClick={clearAll} className="btn-ghost text-sm px-3 py-2 flex items-center gap-1.5">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="ex-card animate-pulse">
                <div style={{ aspectRatio: '4 / 3' }} className="bg-gray-800/50" />
                <div className="p-3.5 space-y-2">
                  <div className="h-3 bg-gray-800/70 rounded w-3/4" />
                  <div className="h-2 bg-gray-800/50 rounded w-full" />
                  <div className="h-2 bg-gray-800/50 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Dumbbell size={44} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No exercises match</p>
            <p className="text-gray-600 text-sm mt-1">
              {filtering ? 'Try a different search or filter.' : 'Nothing has been added yet.'}
            </p>
            {filtering && (
              <button onClick={clearAll} className="btn-outline text-sm px-5 py-2.5 mt-5">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((ex, i) => <ExCard key={ex._id} ex={ex} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
