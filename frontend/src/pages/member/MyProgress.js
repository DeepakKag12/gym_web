import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Plus, Scale, Camera, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import API, { bustCache } from '../../utils/api';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function LineChart({ entries, field, label, color }) {
  if (!entries || entries.length < 2) return null;
  const vals = entries.map(e => e[field]).filter(v => v != null);
  if (vals.length < 2) return null;
  const min = Math.min(...vals), max = Math.max(...vals), range = max - min || 1;
  const W = 340, H = 80, PAD = 10;
  const pts = entries
    .filter(e => e[field] != null)
    .map((e, i, arr) => {
      const x = PAD + (i / (arr.length - 1)) * (W - PAD * 2);
      const y = H - PAD - ((e[field] - min) / range) * (H - PAD * 2);
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <div className="mt-4">
      <div className="text-sm font-medium text-gray-300 mb-1">{label}</div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full">
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
        {entries.filter(e => e[field] != null).map((e, i, arr) => {
          const x = PAD + (i / (arr.length - 1)) * (W - PAD * 2);
          const y = H - PAD - ((e[field] - min) / range) * (H - PAD * 2);
          return <circle key={i} cx={x} cy={y} r="4" fill={color} />;
        })}
      </svg>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{entries[0] && new Date(entries[0].date).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</span>
        <span className="font-semibold text-white">{vals[vals.length - 1]} {field === 'weight' ? 'kg' : field === 'bodyFat' ? '%' : 'cm'}</span>
        <span>{entries[entries.length - 1] && new Date(entries[entries.length - 1].date).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</span>
      </div>
    </div>
  );
}

export default function MyProgress() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], weight: '', bodyFat: '', chest: '', waist: '', hips: '', arms: '', thighs: '', notes: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const fileRef = useRef();

  const fetchEntries = () => {
    setLoading(true);
    bustCache('/progress/me');
    API.get('/progress/me').then(r => setEntries(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(fetchEntries, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      if (photoFile) fd.append('photo', photoFile);
      await API.post('/progress', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Progress logged!');
      setShowForm(false);
      setForm({ date: new Date().toISOString().split('T')[0], weight: '', bodyFat: '', chest: '', waist: '', hips: '', arms: '', thighs: '', notes: '' });
      setPhotoFile(null);
      fetchEntries();
    } catch { toast.error('Failed to save'); }
    finally { setSubmitting(false); }
  };

  const deleteEntry = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    await API.delete(`/progress/${id}`);
    setEntries(prev => prev.filter(e => e._id !== id));
    toast.success('Deleted');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20 pb-20 lg:pb-8">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="gym-font text-3xl text-white">My Progress</h1>
            <p className="text-gray-400 text-sm mt-0.5">Track your transformation journey</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="btn-fire flex items-center gap-2 text-sm px-4 py-2">
            <Plus size={16} /> Log Today
          </button>
        </motion.div>

        {/* Log Form */}
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 mb-6 border border-blue-500/20">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><Scale size={18} className="text-blue-400" /> Log Progress Entry</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[['date','Date','date'],['weight','Weight (kg)','number'],['bodyFat','Body Fat (%)','number'],['chest','Chest (cm)','number'],['waist','Waist (cm)','number'],['hips','Hips (cm)','number'],['arms','Arms (cm)','number'],['thighs','Thighs (cm)','number']].map(([k, lbl, type]) => (
                  <div key={k}>
                    <label className="text-gray-400 text-xs mb-1 block">{lbl}</label>
                    <input type={type} value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                      step={type === 'number' ? '0.1' : undefined}
                      className="input-dark w-full text-sm" />
                  </div>
                ))}
              </div>
              <div className="mb-3">
                <label className="text-gray-400 text-xs mb-1 block">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  rows={2} className="input-dark w-full text-sm resize-none" placeholder="How did you feel today?" />
              </div>
              <div className="mb-4">
                <label className="text-gray-400 text-xs mb-1 block flex items-center gap-1"><Camera size={13} /> Progress Photo (optional)</label>
                <input type="file" accept="image/*" ref={fileRef} onChange={e => setPhotoFile(e.target.files[0])} className="text-gray-300 text-xs" />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={submitting} className="btn-fire text-sm px-5 py-2">
                  {submitting ? 'Saving...' : 'Save Entry'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-all">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Charts */}
        {entries.length >= 2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6 mb-6">
            <h2 className="text-white font-semibold mb-2 flex items-center gap-2"><TrendingUp size={18} className="text-green-400" /> Progress Charts</h2>
            <LineChart entries={[...entries].reverse()} field="weight" label="Weight (kg)" color="#38bdf8" />
            <LineChart entries={[...entries].reverse()} field="waist" label="Waist (cm)" color="#f59e0b" />
            <LineChart entries={[...entries].reverse()} field="bodyFat" label="Body Fat (%)" color="#a78bfa" />
          </motion.div>
        )}

        {/* Entries List */}
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : entries.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Scale size={40} className="text-gray-600 mx-auto mb-3" />
            <div className="text-gray-400">No progress entries yet. Start logging today!</div>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, i) => (
              <motion.div key={entry._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="glass rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-white font-semibold text-sm">
                      {new Date(entry.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2">
                      {entry.weight && <span className="text-xs bg-blue-500/15 text-blue-300 px-2 py-0.5 rounded-full">⚖️ {entry.weight} kg</span>}
                      {entry.bodyFat && <span className="text-xs bg-purple-500/15 text-purple-300 px-2 py-0.5 rounded-full">🔥 {entry.bodyFat}% BF</span>}
                      {entry.waist && <span className="text-xs bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded-full">📏 W:{entry.waist}cm</span>}
                      {entry.chest && <span className="text-xs bg-green-500/15 text-green-300 px-2 py-0.5 rounded-full">💪 C:{entry.chest}cm</span>}
                      {entry.arms && <span className="text-xs bg-red-500/15 text-red-300 px-2 py-0.5 rounded-full">💪 A:{entry.arms}cm</span>}
                    </div>
                    {entry.notes && <p className="text-gray-500 text-xs mt-2 italic">"{entry.notes}"</p>}
                  </div>
                  <div className="flex items-start gap-2 flex-shrink-0 ml-2">
                    {entry.photo && (
                      <img src={entry.photo} alt="progress" className="w-14 h-14 rounded-lg object-cover border border-white/10" />
                    )}
                    <button onClick={() => deleteEntry(entry._id)} className="text-gray-600 hover:text-red-400 p-1 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
