import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Dumbbell, Plus, Trash2, Search, Save, Lock, ChevronDown, Play, Check,
} from 'lucide-react';
import toast from 'react-hot-toast';

import API, { cachedGet, apiError } from '../../utils/api';
import MemberPage from '../../components/MemberPage';
import {
  Card, Button, Badge, Input, Modal, EmptyState, Skeleton, Tabs, FadeIn, useMotion,
} from '../../components/ui';

/**
 * My workout — the member's own weekly plan, plus whatever their trainer assigned.
 *
 * Rewritten from a 900-line screen that hand-rolled its own dark styling, its own
 * buttons and a colour for every day, muscle group and difficulty. It now uses
 * the shared UI kit, so it matches the rest of the app and follows the light/dark
 * switch, and the week reads as seven plain rows instead of a colour chart.
 *
 * The flow is deliberately one idea per step:
 *   pick a day  ->  add exercises  ->  save
 *
 * A sibling file, WeeklyPlanner.js, implemented the same planner against the
 * same endpoints but was never routed. It has been deleted rather than left to
 * drift.
 */

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const emptyWeek = () => DAYS.map(day => ({ day, focus: '', exercises: [], notes: '' }));

/** Cloudinary upload wins over an external link; either may be absent. */
const videoOf = ex => ex?.video || ex?.videoUrl || '';

const isYouTube = url => /(?:youtube\.com|youtu\.be)/.test(url || '');

function youTubeId(url) {
  const m = String(url).match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return m ? m[1] : null;
}

/* ── Video preview ──────────────────────────────────────────────────────── */

