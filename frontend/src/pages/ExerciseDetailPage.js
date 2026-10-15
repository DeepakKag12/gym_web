import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Dumbbell, Clock, Target, BarChart3 } from 'lucide-react';
import { cachedGet } from '../utils/api';
import { img } from '../utils/img';

/* ── Helpers ── */
function isYouTube(url) { return url && (url.includes('youtube.com') || url.includes('youtu.be')); }
function ytId(url) {
  const m = (url || '').match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : '';
}

export default function ExerciseDetailPage() {
  const { id } = useParams();
  const [ex, setEx] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cachedGet(`/exercises/${id}`, { cache: 90 })
      .then(res => setEx(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--bg)]">
      <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!ex) return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center text-[var(--text-muted)] text-sm">
      Exercise not found. <Link to="/exercises" className="text-[var(--primary)] ml-2 hover:underline">← Back to exercises</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] pt-20 transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <Link to="/exercises" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--primary)] mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Exercises
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Media — uploaded video > YouTube URL > image > placeholder */}
          <div>
            {(ex.video || ex.videoUrl) ? (() => {
              const src = ex.video || ex.videoUrl;
              if (isYouTube(src)) {
                const ytid = ytId(src);
                return ytid ? (
                  <div className="rounded-lg overflow-hidden border border-[var(--border)] relative bg-black" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${ytid}?loop=1&playlist=${ytid}&controls=1&modestbranding=1&rel=0`}
                      className="absolute inset-0 w-full h-full border-0"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      title={ex.title}
                    />
                  </div>
                ) : null;
              }
              // Direct video (Cloudinary mp4)
              return (
                <video
                  src={src}
                  controls
                  loop
                  playsInline
                  className="w-full rounded-lg border border-[var(--border)] max-h-80 object-cover bg-black"
                />
              );
            })() : ex.image ? (
              <img src={img(ex.image, 900)} alt={ex.title} decoding="async" className="w-full rounded-lg border border-[var(--border)] object-cover max-h-80" />
            ) : (
              <div className="w-full h-64 bg-[var(--surface)] border border-[var(--border)] rounded-lg flex items-center justify-center">
                <Dumbbell size={52} className="text-[var(--text-muted)] opacity-50" />
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs bg-[var(--surface-raised)] text-[var(--primary)] border border-[var(--border)] px-2.5 py-0.5 rounded-sm capitalize font-bold tracking-wider">{ex.muscleGroup}</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-sm capitalize font-bold tracking-wider ${
                ex.difficulty === 'beginner' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                ex.difficulty === 'intermediate' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                'bg-rose-500/10 text-rose-500 border border-rose-500/20'
              }`}>{ex.difficulty}</span>
            </div>

            <h1 className="gym-font text-4xl sm:text-5xl text-[var(--text-primary)] mb-4">{ex.title}</h1>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed mb-6">{ex.description}</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {ex.sets && (
                <div className="rounded-lg p-3.5 border border-[var(--border)] bg-[var(--surface)] text-center">
                  <Target size={18} className="text-[var(--primary)] mx-auto mb-1" />
                  <div className="text-[var(--text-primary)] font-bold text-base">{ex.sets}</div>
                  <div className="text-[var(--text-muted)] text-[11px] uppercase tracking-wider">Sets</div>
                </div>
              )}
              {ex.reps && (
                <div className="rounded-lg p-3.5 border border-[var(--border)] bg-[var(--surface)] text-center">
                  <BarChart3 size={18} className="text-[var(--primary)] mx-auto mb-1" />
                  <div className="text-[var(--text-primary)] font-bold text-base">{ex.reps}</div>
                  <div className="text-[var(--text-muted)] text-[11px] uppercase tracking-wider">Reps</div>
                </div>
              )}
              {ex.duration && (
                <div className="rounded-lg p-3.5 border border-[var(--border)] bg-[var(--surface)] text-center">
                  <Clock size={18} className="text-[var(--primary)] mx-auto mb-1" />
                  <div className="text-[var(--text-primary)] font-bold text-base">{ex.duration}</div>
                  <div className="text-[var(--text-muted)] text-[11px] uppercase tracking-wider">Duration</div>
                </div>
              )}
            </div>

            {ex.equipmentNeeded && (
              <div className="mb-6 p-4 rounded-lg border border-[var(--border)] bg-[var(--surface)]">
                <h3 className="text-[var(--primary)] font-bold text-xs uppercase tracking-wider mb-1">Equipment Needed</h3>
                <p className="text-[var(--text-secondary)] text-sm">{ex.equipmentNeeded}</p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        {ex.instructions && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8"
          >
            <h2 className="gym-font text-2xl text-[var(--text-primary)] mb-4">STEP-BY-STEP INSTRUCTIONS</h2>
            <div className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed whitespace-pre-line">{ex.instructions}</div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
