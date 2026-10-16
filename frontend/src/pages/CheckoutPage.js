import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ShoppingBag, MapPin, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { thumb } from '../utils/img';

export default function CheckoutPage() {
  const { cart, total, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [name, setName]   = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [placedTotal, setPlacedTotal] = useState(null);
  const idempotencyKeyRef = useRef(`ord_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`);

  // Sync user details once loaded
  useEffect(() => {
    if (user?.name) setName(prev => prev || user.name);
    if (user?.phone) setPhone(prev => prev || user.phone);
  }, [user]);

  // Redirect unauthenticated users to login once auth resolution is complete
  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { replace: true });
  }, [authLoading, user, navigate]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!authLoading && cart.length === 0 && !success) navigate('/cart', { replace: true });
  }, [authLoading, cart.length, success, navigate]);

  if (authLoading || !user || (cart.length === 0 && !success)) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!name || !phone) { toast.error('Please enter your name and phone'); return; }
    setLoading(true);
    try {
      const items = cart.map(i => ({
        product: i._id, name: i.name,
        price: i.discountPrice || i.price,
        quantity: i.qty, flavor: i.flavor, weight: i.weight,
        image: i.images?.[0] || ''
      }));
      // totalAmount / paymentStatus are deliberately NOT sent: the server
      // re-prices every line from the database and ignores client values.
      const { data: order } = await API.post('/orders', {
        items,
        shippingAddress: { name, phone, address: 'Collect from Gym', city: 'Gym', state: '', pincode: '000000' },
        paymentMethod: 'cod',
        idempotencyKey: idempotencyKeyRef.current,
      });
      // Show what was actually charged — a cart restored from localStorage can
      // hold a stale price if the product changed since it was added.
      setPlacedTotal(order?.totalAmount ?? total);
      clearCart();
      idempotencyKeyRef.current = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      setSuccess(true);
    } catch (err) { toast.error(err.response?.data?.message || 'Order placement failed. Please try again.'); }
    finally { setLoading(false); }
  };

  if (success) return (
    <div className="min-h-screen bg-white text-oris-secondary relative font-sans selection:bg-[#3365e2] selection:text-white">
      <div className="relative overflow-hidden pt-28 sm:pt-36 pb-16 sm:pb-20 bg-[linear-gradient(to_bottom,#ffffff_0%,#eff6ff_20%,#bfdbfe_45%,#60a5fa_70%,#3365e2_100%)] text-slate-900 border-b border-[#3365e2]/20 text-center">
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#15324d_1.2px,transparent_1.2px)] [background-size:24px_24px]" />
        <div className="relative z-10 max-w-xl mx-auto px-6">
          <div className="w-16 h-16 bg-white/90 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-4 shadow-sm">
            <CheckCircle size={36} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Order Placed!</h1>
          <p className="text-slate-700 text-sm max-w-sm mx-auto mb-4 leading-relaxed font-medium">
            Thank you! Your order has been placed. Please collect your items directly from the FitNation front desk.
          </p>
          {placedTotal !== null && (
            <div className="inline-block px-5 py-2 rounded-xl bg-white/90 border border-[#3365e2]/25 text-[#3365e2] font-bold text-base mb-6 shadow-xs">
              Amount due on pickup: ₹{Number(placedTotal).toFixed(0)}
            </div>
          )}
          <div>
            <button
              onClick={() => navigate('/store')}
              className="group relative overflow-hidden inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#3365e2] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
            >
              <span
                aria-hidden="true"
                className="absolute rounded-full pointer-events-none transition-transform duration-500 ease-out group-hover:scale-100 scale-0 w-[350%] aspect-square bg-[#2552ca]"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  transitionTimingFunction: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)',
                }}
              />
              <span className="relative z-10 flex items-center gap-2">
                <span>Continue Shopping</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-oris-secondary relative font-sans selection:bg-[#3365e2] selection:text-white">
      {/* ── Landing Page White & Blue Hero Header ── */}
      <div className="relative overflow-hidden pt-28 sm:pt-36 pb-12 sm:pb-16 bg-[linear-gradient(to_bottom,#ffffff_0%,#eff6ff_20%,#bfdbfe_45%,#60a5fa_70%,#3365e2_100%)] text-slate-900 border-b border-[#3365e2]/20">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#15324d_1.2px,transparent_1.2px)] [background-size:24px_24px] pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#3365e2]/30 text-[#3365e2] text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
            <ShoppingBag size={13} /> Order Finalization
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight uppercase leading-tight mb-2">
            ATHLETIC STORE <span className="text-[#3365e2]">CHECKOUT</span>
          </h1>
          <p className="text-sm text-slate-700 font-medium">
            Total Amount Due: ₹{total.toFixed(0)} · Free front desk gym pickup with cash/UPI handover
          </p>
        </div>
      </div>

      <div className="bg-[#f8fafc] text-slate-800 min-h-[60vh]">
        <div className="max-w-3xl mx-auto px-6 py-10 pb-20">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left — form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Contact */}
            <div className="rounded-[22px] border border-slate-200/90 bg-white p-5 space-y-4 shadow-sm">
              <h2 className="text-slate-900 font-extrabold text-sm uppercase tracking-wider pb-2 border-b border-slate-100">Your Details</h2>
              <div>
                <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block mb-1">Full Name</label>
                <input className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#3365e2]/30 focus:border-[#3365e2] transition-colors" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
              </div>
              <div>
                <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block mb-1">Phone Number</label>
                <input className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#3365e2]/30 focus:border-[#3365e2] transition-colors" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" required />
              </div>
            </div>

            {/* Pickup + Payment info */}
            <div className="rounded-[22px] border border-slate-200/90 bg-white p-5 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-[#3365e2] font-bold text-xs uppercase tracking-wider">
                <MapPin size={16} />
                <span>Pickup Method</span>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">Collect directly from the FitNation front desk. Pay cash or UPI on handover.</p>
              <div className="flex items-center gap-2.5 mt-2 px-3 py-2 rounded-xl bg-[#3365e2]/10 border border-[#3365e2]/20">
                <span className="text-[#3365e2] font-semibold text-xs">Payment: Cash / UPI on Collection</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative overflow-hidden w-full py-3.5 px-6 rounded-full bg-[#3365e2] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span
                aria-hidden="true"
                className="absolute rounded-full pointer-events-none transition-transform duration-500 ease-out group-hover:scale-100 scale-0 w-[350%] aspect-square bg-[#2552ca]"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  transitionTimingFunction: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)',
                }}
              />
              <span className="relative z-10 flex items-center gap-2">
                {loading
                  ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4 inline-block" />
                  : <><span>Place Order — ₹{total.toFixed(0)}</span><ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></>}
              </span>
            </button>
          </form>

          {/* Right — order summary */}
          <div className="rounded-[22px] border border-slate-200/90 bg-white p-6 shadow-sm">
            <h2 className="text-slate-900 font-extrabold text-sm uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Order Items</h2>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {cart.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  {item.images?.[0] && <img src={thumb(item.images[0], 96)} loading="lazy" decoding="async" alt={item.name} className="w-11 h-11 object-cover rounded-xl border border-slate-200 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-900 text-xs font-bold line-clamp-1">{item.name}</div>
                    {(item.flavor || item.weight) && (
                      <div className="text-slate-500 text-[11px]">{[item.flavor, item.weight].filter(Boolean).join(' · ')}</div>
                    )}
                    <div className="text-[#3365e2] text-xs font-bold">₹{item.discountPrice || item.price} × {item.qty}</div>
                  </div>
                  <div className="text-slate-900 font-black text-xs flex-shrink-0">
                    ₹{((item.discountPrice || item.price) * item.qty).toFixed(0)}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 mt-4 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span><span className="text-slate-900 font-bold">₹{total.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Pickup</span><span className="text-[#3365e2] font-bold">Free at Gym</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment</span><span className="text-slate-900 font-bold">Pay on Handover</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-slate-100 pt-3 mt-3 text-slate-900">
                <span>Total Due</span>
                <span className="text-[#3365e2] font-black text-xl">₹{total.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
