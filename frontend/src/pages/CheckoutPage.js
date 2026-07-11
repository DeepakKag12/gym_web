import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: '', city: '', state: '', pincode: '' });
  const [payment, setPayment] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (cart.length === 0) { navigate('/cart'); return null; }

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.address || !form.city || !form.pincode) { toast.error('Fill all address fields'); return; }
    setLoading(true);
    try {
      const items = cart.map(i => ({
        product: i._id, name: i.name,
        price: i.discountPrice || i.price,
        quantity: i.qty, flavor: i.flavor, weight: i.weight,
        image: i.images?.[0] || ''
      }));
      await API.post('/orders', {
        items, shippingAddress: { ...form }, totalAmount: total,
        paymentMethod: payment, paymentStatus: payment === 'cod' ? 'pending' : 'paid'
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
      <p className="text-gray-400 text-center">Thank you for your order. We'll confirm and ship soon!</p>
      <button onClick={() => navigate('/store')} className="btn-fire px-10 py-3">Continue Shopping</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-white font-bold text-3xl flex items-center gap-3 mb-8"><CreditCard className="text-orange-500" size={28} /> Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-white font-semibold text-xl mb-2">Shipping Address</h2>
            {[
              { name: 'name', label: 'Full Name', placeholder: 'John Doe' },
              { name: 'phone', label: 'Phone', placeholder: '+91 XXXXX XXXXX' },
              { name: 'address', label: 'Address *', placeholder: '123 Street Name, Area' },
              { name: 'city', label: 'City *', placeholder: 'Mumbai' },
              { name: 'state', label: 'State', placeholder: 'Maharashtra' },
              { name: 'pincode', label: 'Pincode *', placeholder: '400001' },
            ].map(f => (
              <div key={f.name}>
                <label className="text-gray-400 text-sm block mb-1">{f.label}</label>
                <input className="input-dark" name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder} />
              </div>
            ))}
            <div>
              <label className="text-gray-400 text-sm block mb-2">Payment Method</label>
              <div className="flex gap-3">
                {[{ v: 'cod', l: 'Cash on Delivery' }, { v: 'upi', l: 'UPI' }, { v: 'online', l: 'Online' }].map(p => (
                  <label key={p.v} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer text-sm transition-all ${payment === p.v ? 'border-orange-500 bg-orange-500/10 text-orange-400' : 'border-white/10 text-gray-400'}`}>
                    <input type="radio" name="payment" value={p.v} checked={payment === p.v} onChange={() => setPayment(p.v)} className="hidden" />
                    {p.l}
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-fire w-full py-4 text-base mt-4">
              {loading ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5 inline-block" /> : `Place Order — ₹${total.toFixed(0)}`}
            </button>
          </form>

          {/* Summary */}
          <div className="glass rounded-xl p-6">
            <h2 className="text-white font-bold text-xl mb-4">Order Items</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {cart.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  {item.images?.[0] && <img src={item.images[0]} alt={item.name} className="w-14 h-14 object-cover rounded-lg" />}
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium line-clamp-1">{item.name}</div>
                    {(item.flavor || item.weight) && <div className="text-gray-500 text-xs">{[item.flavor, item.weight].filter(Boolean).join(' · ')}</div>}
                    <div className="text-orange-400 text-sm">₹{item.discountPrice || item.price} × {item.qty}</div>
                  </div>
                  <div className="text-white font-bold text-sm">₹{((item.discountPrice || item.price) * item.qty).toFixed(0)}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 mt-4 pt-4 flex justify-between">
              <span className="text-gray-400">Total Amount</span>
              <span className="text-white font-bold text-xl gradient-text">₹{total.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