function VideoModal({ exercise, onClose }) {
  const url = videoOf(exercise);
  const id = isYouTube(url) ? youTubeId(url) : null;

  return (
    <Modal title={exercise.title} onClose={onClose} width={640}>
      <div style={{ aspectRatio: '16 / 9', background: '#000', borderRadius: 10, overflow: 'hidden' }}>
        {id ? (
          <iframe
            src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`}
            title={exercise.title}
            allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 0 }}
          />
        ) : (
          <video src={url} controls autoPlay playsInline style={{ width: '100%', height: '100%' }} />
        )}
      </div>
    </Modal>
  );
}

/* ── Exercise picker ────────────────────────────────────────────────────── */

/**
 * Choosing exercises is the one genuinely fiddly step, so it gets a full sheet
 * with search and a muscle filter, and adds several at once — the old version
 * closed after every single pick, which made building a leg day tedious.
 */
function ExercisePicker({ dayName, alreadyIn, onDone, onClose }) {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [muscle, setMuscle] = useState('all');
  const [picked, setPicked] = useState([]);

  useEffect(() => {
    cachedGet('/exercises', { cache: 300 })
      .then(r => setAll(Array.isArray(r.data) ? r.data : r.data?.exercises || []))
      .catch(() => toast.error('Could not load the exercise list.'))
      .finally(() => setLoading(false));
  }, []);

  const muscles = useMemo(
    () => ['all', ...Array.from(new Set(all.map(e => e.muscleGroup).filter(Boolean))).sort()],
    [all],
  );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter(e => {
      if (alreadyIn.includes(e._id)) return false;
      if (muscle !== 'all' && e.muscleGroup !== muscle) return false;
      return !q || e.title?.toLowerCase().includes(q);
    });
  }, [all, query, muscle, alreadyIn]);

  const toggle = ex =>
    setPicked(p => (p.some(x => x._id === ex._id) ? p.filter(x => x._id !== ex._id) : [...p, ex]));

  return (
    <Modal
      title={`Add to ${dayName}`}
      onClose={onClose}
      width={560}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={!picked.length} onClick={() => onDone(picked)}>
            {picked.length ? `Add ${picked.length}` : 'Add'}
          </Button>
        </>
      }
    >
      <div className="ui-search mb-3">
        <Search size={18} />
        <Input
          autoFocus
          placeholder="Search exercises"
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label="Search exercises"
        />
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-1 scrollbar-hide">
        {muscles.map(m => (
          <button
            key={m}
            onClick={() => setMuscle(m)}
            className="rounded-full px-3 py-1 text-[12.5px] font-medium capitalize whitespace-nowrap"
            style={
              muscle === m
                ? { background: 'var(--p-accent)', color: '#fff' }
                : { background: 'var(--p-surface-2)', color: 'var(--p-text-2)', border: '1px solid var(--p-border)' }
            }
          >
            {m === 'all' ? 'All' : m}
          </button>
        ))}
      </div>

      <div style={{ maxHeight: '46vh', overflowY: 'auto' }}>
        {loading ? (
          <div className="space-y-2 pt-2">
            {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} h={54} />)}
          </div>
        ) : shown.length === 0 ? (
          <EmptyState
            icon={Dumbbell}
            title={all.length ? 'Nothing matches' : 'No exercises yet'}
            hint={all.length ? 'Try another search or muscle group.' : 'Your gym has not added any exercises.'}
          />
        ) : (
          <ul>
            {shown.map((ex, i) => {
              const on = picked.some(x => x._id === ex._id);
              return (
                <li key={ex._id} style={{ borderTop: i ? '1px solid var(--p-border)' : 'none' }}>
                  <button
                    onClick={() => toggle(ex)}
                    className="w-full flex items-center gap-3 py-2.5 text-left"
                    aria-pressed={on}
                  >
                    <span
                      className="grid place-items-center rounded-md flex-shrink-0"
                      style={{
                        width: 22, height: 22,
                        border: `1.5px solid ${on ? 'var(--p-accent)' : 'var(--p-border-2)'}`,
                        background: on ? 'var(--p-accent)' : 'transparent',
                        color: '#fff',
                      }}
                    >
                      {on && <Check size={14} />}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[14.5px] font-medium truncate" style={{ color: 'var(--p-text)' }}>
                        {ex.title}
                      </span>
                      <span className="block text-[12.5px] capitalize" style={{ color: 'var(--p-muted)' }}>
                        {ex.muscleGroup || 'general'}
                        {ex.difficulty ? ` · ${ex.difficulty}` : ''}
                      </span>
                    </span>
                    {videoOf(ex) && <Play size={14} style={{ color: 'var(--p-muted)' }} />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Modal>
  );
}

/* ── One day ────────────────────────────────────────────────────────────── */

function DayCard({ data, open, onToggle, editable, onAdd, onRemove, onFocusChange, onPlay }) {
  const m = useMotion();
  const count = data.exercises.length;

  return (
    <Card padded={false} className="mb-2.5">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
      >
        <span className="flex-1 min-w-0">
          <span className="block text-[15px] font-semibold" style={{ color: 'var(--p-text)' }}>{data.day}</span>
          <span className="block text-[12.5px]" style={{ color: 'var(--p-muted)' }}>
            {count === 0 ? 'Rest day' : `${count} exercise${count === 1 ? '' : 's'}`}
            {data.focus ? ` · ${data.focus}` : ''}
          </span>
        </span>
        {count > 0 && <Badge tone="accent">{count}</Badge>}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={18} style={{ color: 'var(--p-muted)' }} />
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
              {editable && (
                <div className="pt-3">
                  <Input
                    value={data.focus || ''}
                    onChange={e => onFocusChange(e.target.value)}
                    placeholder="What is this day for? e.g. Push, Legs, Cardio"
                    aria-label={`Focus for ${data.day}`}
                  />
                </div>
              )}

              {count === 0 ? (
                <p className="text-[13.5px] py-4 text-center" style={{ color: 'var(--p-muted)' }}>
                  Nothing planned. {editable ? 'Add an exercise below.' : 'A rest day.'}
                </p>
              ) : (
                <ul className="pt-2">
                  {data.exercises.map((ex, i) => (
                    <li
                      key={ex._id || i}
                      className="flex items-center gap-3 py-2.5"
                      style={{ borderTop: i ? '1px solid var(--p-border)' : 'none' }}
                    >
                      <span
                        className="grid place-items-center rounded-md text-[12px] font-bold flex-shrink-0"
                        style={{ width: 26, height: 26, background: 'var(--p-surface-2)', color: 'var(--p-text-2)' }}
                      >
                        {i + 1}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[14.5px] font-medium truncate" style={{ color: 'var(--p-text)' }}>
                          {ex.title}
                        </span>
                        <span className="block text-[12.5px] capitalize" style={{ color: 'var(--p-muted)' }}>
                          {ex.muscleGroup || 'general'}
                          {ex.sets ? ` · ${ex.sets}×${ex.reps || '—'}` : ''}
                        </span>
                      </span>
                      {videoOf(ex) && (
                        <Button size="sm" variant="ghost" icon={Play} onClick={() => onPlay(ex)}
                          aria-label={`Play ${ex.title}`} title="Watch" />
                      )}
                      {editable && (
                        <Button size="sm" variant="ghost" icon={Trash2} onClick={() => onRemove(ex._id)}
                          aria-label={`Remove ${ex.title}`} title="Remove"
                          style={{ color: 'var(--p-danger)' }} />
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {editable && (
                <Button block icon={Plus} onClick={onAdd} className="mt-3">
                  Add exercise
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */

export default function MyWorkout() {
  const [tab, setTab] = useState('mine');
  const [week, setWeek] = useState(emptyWeek);
  const [assigned, setAssigned] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [openDay, setOpenDay] = useState(null);
  const [pickerFor, setPickerFor] = useState(null);
  const [playing, setPlaying] = useState(null);

  // What was last saved, so "unsaved changes" reflects reality rather than
  // "the user touched something".
  const savedRef = useRef(null);

  useEffect(() => {
    let alive = true;
    Promise.allSettled([API.get('/splits/planner'), API.get('/splits/me')])
      .then(([planner, mine]) => {
        if (!alive) return;
        if (planner.status === 'fulfilled' && Array.isArray(planner.value.data?.days)) {
          const days = emptyWeek().map(d => {
            const found = planner.value.data.days.find(x => x.day === d.day);
            return found ? { ...d, ...found, exercises: found.exercises || [] } : d;
          });
          setWeek(days);
          savedRef.current = JSON.stringify(days);
        } else {
          savedRef.current = JSON.stringify(emptyWeek());
        }
        if (mine.status === 'fulfilled') setAssigned(mine.value.data || null);
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const markDirty = useCallback(next => {
    setWeek(next);
    setDirty(JSON.stringify(next) !== savedRef.current);
  }, []);

  const addExercises = list => {
    const next = week.map((d, i) =>
      i === pickerFor ? { ...d, exercises: [...d.exercises, ...list] } : d);
    markDirty(next);
    setPickerFor(null);
  };

  const removeExercise = (dayIndex, exId) =>
    markDirty(week.map((d, i) =>
      i === dayIndex ? { ...d, exercises: d.exercises.filter(e => e._id !== exId) } : d));

  const setFocus = (dayIndex, value) =>
    markDirty(week.map((d, i) => (i === dayIndex ? { ...d, focus: value } : d)));

  const save = async () => {
    setSaving(true);
    try {
      // The API stores exercise ids; the populated objects come back on read.
      const payload = week.map(d => ({
        day: d.day,
        focus: d.focus || '',
        notes: d.notes || '',
        exercises: d.exercises.map(e => e._id),
      }));
      await API.put('/splits/planner', { days: payload });
      savedRef.current = JSON.stringify(week);
      setDirty(false);
      toast.success('Your plan is saved.');
    } catch (err) {
      toast.error(apiError(err, 'Could not save your plan.'));
    } finally {
      setSaving(false);
    }
  };

  const total = week.reduce((n, d) => n + d.exercises.length, 0);
  const trainingDays = week.filter(d => d.exercises.length > 0).length;

  const assignedDays = useMemo(() => {
    if (!assigned?.days?.length) return null;
    return emptyWeek().map(d => {
      const found = assigned.days.find(x => x.day === d.day);
      return found ? { ...d, ...found, exercises: found.exercises || [] } : d;
    });
  }, [assigned]);

  const editable = tab === 'mine';
  const days = editable ? week : (assignedDays || emptyWeek());

  return (
    <MemberPage
      title="My workout"
      subtitle={editable ? 'Build your own week, one day at a time' : 'Set by your trainer'}
      width="max-w-2xl"
      actions={
        editable && dirty ? (
          <Button variant="primary" icon={Save} loading={saving} onClick={save}>Save plan</Button>
        ) : null
      }
    >
      <div className="mb-4">
        <Tabs
          value={tab}
          onChange={t => { setTab(t); setOpenDay(null); }}
          options={[
            { value: 'mine', label: 'My plan' },
            { value: 'assigned', label: assigned ? 'From my trainer' : 'From my trainer (none)' },
          ]}
        />
      </div>

      {loading ? (
        <div className="space-y-2.5">
          {DAYS.map(d => <Skeleton key={d} h={64} />)}
        </div>
      ) : !editable && !assignedDays ? (
        <Card>
          <EmptyState
            icon={Lock}
            title="No plan from your trainer yet"
            hint="When your trainer assigns a split it will appear here. Until then, build your own."
          >
            <Button variant="primary" onClick={() => setTab('mine')}>Build my own</Button>
          </EmptyState>
        </Card>
      ) : (
        <FadeIn>
          {editable && (
            <p className="text-[13px] mb-3" style={{ color: 'var(--p-muted)' }}>
              {total === 0
                ? 'Tap a day to start adding exercises.'
                : `${total} exercise${total === 1 ? '' : 's'} across ${trainingDays} training day${trainingDays === 1 ? '' : 's'}.`}
              {dirty && <strong style={{ color: 'var(--p-warn)' }}> · Unsaved changes</strong>}
            </p>
          )}

          {days.map((d, i) => (
            <DayCard
              key={d.day}
              data={d}
              open={openDay === i}
              onToggle={() => setOpenDay(openDay === i ? null : i)}
              editable={editable}
              onAdd={() => setPickerFor(i)}
              onRemove={exId => removeExercise(i, exId)}
              onFocusChange={v => setFocus(i, v)}
              onPlay={setPlaying}
            />
          ))}

          {/* A second save at the foot: after editing Sunday the header button
              is a long way back up the page on a phone. */}
          {editable && dirty && (
            <Button block variant="primary" icon={Save} loading={saving} onClick={save} className="mt-3">
              Save plan
            </Button>
          )}
        </FadeIn>
      )}

      <AnimatePresence>
        {pickerFor !== null && (
          <ExercisePicker
            key="picker"
            dayName={week[pickerFor].day}
            alreadyIn={week[pickerFor].exercises.map(e => e._id)}
            onDone={addExercises}
            onClose={() => setPickerFor(null)}
          />
        )}
        {playing && <VideoModal key="video" exercise={playing} onClose={() => setPlaying(null)} />}
      </AnimatePresence>
    </MemberPage>
  );
}
