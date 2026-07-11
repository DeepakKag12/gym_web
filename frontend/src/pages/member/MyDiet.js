import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Salad, ChevronRight, Flame, Target, Apple, Info } from 'lucide-react';
import API from '../../utils/api';

const GOAL_COLOR = {
  'weight-loss':   'text-orange-400 bg-orange-400/10',
  'muscle-gain':   'text-cyan-400   bg-cyan-400/10',
  'maintenance':   'text-green-400  bg-green-400/10',
  'general':       'text-purple-400 bg-purple-400/10',
};

function MacroBar({ label, value, max = 300, color }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-medium">{value ?? '–'}{label !== 'Calories' ? 'g' : ' kcal'}</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function MealCard({ meal, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-400/10 text-cyan-400 flex items-center justify-center text-sm font-bold">
            {index + 1}
          </div>
          <div className="text-left">
            <div className="text-white font-semibold text-sm">{meal.mealName}</div>
            {meal.time && <div className="text-gray-500 text-xs">{meal.time}</div>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {meal.calories && (
            <span className="text-xs text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Flame size={10} />{meal.calories} kcal
            </span>
          )}
          <ChevronRight size={15} className={`text-gray-500 transition-transform ${open ? 'rotate-90' : ''}`} />
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-2">
          {meal.items?.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm py-1.5 border-t border-white/5">
              <div className="flex items-center gap-2">
                <Apple size={13} className="text-cyan-400 flex-shrink-0" />
                <span className="text-gray-200">{item.food}</span>
              </div>
              <div className="flex gap-3 text-gray-500 text-xs">
                {item.quantity && <span>{item.quantity}</span>}
                {item.calories && <span className="text-orange-400">{item.calories} kcal</span>}
              </div>
            </div>
          ))}
          {meal.notes && (
            <div className="flex items-start gap-2 mt-2 p-2 rounded-lg bg-white/5">
              <Info size={13} className="text-gray-500 mt-0.5 flex-shrink-0" />
              <p className="text-gray-400 text-xs">{meal.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MyDiet() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    API.get('/diet/my')
      .then(r => {
        setPlans(r.data);
        if (r.data.length > 0) setSelected(r.data[0]._id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const plan = plans.find(p => p._id === selected);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-cyan-400/10 flex items-center justify-center">
            <Salad size={22} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-white font-bold text-2xl">My Diet Plans</h1>
            <p className="text-gray-500 text-sm">Nutrition plans assigned to you by your trainer</p>
          </div>
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-20">
            <Salad size={50} className="mx-auto mb-4 text-gray-700" />
            <p className="text-gray-400 text-lg font-medium">No diet plans yet</p>
            <p className="text-gray-600 text-sm mt-1">Your trainer hasn't assigned any diet plans yet.</p>
            <Link to="/diet" className="btn-outline mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm">
              Browse Public Diet Plans
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Plan selector */}
            <div className="space-y-2">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">Your Plans</p>
              {plans.map(p => (
                <button
                  key={p._id}
                  onClick={() => setSelected(p._id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selected === p._id
                      ? 'border-cyan-500/50 bg-cyan-500/10 text-white'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <div className="font-semibold text-sm">{p.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${GOAL_COLOR[p.goal] || 'text-gray-400 bg-gray-400/10'}`}>
                      {(p.goal || 'general').replace('-', ' ')}
                    </span>
                    <span className="text-xs text-gray-600">{p.meals?.length || 0} meals</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Plan detail */}
            {plan && (
              <div className="lg:col-span-2 space-y-4">
                <div className="glass rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-white font-bold text-xl">{plan.title}</h2>
                      {plan.description && <p className="text-gray-400 text-sm mt-1">{plan.description}</p>}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize flex-shrink-0 ${GOAL_COLOR[plan.goal] || 'text-gray-400 bg-gray-400/10'}`}>
                      <Target size={10} className="inline mr-1" />
                      {(plan.goal || 'general').replace('-', ' ')}
                    </span>
                  </div>

                  {/* Macros */}
                  {plan.totalCalories && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-white/5 rounded-xl mb-4">
                      <MacroBar label="Calories" value={plan.totalCalories} max={4000} color="bg-orange-400" />
                      <MacroBar label="Protein"  value={plan.totalProtein}  max={300}  color="bg-cyan-400" />
                      <MacroBar label="Carbs"    value={plan.totalCarbs}    max={500}  color="bg-purple-400" />
                    </div>
                  )}
                </div>

                {/* Meals */}
                <div className="space-y-2">
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Meals ({plan.meals?.length || 0})</p>
                  {plan.meals?.map((meal, i) => <MealCard key={i} meal={meal} index={i} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
