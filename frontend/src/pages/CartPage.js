import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { cart, removeFromCart, updateQty, total, clearCart } = useCart();

  if (cart.length === 0) return (
    <div className="min-h-screen bg-gray-50 pt-16 flex flex-col items-center justify-center gap-5">
      <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center">
        <ShoppingBag size={36} className="text-blue-300" />
      </div>
      <h2 className="text-gray-800 font-bold text-2xl">Your cart is empty</h2>
      <p className="text-gray-400 text-sm">Browse our store and add items to cart</p>
      <Link to="/store" className="btn-fire px-8 py-3">Go to Store</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-gray-900 font-bold text-2xl flex items-center gap-3">
            <ShoppingCart size={26} className="text-blue-600" /> Shopping Cart
            <span className="text-gray-400 font-normal text-base">({cart.reduce((s,i)=>s+i.qty,0)} items)</span>
          </h1>
          <button onClick={clearCart} className="text-red-500 text-sm hover:underline font-medium">Clear all</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {cart.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
                {item.images?.[0] ? (
                  <img src={item.images[0]} alt={item.name} className="w-18 h-18 w-[72px] h-[72px] object-cover rounded-xl flex-shrink-0 border border-gray-100" />
                ) : (
                  <div className="w-[72px] h-[72px] bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ShoppingBag size={24} className="text-blue-200" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 font-semibold text-sm line-clamp-1">{item.name}</h3>
                  {(item.flavor || item.weight) && (
                    <p className="text-gray-400 text-xs mt-0.5">{[item.flavor, item.weight].filter(Boolean).join(' · ')}</p>
                  )}
                  <p className="text-blue-600 font-bold mt-1 text-sm">₹{item.discountPrice || item.price}</p>
                </div>
                <div className="flex items-center border-2 border-gray-100 rounded-xl overflow-hidden">
                  <button onClick={() => updateQty(item._id, item.flavor, item.weight, item.qty - 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50"><Minus size={13} /></button>
                  <span className="text-gray-900 font-bold px-2 text-sm min-w-[24px] text-center">{item.qty}</span>
                  <button onClick={() => updateQty(item._id, item.flavor, item.weight, item.qty + 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50"><Plus size={13} /></button>
                </div>
                <div className="text-gray-900 font-bold text-sm min-w-[60px] text-right">₹{((item.discountPrice || item.price) * item.qty).toFixed(0)}</div>
                <button onClick={() => removeFromCart(item._id, item.flavor, item.weight)} className="text-gray-300 hover:text-red-500 transition-colors ml-1"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-20">
              <h2 className="text-gray-900 font-bold text-lg mb-5">Order Summary</h2>
              <div className="space-y-2 mb-5">
                {cart.map((item, i) => (
                  <div key={i} className="flex justify-between text-gray-500 text-sm">
                    <span className="line-clamp-1 flex-1 mr-2">{item.name} × {item.qty}</span>
                    <span className="text-gray-700 font-medium">₹{((item.discountPrice || item.price) * item.qty).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4 flex justify-between text-gray-900 font-bold text-lg mb-5">
                <span>Total</span>
                <span className="gradient-text">₹{total.toFixed(0)}</span>
              </div>
              <Link to="/checkout" className="btn-fire w-full justify-center py-3.5 text-base">Proceed to Checkout</Link>
              <Link to="/store" className="block text-center text-gray-400 hover:text-blue-600 text-sm mt-4 transition-colors">← Continue Shopping</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
