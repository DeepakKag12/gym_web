import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactPlayer from 'react-player';
import { ArrowLeft, Dumbbell, Clock, Target, BarChart3, Play } from 'lucide-react';
import API from '../utils/api';

export default function ExerciseDetailPage() {
  const { id } = useParams();
  const [ex, setEx] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/exercises/${id}`)
      .then(res => setEx(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0f]">
      <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!ex) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-gray-400">
      Exercise not found. <Link to="/exercises" className="text-orange-400 ml-2">← Back</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <Link to="/exercises" className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 mb-8 transition-colors">
          <ArrowLeft size={18} /> Back to Exercises
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Media */}
          <div>
            {ex.video ? (
              <div className="rounded-xl overflow-hidden border border-white/10">
                <ReactPlayer url={ex.video} controls width="100%" />
              </div>
            ) : ex.image ? (
              <img src={ex.image} alt={ex.title} className="w-full rounded-xl border border-white/10 object-cover max-h-80" />
            ) : (
              <div className="w-full h-64 bg-white/5 rounded-xl flex items-center justify-center">
                <Dumbbell size={64} className="text-gray-700" />
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full capitalize">{ex.muscleGroup}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                      ex.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                      ex.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>{ex.difficulty}</span>
            </div>

            <h1 className="gym-font text-4xl text-white mb-4">{ex.title}</h1>
            <p className="text-gray-400 leading-relaxed mb-6">{ex.description}</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {ex.sets && (
                  <div className="glass rounded-lg p-3 text-center">
                    <Target size={18} className="text-cyan-400 mx-auto mb-1" />
                    <div className="text-white font-bold">{ex.sets}</div>
                    <div className="text-gray-500 text-xs">Sets</div>
                  </div>
                )}
                {ex.reps && (
                  <div className="glass rounded-lg p-3 text-center">
                    <BarChart3 size={18} className="text-cyan-400 mx-auto mb-1" />
                    <div className="text-white font-bold">{ex.reps}</div>
                    <div className="text-gray-500 text-xs">Reps</div>
                  </div>
                )}
                {ex.duration && (
                  <div className="glass rounded-lg p-3 text-center">
                    <Clock size={18} className="text-cyan-400 mx-auto mb-1" />
                  <div className="text-white font-bold">{ex.duration}</div>
                  <div className="text-gray-500 text-xs">Duration</div>
                </div>
              )}
            </div>

            {ex.equipmentNeeded && (
              <div className="mb-6 p-4 glass rounded-xl">
                <h3 className="text-orange-400 font-semibold mb-1 text-sm">Equipment Needed</h3>
                <p className="text-gray-300 text-sm">{ex.equipmentNeeded}</p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        {ex.instructions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 glass rounded-xl p-8"
          >
            <h2 className="text-white font-bold text-xl mb-4">Step-by-Step Instructions</h2>
            <div className="text-gray-300 leading-relaxed whitespace-pre-line">{ex.instructions}</div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
