import React, { useState, useEffect } from 'react';
import { Package, ChevronDown } from 'lucide-react';
import API from '../../utils/api';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  placed:    'text-blue-400 bg-blue-400/10 border-blue-400/20',
  confirmed: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  shipped:   'text-purple-400 bg-purple-400/10 border-purple-400/20',
  delivered: 'text-green-400 bg-green-400/10 border-green-400/20',
  cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
};

const STATUSES = ['placed','confirmed','shipped','delivered','cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const load = () => {
    API.get('/orders').then(r => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try { await API.put(`/orders/${id}/status`, { orderStatus: status }); toast.success('Status updated'); load(); }
    catch { toast.error('Error'); }
  };

  const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.orderStatus === filterStatus);

  return (
    <AdminLayout title="Orders">
      {/* Status filter pills */}
      <div className="flex gap-2 flex-wrap mb-5">
        {['all', ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
              filterStatus === s ? 'bg-[#22d3ee] text-black' : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
            }`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-[#22d3ee] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No orders found</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(o => (
            <div key={o._id} className="glass rounded-2xl p-4">
              {/* Header row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="text-white font-semibold text-sm">#{o._id.slice(-6).toUpperCase()}</div>
                  <div className="text-gray-400 text-xs mt-0.5">
                    {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[#22d3ee] font-bold text-base">₹{o.totalAmount}</div>
                  <div className="text-gray-500 text-xs uppercase">{o.paymentMethod}</div>
                </div>
              </div>

              {/* Customer */}
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {o.user?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <div className="text-white text-sm font-medium">{o.user?.name || 'Unknown'}</div>
                  <div className="text-gray-500 text-xs">{o.user?.phone}</div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-1.5 mb-3">
                {o.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {item.image && <img src={item.image} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />}
                    <span className="text-gray-300 text-xs flex-1 min-w-0 truncate">{item.name}</span>
                    <span className="text-gray-500 text-xs flex-shrink-0">×{item.quantity}</span>
                    <span className="text-gray-400 text-xs flex-shrink-0">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Status selector */}
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-xs">Status:</span>
                <div className="relative flex-1">
                  <select
                    value={o.orderStatus}
                    onChange={e => updateStatus(o._id, e.target.value)}
                    className={`w-full text-xs px-3 py-2 rounded-xl border outline-none cursor-pointer font-semibold capitalize appearance-none pr-8 ${STATUS_COLORS[o.orderStatus] || 'text-gray-400 bg-white/5 border-white/10'}`}
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    {STATUSES.map(s => (
                      <option key={s} value={s} style={{ background: '#111318', color: '#f1f5f9' }} className="capitalize">{s}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
