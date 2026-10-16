import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Dumbbell, Clock, Target, BarChart3, CheckCircle2, MessageCircle, ShieldCheck, Sparkles, ChevronRight } from 'lucide-react';
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
      <div className="w-9 h-9 border-3 border-[#3365e2] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!ex) return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center gap-3 text-slate-500 text-sm">
      <p>Exercise not found.</p>
      <Link to="/exercises" className="text-[#3365e2] font-bold hover:underline inline-flex items-center gap-1">
        <ArrowLeft size={14} /> Return to exercise library
      </Link>
    </div>
  );

  const steps = ex.instructions
    ? ex.instructions.split('\n').filter(s => s.trim().length > 0)
    : [];

  return (
    <div className="min-h-screen bg-white text-oris-secondary relative font-sans selection:bg-[#3365e2] selection:text-white">
      {/* ── Landing Page White & Blue Hero Header ── */}
      <div className="relative overflow-hidden pt-28 sm:pt-36 pb-12 sm:pb-16 bg-[linear-gradient(to_bottom,#ffffff_0%,#eff6ff_20%,#bfdbfe_45%,#60a5fa_70%,#3365e2_100%)] text-slate-900 border-b border-[#3365e2]/20">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#15324d_1.2px,transparent_1.2px)] [background-size:24px_24px] pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          {/* Breadcrumb */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-semibold mb-4">
            <Link to="/" className="hover:text-[#3365e2] transition-colors">Home</Link>
            <ChevronRight size={13} className="text-slate-400" />
            <Link to="/exercises" className="hover:text-[#3365e2] transition-colors">Workouts &amp; Exercises</Link>
            <ChevronRight size={13} className="text-slate-400" />
            <span className="text-[#3365e2] font-semibold capitalize">{ex.muscleGroup}</span>
            <ChevronRight size={13} className="text-slate-400" />
            <span className="text-slate-900 font-bold line-clamp-1 max-w-xs">{ex.title}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#3365e2]/30 text-[#3365e2] text-xs font-bold uppercase tracking-wider shadow-xs">
              <Dumbbell size={13} /> {ex.muscleGroup}
            </span>
            {ex.difficulty && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/90 border border-[#3365e2]/25 text-slate-800 text-xs font-bold capitalize shadow-xs">
                {ex.difficulty}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight uppercase leading-tight mb-2">
            {ex.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-700 max-w-2xl leading-relaxed font-medium">
            {ex.description || 'Master this athletic movement with proper mechanics, tension cues, and coaching safety protocols.'}
          </p>
        </div>
      </div>

      <div className="bg-[#f8fafc] text-slate-800 min-h-[60vh]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <Link
            to="/exercises"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-[#3365e2] mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Exercises
          </Link>

        {/* ── 2-Column Hero ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Media Column — uploaded video > YouTube URL > image > placeholder */}
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden border border-slate-200/90 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.06)] bg-black relative">
              {(ex.video || ex.videoUrl) ? (() => {
                const src = ex.video || ex.videoUrl;
                if (isYouTube(src)) {
                  const ytid = ytId(src);
                  return ytid ? (
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
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
                    className="w-full max-h-[420px] object-cover bg-black"
                  />
                );
              })() : ex.image ? (
                <img
                  src={img(ex.image, 1000)}
                  alt={ex.title}
                  decoding="async"
                  className="w-full max-h-[420px] object-cover"
                />
              ) : (
                <div className="w-full h-72 bg-slate-900 flex flex-col items-center justify-center gap-2 text-slate-500">
                  <Dumbbell size={52} className="opacity-40" />
                  <span className="text-xs">No media available</span>
                </div>
              )}
            </div>

            {/* Quick Specs Pill Box */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-white dark:bg-[#0e1526] border border-slate-200/90 dark:border-white/10 shadow-xs">
              <div>
                <span className="text-[10.5px] uppercase font-bold tracking-wider text-slate-400 block">Target Group</span>
                <span className="text-sm font-extrabold text-slate-900 capitalize">{ex.muscleGroup}</span>
              </div>
              <div>
                <span className="text-[10.5px] uppercase font-bold tracking-wider text-slate-400 block">Equipment</span>
                <span className="text-sm font-extrabold text-slate-900 truncate block">{ex.equipmentNeeded || 'Standard Gym Floor'}</span>
              </div>
            </div>
          </div>

          {/* Details Column */}
          <div className="flex flex-col">
            {/* Badges */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs bg-[#eff4fe] text-[#3365e2] border border-[#3365e2]/30 px-3 py-1 rounded-full capitalize font-bold tracking-wider">
                {ex.muscleGroup}
              </span>
              <span className={`text-xs px-3 py-1 rounded-full capitalize font-bold tracking-wider ${
                ex.difficulty === 'beginner' ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30' :
                ex.difficulty === 'intermediate' ? 'bg-amber-500/15 text-amber-700 border border-amber-500/30' :
                'bg-rose-500/15 text-rose-700 border border-rose-500/30'
              }`}>
                {ex.difficulty}
              </span>
              {ex.isPublic === false && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                  Members Only
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
              {ex.title}
            </h1>

            {ex.description && (
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                {ex.description}
              </p>
            )}

            {/* Architectural Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="rounded-xl p-3.5 border border-slate-200/90 bg-white text-center shadow-xs">
                <Target size={18} className="text-[#3365e2] mx-auto mb-1" />
                <div className="text-slate-900 font-black text-lg tabular-nums">{ex.sets || '3'}</div>
                <div className="text-slate-400 text-[10.5px] font-bold uppercase tracking-wider">Sets</div>
              </div>
              <div className="rounded-xl p-3.5 border border-slate-200/90 bg-white text-center shadow-xs">
                <BarChart3 size={18} className="text-[#3365e2] mx-auto mb-1" />
                <div className="text-slate-900 font-black text-lg tabular-nums">{ex.reps || '10-12'}</div>
                <div className="text-slate-400 text-[10.5px] font-bold uppercase tracking-wider">Reps</div>
              </div>
              <div className="rounded-xl p-3.5 border border-slate-200/90 bg-white text-center shadow-xs">
                <Clock size={18} className="text-[#3365e2] mx-auto mb-1" />
                <div className="text-slate-900 font-black text-lg tabular-nums">{ex.duration || '60s'}</div>
                <div className="text-slate-400 text-[10.5px] font-bold uppercase tracking-wider">Rest Window</div>
              </div>
            </div>

            {/* Equipment Callout */}
            {ex.equipmentNeeded && (
              <div className="mb-6 p-4 rounded-xl border border-slate-200/90 bg-white shadow-xs">
                <h3 className="text-[#3365e2] font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Dumbbell size={14} /> Equipment Required
                </h3>
                <p className="text-slate-700 text-sm font-medium">{ex.equipmentNeeded}</p>
              </div>
            )}

            {/* Direct WhatsApp Coaching Button */}
            <a
              href={`https://wa.me/919630906906?text=Hi%20Coach%20Ajeet,%20I%20have%20a%20question%20about%20the%20${encodeURIComponent(ex.title)}%20exercise`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 p-3.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-sm transition-all shadow-md active:scale-98"
            >
              <MessageCircle size={16} />
              <span>Ask Coach Ajeet About Form &amp; Technique</span>
            </a>
          </div>
        </div>

        {/* ── Step-by-Step Instructions & Coaching Cues ── */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-6 tracking-tight flex items-center gap-2">
              <Sparkles size={20} className="text-[#3365e2]" />
              STEP-BY-STEP BIOMECHANICAL EXECUTION
            </h2>

            {steps.length > 0 ? (
              <div className="space-y-4">
                {steps.map((st, i) => (
                  <div key={i} className="flex items-start gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="w-8 h-8 rounded-lg bg-[#3365e2] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                      {i + 1 < 10 ? `0${i + 1}` : i + 1}
                    </span>
                    <p className="text-slate-700 text-sm sm:text-base leading-relaxed pt-1">
                      {st.replace(/^\d+[.)]\s*/, '')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm leading-relaxed">
                {ex.instructions || 'Focus on maintaining steady breathing and proper muscular tension throughout the full range of motion.'}
              </p>
            )}
          </div>

          {/* Form Guardrails Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#3365e2]" />
                Coaching Checkpoints
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>Control eccentric tempo (2-second lowering phase).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>Maintain core bracing and neutral spinal alignment.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>Prioritize full biomechanical range of motion over load.</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Coached by</span>
              <span className="text-xs font-bold text-slate-800">Ajeet Kag · FitNation Head Coach</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
