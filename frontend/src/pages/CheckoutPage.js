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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] pt-20 flex flex-col items-center justify-center gap-5 px-4 text-center transition-colors duration-200">
      <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-[var(--primary)]">
        <CheckCircle size={36} />
      </div>
      <h2 className="gym-font text-3xl sm:text-4xl text-[var(--text-primary)]">Order Placed!</h2>
      <p className="text-[var(--text-secondary)] text-sm max-w-sm leading-relaxed">
        Thank you. Your order is confirmed. Please collect your items from the gym and pay cash on pickup.
      </p>
      {placedTotal !== null && (
        <p className="text-[var(--text-primary)] font-semibold text-base">
          Amount due on pickup: ₹{Number(placedTotal).toFixed(0)}
        </p>
      )}
      <button onClick={() => navigate('/store')} className="btn-fire px-8 py-3 text-xs font-bold uppercase tracking-wider rounded-md mt-2">
        Continue Shopping
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] pt-20 transition-colors duration-200">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="gym-font text-3xl sm:text-4xl flex items-center gap-3 mb-8 text-[var(--text-primary)]">
          <ShoppingBag className="text-[var(--primary)]" size={28} /> CHECKOUT
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left — form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Contact */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4">
              <h2 className="text-[var(--text-primary)] font-bold text-sm uppercase tracking-wider pb-2 border-b border-[var(--border-subtle)]">Your Details</h2>
              <div>
                <label className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-wider block mb-1">Full Name</label>
                <input className="input-dark w-full" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
              </div>
              <div>
                <label className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-wider block mb-1">Phone Number</label>
                <input className="input-dark w-full" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" required />
              </div>
            </div>

            {/* Pickup + Payment info */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3">
              <div className="flex items-center gap-2 text-[var(--primary)] font-bold text-xs uppercase tracking-wider">
                <MapPin size={16} />
                <span>Pickup Method</span>
              </div>
              <p className="text-[var(--text-secondary)] text-xs leading-relaxed">Collect directly from the FitNation front desk. Pay cash or UPI on handover.</p>
              <div className="flex items-center gap-2.5 mt-2 px-3 py-2 rounded-md bg-[var(--surface-raised)] border border-[var(--border)]">
                <span className="text-[var(--primary)] font-semibold text-xs">Payment: Cash / UPI on Collection</span>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-fire w-full py-3.5 text-xs font-bold uppercase tracking-wider rounded-md flex items-center justify-center gap-2">
              {loading
                ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4 inline-block" />
                : <><span>Place Order — ₹{total.toFixed(0)}</span><ArrowRight size={14} /></>}
            </button>
          </form>

          {/* Right — order summary */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
            <h2 className="text-[var(--text-primary)] font-bold text-sm uppercase tracking-wider mb-4 pb-2 border-b border-[var(--border-subtle)]">Order Items</h2>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {cart.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  {item.images?.[0] && <img src={thumb(item.images[0], 96)} loading="lazy" decoding="async" alt={item.name} className="w-11 h-11 object-cover rounded-md border border-[var(--border)] flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-[var(--text-primary)] text-xs font-medium line-clamp-1">{item.name}</div>
                    {(item.flavor || item.weight) && (
                      <div className="text-[var(--text-muted)] text-[11px]">{[item.flavor, item.weight].filter(Boolean).join(' · ')}</div>
                    )}
                    <div className="text-[var(--primary)] text-xs font-semibold">₹{item.discountPrice || item.price} × {item.qty}</div>
                  </div>
                  <div className="text-[var(--text-primary)] font-bold text-xs flex-shrink-0">
                    ₹{((item.discountPrice || item.price) * item.qty).toFixed(0)}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-[var(--border)] mt-4 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Subtotal</span><span className="text-[var(--text-primary)] font-medium">₹{total.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Pickup</span><span className="text-[var(--primary)] font-medium">Free at Gym</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Payment</span><span className="text-[var(--text-primary)] font-medium">Pay on Handover</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-[var(--border-subtle)] pt-3 mt-3 text-[var(--text-primary)]">
                <span>Total Due</span>
                <span className="text-[var(--primary)] font-black text-xl">₹{total.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
