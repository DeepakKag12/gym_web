import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, XCircle, MapPin, ShoppingBag } from 'lucide-react';
import { cachedGet } from '../../utils/api';

// Gym-pickup order flow statuses
const STATUS_MAP = {
  placed:    { icon: Clock,        color: 'text-blue-400 bg-blue-500/10 border border-blue-500/20',     label: 'Order Placed' },
  confirmed: { icon: CheckCircle,  color: 'text-yellow-400 bg-yellow-500/10 border border-yellow-500/20', label: 'Confirmed' },
  ready:     { icon: Package,      color: 'text-purple-400 bg-purple-500/10 border border-purple-500/20', label: 'Ready for Pickup' },
  collected: { icon: CheckCircle,  color: 'text-green-400 bg-green-500/10 border border-green-500/20',    label: 'Collected ✓' },
  cancelled: { icon: XCircle,      color: 'text-red-400 bg-red-500/10 border border-red-500/20',          label: 'Cancelled' },
};

// Progress steps for the gym pickup flow
const STEPS = ['placed', 'confirmed', 'ready', 'collected'];

function OrderProgress({ status }) {
  if (status === 'cancelled') return (
    <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-center">
      ❌ This order was cancelled
    </div>
  );
  const current = STEPS.indexOf(status);
  const labels = ['Placed', 'Confirmed', 'Ready for Pickup', 'Collected'];
  return (
    <div className="flex items-center gap-0 mt-2">
      {STEPS.map((step, i) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center gap-1" style={{ flex: '0 0 auto' }}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
              i <= current
                ? 'bg-[#22d3ee] border-[#22d3ee] text-black'
                : 'bg-transparent border-white/15 text-gray-600'
            }`}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className={`text-[9px] text-center whitespace-nowrap ${i <= current ? 'text-[#22d3ee]' : 'text-gray-600'}`}>
              {labels[i]}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-0.5 flex-1 mx-1 mb-3.5 transition-all ${i < current ? 'bg-[#22d3ee]' : 'bg-white/8'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cachedGet('/orders/my', { cache: 60 })
      .then(r => setOrders(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20 pb-24 lg:pb-8">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="gym-font text-3xl text-white flex items-center gap-2">
            <ShoppingBag size={28} className="text-[#22d3ee]" /> My Orders
          </h1>
          <p className="text-gray-400 text-sm mt-1">Track your supplement orders</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#22d3ee] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Package size={40} className="text-gray-600 mx-auto mb-3" />
            <div className="text-gray-400 mb-1">No orders placed yet</div>
            <p className="text-gray-600 text-sm mb-4">Visit the store to order supplements</p>
            <Link to="/store" className="btn-fire inline-block px-6 py-2.5 text-sm">Browse Store</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => {
              const st = STATUS_MAP[order.orderStatus] || STATUS_MAP.placed;
              const Icon = st.icon;
              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="glass rounded-2xl p-5"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-white font-bold text-sm">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </div>
                      <div className="text-gray-500 text-xs mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </div>
                    </div>
                    <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${st.color}`}>
                      <Icon size={12} /> {st.label}
                    </span>
                  </div>

                  {/* Progress tracker */}
                  <div className="mb-4">
                    <OrderProgress status={order.orderStatus} />
                  </div>

                  {/* Items */}
                  <div className="space-y-2 mb-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-white/5 flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                            <Package size={16} className="text-gray-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm truncate">{item.name}</div>
                          {(item.flavor || item.weight) && (
                            <div className="text-gray-500 text-xs">{[item.flavor, item.weight].filter(Boolean).join(' · ')}</div>
                          )}
                        </div>
                        <div className="text-right text-sm flex-shrink-0">
                          <div className="text-white font-semibold">₹{item.price * item.quantity}</div>
                          <div className="text-gray-500 text-xs">×{item.quantity}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="border-t border-white/8 pt-3 flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      {/* Pickup info */}
                      <div className="flex items-center gap-1.5 text-xs text-green-400">
                        <MapPin size={11} /> Collect from Gym
                      </div>
                      {/* Payment */}
                      <div className="text-xs text-orange-400 font-medium">
                        💵 Cash on Delivery
                        <span className={`ml-1.5 ${order.paymentStatus === 'paid' ? 'text-green-400' : 'text-gray-500'}`}>
                          · {order.paymentStatus === 'paid' ? 'Paid ✓' : 'Pay at pickup'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-white font-bold text-lg gradient-text">₹{order.totalAmount}</div>
                      <div className="text-gray-500 text-xs">
                        {order.items.reduce((s, it) => s + it.quantity, 0)} item(s)
                      </div>
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
