import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, BookOpen, Target, Flame, ExternalLink, ChevronDown, Video } from 'lucide-react';
import { cachedGet } from '../../utils/api';

/* ── VideoThumb: native <video> for direct files, <iframe> for YouTube ── */
function isYouTube(url) { return url && (url.includes('youtube.com') || url.includes('youtu.be')); }
function ytId(url) {
  const m = (url || '').match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : '';
}
function VideoThumb({ video, videoUrl, image, title }) {
  const src = video || videoUrl || '';
  if (src) {
    if (isYouTube(src)) {
      const id = ytId(src);
      return id ? (
        <iframe
          src={`https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&modestbranding=1&playsinline=1`}
          className="absolute inset-0 w-full h-full border-0 pointer-events-none"
          allow="autoplay; muted" title={title}
        />
      ) : null;
    }
    return (
      <video src={src} autoPlay muted loop playsInline
        className="absolute inset-0 w-full h-full object-cover" />
    );
  }
  if (image) return <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />;
  return <div className="absolute inset-0 flex items-center justify-center"><Dumbbell size={48} className="text-gray-700" /></div>;
}

const DIFF_COLOR = {
  beginner:     'text-green-400 bg-green-400/10',
  intermediate: 'text-yellow-400 bg-yellow-400/10',
  advanced:     'text-red-400 bg-red-400/10',
};

const MUSCLE_EMOJI = {
  chest: '💪', back: '🔙', shoulders: '🏋️', arms: '💪',
  legs: '🦵', core: '🎯', cardio: '🏃', fullbody: '⚡',
};

function ExCard({ ex }) {
  const [open, setOpen] = useState(false);
  const hasVideo = ex.video || ex.videoUrl;

  return (
    <div className="glass rounded-2xl overflow-hidden group">
      {/* Thumbnail */}
      <div className="relative h-44 bg-[#0d0d14] overflow-hidden">
        <VideoThumb video={ex.video} videoUrl={ex.videoUrl} image={ex.image} title={ex.title} />
        {hasVideo && (
          <div className="absolute top-3 right-3 bg-[#22d3ee] rounded-full p-1 pointer-events-none z-10">
            <Video size={10} className="text-black" />
          </div>
        )}
        <span className="absolute bottom-3 left-3 text-xs px-2 py-0.5 rounded-full bg-black/60 text-white capitalize z-10">
          {MUSCLE_EMOJI[ex.muscleGroup] || '💪'} {ex.muscleGroup}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-white font-bold text-base leading-snug">{ex.title}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${DIFF_COLOR[ex.difficulty] || 'text-gray-400 bg-gray-400/10'}`}>
            {ex.difficulty}
          </span>
        </div>

        {ex.description && (
          <p className={`text-gray-400 text-sm leading-relaxed overflow-hidden transition-all ${open ? '' : 'line-clamp-2'}`}>
            {ex.description}
          </p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
          {ex.sets  && <span className="flex items-center gap-1"><Target size={11} className="text-cyan-400" />{ex.sets} sets</span>}
          {ex.reps  && <span className="flex items-center gap-1"><Flame  size={11} className="text-orange-400" />{ex.reps} reps</span>}
          {ex.duration && <span>{ex.duration}</span>}
        </div>

        <div className="flex gap-2 mt-4">
          <Link to={`/exercises/${ex._id}`} className="btn-fire flex-1 text-xs py-2 flex items-center justify-center gap-1">
            <BookOpen size={13} /> View Details
          </Link>
          {hasVideo && (
            <a href={ex.videoUrl || ex.video} target="_blank" rel="noreferrer"
              className="btn-outline text-xs px-3 py-2 flex items-center gap-1">
              <ExternalLink size={13} /> Video
            </a>
          )}
          {ex.description && ex.description.length > 100 && (
            <button onClick={() => setOpen(v => !v)} className="text-gray-500 hover:text-gray-300 px-2">
              <ChevronDown size={15} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MyExercises() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [muscle, setMuscle]       = useState('all');

  useEffect(() => {
    cachedGet('/exercises/my', { cache: 60 })
      .then(r => setExercises(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const muscles = ['all', ...new Set(exercises.map(e => e.muscleGroup).filter(Boolean))];
  const filtered = muscle === 'all' ? exercises : exercises.filter(e => e.muscleGroup === muscle);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20 pb-24 lg:pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-cyan-400/10 flex items-center justify-center">
            <Dumbbell size={22} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-white font-bold text-2xl">My Exercises</h1>
            <p className="text-gray-500 text-sm">Workouts assigned to you by your trainer</p>
          </div>
        </div>

        {exercises.length === 0 ? (
          <div className="text-center py-20">
            <Dumbbell size={50} className="mx-auto mb-4 text-gray-700" />
            <p className="text-gray-400 text-lg font-medium">No exercises assigned yet</p>
            <p className="text-gray-600 text-sm mt-1">Your trainer hasn't assigned any exercises to you yet.</p>
            <Link to="/exercises" className="btn-outline mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm">
              Browse Exercise Library
            </Link>
          </div>
        ) : (
          <>
            {/* Muscle filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              {muscles.map(m => (
                <button key={m} onClick={() => setMuscle(m)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
                    muscle === m ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}>
                  {m === 'all' ? 'All' : `${MUSCLE_EMOJI[m] || '💪'} ${m}`}
                </button>
              ))}
            </div>

            <p className="text-gray-600 text-sm mb-4">{filtered.length} exercise{filtered.length !== 1 ? 's' : ''}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(ex => <ExCard key={ex._id} ex={ex} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
