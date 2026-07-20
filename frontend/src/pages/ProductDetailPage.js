import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Package, CheckCircle, Truck, Shield, RotateCcw, ChevronRight, Minus, Plus } from 'lucide-react';
import API from '../utils/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

function StarRating({ rating, count, size = 16 }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(s => (
          <Star key={s} size={size} className={s <= Math.round(rating) ? 'star-filled' : 'star-empty'} fill={s <= Math.round(rating) ? '#f59e0b' : 'none'} />
        ))}
      </div>
      <span className="text-gray-400 text-sm font-medium">{rating.toFixed(1)}</span>
      {count !== undefined && <span className="text-gray-500 text-sm">({count} reviews)</span>}
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [flavor, setFlavor] = useState('');
  const [weight, setWeight] = useState('');
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('description');
  const { addToCart } = useCart();

  useEffect(() => {
    API.get(`/store/${id}`)
      .then(r => {
        setProduct(r.data);
        setFlavor(r.data.flavors?.[0] || '');
        setWeight(r.data.weights?.[0] || '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center pt-16">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading product…</p>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-[#0d0d14] flex flex-col items-center justify-center gap-4 pt-16">
      <Package size={48} className="text-gray-600" />
      <p className="text-gray-400 font-medium">Product not found</p>
      <Link to="/store" className="btn-fire text-sm px-5 py-2.5">← Back to Store</Link>
    </div>
  );

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAdd = () => {
    addToCart(product, qty, flavor, weight);
    toast.success(`${product.name} added to cart!`, {
      style: { background: '#fff', color: '#111', border: '1px solid #e2e8f0' },
      iconTheme: { primary: '#2563eb', secondary: '#fff' },
    });
  };

  return (
    <div className="min-h-screen bg-[#0d0d14] pt-16">

      {/* ── Breadcrumb ── */}
      <div className="bg-[#111318] border-b border-white/8">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
          <ChevronRight size={14} className="text-gray-700" />
          <Link to="/store" className="hover:text-blue-400 transition-colors">Store</Link>
          <ChevronRight size={14} className="text-gray-700" />
          {product.category && (
            <>
              <Link to={`/store?category=${product.category}`} className="hover:text-blue-400 capitalize transition-colors">{product.category}</Link>
              <ChevronRight size={14} className="text-gray-700" />
            </>
          )}
          <span className="text-gray-300 font-medium line-clamp-1 max-w-xs">{product.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

          {/* ── Images panel ── */}
          <div>
            {/* Main image */}
            <div className="relative bg-[#1a1b23] rounded-2xl overflow-hidden border border-white/10 mb-3"
                 style={{ aspectRatio: '1/1' }}>
              {product.images?.[activeImg] ? (
                <motion.img
                  key={activeImg}
                  initial={{ opacity: 0.7, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  src={product.images[activeImg]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#1a1b23]">
                  <Package size={80} className="text-gray-700" />
                </div>
              )}
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-lg shadow-md">
                  {discount}% OFF
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImg === i ? 'border-blue-500 shadow-md shadow-blue-900/30' : 'border-white/10 hover:border-blue-500/40'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product info panel ── */}
          <div className="flex flex-col">

            {/* Brand + badges */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {product.brand && (
                <span className="text-blue-400 text-xs font-bold uppercase tracking-wider bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">
                  {product.brand}
                </span>
              )}
              {product.isFeatured && (
                <span className="text-yellow-400 text-xs font-bold bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-full">★ Featured</span>
              )}
              {product.stock > 0
                ? <span className="text-green-400 text-xs font-semibold bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full flex items-center gap-1"><CheckCircle size={11} /> In Stock</span>
                : <span className="text-red-400 text-xs font-semibold bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full">Out of Stock</span>
              }
            </div>

            <h1 className="text-white font-bold text-2xl sm:text-3xl leading-tight mb-3">{product.name}</h1>

            {product.rating > 0 && (
              <div className="mb-4">
                <StarRating rating={product.rating} count={product.reviewCount} />
              </div>
            )}

            {/* Price block */}
            <div className="flex items-center gap-3 mb-5 pb-5 border-b border-white/10">
              <span className="text-white font-bold text-4xl">₹{product.discountPrice || product.price}</span>
              {product.discountPrice && (
                <>
                  <span className="text-gray-600 line-through text-xl">₹{product.price}</span>
                  <span className="bg-green-500/15 text-green-400 text-sm font-bold px-2.5 py-1 rounded-lg border border-green-500/20">
                    Save ₹{product.price - product.discountPrice}
                  </span>
                </>
              )}
            </div>

            {/* Flavor */}
            {product.flavors?.length > 0 && (
              <div className="mb-4">
                <div className="text-gray-300 text-sm font-semibold mb-2">
                  Flavor: <span className="text-blue-400">{flavor}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {product.flavors.map(f => (
                    <button
                      key={f}
                      onClick={() => setFlavor(f)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${
                        flavor === f
                          ? 'border-blue-500 bg-blue-500/15 text-blue-400'
                          : 'border-white/10 text-gray-400 hover:border-blue-500/40 bg-white/5'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Weight/size */}
            {product.weights?.length > 0 && (
              <div className="mb-5">
                <div className="text-gray-300 text-sm font-semibold mb-2">
                  Size: <span className="text-blue-400">{weight}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {product.weights.map(w => (
                    <button
                      key={w}
                      onClick={() => setWeight(w)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                        weight === w
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-white/10 text-gray-400 hover:border-blue-500/40 bg-white/5'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty + CTA */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border-2 border-white/10 rounded-xl overflow-hidden bg-white/5">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-10 h-11 flex items-center justify-center text-gray-400 hover:bg-white/10 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-10 text-center text-white font-bold text-base">{qty}</span>
                <button
                  onClick={() => setQty(q => q + 1)}
                  className="w-10 h-11 flex items-center justify-center text-gray-400 hover:bg-white/10 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              <span className="text-gray-500 text-sm">{product.stock > 0 ? `${product.stock} units left` : ''}</span>
            </div>

            {product.stock > 0 ? (
              <button
                onClick={handleAdd}
                className="w-full flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base py-4 rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-900/30 mb-3"
              >
                <ShoppingCart size={20} /> Add {qty} to Cart · ₹{((product.discountPrice || product.price) * qty).toFixed(0)}
              </button>
            ) : (
              <div className="w-full text-center text-gray-500 font-semibold py-4 rounded-2xl border-2 border-white/10 bg-white/5 mb-3">
                Out of Stock
              </div>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 mt-1">
              {[
                { icon: <Truck size={16} className="text-blue-400" />, label: 'Free Delivery', sub: 'On orders ₹999+' },
                { icon: <Shield size={16} className="text-green-400" />, label: 'Authentic', sub: '100% genuine' },
                { icon: <RotateCcw size={16} className="text-orange-400" />, label: 'Easy Returns', sub: '7-day policy' },
              ].map((b, i) => (
                <div key={i} className="flex flex-col items-center text-center bg-white/5 rounded-xl p-2.5 border border-white/10">
                  {b.icon}
                  <div className="text-gray-300 text-xs font-semibold mt-1">{b.label}</div>
                  <div className="text-gray-500 text-[10px]">{b.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs: Description / Reviews ── */}
        <div className="mt-12 bg-[#111318] rounded-2xl border border-white/10 overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-white/10">
            {['description', 'reviews'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-4 text-sm font-semibold capitalize transition-all border-b-2 -mb-px ${
                  tab === t
                    ? 'border-blue-500 text-blue-400 bg-blue-500/8'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                {t === 'reviews' ? `Reviews (${product.reviewCount || 0})` : 'Description'}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8">
            {tab === 'description' ? (
              <div>
                {product.description ? (
                  <p className="text-gray-300 leading-relaxed">{product.description}</p>
                ) : (
                  <p className="text-gray-600 italic text-sm">No description available.</p>
                )}
              </div>
            ) : (
              <div>
                {product.reviews?.length > 0 ? (
                  <div className="space-y-4">
                    {product.reviews.map((r, i) => (
                      <div key={i} className="border border-white/10 rounded-xl p-4 bg-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                              {r.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div className="text-white font-semibold text-sm">{r.name}</div>
                              <div className="text-gray-500 text-xs">{new Date(r.date).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <StarRating rating={r.rating} size={13} />
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star size={36} className="text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No reviews yet. Be the first to review!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
