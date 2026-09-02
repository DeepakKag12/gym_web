import React, { useEffect, useMemo, useState } from 'react';
import { Dumbbell, Play, Target, Repeat, Clock } from 'lucide-react';

import { cachedGet, apiError } from '../../utils/api';
import { img } from '../../utils/img';
import MemberPage from '../../components/MemberPage';
import {
  Card, Button, Badge, EmptyState, Skeleton, Stagger, StaggerItem, Modal,
} from '../../components/ui';

/**
 * My exercises — what a trainer has assigned to this member.
 *
 * Converted from a hand-rolled dark grid onto the shared UI kit.
 *
 * The old cards autoplayed a muted, looping video in every tile. Three or four
 * of those on screen at once on a phone is a lot of data and battery for a
 * thumbnail, so the card now shows a still and plays on demand, in a dialog,
 * where the member is actually watching it.
 */

const DIFF_TONE = { beginner: 'ok', intermediate: 'warn', advanced: 'danger' };

const videoOf = ex => ex?.video || ex?.videoUrl || '';
const isYouTube = url => /(?:youtube\.com|youtu\.be)/.test(url || '');
const ytId = url => (String(url).match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/) || [])[1];

/** YouTube gives us a still for free; an uploaded file falls back to the image. */
function posterFor(ex) {
  const v = videoOf(ex);
  if (isYouTube(v)) {
    const id = ytId(v);
    if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  }
  return ex.image ? img(ex.image, 500) : null;
}

function VideoModal({ exercise, onClose }) {
  const url = videoOf(exercise);
  const id = isYouTube(url) ? ytId(url) : null;
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

function ExerciseCard({ ex, onPlay }) {
  const poster = posterFor(ex);
  const hasVideo = Boolean(videoOf(ex));

  return (
    <StaggerItem>
      <Card padded={false} className="overflow-hidden h-full flex flex-col">
        <div
          className="relative"
          style={{ aspectRatio: '16 / 10', background: 'var(--p-surface-2)' }}
        >
          {poster ? (
            <img
              src={poster}
              alt={ex.title}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center">
              <Dumbbell size={34} style={{ color: 'var(--p-muted)' }} />
            </span>
          )}

          {hasVideo && (
            <button
              onClick={() => onPlay(ex)}
              aria-label={`Play ${ex.title}`}
              className="absolute inset-0 grid place-items-center"
              style={{ background: 'rgba(0,0,0,0.28)' }}
            >
              <span
                className="grid place-items-center rounded-full"
                style={{ width: 46, height: 46, background: 'rgba(255,255,255,0.94)', color: '#111' }}
              >
                <Play size={20} style={{ marginLeft: 3 }} />
              </span>
            </button>
          )}

          {ex.muscleGroup && (
            <span
              className="absolute bottom-2.5 left-2.5 text-[11.5px] font-semibold capitalize px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}
            >
              {ex.muscleGroup}
            </span>
          )}
        </div>

        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="text-[15px] font-semibold leading-snug" style={{ color: 'var(--p-text)' }}>
              {ex.title}
            </h3>
            {ex.difficulty && (
              <Badge tone={DIFF_TONE[ex.difficulty] || 'neutral'}>{ex.difficulty}</Badge>
            )}
          </div>

          {ex.description && (
            <p
              className="text-[13px] leading-relaxed"
              style={{
                color: 'var(--p-text-2)',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}
            >
              {ex.description}
            </p>
          )}

          {(ex.sets || ex.reps || ex.duration) && (
            <div className="flex items-center gap-3 mt-3 text-[12.5px]" style={{ color: 'var(--p-muted)' }}>
              {ex.sets && <span className="flex items-center gap-1"><Target size={12} />{ex.sets} sets</span>}
              {ex.reps && <span className="flex items-center gap-1"><Repeat size={12} />{ex.reps} reps</span>}
              {ex.duration && <span className="flex items-center gap-1"><Clock size={12} />{ex.duration}</span>}
            </div>
          )}

          <div className="mt-auto pt-3.5">
            <Button block size="sm" to={`/exercises/${ex._id}`}>View details</Button>
          </div>
        </div>
      </Card>
    </StaggerItem>
  );
}

export default function MyExercises() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [muscle, setMuscle] = useState('all');
  const [playing, setPlaying] = useState(null);

  useEffect(() => {
    cachedGet('/exercises/my', { cache: 60 })
      .then(r => setExercises(Array.isArray(r.data) ? r.data : []))
      .catch(err => setError(apiError(err, 'Could not load your exercises.')))
      .finally(() => setLoading(false));
  }, []);

  const muscles = useMemo(
    () => ['all', ...Array.from(new Set(exercises.map(e => e.muscleGroup).filter(Boolean))).sort()],
    [exercises],
  );

  const shown = useMemo(
    () => (muscle === 'all' ? exercises : exercises.filter(e => e.muscleGroup === muscle)),
    [exercises, muscle],
  );

  return (
    <MemberPage title="My exercises" subtitle="Assigned to you by your trainer" width="max-w-5xl">
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} h={280} />)}
        </div>
      ) : error ? (
        <Card><EmptyState icon={Dumbbell} title="Could not load your exercises" hint={error} /></Card>
      ) : exercises.length === 0 ? (
        <Card>
          <EmptyState
            icon={Dumbbell}
            title="Nothing assigned yet"
            hint="Your trainer has not assigned any exercises. The full library is open to browse in the meantime."
          >
            <Button variant="primary" to="/exercises">Browse the library</Button>
          </EmptyState>
        </Card>
      ) : (
        <>
          {muscles.length > 2 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {muscles.map(m => (
                <button
                  key={m}
                  onClick={() => setMuscle(m)}
                  className="rounded-full px-3.5 py-1.5 text-[13px] font-medium capitalize"
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
          )}

          <p className="text-[13px] mb-3" style={{ color: 'var(--p-muted)' }}>
            {shown.length} exercise{shown.length === 1 ? '' : 's'}
          </p>

          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shown.map(ex => <ExerciseCard key={ex._id} ex={ex} onPlay={setPlaying} />)}
          </Stagger>
        </>
      )}

      {playing && <VideoModal exercise={playing} onClose={() => setPlaying(null)} />}
    </MemberPage>
  );
}
