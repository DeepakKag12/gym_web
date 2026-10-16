import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { thumb } from '../utils/img';

export default function CartPage() {
  const { cart, removeFromCart, updateQty, total, clearCart } = useCart();

  if (cart.length === 0) return (
    <div className="min-h-screen bg-white text-oris-secondary relative font-sans selection:bg-[#3365e2] selection:text-white">
      <div className="relative overflow-hidden pt-28 sm:pt-36 pb-16 sm:pb-20 bg-[linear-gradient(to_bottom,#ffffff_0%,#eff6ff_20%,#bfdbfe_45%,#60a5fa_70%,#3365e2_100%)] text-slate-900 border-b border-[#3365e2]/20 text-center">
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#15324d_1.2px,transparent_1.2px)] [background-size:24px_24px]" />
        <div className="relative z-10 max-w-xl mx-auto px-6">
          <div className="w-16 h-16 bg-white/90 rounded-2xl flex items-center justify-center border border-[#3365e2]/30 text-[#3365e2] mx-auto mb-4 shadow-sm">
            <ShoppingBag size={30} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Your Cart is Empty</h1>
          <p className="text-slate-700 text-sm max-w-sm mx-auto mb-6 font-medium">Explore our authentic supplement store and add products to your cart</p>
          <Link
            to="/store"
            className="group relative overflow-hidden inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#3365e2] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
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
              <span>Browse Store</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-oris-secondary relative font-sans selection:bg-[#3365e2] selection:text-white">
      {/* ── Landing Page White & Blue Hero Header ── */}
      <div className="relative overflow-hidden pt-28 sm:pt-36 pb-12 sm:pb-16 bg-[linear-gradient(to_bottom,#ffffff_0%,#eff6ff_20%,#bfdbfe_45%,#60a5fa_70%,#3365e2_100%)] text-slate-900 border-b border-[#3365e2]/20">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#15324d_1.2px,transparent_1.2px)] [background-size:24px_24px] pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#3365e2]/30 text-[#3365e2] text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
            <ShoppingCart size={13} /> Secure Athletic Store Checkout
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight uppercase leading-tight">
                SHOPPING <span className="text-[#3365e2]">CART</span>
              </h1>
              <p className="text-sm text-slate-700 mt-1 font-medium">
                {cart.reduce((s, i) => s + i.qty, 0)} items selected · 100% Genuine Gym Dispatch
              </p>
            </div>
            <button
              onClick={clearCart}
              className="text-xs font-bold uppercase tracking-wider text-rose-600 hover:text-rose-700 underline self-start sm:self-auto transition-colors cursor-pointer"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#f8fafc] text-slate-800 min-h-[60vh]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 pb-20">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {cart.map((item, i) => (
              <div key={i} className="rounded-[20px] border border-slate-200/90 bg-white p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-xs hover:border-[#3365e2]/30 transition-all">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <Link to={`/store/${item._id}`} className="flex-shrink-0 group block">
                    {item.images?.[0] ? (
                      <img src={thumb(item.images[0], 144)} loading="lazy" decoding="async" alt={item.name} className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-xl border border-slate-200 group-hover:border-[#3365e2] transition-colors" />
                    ) : (
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 text-slate-400">
                        <ShoppingBag size={20} />
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/store/${item._id}`} className="hover:text-[#3365e2] transition-colors block">
                      <h3 className="text-slate-900 font-bold text-sm line-clamp-1">{item.name}</h3>
                    </Link>
                    {(item.flavor || item.weight) && (
                      <p className="text-slate-500 text-xs mt-0.5">{[item.flavor, item.weight].filter(Boolean).join(' · ')}</p>
                    )}
                    <p className="text-[#3365e2] font-black mt-1 text-sm">₹{item.discountPrice || item.price}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <button onClick={() => updateQty(item._id, item.flavor, item.weight, item.qty - 1)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors" aria-label="Decrease quantity"><Minus size={12} /></button>
                    <span className="text-slate-900 font-extrabold px-2 text-xs min-w-[24px] text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item._id, item.flavor, item.weight, item.qty + 1)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors" aria-label="Increase quantity"><Plus size={12} /></button>
                  </div>
                  <div className="text-slate-900 font-black text-sm min-w-[60px] text-right">₹{((item.discountPrice || item.price) * item.qty).toFixed(0)}</div>
                  <button onClick={() => removeFromCart(item._id, item.flavor, item.weight)} className="text-slate-400 hover:text-rose-600 transition-colors ml-1 p-1.5" aria-label="Remove item"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div>
            <div className="rounded-[22px] border border-slate-200/90 bg-white p-6 sticky top-28 shadow-sm">
              <h2 className="text-slate-900 font-extrabold text-base mb-4 pb-2 border-b border-slate-100 uppercase tracking-tight">Order Summary</h2>
              <div className="space-y-2 mb-5">
                {cart.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs text-slate-600">
                    <span className="line-clamp-1 flex-1 mr-2">{item.name} × {item.qty}</span>
                    <span className="text-slate-900 font-semibold">₹{((item.discountPrice || item.price) * item.qty).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-4 flex justify-between items-baseline text-slate-900 font-bold text-base mb-5">
                <span>Total Due</span>
                <span className="text-[#3365e2] font-black text-2xl">₹{total.toFixed(0)}</span>
              </div>
              <Link to="/checkout" className="group relative overflow-hidden w-full py-3.5 px-6 rounded-full bg-[#3365e2] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer">
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
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link to="/store" className="block text-center text-slate-500 hover:text-[#3365e2] text-xs mt-4 font-semibold transition-colors">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
