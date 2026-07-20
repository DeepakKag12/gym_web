import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, Upload, Video, Edit2, Globe, Lock, Dumbbell } from 'lucide-react';
import API from '../../utils/api';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';

/* ── VideoThumb: native <video> for direct files, <iframe> for YouTube ── */
function isYouTube(url) { return url && (url.includes('youtube.com') || url.includes('youtu.be')); }
function ytId(url) {
  const m = (url || '').match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : '';
}
function VideoThumb({ video, videoUrl, image, title }) {
  const src = video || videoUrl || '';
  if (src) {
    if (isYouTube(src)) {
      const id = ytId(src);
      return id ? (
        <iframe
          src={`https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&modestbranding=1&playsinline=1`}
          className="absolute inset-0 w-full h-full border-0 pointer-events-none"
          allow="autoplay; muted" title={title}
        />
      ) : null;
    }
    return (
      <video src={src} autoPlay muted loop playsInline
        className="absolute inset-0 w-full h-full object-cover" />
    );
  }
  if (image) return <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />;
  return <div className="absolute inset-0 flex items-center justify-center text-gray-700"><Dumbbell size={36} /></div>;
}

const MUSCLE_GROUPS = ['chest','back','shoulders','arms','biceps','triceps','legs','glutes','core','abs','cardio','full-body','other'];
const DIFFS = ['beginner','intermediate','advanced'];
const DIFF_COLOR = { beginner:'text-emerald-400', intermediate:'text-amber-400', advanced:'text-red-400' };

const emptyForm = {
  title: '', description: '', instructions: '', muscleGroup: 'chest',
  difficulty: 'beginner', equipmentNeeded: '', sets: '', reps: '', duration: '',
  isPublic: true, videoUrl: '', assignedTo: '',
};

