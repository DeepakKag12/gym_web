import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, Upload, Video, Edit2, Globe, Lock, Dumbbell } from 'lucide-react';
import API from '../../utils/api';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';

const MUSCLE_GROUPS = ['chest','back','shoulders','arms','biceps','triceps','legs','glutes','core','abs','cardio','fullbody','other'];
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
  const [saving, setSaving] = useState(false);
  const imgRef = useRef(), vidRef = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({
      ...p,
      [name]: name === 'isPublic' ? value === 'true' : value,
    }));
  };

  const handleImageFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const save = async () => {
    if (!form.title || !form.muscleGroup) { toast.error('Title and muscle group are required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.keys(form).forEach(k => {
        if (k === 'assignedTo') {
          fd.append(k, form[k] ? JSON.stringify([form[k]]) : JSON.stringify([]));
        } else {
          fd.append(k, form[k]);
        }
      });
      if (imageFile) fd.append('image', imageFile);
      if (videoFile) fd.append('video', videoFile);

      if (editData) {
        await API.put(`/exercises/${editData._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Exercise updated!');
      } else {
        await API.post('/exercises', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Exercise added!');
      }
      onSaved();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center px-4 py-8 overflow-y-auto">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-[#111318] border border-white/10 rounded-2xl p-6 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-xl">{editData ? 'Edit Exercise' : 'Add Exercise'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Exercise Title *</label>
            <input className="input-dark text-sm" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Barbell Bench Press" />
          </div>
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Muscle Group *</label>
            <select className="input-dark text-sm" name="muscleGroup" value={form.muscleGroup} onChange={handleChange}>
              {MUSCLE_GROUPS.map(m => <option key={m} value={m} className="capitalize">{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Difficulty</label>
            <select className="input-dark text-sm" name="difficulty" value={form.difficulty} onChange={handleChange}>
              {DIFFS.map(d => <option key={d} value={d} className="capitalize">{d}</option>)}
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Sets</label>
            <input className="input-dark text-sm" name="sets" value={form.sets} onChange={handleChange} placeholder="3–4" />
          </div>
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Reps</label>
            <input className="input-dark text-sm" name="reps" value={form.reps} onChange={handleChange} placeholder="8–12" />
          </div>
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Duration</label>
            <input className="input-dark text-sm" name="duration" value={form.duration} onChange={handleChange} placeholder="30 sec" />
          </div>
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Equipment</label>
            <input className="input-dark text-sm" name="equipmentNeeded" value={form.equipmentNeeded} onChange={handleChange} placeholder="Barbell, Bench" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Description</label>
            <textarea className="input-dark text-sm min-h-[70px] resize-none" name="description" value={form.description} onChange={handleChange}
              placeholder="Brief description of the exercise..." />
          </div>
          <div className="sm:col-span-2">
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Step-by-step Instructions</label>
            <textarea className="input-dark text-sm min-h-[90px] resize-none" name="instructions" value={form.instructions} onChange={handleChange}
              placeholder={"1. Lie flat on the bench...\n2. Grip the barbell...\n3. Lower to chest..."} />
          </div>

          {/* Visibility & assign */}
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Visibility</label>
            <div className="flex gap-4 h-10 items-center">
              {[['true','🌐 Public'],['false','🔒 Private']].map(([val, lbl]) => (
                <label key={val} className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-300">
                  <input type="radio" name="isPublic" value={val} checked={String(form.isPublic) === val} onChange={handleChange} />
                  {lbl}
                </label>
              ))}
            </div>
          </div>
          {!form.isPublic && (
            <div>
              <label className="text-gray-400 text-xs font-medium block mb-1.5">Assign to Member</label>
              <select className="input-dark text-sm" name="assignedTo" value={form.assignedTo} onChange={handleChange}>
                <option value="">— All private members —</option>
                {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
          )}

          {/* Video URL */}
          <div className="sm:col-span-2">
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Video URL <span className="text-gray-600">(YouTube / embed link)</span></label>
            <input className="input-dark text-sm" name="videoUrl" value={form.videoUrl || ''} onChange={handleChange} placeholder="https://youtube.com/watch?v=..." />
          </div>

          {/* Image upload */}
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-1.5 flex items-center gap-1"><Upload size={12}/> Thumbnail Image</label>
            {imagePreview && <img src={imagePreview} alt="preview" className="w-20 h-14 rounded-lg object-cover mb-2 border border-white/10" />}
            <button type="button" onClick={() => imgRef.current?.click()}
              className="w-full border border-dashed border-white/15 rounded-xl py-3 text-xs text-gray-500 hover:text-gray-300 hover:border-[#22d3ee]/30 transition-all">
              Click to upload image
              <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
            </button>
          </div>

          {/* Video file upload */}
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-1.5 flex items-center gap-1"><Video size={12}/> Upload Video File</label>
            {videoFile && <div className="text-[#22d3ee] text-xs mb-2 truncate">✓ {videoFile.name}</div>}
            <button type="button" onClick={() => vidRef.current?.click()}
              className="w-full border border-dashed border-white/15 rounded-xl py-3 text-xs text-gray-500 hover:text-gray-300 hover:border-[#22d3ee]/30 transition-all">
              Click to upload video
              <input ref={vidRef} type="file" accept="video/*" className="hidden" onChange={e => setVideoFile(e.target.files[0])} />
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="btn-ghost px-5 py-2.5 text-sm">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-fire px-6 py-2.5 text-sm">
            {saving ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : (editData ? 'Update Exercise' : 'Add Exercise')}
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
                {ex.image
                  ? <img src={ex.image} alt={ex.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  : <div className="w-full h-full flex items-center justify-center text-gray-700"><Dumbbell size={36} /></div>
                }
                {(ex.video || ex.videoUrl) && (
                  <div className="absolute top-2 right-2 bg-[#22d3ee] rounded-full p-1"><Video size={11} className="text-black" /></div>
                )}
                <div className="absolute top-2 left-2">
                  <span className="text-[10px] bg-black/70 text-gray-200 px-1.5 py-0.5 rounded-full capitalize">{ex.muscleGroup}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#111318] to-transparent" />
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
