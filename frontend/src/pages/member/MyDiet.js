import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Salad, ChevronDown, Flame, Apple, Info } from 'lucide-react';

import { cachedGet, apiError } from '../../utils/api';
import MemberPage from '../../components/MemberPage';
import {
  Card, Button, Badge, EmptyState, Skeleton, Tabs, FadeIn, useMotion,
} from '../../components/ui';

/**
 * My diet — the plans a trainer has assigned to this member.
 *
 * Converted from a hand-rolled dark screen (its own colours per goal, its own
 * cards, its own spinner) onto the shared UI kit, so it matches the rest of the
 * app and follows the light/dark switch.
 *
 * The old version used a colour per goal and another per macro. Goal is now one
 * badge and the macros are three plain bars, because the useful comparison is
 * "how much of my target is this", not "which colour is protein".
 */

/** Goal → badge tone. One accent, not four. */
const GOAL_TONE = {
  'weight-loss': 'warn',
  'muscle-gain': 'accent',
  maintenance: 'ok',
  general: 'neutral',
};

const goalLabel = g => (g || 'general').replace('-', ' ');

function MacroBar({ label, value, max, unit }) {
  const pct = value ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-[12.5px] mb-1">
        <span style={{ color: 'var(--p-text-2)' }}>{label}</span>
        <span className="font-semibold" style={{ color: 'var(--p-text)' }}>
          {value ?? '—'}{value ? unit : ''}
        </span>
      </div>
      <div style={{ height: 6, background: 'var(--p-surface-2)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: 'var(--p-accent)' }} />
      </div>
    </div>
  );
}

function MealCard({ meal, index }) {
  const [open, setOpen] = useState(index === 0);
  const m = useMotion();
  const items = meal.items || [];

  return (
    <Card padded={false} className="mb-2.5">
      <button
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
      >
        <span
          className="grid place-items-center rounded-lg text-[13px] font-bold flex-shrink-0"
          style={{ width: 30, height: 30, background: 'var(--p-accent-soft)', color: 'var(--p-accent)' }}
        >
          {index + 1}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-[14.5px] font-semibold capitalize" style={{ color: 'var(--p-text)' }}>
            {meal.mealType || meal.mealName || `Meal ${index + 1}`}
          </span>
          <span className="block text-[12.5px]" style={{ color: 'var(--p-muted)' }}>
            {meal.time ? `${meal.time} · ` : ''}
            {items.length} item{items.length === 1 ? '' : 's'}
          </span>
        </span>
        {meal.calories ? (
          <Badge tone="warn"><Flame size={11} /> {meal.calories} kcal</Badge>
        ) : null}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={17} style={{ color: 'var(--p-muted)' }} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={m.reduce ? false : { height: 0, opacity: 0 }}
            animate={m.reduce ? {} : { height: 'auto', opacity: 1 }}
            exit={m.reduce ? {} : { height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 pb-4" style={{ borderTop: '1px solid var(--p-border)' }}>
              {items.length === 0 ? (
                <p className="text-[13px] py-3" style={{ color: 'var(--p-muted)' }}>
                  No items listed for this meal.
                </p>
              ) : (
                <ul className="pt-1">
                  {items.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2.5 py-2"
                      style={{ borderTop: i ? '1px solid var(--p-border)' : 'none' }}
                    >
                      <Apple size={14} style={{ color: 'var(--p-accent)' }} className="flex-shrink-0" />
                      <span className="flex-1 min-w-0 text-[14px]" style={{ color: 'var(--p-text)' }}>
                        {item.name || item.food}
                      </span>
                      {item.quantity && (
                        <span className="text-[12.5px]" style={{ color: 'var(--p-muted)' }}>{item.quantity}</span>
                      )}
                      {item.calories && (
                        <span className="text-[12.5px] font-medium" style={{ color: 'var(--p-warn)' }}>
                          {item.calories} kcal
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {meal.notes && (
                <div
                  className="flex items-start gap-2 mt-3 p-2.5 rounded-lg"
                  style={{ background: 'var(--p-surface-2)' }}
                >
                  <Info size={14} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--p-muted)' }} />
                  <p className="text-[13px]" style={{ color: 'var(--p-text-2)' }}>{meal.notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export default function MyDiet() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    cachedGet('/diet/my', { cache: 60 })
      .then(r => {
        const list = Array.isArray(r.data) ? r.data : [];
        setPlans(list);
        if (list.length) setSelected(list[0]._id);
      })
      .catch(err => setError(apiError(err, 'Could not load your diet plans.')))
      .finally(() => setLoading(false));
  }, []);

  const plan = useMemo(() => plans.find(p => p._id === selected), [plans, selected]);

  return (
    <MemberPage title="My diet" subtitle="Plans your trainer has assigned to you">
      {loading ? (
        <div className="space-y-3">
          <Skeleton h={72} />
          <Skeleton h={140} />
          <Skeleton h={64} />
        </div>
      ) : error ? (
        <Card>
          <EmptyState icon={Salad} title="Could not load your plans" hint={error} />
        </Card>
      ) : plans.length === 0 ? (
        <Card>
          <EmptyState
            icon={Salad}
            title="No diet plan yet"
            hint="Your trainer has not assigned one. You can still browse the plans the gym publishes."
          >
            <Button variant="primary" to="/diet">Browse diet plans</Button>
          </EmptyState>
        </Card>
      ) : (
        <FadeIn>
          {/* Only worth a switcher when there is something to switch between */}
          {plans.length > 1 && (
            <div className="mb-4">
              <Tabs
                value={selected}
                onChange={setSelected}
                options={plans.map(p => ({ value: p._id, label: p.title }))}
              />
            </div>
          )}

          {plan && (
            <>
              <Card className="mb-4">
                <div className="flex items-start justify-between gap-3 flex-wrap mb-1">
                  <div className="min-w-0">
                    <h2 className="text-[17px] font-semibold" style={{ color: 'var(--p-text)' }}>{plan.title}</h2>
                    {plan.description && (
                      <p className="text-[13.5px] mt-0.5" style={{ color: 'var(--p-text-2)' }}>{plan.description}</p>
                    )}
                  </div>
                  <Badge tone={GOAL_TONE[plan.goal] || 'neutral'}>{goalLabel(plan.goal)}</Badge>
                </div>

                {plan.totalCalories ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4"
                    style={{ borderTop: '1px solid var(--p-border)' }}>
                    <MacroBar label="Calories" value={plan.totalCalories} max={4000} unit=" kcal" />
                    <MacroBar label="Protein"  value={plan.totalProtein}  max={300}  unit="g" />
                    <MacroBar label="Carbs"    value={plan.totalCarbs}    max={500}  unit="g" />
                  </div>
                ) : null}
              </Card>

              <p className="ui-section-label mb-2">
                Meals ({plan.meals?.length || 0})
              </p>

              {plan.meals?.length
                ? plan.meals.map((meal, i) => <MealCard key={i} meal={meal} index={i} />)
                : (
                  <Card>
                    <EmptyState icon={Apple} title="No meals in this plan yet"
                      hint="Your trainer will add them." />
                  </Card>
                )}
            </>
          )}
        </FadeIn>
      )}
    </MemberPage>
  );
}
