import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ShoppingBag, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName]   = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (cart.length === 0) { navigate('/cart'); return null; }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone) { toast.error('Please enter your name and phone'); return; }
    setLoading(true);
    try {
      const items = cart.map(i => ({
        product: i._id, name: i.name,
        price: i.discountPrice || i.price,
        quantity: i.qty, flavor: i.flavor, weight: i.weight,
        image: i.images?.[0] || ''
      }));
      await API.post('/orders', {
        items,
        shippingAddress: { name, phone, address: 'Collect from Gym', city: 'Gym', state: '', pincode: '000000' },
        totalAmount: total,
        paymentMethod: 'cod',
        paymentStatus: 'pending',
      });
      clearCart();
      setSuccess(true);
    } catch { toast.error('Order placement failed. Please try again.'); }
    finally { setLoading(false); }
  };

  if (success) return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20 flex flex-col items-center justify-center gap-6 px-4">
      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
        <CheckCircle size={48} className="text-green-400" />
      </div>
      <h2 className="text-white font-bold text-3xl">Order Placed!</h2>
      <p className="text-gray-400 text-center max-w-sm">
        Thank you! Your order is confirmed. Please collect your items from the gym and pay cash on pickup.
      </p>
      <button onClick={() => navigate('/store')} className="btn-fire px-10 py-3">Continue Shopping</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-white font-bold text-3xl flex items-center gap-3 mb-8">
          <ShoppingBag className="text-orange-500" size={28} /> Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left — form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Contact */}
            <div className="glass rounded-xl p-5 space-y-4">
              <h2 className="text-white font-semibold text-base mb-1">Your Details</h2>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Full Name</label>
                <input className="input-dark" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Phone Number</label>
                <input className="input-dark" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" required />
              </div>
            </div>

            {/* Pickup + Payment info */}
            <div className="glass rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2.5 text-green-400">
                <MapPin size={18} />
                <span className="font-semibold text-sm">Collect from Gym</span>
              </div>
              <p className="text-gray-400 text-sm">Pick up your order directly at the gym. Pay cash when you collect.</p>
              <div className="flex items-center gap-2.5 mt-2 px-3 py-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <span className="text-orange-400 font-semibold text-sm">💵 Cash on Delivery (COD)</span>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-fire w-full py-4 text-base">
              {loading
                ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5 inline-block" />
                : `Place Order — ₹${total.toFixed(0)}`}
            </button>
          </form>

          {/* Right — order summary */}
          <div className="glass rounded-xl p-6">
            <h2 className="text-white font-bold text-lg mb-4">Order Summary</h2>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {cart.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  {item.images?.[0] && <img src={item.images[0]} alt={item.name} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium line-clamp-1">{item.name}</div>
                    {(item.flavor || item.weight) && (
                      <div className="text-gray-500 text-xs">{[item.flavor, item.weight].filter(Boolean).join(' · ')}</div>
                    )}
                    <div className="text-orange-400 text-xs">₹{item.discountPrice || item.price} × {item.qty}</div>
                  </div>
                  <div className="text-white font-bold text-sm flex-shrink-0">
                    ₹{((item.discountPrice || item.price) * item.qty).toFixed(0)}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Subtotal</span><span className="text-white">₹{total.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Delivery</span><span className="text-green-400">Collect from Gym</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Payment</span><span className="text-orange-400">Cash on Delivery</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-white/10 pt-2 mt-2">
                <span className="text-gray-300">Total</span>
                <span className="gradient-text">₹{total.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
