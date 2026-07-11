import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, CheckCircle, XCircle, Edit2 } from 'lucide-react';
import API from '../../utils/api';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  new: 'bg-blue-500/20 text-blue-400',
  contacted: 'bg-yellow-500/20 text-yellow-400',
  converted: 'bg-green-500/20 text-green-400',
  closed: 'bg-gray-500/20 text-gray-400',
};

const ADMIN_WHATSAPP = '919999999999';

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const load = () => API.get('/enquiries').then(r => setEnquiries(r.data)).catch(() => {}).finally(() => setLoading(false));
  useEffect(load, []);

  const updateStatus = async (id, status) => {
    try { await API.put(`/enquiries/${id}`, { status }); toast.success('Status updated'); load(); }
    catch { toast.error('Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this enquiry?')) return;
    try { await API.delete(`/enquiries/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Error'); }
  };

  const filtered = filterStatus === 'all' ? enquiries : enquiries.filter(e => e.status === filterStatus);

  return (
    <AdminLayout title="Enquiries">
      <div className="flex gap-2 flex-wrap mb-6">
        {['all','new','contacted','converted','closed'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${filterStatus === s ? 'bg-orange-500 text-white' : 'bg-white/5 text-gray-400 border border-white/10'}`}>{s}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No enquiries found</div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10">
                <tr className="text-gray-500 text-xs uppercase">
                  {['Name','Phone','Interest','Message','Status','Date','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e._id} className="border-b border-white/5 hover:bg-white/2">
                    <td className="px-4 py-3 text-white font-medium">{e.name}</td>
                    <td className="px-4 py-3">
                      <a href={`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(`Hi ${e.name}!`)}`} target="_blank" rel="noreferrer"
                        className="text-green-400 hover:underline text-xs">{e.phone}</a>
                    </td>
                    <td className="px-4 py-3 text-gray-300 capitalize text-xs">{e.interest?.replace('-', ' ')}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs max-w-xs"><span className="line-clamp-2">{e.message}</span></td>
                    <td className="px-4 py-3">
                      <select value={e.status} onChange={ev => updateStatus(e._id, ev.target.value)}
                        className={`text-xs px-2 py-0.5 rounded-full bg-transparent border-0 outline-none cursor-pointer capitalize font-semibold ${STATUS_COLORS[e.status] || ''}`}>
                        {['new','contacted','converted','closed'].map(s => <option key={s} value={s} className="bg-[#0d0d14] capitalize">{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(e.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <a href={`https://wa.me/${e.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${e.name}! Thank you for your interest in FitnessByAjeet.`)}`}
                          target="_blank" rel="noreferrer" className="text-green-400 text-xs border border-green-500/20 px-2 py-1 rounded-lg hover:bg-green-500/10">WhatsApp</a>
                        <button onClick={() => handleDelete(e._id)} className="text-red-400 text-xs border border-red-500/20 px-2 py-1 rounded-lg hover:bg-red-500/10">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
