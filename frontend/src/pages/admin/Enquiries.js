import React, { useState, useEffect } from 'react';
import { MessageSquare, Trash2, ChevronDown, Phone } from 'lucide-react';
import API, { cachedGet, bustCache } from '../../utils/api';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  new:       'bg-blue-500/20 text-blue-400 border-blue-500/20',
  contacted: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
  converted: 'bg-green-500/20 text-green-400 border-green-500/20',
  closed:    'bg-gray-500/20 text-gray-400 border-gray-500/20',
};

const STATUSES = ['new','contacted','converted','closed'];

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const load = (force = false) => {
    if (force) bustCache('/enquiries');
    cachedGet('/enquiries', { cache: 60 }).then(r => setEnquiries(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const updateStatus = async (id, status) => {
    try { await API.put(`/enquiries/${id}`, { status }); bustCache('/enquiries'); toast.success('Status updated'); load(true); }
    catch { toast.error('Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this enquiry?')) return;
    try { await API.delete(`/enquiries/${id}`); bustCache('/enquiries'); toast.success('Deleted'); load(true); }
    catch { toast.error('Error'); }
  };

  const filtered = filterStatus === 'all' ? enquiries : enquiries.filter(e => e.status === filterStatus);

  return (
    <AdminLayout title="Enquiries">
      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap mb-5">
        {['all', ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
              filterStatus === s ? 'bg-orange-500 text-white' : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
            }`}>
            {s}
            {s !== 'all' && (
              <span className="ml-1 opacity-60">({enquiries.filter(e => e.status === s).length})</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No enquiries found</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(e => (
            <div key={e._id} className="glass rounded-2xl p-4">
              {/* Top row: name + date */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="text-white font-semibold text-sm">{e.name}</div>
                  <div className="text-gray-500 text-xs mt-0.5">
                    {new Date(e.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border capitalize ${STATUS_COLORS[e.status] || ''}`}>
                  {e.status}
                </span>
              </div>

              {/* Interest + message */}
              <div className="mb-3">
                {e.interest && (
                  <span className="inline-block text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full px-2 py-0.5 mb-1.5 capitalize">
                    {e.interest.replace('-', ' ')}
                  </span>
                )}
                {e.message && (
                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-3">{e.message}</p>
                )}
              </div>

              {/* Actions row */}
              <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                {/* Phone / WhatsApp */}
                <a
                  href={`https://wa.me/${e.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${e.name}! Thank you for your interest in FitNation.`)}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-green-400 border border-green-500/20 px-3 py-1.5 rounded-xl hover:bg-green-500/10 transition-all"
                >
                  <Phone size={12} /> {e.phone}
                </a>

                {/* Status dropdown */}
                <div className="relative flex-1">
                  <select
                    value={e.status}
                    onChange={ev => updateStatus(e._id, ev.target.value)}
                    className={`w-full text-xs px-3 py-2 rounded-xl border outline-none cursor-pointer font-semibold capitalize appearance-none pr-8 ${STATUS_COLORS[e.status] || 'text-gray-400 bg-white/5 border-white/10'}`}
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    {STATUSES.map(s => (
                      <option key={s} value={s} style={{ background: '#111318', color: '#f1f5f9' }} className="capitalize">{s}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>

                {/* Delete */}
                <button onClick={() => handleDelete(e._id)}
                  className="p-2 text-red-400 hover:bg-red-400/10 rounded-xl transition-all flex-shrink-0">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
