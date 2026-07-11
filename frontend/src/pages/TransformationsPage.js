import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import API from '../utils/api';

export default function TransformationsPage() {
  const [transformations, setTransformations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/transformations').then(res => setTransformations(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20">
      <div className="relative bg-gradient-to-br from-purple-900/20 to-transparent border-b border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="gym-font text-6xl text-white mb-3">REAL <span className="gradient-text">TRANSFORMATIONS</span></h1>
          <p className="text-gray-400 text-lg">Before & after results from our members</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : transformations.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No transformations posted yet</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {transformations.map((t, i) => (
              <motion.div
                key={t._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass rounded-xl overflow-hidden hover:border-orange-500/30 transition-all"
              >
                <div className="grid grid-cols-2 gap-1">
                  <div className="relative">
                    <img src={t.beforeImage} alt="Before" className="w-full h-52 object-cover" />
                    <div className="absolute bottom-2 left-2 bg-red-500/80 text-white text-xs px-2 py-0.5 rounded-full font-semibold">BEFORE</div>
                  </div>
                  <div className="relative">
                    <img src={t.afterImage} alt="After" className="w-full h-52 object-cover" />
                    <div className="absolute bottom-2 right-2 bg-green-500/80 text-white text-xs px-2 py-0.5 rounded-full font-semibold">AFTER</div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-white font-bold text-lg mb-1">{t.title}</h3>
                  {t.description && <p className="text-gray-400 text-sm mb-3 line-clamp-2">{t.description}</p>}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {t.duration && <span className="text-gray-500 bg-white/5 px-2 py-1 rounded-full">⏱ {t.duration}</span>}
                    {t.weightLost && <span className="text-red-400 bg-red-400/10 px-2 py-1 rounded-full">↓ {t.weightLost} lost</span>}
                    {t.muscleGained && <span className="text-green-400 bg-green-400/10 px-2 py-1 rounded-full">↑ {t.muscleGained} gained</span>}
                  </div>
                  {t.member?.name && <p className="text-gray-500 text-xs mt-3">— {t.member.name}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
