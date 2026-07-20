import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Salad, Globe, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { cachedGet } from '../utils/api';

const GOAL_COLORS = {
  'weight-loss': 'text-red-400 bg-red-400/10',
  'muscle-gain': 'text-orange-400 bg-orange-400/10',
  'maintenance': 'text-blue-400 bg-blue-400/10',
  'endurance': 'text-green-400 bg-green-400/10',
  'general': 'text-purple-400 bg-purple-400/10',
};

function DietCard({ plan }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass rounded-xl overflow-hidden hover:border-orange-500/30 transition-all">
      <div className="p-5">
        {plan.image && <img src={plan.image} alt={plan.title} className="w-full h-40 object-cover rounded-lg mb-4" />}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-white font-semibold text-lg">{plan.title}</h3>
          {!plan.isPublic && <Lock size={14} className="text-yellow-400 flex-shrink-0 mt-1" />}
        </div>
        {plan.goal && (
          <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${GOAL_COLORS[plan.goal]}`}>{plan.goal.replace('-', ' ')}</span>
        )}
        <p className="text-gray-400 text-sm mt-2 leading-relaxed line-clamp-2">{plan.description}</p>
        {plan.totalCalories && (
          <div className="mt-3 flex gap-4 text-xs text-gray-500">
            <span>🔥 {plan.totalCalories} kcal</span>
            {plan.totalProtein && <span>💪 {plan.totalProtein} protein</span>}
          </div>
        )}
        {plan.meals?.length > 0 && (
          <button
            onClick={() => setOpen(!open)}
            className="mt-4 flex items-center gap-1 text-orange-400 text-sm hover:text-orange-300 transition-colors"
          >
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {open ? 'Hide Meals' : `View ${plan.meals.length} Meals`}
          </button>
        )}
      </div>
      {open && plan.meals?.length > 0 && (
        <div className="border-t border-white/10 p-5">
          <div className="space-y-4">
            {plan.meals.map((meal, i) => (
              <div key={i} className="bg-white/3 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-orange-400 font-semibold text-sm capitalize">{meal.mealType}</span>
                  {meal.time && <span className="text-gray-500 text-xs">{meal.time}</span>}
                </div>
                {meal.items?.length > 0 && (
                  <ul className="space-y-1">
                    {meal.items.map((item, j) => (
                      <li key={j} className="flex justify-between text-xs text-gray-300">
                        <span>{item.name} — {item.quantity}</span>
                        {item.calories && <span className="text-gray-500">{item.calories} kcal</span>}
                      </li>
                    ))}
                  </ul>
                )}
                {meal.notes && <p className="text-gray-500 text-xs mt-1">{meal.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DietPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    cachedGet('/diet', { cache: 90 }).then(res => setPlans(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const goals = ['all', 'weight-loss', 'muscle-gain', 'maintenance', 'endurance', 'general'];
  const filtered = filter === 'all' ? plans : plans.filter(p => p.goal === filter);

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20">
      <div className="relative bg-gradient-to-br from-green-900/20 to-transparent border-b border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Salad size={40} className="text-green-400 mx-auto mb-4" />
          <h1 className="gym-font text-6xl text-white mb-3">DIET <span className="gradient-text">PLANS</span></h1>
          <p className="text-gray-400 text-lg">Nutrition plans for every fitness goal</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Filter */}
        <div className="flex gap-2 flex-wrap mb-10">
          {goals.map(g => (
            <button
              key={g}
              onClick={() => setFilter(g)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
                filter === g ? 'bg-orange-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
              }`}
            >
              {g.replace('-', ' ')}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No diet plans available</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((plan, i) => (
              <motion.div key={plan._id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <DietCard plan={plan} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
