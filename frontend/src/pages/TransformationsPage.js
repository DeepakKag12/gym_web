import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Dumbbell, Clock, TrendingDown, TrendingUp, User, Sparkles } from 'lucide-react';
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
      .then(res => setTransformations(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20">
      <div className="relative bg-gradient-to-br from-purple-900/20 via-orange-950/10 to-transparent border-b border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold mb-4">
            <Sparkles size={13} /> Member Success Stories
          </div>
          <h1 className="gym-font text-5xl sm:text-6xl text-white mb-3 tracking-wide">
            REAL <span className="gradient-text">TRANSFORMATIONS</span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
            Real discipline. Real sweat. Real results. Click on any athlete's card to view their complete journey and video showcase.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : transformations.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No transformations posted yet</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {transformations.map((t, i) => {
              const hasVideo = Boolean(t.video || t.videoUrl);
              return (
                <motion.div
                  key={t._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => setSelected(t)}
                  className="glass rounded-2xl overflow-hidden hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 cursor-pointer group flex flex-col"
                >
                  <div className="grid grid-cols-2 gap-0.5 relative bg-black/40">
                    <div className="relative overflow-hidden aspect-[4/5]">
                      <img
                        src={img(t.beforeImage, 500)}
                        alt="Before"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute bottom-2.5 left-2.5 bg-rose-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md uppercase tracking-wider">
                        BEFORE
                      </div>
                    </div>
                    <div className="relative overflow-hidden aspect-[4/5]">
                      <img
                        src={img(t.afterImage, 500)}
                        alt="After"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute bottom-2.5 right-2.5 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md uppercase tracking-wider">
                        AFTER
                      </div>
                    </div>

                    {hasVideo && (
                      <div className="absolute top-2.5 right-2.5 z-10 bg-black/70 backdrop-blur-md text-orange-400 border border-orange-500/30 p-1.5 rounded-full shadow-lg">
                        <Play size={13} fill="currentColor" />
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <h3 className="text-white font-bold text-lg group-hover:text-orange-400 transition-colors line-clamp-1">
                          {t.title}
                        </h3>
                        {hasVideo && (
                          <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 flex-shrink-0">
                            <Play size={9} fill="currentColor" /> Video
                          </span>
                        )}
                      </div>
                      {t.description && (
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2 leading-relaxed">
                          {t.description}
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap gap-2 text-xs mb-3">
                        {t.duration && (
                          <span className="text-gray-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium">
                            <Clock size={12} className="text-orange-400" /> {t.duration}
                          </span>
                        )}
                        {t.weightLost && (
                          <span className="text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium">
                            <TrendingDown size={12} className="text-rose-400" /> {t.weightLost} lost
                          </span>
                        )}
                        {t.muscleGained && (
                          <span className="text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium">
                            <TrendingUp size={12} className="text-emerald-400" /> {t.muscleGained} gained
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                        <span className="text-gray-400 flex items-center gap-1.5">
                          <User size={13} className="text-gray-500" />
                          <strong className="text-gray-200">{t.member?.name || 'FitNation Athlete'}</strong>
                        </span>
                        <span className="text-orange-400 font-semibold group-hover:translate-x-0.5 transition-transform">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-[#12141c] border border-white/15 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative custom-scrollbar"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-gray-300 hover:text-white flex items-center justify-center border border-white/15 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              <div className="p-6 sm:p-8">
                {/* Header */}
                <div className="mb-6 pr-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold mb-2">
                    <Sparkles size={12} /> FitNation Transformation Showcase
                  </div>
                  <h2 className="gym-font text-3xl sm:text-4xl text-white tracking-wide">{selected.title}</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Athlete: <strong className="text-white">{selected.member?.name || 'FitNation Athlete'}</strong>
                  </p>
                </div>

                {/* Key Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {selected.duration && (
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                        <Clock size={18} />
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 block font-medium">Program Duration</span>
                        <strong className="text-white text-sm sm:text-base font-bold">{selected.duration}</strong>
                      </div>
                    </div>
                  )}

                  {selected.weightLost && (
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                        <TrendingDown size={18} />
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 block font-medium">Weight Dropped</span>
                        <strong className="text-rose-400 text-sm sm:text-base font-bold">{selected.weightLost}</strong>
                      </div>
                    </div>
                  )}

                  {selected.muscleGained && (
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 col-span-2 sm:col-span-1">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <TrendingUp size={18} />
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 block font-medium">Lean Muscle Added</span>
                        <strong className="text-emerald-400 text-sm sm:text-base font-bold">{selected.muscleGained}</strong>
                      </div>
                    </div>
                  )}
                </div>

                {/* Side-by-Side High-Res Before & After Comparison */}
                <div className="mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-3">
                    Before & After Visual Progress
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl overflow-hidden border border-white/15 bg-black/50 relative group">
                      <img
                        src={img(selected.beforeImage, 900)}
                        alt="Before Transformation"
                        className="w-full aspect-[4/5] object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-rose-600/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-lg shadow-md uppercase tracking-wider">
                        BEFORE PROGRAM
                      </div>
                    </div>

                    <div className="rounded-2xl overflow-hidden border border-white/15 bg-black/50 relative group">
                      <img
                        src={img(selected.afterImage, 900)}
                        alt="After Transformation"
                        className="w-full aspect-[4/5] object-cover"
                      />
                      <div className="absolute top-3 right-3 bg-emerald-600/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-lg shadow-md uppercase tracking-wider">
                        AFTER RESULTS
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Showcase Section if available */}
                {(selected.video || selected.videoUrl) && (
                  <div className="mb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-400 block mb-3 flex items-center gap-1.5">
                      <Play size={14} fill="currentColor" /> Transformation Video & Form Showcase
                    </span>
                    <div className="rounded-2xl overflow-hidden border border-white/15 bg-black/60">
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
                          className="w-full max-h-[460px] object-contain bg-black"
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Athlete Journey & Story */}
                {selected.description && (
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">
                      Training & Nutrition Journey
                    </span>
                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
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
