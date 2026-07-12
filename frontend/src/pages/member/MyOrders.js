import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronRight } from 'lucide-react';
import API from '../../utils/api';

const STATUS_MAP = {
  placed:     { icon: Clock,         color: 'text-yellow-400 bg-yellow-500/10', label: 'Placed' },
  confirmed:  { icon: CheckCircle,   color: 'text-blue-400 bg-blue-500/10',    label: 'Confirmed' },
  processing: { icon: Package,       color: 'text-purple-400 bg-purple-500/10', label: 'Processing' },
  shipped:    { icon: Truck,         color: 'text-cyan-400 bg-cyan-500/10',    label: 'Shipped' },
  delivered:  { icon: CheckCircle,   color: 'text-green-400 bg-green-500/10', label: 'Delivered' },
  cancelled:  { icon: XCircle,       color: 'text-red-400 bg-red-500/10',     label: 'Cancelled' },
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/orders/my').then(r => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20 pb-20 lg:pb-8">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="gym-font text-3xl text-white">My Orders</h1>
          <p className="text-gray-400 text-sm mt-0.5">Track your supplement & product orders</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : orders.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Package size={40} className="text-gray-600 mx-auto mb-3" />
            <div className="text-gray-400 mb-3">No orders placed yet</div>
            <a href="/store" className="btn-fire inline-block px-6 py-2.5 text-sm">Browse Store</a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => {
              const st = STATUS_MAP[order.orderStatus] || STATUS_MAP['pending'];
              const Icon = st.icon;
              return (
                <motion.div key={order._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className="glass rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-white font-semibold text-sm">Order #{order._id.slice(-8).toUpperCase()}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    </div>
                    <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${st.color}`}>
                      <Icon size={13} /> {st.label}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        {item.product?.images?.[0] && (
                          <img src={item.product.images[0]} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-white/5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm truncate">{item.name}</div>
                          {(item.flavor || item.weight) && <div className="text-gray-500 text-xs">{[item.flavor, item.weight].filter(Boolean).join(' · ')}</div>}
                        </div>
                        <div className="text-right text-sm">
                          <div className="text-white font-semibold">₹{item.price}</div>
                          <div className="text-gray-500 text-xs">×{item.quantity}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                    <div>
                      <div className="text-gray-500 text-xs">{order.paymentMethod?.toUpperCase()} · {order.paymentStatus}</div>
                      {order.shippingAddress && (
                        <div className="text-gray-600 text-xs mt-0.5 truncate max-w-xs">
                          📍 {order.shippingAddress.city}, {order.shippingAddress.state}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold text-lg">₹{order.totalAmount}</div>
                      <div className="text-gray-500 text-xs">{order.items.reduce((s, it) => s + it.quantity, 0)} item(s)</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
