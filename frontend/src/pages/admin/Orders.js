import React, { useState, useEffect } from 'react';
import { Package, ChevronDown, MapPin, Phone, User, IndianRupee } from 'lucide-react';
import API, { cachedGet, bustCache, freshGet } from '../../utils/api';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';

// Gym-pickup order flow
const STATUSES = ['placed', 'confirmed', 'ready', 'collected', 'cancelled'];

const STATUS_META = {
  placed:    { label: 'Order Placed',        color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  confirmed: { label: 'Confirmed',           color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  ready:     { label: 'Ready for Pickup',    color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  collected: { label: 'Collected ✓',         color: 'text-green-400 bg-green-400/10 border-green-400/20' },
  cancelled: { label: 'Cancelled',           color: 'text-red-400 bg-red-400/10 border-red-400/20' },
};

const PAYMENT_META = {
  paid:    { label: 'Paid',    color: 'text-green-400 bg-green-400/10 border-green-400/20' },
  pending: { label: 'Pending', color: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
  failed:  { label: 'Failed',  color: 'text-red-400 bg-red-400/10 border-red-400/20' },
};

export default function AdminOrders() {
  const [orders,       setOrders]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const load = (force = false) => {
    setLoading(true);
    const fetcher = force ? freshGet('/orders', { cache: 60 }) : cachedGet('/orders', { cache: 60 });
    fetcher.then(r => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const updateOrderStatus = async (id, orderStatus) => {
    try {
      await API.put(`/orders/${id}/status`, { orderStatus });
      setOrders(prev => prev.map(o => o._id === id ? { ...o, orderStatus } : o));
      bustCache('/orders');
      toast.success('Order status updated');
    } catch { toast.error('Error updating status'); }
  };

  const updatePaymentStatus = async (id, paymentStatus) => {
    try {
      await API.put(`/orders/${id}/status`, { paymentStatus });
      setOrders(prev => prev.map(o => o._id === id ? { ...o, paymentStatus } : o));
      bustCache('/orders');
      bustCache('analytics');
      toast.success('Payment status updated');
    } catch { toast.error('Error updating payment'); }
  };

  const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.orderStatus === filterStatus);

  // Count badges for each status
  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.orderStatus === s).length;
    return acc;
  }, {});

  return (
    <AdminLayout title="Orders">

      {/* Status filter pills */}
      <div className="flex gap-2 flex-wrap mb-5">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
            filterStatus === 'all' ? 'bg-[#22d3ee] text-black' : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
          }`}
        >
          All <span className="opacity-70">({orders.length})</span>
        </button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all flex items-center gap-1.5 ${
              filterStatus === s ? 'bg-[#22d3ee] text-black' : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
            }`}
          >
            {STATUS_META[s]?.label}
            {counts[s] > 0 && <span className="opacity-70">({counts[s]})</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-[#22d3ee] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Package size={40} className="mx-auto mb-3 text-gray-700" />
          No orders found
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(o => {
            const meta = STATUS_META[o.orderStatus] || STATUS_META.placed;
            const pmeta = PAYMENT_META[o.paymentStatus] || PAYMENT_META.pending;
            return (
              <div key={o._id} className="glass rounded-2xl p-4">

                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="text-white font-bold text-sm">
                      #{o._id.slice(-6).toUpperCase()}
                    </div>
                    <div className="text-gray-500 text-xs mt-0.5">
                      {new Date(o.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#22d3ee] font-bold text-base">₹{o.totalAmount}</div>
                    {/* Payment method pill */}
                    <div className="text-xs text-orange-400 font-semibold mt-0.5 uppercase">
                      {o.paymentMethod || 'COD'}
                    </div>
                  </div>
                </div>

                {/* Customer info */}
                <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-white/5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {(o.shippingAddress?.name || o.user?.name || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium flex items-center gap-1.5">
                      <User size={11} className="text-gray-500" />
                      {o.shippingAddress?.name || o.user?.name || 'Unknown'}
                    </div>
                    <div className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                      <Phone size={10} />
                      {o.shippingAddress?.phone || o.user?.phone || '—'}
                    </div>
                  </div>
                  {/* Pickup label */}
                  <div className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full flex-shrink-0">
                    <MapPin size={10} /> Collect from Gym
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-1.5 mb-3">
                  {o.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {item.image && (
                        <img src={item.image} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0 bg-white/5" />
                      )}
                      <span className="text-gray-300 text-xs flex-1 min-w-0 truncate">{item.name}</span>
                      {item.flavor && <span className="text-gray-600 text-xs flex-shrink-0">{item.flavor}</span>}
                      <span className="text-gray-500 text-xs flex-shrink-0">×{item.quantity}</span>
                      <span className="text-gray-400 text-xs font-medium flex-shrink-0">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* ── Status controls ── */}
                <div className="space-y-2">
                  {/* Order status row */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs flex-shrink-0 w-24">Order Status:</span>
                    <div className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold flex-shrink-0 ${meta.color}`}>
                      {meta.label}
                    </div>
                    <div className="relative flex-1">
                      <select
                        value={o.orderStatus}
                        onChange={e => updateOrderStatus(o._id, e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-white/10 outline-none cursor-pointer bg-white/5 text-gray-300 appearance-none pr-7"
                      >
                        {STATUSES.map(s => (
                          <option key={s} value={s} style={{ background: '#111318', color: '#f1f5f9' }}>
                            {STATUS_META[s]?.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                  </div>

                  {/* Payment status row */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs flex-shrink-0 w-24 flex items-center gap-1">
                      <IndianRupee size={10} /> Payment:
                    </span>
                    <div className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold flex-shrink-0 ${pmeta.color}`}>
                      {pmeta.label}
                    </div>
                    <div className="relative flex-1">
                      <select
                        value={o.paymentStatus}
                        onChange={e => updatePaymentStatus(o._id, e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-white/10 outline-none cursor-pointer bg-white/5 text-gray-300 appearance-none pr-7"
                      >
                        {Object.entries(PAYMENT_META).map(([k, v]) => (
                          <option key={k} value={k} style={{ background: '#111318', color: '#f1f5f9' }}>
                            {v.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
