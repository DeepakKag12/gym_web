import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Clock, TrendingDown, TrendingUp, User, ShieldCheck } from 'lucide-react';
import { cachedGet } from '../utils/api';
import { img } from '../utils/img';
import PillButton from '../components/ui/PillButton';
import { SpiralLoader } from '../components/ui';

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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelected(null);
    };
    if (selected) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selected]);

  return (
    <div className="min-h-screen bg-white text-oris-secondary relative font-sans selection:bg-[#3365e2] selection:text-white">
      {/* ── Landing Page White & Blue Hero Header ── */}
      <div className="relative overflow-hidden pt-28 sm:pt-36 pb-16 sm:pb-20 bg-[linear-gradient(to_bottom,#ffffff_0%,#eff6ff_20%,#bfdbfe_45%,#60a5fa_70%,#3365e2_100%)] text-slate-900 border-b border-[#3365e2]/20">
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#15324d_1.2px,transparent_1.2px)] [background-size:24px_24px]" />
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#3365e2]/30 text-[#3365e2] text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <ShieldCheck size={13} /> Verified Member Results
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 mb-4 tracking-tight uppercase">
            REAL MEMBER <span className="text-[#3365e2]">TRANSFORMATIONS</span>
          </h1>
          <p className="text-slate-700 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
            Real discipline. Real sweat. Real results. Click any athlete's card to inspect their complete progress timeline and video breakdown.
          </p>
        </div>
      </div>

      <div className="bg-[#f8fafc] text-slate-800 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-20">
        {loading ? (
          <SpiralLoader size="lg" />
        ) : transformations.length === 0 ? (
          <div className="text-center py-20 text-slate-500 text-sm">No transformations posted yet</div>
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
                  className="rounded-[22px] overflow-hidden border border-slate-200/90 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(51,101,226,0.12)] hover:border-[#3365e2]/40 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group flex flex-col"
                >
                  <div className="grid grid-cols-2 gap-px relative bg-slate-900">
                    <div className="relative overflow-hidden aspect-[4/5] bg-black">
                      <img
                        src={img(t.beforeImage, 500)}
                        alt="Before"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute bottom-2.5 left-2.5 bg-rose-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
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
                      <div className="absolute bottom-2.5 right-2.5 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        AFTER
                      </div>
                    </div>

                    {hasVideo && (
                      <div className="absolute top-2.5 right-2.5 z-10 bg-[#3365e2] text-white p-1.5 rounded-full shadow-md">
                        <Play size={11} fill="currentColor" />
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <h3 className="text-slate-900 font-bold text-base group-hover:text-[#3365e2] transition-colors line-clamp-1">
                          {t.title}
                        </h3>
                        {hasVideo && (
                          <span className="text-[10px] bg-[#3365e2]/10 text-[#3365e2] border border-[#3365e2]/25 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 flex-shrink-0">
                            <Play size={9} fill="currentColor" /> Video
                          </span>
                        )}
                      </div>
                      {t.description && (
                        <p className="text-slate-600 text-xs sm:text-sm mb-3 line-clamp-2 leading-relaxed font-normal">
                          {t.description}
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap gap-2 text-xs mb-3">
                        {t.duration && (
                          <span className="text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md flex items-center gap-1 font-semibold text-[11px]">
                            <Clock size={11} className="text-[#3365e2]" /> {t.duration}
                          </span>
                        )}
                        {t.weightLost && (
                          <span className="text-rose-600 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-md flex items-center gap-1 font-bold text-[11px]">
                            <TrendingDown size={11} /> {t.weightLost} lost
                          </span>
                        )}
                        {t.muscleGained && (
                          <span className="text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md flex items-center gap-1 font-bold text-[11px]">
                            <TrendingUp size={11} /> {t.muscleGained} gained
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                        <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                          <User size={13} className="text-[#3365e2]" />
                          <strong className="text-slate-900 font-bold">{t.member?.name || 'FitNation Athlete'}</strong>
                        </span>
                        <span className="text-[#3365e2] font-bold group-hover:translate-x-0.5 transition-transform">
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
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelected(null);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white border border-slate-200/90 rounded-2xl max-w-5xl w-full max-h-[92vh] max-h-[92dvh] flex flex-col shadow-2xl relative custom-scrollbar overflow-hidden"
            >
              {/* Sticky Top Header */}
              <div className="sticky top-0 z-20 px-4 sm:px-6 py-3.5 sm:py-4 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#3365e2]/10 text-[#3365e2] flex items-center justify-center flex-shrink-0">
                    <ShieldCheck size={18} className="sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-[#3365e2] block truncate">
                      FitNation Verified Result
                    </span>
                    <h2 className="gym-font text-xl sm:text-3xl text-slate-900 leading-tight truncate">
                      {selected.title}
                    </h2>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
                  aria-label="Close modal"
                >
                  <X size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              </div>

              {/* Scrollable Modal Content */}
              <div className="overflow-y-auto p-4 sm:p-8 space-y-5 sm:space-y-6 flex-1 bg-white">
                {/* Athlete & Metrics Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                      <User size={16} />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-medium">Athlete Spotlight</div>
                      <div className="text-base font-bold text-slate-900">
                        {selected.member?.name || 'FitNation Athlete'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {selected.duration && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-700 border border-blue-500/20 text-xs font-bold">
                        <Clock size={14} className="text-blue-500" />
                        {selected.duration} Protocol
                      </span>
                    )}
                    {selected.weightLost && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-700 border border-rose-500/20 text-xs font-bold">
                        <TrendingDown size={14} className="text-rose-500" />
                        {selected.weightLost} Lost
                      </span>
                    )}
                    {selected.muscleGained && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-xs font-bold">
                        <TrendingUp size={14} className="text-emerald-500" />
                        {selected.muscleGained} Gained
                      </span>
                    )}
                  </div>
                </div>

                {/* Side-by-Side High-Res Before & After Comparison */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Full Photographic Comparison
                    </span>
                    <span className="text-[11px] text-slate-500">
                      100% Unedited Client Progress
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Before Image */}
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950 relative group shadow-sm flex flex-col">
                      <div className="h-72 sm:h-96 md:h-[440px] w-full flex items-center justify-center bg-black/40">
                        <img
                          src={img(selected.beforeImage, 1000)}
                          alt="Before Transformation"
                          className="w-full h-full object-contain sm:object-cover object-top"
                        />
                      </div>
                      <div className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-md uppercase tracking-wider shadow-md">
                        BEFORE PROGRAM
                      </div>
                    </div>

                    {/* After Image */}
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950 relative group shadow-sm flex flex-col">
                      <div className="h-72 sm:h-96 md:h-[440px] w-full flex items-center justify-center bg-black/40">
                        <img
                          src={img(selected.afterImage, 1000)}
                          alt="After Results"
                          className="w-full h-full object-contain sm:object-cover object-top"
                        />
                      </div>
                      <div className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-black px-3 py-1 rounded-md uppercase tracking-wider shadow-md">
                        AFTER RESULTS
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Showcase Section if available */}
                {(selected.video || selected.videoUrl) && (
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#3365e2] block mb-3 flex items-center gap-1.5">
                      <Play size={13} fill="currentColor" /> Transformation Video & Form Showcase
                    </span>
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-black shadow-sm">
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
                  <div className="p-6 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#3365e2] block mb-2">
                      Training & Nutrition Breakdown
                    </span>
                    <p className="text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
                      {selected.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Sticky / Dedicated Footer Bar */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-slate-600">
                  Ready to achieve your own measurable athletic transformation?
                </p>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <PillButton
                    href="https://wa.me/919630906906?text=Hi%20Coach%20Ajeet,%20I%20am%20inspired%20by%20the%20transformations%20and%20want%20to%20start%20my%20fitness%20journey"
                    btnText="Chat With Coach Ajeet"
                    bgColor="#25D366"
                    hoverTextColor="#25D366"
                    dotColor="#ffffff"
                    size="sm"
                    className="flex-1 sm:flex-none border border-emerald-600"
                  />
                  <button
                    onClick={() => setSelected(null)}
                    className="px-4 py-2.5 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
