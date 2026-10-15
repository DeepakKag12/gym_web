import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Clock, TrendingDown, TrendingUp, User, ShieldCheck } from 'lucide-react';
import { cachedGet } from '../utils/api';
import { img } from '../utils/img';

function isYouTube(url) {
  return url && (url.includes('youtube.com') || url.includes('youtu.be'));
}

function ytId(url) {
  const m = (url || '').match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : '';
}

export default function TransformationsPage() {
  const [transformations, setTransformations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    cachedGet('/transformations', { cache: 120 })
      .then(res => setTransformations(Array.isArray(res.data) ? res.data : []))
      .catch(() => setTransformations([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] pt-20 transition-colors duration-200">
      {/* Header */}
      <div className="border-b border-[var(--border)] bg-[var(--surface)] py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--primary)] text-xs font-bold uppercase tracking-[0.16em] mb-3">
            <ShieldCheck size={13} /> Verified Member Results
          </div>
          <h1 className="gym-font text-5xl sm:text-6xl text-[var(--text-primary)] mb-3 tracking-wide">
            REAL TRANSFORMATIONS
          </h1>
          <p className="text-[var(--text-secondary)] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Real discipline. Real sweat. Real results. Click any member's card to inspect their complete progress timeline and video breakdown.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : transformations.length === 0 ? (
          <div className="text-center py-20 text-[var(--text-muted)] text-sm">No transformations posted yet</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {transformations.map((t, i) => {
              const hasVideo = Boolean(t.video || t.videoUrl);
              return (
                <motion.div
                  key={t._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i, 6) * 0.05, duration: 0.3 }}
                  onClick={() => setSelected(t)}
                  className="rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)] transition-all cursor-pointer group flex flex-col"
                >
                  <div className="grid grid-cols-2 gap-px relative bg-[var(--border)]">
                    <div className="relative overflow-hidden aspect-[4/5] bg-black">
                      <img
                        src={img(t.beforeImage, 500)}
                        alt="Before"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute bottom-2 left-2 bg-rose-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                        BEFORE
                      </div>
                    </div>
                    <div className="relative overflow-hidden aspect-[4/5] bg-black">
                      <img
                        src={img(t.afterImage, 500)}
                        alt="After"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute bottom-2 right-2 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                        AFTER
                      </div>
                    </div>

                    {hasVideo && (
                      <div className="absolute top-2.5 right-2.5 z-10 bg-black/75 text-[var(--primary)] border border-white/20 p-1.5 rounded-full shadow-md">
                        <Play size={11} fill="currentColor" />
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <h3 className="text-[var(--text-primary)] font-bold text-base group-hover:text-[var(--primary)] transition-colors line-clamp-1">
                          {t.title}
                        </h3>
                        {hasVideo && (
                          <span className="text-[10px] bg-[var(--surface-raised)] text-[var(--primary)] border border-[var(--border)] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 flex-shrink-0">
                            <Play size={9} fill="currentColor" /> Video
                          </span>
                        )}
                      </div>
                      {t.description && (
                        <p className="text-[var(--text-secondary)] text-xs sm:text-sm mb-3 line-clamp-2 leading-relaxed">
                          {t.description}
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap gap-2 text-xs mb-3">
                        {t.duration && (
                          <span className="text-[var(--text-secondary)] bg-[var(--surface-raised)] border border-[var(--border)] px-2.5 py-1 rounded-md flex items-center gap-1 font-medium text-[11px]">
                            <Clock size={11} className="text-[var(--primary)]" /> {t.duration}
                          </span>
                        )}
                        {t.weightLost && (
                          <span className="text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-md flex items-center gap-1 font-medium text-[11px]">
                            <TrendingDown size={11} /> {t.weightLost} lost
                          </span>
                        )}
                        {t.muscleGained && (
                          <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md flex items-center gap-1 font-medium text-[11px]">
                            <TrendingUp size={11} /> {t.muscleGained} gained
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)] text-xs">
                        <span className="text-[var(--text-muted)] flex items-center gap-1.5">
                          <User size={13} />
                          <strong className="text-[var(--text-secondary)] font-medium">{t.member?.name || 'FitNation Athlete'}</strong>
                        </span>
                        <span className="text-[var(--primary)] font-semibold group-hover:translate-x-0.5 transition-transform">
                          View details →
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Full Transformation Story & Video Modal */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.18 }}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative custom-scrollbar"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-[var(--surface-raised)] hover:bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center border border-[var(--border)] transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>

              <div className="p-6 sm:p-8">
                {/* Header */}
                <div className="mb-6 pr-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-sm bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--primary)] text-xs font-bold uppercase tracking-[0.16em] mb-2">
                    <ShieldCheck size={12} /> FitNation Transformation Story
                  </div>
                  <h2 className="gym-font text-3xl sm:text-4xl text-[var(--text-primary)] tracking-wide">{selected.title}</h2>
                  <p className="text-[var(--text-muted)] text-xs sm:text-sm mt-1">
                    Athlete: <strong className="text-[var(--text-primary)]">{selected.member?.name || 'FitNation Athlete'}</strong>
                  </p>
                </div>

                {/* Key Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {selected.duration && (
                    <div className="p-3.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)]">
                        <Clock size={16} />
                      </div>
                      <div>
                        <span className="text-[11px] text-[var(--text-muted)] block font-medium">Program Duration</span>
                        <strong className="text-[var(--text-primary)] text-sm font-bold">{selected.duration}</strong>
                      </div>
                    </div>
                  )}

                  {selected.weightLost && (
                    <div className="p-3.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                        <TrendingDown size={16} />
                      </div>
                      <div>
                        <span className="text-[11px] text-[var(--text-muted)] block font-medium">Weight Dropped</span>
                        <strong className="text-rose-500 text-sm font-bold">{selected.weightLost}</strong>
                      </div>
                    </div>
                  )}

                  {selected.muscleGained && (
                    <div className="p-3.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] flex items-center gap-3 col-span-2 sm:col-span-1">
                      <div className="w-9 h-9 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[var(--primary)]">
                        <TrendingUp size={16} />
                      </div>
                      <div>
                        <span className="text-[11px] text-[var(--text-muted)] block font-medium">Lean Muscle Added</span>
                        <strong className="text-[var(--primary)] text-sm font-bold">{selected.muscleGained}</strong>
                      </div>
                    </div>
                  )}
                </div>

                {/* Side-by-Side High-Res Before & After Comparison */}
                <div className="mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-3">
                    Before & After Visual Progress
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-lg overflow-hidden border border-[var(--border)] bg-black relative group">
                      <img
                        src={img(selected.beforeImage, 900)}
                        alt="Before Transformation"
                        className="w-full aspect-[4/5] object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-rose-600/90 text-white text-xs font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider">
                        BEFORE PROGRAM
                      </div>
                    </div>

                    <div className="rounded-lg overflow-hidden border border-[var(--border)] bg-black relative group">
                      <img
                        src={img(selected.afterImage, 900)}
                        alt="After Transformation"
                        className="w-full aspect-[4/5] object-cover"
                      />
                      <div className="absolute top-3 right-3 bg-emerald-600/90 text-white text-xs font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider">
                        AFTER RESULTS
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Showcase Section if available */}
                {(selected.video || selected.videoUrl) && (
                  <div className="mb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] block mb-3 flex items-center gap-1.5">
                      <Play size={13} fill="currentColor" /> Transformation Video & Form Showcase
                    </span>
                    <div className="rounded-lg overflow-hidden border border-[var(--border)] bg-black">
                      {isYouTube(selected.video || selected.videoUrl) ? (
                        <div className="relative w-full aspect-video">
                          <iframe
                            src={`https://www.youtube.com/embed/${ytId(selected.video || selected.videoUrl)}?autoplay=0&rel=0`}
                            className="absolute inset-0 w-full h-full border-0"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            title={selected.title}
                          />
                        </div>
                      ) : (
                        <video
                          src={selected.video || selected.videoUrl}
                          controls
                          playsInline
                          className="w-full max-h-[440px] object-contain bg-black"
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Athlete Journey & Story */}
                {selected.description && (
                  <div className="p-5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)]">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-2">
                      Training & Nutrition Journey
                    </span>
                    <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed whitespace-pre-line">
                      {selected.description}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
