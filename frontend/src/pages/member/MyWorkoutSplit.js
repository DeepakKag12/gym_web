import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Dumbbell, ChevronDown, ChevronUp, Star, Zap } from 'lucide-react';
import API from '../../utils/api';

const DAY_COLORS = {
  Monday:    'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  Tuesday:   'from-purple-500/20 to-purple-600/10 border-purple-500/30',
  Wednesday: 'from-green-500/20 to-green-600/10 border-green-500/30',
  Thursday:  'from-amber-500/20 to-amber-600/10 border-amber-500/30',
  Friday:    'from-red-500/20 to-red-600/10 border-red-500/30',
  Saturday:  'from-pink-500/20 to-pink-600/10 border-pink-500/30',
  Sunday:    'from-gray-500/20 to-gray-600/10 border-gray-500/30',
};

const DIFF_COLOR = { beginner: 'text-green-400 bg-green-500/10', intermediate: 'text-yellow-400 bg-yellow-500/10', advanced: 'text-red-400 bg-red-500/10' };
const DAYS_ORDER = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

function DayCard({ day, index }) {
  const [open, setOpen] = useState(index < 2);
  const today = DAYS_ORDER[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const isToday = day.day === today;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}
      className={`rounded-2xl border bg-gradient-to-br ${DAY_COLORS[day.day] || 'from-gray-500/10 to-gray-600/5 border-gray-500/20'} overflow-hidden`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${isToday ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-300'}`}>
            {day.day.slice(0, 3)}
          </div>
          <div className="text-left">
            <div className="text-white font-semibold flex items-center gap-2">
              {day.day}
              {isToday && <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Today</span>}
            </div>
            <div className="text-gray-400 text-xs">{day.focus || (day.exercises?.length ? `${day.exercises.length} exercises` : 'Rest Day')}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <span className="text-xs">{day.exercises?.length || 0}</span>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2.5">
          {day.exercises?.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">🌟 Rest & Recovery</div>
          )}
          {day.exercises?.map((ex, i) => (
            <div key={ex._id || i} className="flex items-start gap-3 p-3 rounded-xl bg-black/20 border border-white/5">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                <Dumbbell size={14} className="text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">{ex.title}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-gray-500 text-xs capitalize">{ex.muscleGroup}</span>
                  {ex.difficulty && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full capitalize ${DIFF_COLOR[ex.difficulty]}`}>{ex.difficulty}</span>
                  )}
                </div>
              </div>
              {ex.sets && <div className="text-right text-xs text-gray-500 flex-shrink-0">{ex.sets}×{ex.reps || '?'}</div>}
            </div>
          ))}
          {day.notes && (
            <div className="text-xs text-gray-500 italic border-t border-white/5 pt-2 mt-2">💡 {day.notes}</div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function MyWorkoutSplit() {
  const [split, setSplit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/splits/me').then(r => setSplit(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const sortedDays = split?.days?.sort((a, b) => DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day)) || [];

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20 pb-20 lg:pb-8">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="gym-font text-3xl text-white flex items-center gap-2">
            <Calendar size={28} className="text-blue-400" /> My Workout Split
          </h1>
          {split && (
            <div className="mt-2 flex items-center gap-3">
              <span className="text-lg font-bold text-white">{split.title}</span>
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full capitalize">{split.goal?.replace('_', ' ')}</span>
              {split.isDefault && <span className="text-xs bg-gray-500/20 text-gray-400 px-2.5 py-1 rounded-full">Default Plan</span>}
            </div>
          )}
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : !split ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Dumbbell size={40} className="text-gray-600 mx-auto mb-3" />
            <div className="text-gray-400 mb-2">No workout plan assigned yet</div>
            <div className="text-gray-600 text-sm">Ask your trainer to set up your weekly split</div>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedDays.map((day, i) => <DayCard key={day.day} day={day} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
