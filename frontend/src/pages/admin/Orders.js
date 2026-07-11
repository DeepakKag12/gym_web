import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import API from '../../utils/api';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  placed: 'text-blue-400 bg-blue-400/10',
  confirmed: 'text-yellow-400 bg-yellow-400/10',
  shipped: 'text-purple-400 bg-purple-400/10',
  delivered: 'text-green-400 bg-green-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => API.get('/orders').then(r => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false));
  useEffect(load, []);

  const updateStatus = async (id, status) => {
    try { await API.put(`/orders/${id}/status`, { orderStatus: status }); toast.success('Status updated'); load(); }
    catch { toast.error('Error'); }
  };

  return (
    <AdminLayout title="Orders">
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No orders yet</div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10">
                <tr className="text-gray-500 text-xs uppercase">
                  {['Order','Customer','Items','Total','Payment','Status','Date'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o._id} className="border-b border-white/5 hover:bg-white/2">
                    <td className="px-4 py-3 text-gray-500 text-xs font-mono">#{o._id.slice(-6).toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <div className="text-white text-sm font-medium">{o.user?.name}</div>
                      <div className="text-gray-500 text-xs">{o.user?.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      {o.items.slice(0, 2).map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          {item.image && <img src={item.image} alt="" className="w-7 h-7 rounded object-cover" />}
                          <span className="text-gray-300 text-xs line-clamp-1">{item.name} ×{item.quantity}</span>
                        </div>
                      ))}
                      {o.items.length > 2 && <span className="text-gray-500 text-xs">+{o.items.length - 2} more</span>}
                    </td>
                    <td className="px-4 py-3 text-white font-bold">₹{o.totalAmount}</td>
                    <td className="px-4 py-3 text-gray-300 text-xs uppercase">{o.paymentMethod}</td>
                    <td className="px-4 py-3">
                      <select value={o.orderStatus} onChange={e => updateStatus(o._id, e.target.value)}
                        className={`text-xs px-2 py-0.5 rounded-full bg-transparent outline-none cursor-pointer capitalize font-semibold border-0 ${STATUS_COLORS[o.orderStatus] || ''}`}>
                        {['placed','confirmed','shipped','delivered','cancelled'].map(s => <option key={s} value={s} className="bg-[#0d0d14]">{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
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
