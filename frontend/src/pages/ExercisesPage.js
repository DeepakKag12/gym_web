import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Play, Lock, Dumbbell, Clock, Zap } from 'lucide-react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

const MUSCLE_GROUPS = [
  { key: 'all',       label: 'All',        emoji: '🏋️' },
  { key: 'chest',     label: 'Chest',      emoji: '💪' },
  { key: 'back',      label: 'Back',       emoji: '🔙' },
  { key: 'shoulders', label: 'Shoulders',  emoji: '⚡' },
  { key: 'arms',      label: 'Arms',       emoji: '💥' },
  { key: 'legs',      label: 'Legs',       emoji: '🦵' },
  { key: 'core',      label: 'Core',       emoji: '🎯' },
  { key: 'cardio',    label: 'Cardio',     emoji: '🔥' },
  { key: 'fullbody',  label: 'Full Body',  emoji: '⚔️' },
];

const DIFF_MAP = {
  beginner:     { label: 'Beginner',     color: 'text-emerald-400 bg-emerald-500/10' },
  intermediate: { label: 'Intermediate', color: 'text-amber-400 bg-amber-500/10' },
  advanced:     { label: 'Advanced',     color: 'text-red-400 bg-red-500/10' },
};

function ExCard({ ex, index }) {
  const diff = DIFF_MAP[ex.difficulty] || DIFF_MAP.beginner;
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04, duration: 0.4 }}>
      <Link to={`/exercises/${ex._id}`} className="ex-card group block">
        {/* Image */}
        <div className="relative h-44 overflow-hidden bg-[#0f1218]">
          {ex.image ? (
            <img src={ex.image} alt={ex.title} className="ex-img" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Dumbbell size={40} className="text-gray-700" />
            </div>
          )}
          {/* Overlays */}
          {ex.videoUrl && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
              <div className="w-11 h-11 rounded-full bg-[#22d3ee] flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Play size={18} className="text-black ml-0.5" />
              </div>
            </div>
          )}
          <div className="absolute top-2.5 left-2.5">
            <span className="text-xs bg-black/60 backdrop-blur-sm text-gray-200 px-2 py-1 rounded-full capitalize font-medium">
              {ex.muscleGroup}
            </span>
          </div>
          {!ex.isPublic && (
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/60 rounded-full px-2 py-1 text-xs text-amber-400">
              <Lock size={10} /> Members
            </div>
          )}
          {/* Gradient fade bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#111318] to-transparent" />
        </div>

        {/* Body */}
        <div className="p-4">
          <h3 className="text-white font-semibold text-sm mb-1.5 line-clamp-1 group-hover:text-[#22d3ee] transition-colors">{ex.title}</h3>
          <p className="text-gray-500 text-xs line-clamp-2 mb-3 leading-relaxed">{ex.description}</p>
          <div className="flex items-center justify-between">
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${diff.color}`}>{diff.label}</span>
            {ex.sets && (
              <span className="text-gray-600 text-xs flex items-center gap-1">
                <Zap size={10} className="text-[#22d3ee]" />{ex.sets}×{ex.reps}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams();
  const [activeMuscle, setActiveMuscle] = useState(searchParams.get('muscle') || 'all');

  useEffect(() => {
    setLoading(true);
    const params = activeMuscle !== 'all' ? `?muscleGroup=${activeMuscle}` : '';
    API.get(`/exercises${params}`).then(r => setExercises(r.data)).catch(() => setExercises([])).finally(() => setLoading(false));
  }, [activeMuscle]);

  const filtered = exercises.filter(e =>
    e.title?.toLowerCase().includes(search.toLowerCase()) ||
    e.muscleGroup?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0b0c0e] pt-16">
      {/* Hero Header with background */}
      <div className="relative py-20 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=60"
          alt="exercises" className="absolute inset-0 w-full h-full object-cover opacity-20"/>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0c0e]/60 to-[#0b0c0e]" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="section-pill">💪 Exercise Library</span>
            <h1 className="gym-font text-6xl md:text-7xl text-white mt-2">WORKOUT <span className="gradient-text">LIBRARY</span></h1>
            <p className="text-gray-400 mt-3 text-lg">Video-guided exercises for every muscle group</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-16">
        {/* Search */}
        <div className="relative max-w-sm mb-6">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"/>
          <input className="input-dark pl-10 pr-4 py-2.5 text-sm"
            placeholder="Search exercises..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Category scroll pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-hide">
          {MUSCLE_GROUPS.map(mg => (
            <button key={mg.key} onClick={() => setActiveMuscle(mg.key)}
              className={`cat-pill flex items-center gap-1.5 flex-shrink-0 ${activeMuscle === mg.key ? 'active' : ''}`}>
              <span>{mg.emoji}</span> {mg.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array(10).fill(0).map((_, i) => (
              <div key={i} className="ex-card animate-pulse">
                <div className="h-44 bg-gray-800/50" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-800/70 rounded w-3/4" />
                  <div className="h-2 bg-gray-800/50 rounded w-full" />
                  <div className="h-2 bg-gray-800/50 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Dumbbell size={48} className="text-gray-700 mx-auto mb-3" />
            <div className="text-gray-500">No exercises found</div>
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
