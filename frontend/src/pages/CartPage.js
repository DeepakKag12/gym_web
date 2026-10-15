import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { thumb } from '../utils/img';

export default function CartPage() {
  const { cart, removeFromCart, updateQty, total, clearCart } = useCart();

  if (cart.length === 0) return (
    <div className="min-h-screen bg-[var(--bg)] pt-16 flex flex-col items-center justify-center gap-4 text-center px-4 transition-colors duration-200">
      <div className="w-16 h-16 bg-[var(--surface-raised)] rounded-lg flex items-center justify-center border border-[var(--border)] text-[var(--text-muted)]">
        <ShoppingBag size={30} />
      </div>
      <h2 className="text-[var(--text-primary)] font-bold text-2xl">Your cart is empty</h2>
      <p className="text-[var(--text-muted)] text-xs sm:text-sm max-w-xs">Explore our supplement store and add items to your cart</p>
      <Link to="/store" className="btn-fire px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-md mt-2">
        Browse Store
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] pt-16 transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border)]">
          <h1 className="text-[var(--text-primary)] font-bold text-2xl flex items-center gap-3">
            <ShoppingCart size={22} className="text-[var(--primary)]" /> Shopping Cart
            <span className="text-[var(--text-muted)] font-normal text-sm">({cart.reduce((s,i)=>s+i.qty,0)} items)</span>
          </h1>
          <button onClick={clearCart} className="text-rose-500 text-xs font-semibold hover:underline">
            Clear all
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {cart.map((item, i) => (
              <div key={i} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 flex items-center gap-4">
                <Link to={`/store/${item._id}`} className="flex-shrink-0 group block">
                  {item.images?.[0] ? (
                    <img src={thumb(item.images[0], 144)} loading="lazy" decoding="async" alt={item.name} className="w-16 h-16 object-cover rounded-md border border-[var(--border)] group-hover:border-[var(--primary)] transition-colors" />
                  ) : (
                    <div className="w-16 h-16 bg-[var(--surface-raised)] rounded-md flex items-center justify-center border border-[var(--border)] text-[var(--text-muted)]">
                      <ShoppingBag size={20} />
                    </div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/store/${item._id}`} className="hover:text-[var(--primary)] transition-colors block">
                    <h3 className="text-[var(--text-primary)] font-semibold text-sm line-clamp-1">{item.name}</h3>
                  </Link>
                  {(item.flavor || item.weight) && (
                    <p className="text-[var(--text-muted)] text-xs mt-0.5">{[item.flavor, item.weight].filter(Boolean).join(' · ')}</p>
                  )}
                  <p className="text-[var(--text-primary)] font-bold mt-1 text-sm">₹{item.discountPrice || item.price}</p>
                </div>
                <div className="flex items-center border border-[var(--border)] rounded-md overflow-hidden bg-[var(--surface-raised)]">
                  <button onClick={() => updateQty(item._id, item.flavor, item.weight, item.qty - 1)} className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors" aria-label="Decrease quantity"><Minus size={12} /></button>
                  <span className="text-[var(--text-primary)] font-bold px-2 text-xs min-w-[24px] text-center">{item.qty}</span>
                  <button onClick={() => updateQty(item._id, item.flavor, item.weight, item.qty + 1)} className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors" aria-label="Increase quantity"><Plus size={12} /></button>
                </div>
                <div className="text-[var(--text-primary)] font-black text-sm min-w-[60px] text-right">₹{((item.discountPrice || item.price) * item.qty).toFixed(0)}</div>
                <button onClick={() => removeFromCart(item._id, item.flavor, item.weight)} className="text-[var(--text-muted)] hover:text-rose-500 transition-colors ml-1" aria-label="Remove item"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 sticky top-20">
              <h2 className="text-[var(--text-primary)] font-bold text-base mb-4 pb-2 border-b border-[var(--border-subtle)]">Order Summary</h2>
              <div className="space-y-2 mb-5">
                {cart.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs text-[var(--text-secondary)]">
                    <span className="line-clamp-1 flex-1 mr-2">{item.name} × {item.qty}</span>
                    <span className="text-[var(--text-primary)] font-semibold">₹{((item.discountPrice || item.price) * item.qty).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[var(--border)] pt-4 flex justify-between items-baseline text-[var(--text-primary)] font-bold text-base mb-5">
                <span>Total Due</span>
                <span className="text-[var(--primary)] font-black text-2xl">₹{total.toFixed(0)}</span>
              </div>
              <Link to="/checkout" className="btn-fire w-full py-3.5 text-xs font-bold uppercase tracking-wider rounded-md flex items-center justify-center gap-2">
                Proceed to Checkout <ArrowRight size={14} />
              </Link>
              <Link to="/store" className="block text-center text-[var(--text-muted)] hover:text-[var(--primary)] text-xs mt-4 transition-colors">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