function ExerciseModal({ editData, members, onClose, onSaved }) {
  const [form, setForm] = useState(editData ? {
    ...emptyForm, ...editData,
    isPublic: editData.isPublic !== false,
    assignedTo: editData.assignedTo?.[0] || '',
  } : { ...emptyForm });
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(editData?.image || '');
  const [videoPreview, setVideoPreview] = useState(editData?.video || '');
  const [removeVideo, setRemoveVideo] = useState(false); // flag to clear existing video
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const imgRef = useRef(), vidRef = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: name === 'isPublic' ? value === 'true' : value }));
  };

  const handleImageFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 4 * 1024 * 1024) { toast.error('Image must be under 4 MB'); return; }
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const handleVideoFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setVideoFile(f);
    setVideoPreview(f.name);
  };

  // Upload a file directly from the browser to Cloudinary using a signed request.
  // This bypasses Vercel's 4.5 MB function payload limit entirely.
  const uploadDirectToCloudinary = async (file, resourceType = 'video') => {
    const folder = resourceType === 'video' ? 'exercises/videos' : 'exercises';
    // 1. Get a signature from our backend
    const { data: sig } = await API.post('/exercises/sign-upload', { folder, resource_type: resourceType });
    // 2. Upload directly to Cloudinary Upload API
    const fd = new FormData();
    fd.append('file', file);
    fd.append('api_key', sig.api_key);
    fd.append('timestamp', sig.timestamp);
    fd.append('signature', sig.signature);
    fd.append('folder', sig.folder);
    if (resourceType === 'video') {
      fd.append('video_codec', 'auto');
      fd.append('quality', 'auto');
    }
    const uploadUrl = `https://api.cloudinary.com/v1_1/${sig.cloud_name}/${resourceType}/upload`;
    const xhr = new XMLHttpRequest();
    return new Promise((resolve, reject) => {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(`Uploading ${resourceType}… ${pct}%`);
        }
      };
      xhr.onload = () => {
        setUploadProgress('');
        if (xhr.status === 200) resolve(JSON.parse(xhr.responseText));
        else reject(new Error(`Cloudinary upload failed: ${xhr.responseText}`));
      };
      xhr.onerror = () => { setUploadProgress(''); reject(new Error('Network error during upload')); };
      xhr.open('POST', uploadUrl);
      xhr.send(fd);
    });
  };

  const save = async () => {
    if (!form.title || !form.muscleGroup) { toast.error('Title and muscle group are required'); return; }
    setSaving(true);
    try {
      let imageUrl = editData?.image || '';
      let videoUrl = removeVideo ? '' : (editData?.video || '');
      let videoPublicId = removeVideo ? '' : (editData?.videoPublicId || '');

      // Upload image directly to Cloudinary if a new file was selected
      if (imageFile) {
        setUploadProgress('Uploading image…');
        const result = await uploadDirectToCloudinary(imageFile, 'image');
        imageUrl = result.secure_url;
        setUploadProgress('');
      }

      // Upload video directly to Cloudinary (bypasses Vercel 4.5 MB limit)
      if (videoFile) {
        const result = await uploadDirectToCloudinary(videoFile, 'video');
        videoUrl = result.secure_url;
        videoPublicId = result.public_id;
      }

      const fd = new FormData();
      ['title','description','instructions','muscleGroup','difficulty',
       'equipmentNeeded','sets','reps','duration','videoUrl','isPublic'].forEach(k => {
        fd.append(k, form[k] ?? '');
      });
      fd.append('assignedTo', form.assignedTo ? JSON.stringify([form.assignedTo]) : JSON.stringify([]));
      // Pass already-uploaded Cloudinary URLs; no file blobs sent to Vercel
      if (imageFile) fd.append('imageUrl', imageUrl);
      // Always send video state so backend can clear it if removeVideo
      fd.append('uploadedVideoUrl', videoUrl);
      if (videoPublicId) fd.append('uploadedVideoPublicId', videoPublicId);

      if (editData) {
        await API.put(`/exercises/${editData._id}`, fd);
        toast.success('Exercise updated!');
      } else {
        await API.post('/exercises', fd);
        toast.success('Exercise added!');
      }
      onSaved();
    } catch (err) { toast.error(err.response?.data?.message || err.message || 'Save failed'); }
    finally { setSaving(false); setUploadProgress(''); }
  };

  return (
    <div className="admin-modal-overlay">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="admin-modal-box" style={{ maxWidth: '520px' }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
            {editData ? 'Edit Exercise' : 'Add Exercise'}
          </h2>
          <button onClick={onClose} className="icon-btn" style={{ color: 'var(--muted)' }}><X size={16} /></button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Title — full width */}
          <div className="col-span-2">
            <label className="block text-xs mb-0.5" style={{ color: 'var(--muted)' }}>Title *</label>
            <input className="input-dark text-xs py-1.5" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Barbell Bench Press" />
          </div>

          {/* Muscle + Difficulty */}
          <div>
            <label className="block text-xs mb-0.5" style={{ color: 'var(--muted)' }}>Muscle *</label>
            <select className="input-dark text-xs py-1.5" name="muscleGroup" value={form.muscleGroup} onChange={handleChange}>
              {MUSCLE_GROUPS.map(m => <option key={m} value={m} style={{ background: '#fff', color: '#111' }} className="capitalize">{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-0.5" style={{ color: 'var(--muted)' }}>Difficulty</label>
            <select className="input-dark text-xs py-1.5" name="difficulty" value={form.difficulty} onChange={handleChange}>
              {DIFFS.map(d => <option key={d} value={d} style={{ background: '#fff', color: '#111' }} className="capitalize">{d}</option>)}
            </select>
          </div>

          {/* Sets + Reps + Duration + Equipment — 4 in a row */}
          <div>
            <label className="block text-xs mb-0.5" style={{ color: 'var(--muted)' }}>Sets</label>
            <input className="input-dark text-xs py-1.5" name="sets" value={form.sets} onChange={handleChange} placeholder="3-4" />
          </div>
          <div>
            <label className="block text-xs mb-0.5" style={{ color: 'var(--muted)' }}>Reps</label>
            <input className="input-dark text-xs py-1.5" name="reps" value={form.reps} onChange={handleChange} placeholder="8-12" />
          </div>
          <div>
            <label className="block text-xs mb-0.5" style={{ color: 'var(--muted)' }}>Duration</label>
            <input className="input-dark text-xs py-1.5" name="duration" value={form.duration} onChange={handleChange} placeholder="30 sec" />
          </div>
          <div>
            <label className="block text-xs mb-0.5" style={{ color: 'var(--muted)' }}>Equipment</label>
            <input className="input-dark text-xs py-1.5" name="equipmentNeeded" value={form.equipmentNeeded} onChange={handleChange} placeholder="Barbell" />
          </div>

          {/* Description */}
          <div className="col-span-2">
            <label className="block text-xs mb-0.5" style={{ color: 'var(--muted)' }}>Description</label>
            <textarea className="input-dark text-xs py-1.5 resize-none" rows={2} name="description" value={form.description} onChange={handleChange}
              placeholder="Brief description..." />
          </div>

          {/* Instructions */}
          <div className="col-span-2">
            <label className="block text-xs mb-0.5" style={{ color: 'var(--muted)' }}>Instructions</label>
            <textarea className="input-dark text-xs py-1.5 resize-none" rows={2} name="instructions" value={form.instructions} onChange={handleChange}
              placeholder={"1. Starting position...\n2. Movement..."} />
          </div>

          {/* Visibility + Assign in one row */}
          <div className="col-span-2 flex items-center gap-3">
            <span className="text-xs flex-shrink-0" style={{ color: 'var(--muted)' }}>Visibility:</span>
            {[['true','🌐 Public'],['false','🔒 Private']].map(([val, lbl]) => (
              <label key={val} className="flex items-center gap-1 cursor-pointer text-xs" style={{ color: 'var(--muted2)' }}>
                <input type="radio" name="isPublic" value={val} checked={String(form.isPublic) === val} onChange={handleChange} />
                {lbl}
              </label>
            ))}
          </div>

          {/* Assign member (only if private) */}
          {!form.isPublic && (
            <div className="col-span-2">
              <label className="block text-xs mb-0.5" style={{ color: 'var(--muted)' }}>Assign to Member</label>
              <select className="input-dark text-xs py-1.5" name="assignedTo" value={form.assignedTo} onChange={handleChange}>
                <option value="" style={{ background: '#fff', color: '#111' }}>— All private members —</option>
                {members.map(m => <option key={m._id} value={m._id} style={{ background: '#fff', color: '#111' }}>{m.name}</option>)}
              </select>
            </div>
          )}

          {/* Video URL */}
          <div className="col-span-2">
            <label className="block text-xs mb-0.5" style={{ color: 'var(--muted)' }}>YouTube / Video URL <span style={{ opacity: 0.5 }}>(optional)</span></label>
            <input className="input-dark text-xs py-1.5" name="videoUrl" value={form.videoUrl || ''} onChange={handleChange}
              placeholder="https://youtube.com/watch?v=..." />
          </div>

          {/* Image + Video upload side by side */}
          <div>
            <label className="block text-xs mb-0.5" style={{ color: 'var(--muted)' }}>Thumbnail</label>
            {imagePreview && (
              <img src={imagePreview} alt="preview" className="w-full h-12 rounded-lg object-cover mb-1" style={{ border: '1px solid var(--border)' }} />
            )}
            <button type="button" onClick={() => imgRef.current?.click()}
              className="w-full rounded-lg py-2 text-xs transition-all flex items-center justify-center gap-1"
              style={{ border: '1px dashed var(--border)', color: 'var(--muted)' }}>
              <Upload size={10} /> {imageFile ? imageFile.name.slice(0,14)+'…' : 'Image'}
              <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
            </button>
          </div>

          <div>
            <label className="block text-xs mb-0.5" style={{ color: 'var(--muted)' }}>
              Video File <span style={{ opacity: 0.5 }}>(mp4, any size)</span>
            </label>

            {/* Existing video state */}
            {editData?.video && !videoFile && !removeVideo && (
              <div className="flex items-center gap-1.5 mb-1">
                <a href={editData.video} target="_blank" rel="noreferrer"
                  className="text-xs flex items-center gap-1 flex-1 truncate"
                  style={{ color: 'var(--cyan)' }}>
                  <Video size={10} /> Saved video
                </a>
                <button type="button"
                  onClick={() => { setRemoveVideo(true); setVideoPreview(''); }}
                  className="text-xs px-1.5 py-0.5 rounded-lg transition-all"
                  style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}>
                  Remove
                </button>
              </div>
            )}
            {removeVideo && !videoFile && (
              <div className="text-xs mb-1 flex items-center gap-1.5" style={{ color: '#f87171' }}>
                <span>Video will be removed</span>
                <button type="button" onClick={() => { setRemoveVideo(false); setVideoPreview(editData?.video || ''); }}
                  className="underline" style={{ color: 'var(--muted)' }}>Undo</button>
              </div>
            )}
            {videoFile && (
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs truncate flex-1" style={{ color: 'var(--cyan)' }}>✓ {videoFile.name.slice(0,16)}</span>
                <button type="button" onClick={() => { setVideoFile(null); setVideoPreview(editData?.video || ''); }}
                  className="text-xs" style={{ color: 'var(--muted)' }}>✕</button>
              </div>
            )}

            <button type="button" onClick={() => vidRef.current?.click()}
              className="w-full rounded-lg py-2 text-xs transition-all flex items-center justify-center gap-1"
              style={{ border: '1px dashed var(--border)', color: 'var(--muted)' }}>
              <Video size={10} /> {videoFile ? 'Change video' : removeVideo ? 'Upload new video' : 'Upload video'}
              <input ref={vidRef} type="file" accept="video/*" className="hidden" onChange={e => {
                handleVideoFile(e);
                if (e.target.files[0]) setRemoveVideo(false);
              }} />
            </button>
          </div>
        </div>

        {/* Upload progress bar */}
        {uploadProgress && (
          <div className="mt-2 text-xs rounded-lg px-3 py-2 flex items-center gap-2" style={{ background: 'rgba(34,211,238,0.08)', color: 'var(--cyan)', border: '1px solid rgba(34,211,238,0.2)' }}>
            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
            {uploadProgress}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-3">
          <button onClick={onClose} disabled={saving} className="btn-ghost px-3 py-1.5 text-xs">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-fire px-4 py-1.5 text-xs">
            {saving
              ? <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              : editData ? 'Update' : 'Add Exercise'
            }
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminExercises() {
  const [exercises, setExercises]   = useState([]);
  const [members, setMembers]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState(null); // null | 'new' | exercise
  const [filterMuscle, setFilterMuscle] = useState('all');

  const load = () => {
    const q = filterMuscle !== 'all' ? `?muscleGroup=${filterMuscle}` : '';
    API.get(`/exercises${q}`).then(r => setExercises(r.data)).catch(() => {}).finally(() => setLoading(false));
    API.get('/members').then(r => setMembers(r.data)).catch(() => {});
  };
  useEffect(load, [filterMuscle]);

  const del = async (id) => {
    if (!window.confirm('Delete this exercise?')) return;
    try { await API.delete(`/exercises/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Error'); }
  };

  return (
    <AdminLayout title="Exercises">
      <div className="flex flex-col sm:flex-row gap-3 mb-5 items-start sm:items-center justify-between">
        {/* Muscle filter pills */}
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setFilterMuscle('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filterMuscle === 'all' ? 'bg-[#22d3ee] text-black' : 'bg-white/5 text-gray-400 border border-white/8 hover:border-white/20'}`}>
            All
          </button>
          {MUSCLE_GROUPS.map(mg => (
            <button key={mg} onClick={() => setFilterMuscle(mg)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${filterMuscle === mg ? 'bg-[#22d3ee] text-black' : 'bg-white/5 text-gray-400 border border-white/8 hover:border-white/20'}`}>
              {mg}
            </button>
          ))}
        </div>
        <button onClick={() => setModal('new')} className="btn-fire text-sm py-2 px-4 gap-1.5 flex-shrink-0">
          <Plus size={15} /> Add Exercise
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#22d3ee] border-t-transparent rounded-full animate-spin" /></div>
      ) : exercises.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <Dumbbell size={40} className="text-gray-700 mx-auto mb-3" />
          <div className="text-gray-500">No exercises found.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {exercises.map((ex, i) => (
            <motion.div key={ex._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="glass rounded-2xl overflow-hidden group">
              <div className="relative h-40 bg-[#0d0e11] overflow-hidden">
                <VideoThumb video={ex.video} videoUrl={ex.videoUrl} image={ex.image} title={ex.title} />
                {(ex.video || ex.videoUrl) && (
                  <div className="absolute top-2 right-2 bg-[#22d3ee] rounded-full p-1 pointer-events-none z-10">
                    <Video size={11} className="text-black" />
                  </div>
                )}
                <div className="absolute top-2 left-2 z-10">
                  <span className="text-[10px] bg-black/70 text-gray-200 px-1.5 py-0.5 rounded-full capitalize">{ex.muscleGroup}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#111318] to-transparent pointer-events-none z-10" />
              </div>
              <div className="p-3.5">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm line-clamp-1">{ex.title}</h3>
                    <span className={`text-xs capitalize ${DIFF_COLOR[ex.difficulty] || 'text-gray-500'}`}>{ex.difficulty}</span>
                  </div>
                  {ex.isPublic ? <Globe size={12} className="text-gray-600 flex-shrink-0 mt-0.5" /> : <Lock size={12} className="text-amber-500 flex-shrink-0 mt-0.5" />}
                </div>
                {ex.sets && <div className="text-gray-600 text-xs mt-1">{ex.sets} sets × {ex.reps}</div>}
                <div className="flex gap-2 mt-3 border-t border-white/5 pt-2.5">
                  <button onClick={() => setModal(ex)} className="flex-1 flex items-center justify-center gap-1.5 text-xs text-amber-400 hover:bg-amber-400/10 rounded-lg py-1.5 transition-all">
                    <Edit2 size={12} /> Edit
                  </button>
                  <button onClick={() => del(ex._id)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <ExerciseModal
            editData={modal === 'new' ? null : modal}
            members={members}
            onClose={() => setModal(null)}
            onSaved={() => { setModal(null); load(); }}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
