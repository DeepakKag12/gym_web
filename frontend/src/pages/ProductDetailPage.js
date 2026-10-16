import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Package, CheckCircle, Truck, Shield, RotateCcw, ChevronRight, Minus, Plus } from 'lucide-react';
import API from '../utils/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { img as cld } from '../utils/img';

function StarRating({ rating, count, size = 15 }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(s => (
          <Star key={s} size={size} className={s <= Math.round(rating) ? 'star-filled' : 'star-empty'} fill={s <= Math.round(rating) ? '#f59e0b' : 'none'} />
        ))}
      </div>
      <span className="text-[var(--text-secondary)] text-sm font-medium">{rating.toFixed(1)}</span>
      {count !== undefined && <span className="text-[var(--text-muted)] text-xs">({count} reviews)</span>}
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
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center pt-16">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        <p className="text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider">Loading product…</p>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center gap-4 pt-16">
      <Package size={44} className="text-[var(--text-muted)]" />
      <p className="text-[var(--text-secondary)] font-medium text-sm">Product not found</p>
      <Link to="/store" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-xs font-semibold">
        ← Back to Store
      </Link>
    </div>
  );

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAdd = () => {
    addToCart(product, qty, flavor, weight);
    toast.success(`${product.name} added to cart!`, {
      style: { background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' },
      iconTheme: { primary: 'var(--primary)', secondary: '#fff' },
    });
  };

  return (
    <div className="min-h-screen bg-white text-oris-secondary relative font-sans selection:bg-[#3365e2] selection:text-white">
      {/* ── Landing Page White & Blue Hero Header ── */}
      <div className="relative overflow-hidden pt-28 sm:pt-36 pb-12 sm:pb-16 bg-[linear-gradient(to_bottom,#ffffff_0%,#eff6ff_20%,#bfdbfe_45%,#60a5fa_70%,#3365e2_100%)] text-slate-900 border-b border-[#3365e2]/20">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#15324d_1.2px,transparent_1.2px)] [background-size:24px_24px] pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          {/* Breadcrumb */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-semibold mb-4">
            <Link to="/" className="hover:text-[#3365e2] transition-colors">Home</Link>
            <ChevronRight size={13} className="text-slate-400" />
            <Link to="/store" className="hover:text-[#3365e2] transition-colors">Store</Link>
            {product.category && (
              <>
                <ChevronRight size={13} className="text-slate-400" />
                <Link to={`/store?category=${product.category}`} className="hover:text-[#3365e2] capitalize transition-colors font-semibold">{product.category}</Link>
              </>
            )}
            <ChevronRight size={13} className="text-slate-400" />
            <span className="text-slate-900 font-bold line-clamp-1 max-w-xs">{product.name}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            {product.category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#3365e2]/30 text-[#3365e2] text-xs font-bold uppercase tracking-wider shadow-xs">
                {product.category}
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 border border-emerald-500/30 text-emerald-700 text-xs font-bold shadow-xs">
              <CheckCircle size={12} className="text-emerald-600" /> 100% Authentic Gym Grade
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight uppercase leading-tight mb-2">
            {product.name}
          </h1>
          <p className="text-sm sm:text-base text-slate-700 max-w-2xl leading-relaxed font-medium">
            {product.brand ? `Official ${product.brand} formulation · Lab tested and verified for performance output.` : 'Lab tested and verified athletic nutrition and equipment.'}
          </p>
        </div>
      </div>

      <div className="bg-[#f8fafc] text-slate-800 min-h-[60vh]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <Link
            to="/store"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-[#3365e2] mb-6 transition-colors"
          >
            ← Back to Store
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">

          {/* ── Images panel ── */}
          <div>
            {/* Main image */}
            <div className="relative bg-white rounded-2xl overflow-hidden border border-slate-200/90 mb-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
                 style={{ aspectRatio: '1/1' }}>
              {product.images?.[activeImg] ? (
                <motion.img
                  key={activeImg}
                  initial={{ opacity: 0.8, scale: 1.01 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  src={product.images[activeImg]}
                  alt={product.name}
                  className="w-full h-full object-contain p-6"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Package size={48} />
                  <span className="text-xs">No image uploaded</span>
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                {discount > 0 && (
                  <span className="bg-[#3365e2] text-white text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">
                    {discount}% OFF
                  </span>
                )}
                {product.isFeatured && (
                  <span className="bg-[#15324d] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                    Featured
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail row */}
            {product.images?.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      activeImg === i ? 'border-[#3365e2] shadow-sm' : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={cld(img, 800)} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product info panel ── */}
          <div className="flex flex-col">

            {/* Brand + badges */}
            <div className="flex items-center gap-2 mb-2.5 flex-wrap">
              {product.brand && (
                <span className="text-[#3365e2] text-xs font-bold uppercase tracking-wider bg-[#eff4fe] border border-[#3365e2]/25 px-3 py-0.5 rounded-full">
                  {product.brand}
                </span>
              )}
              {product.stock > 0
                ? <span className="text-emerald-700 text-xs font-bold bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-0.5 rounded-full flex items-center gap-1"><CheckCircle size={12} /> In Stock · Ready to Dispatch</span>
                : <span className="text-rose-700 text-xs font-bold bg-rose-500/15 border border-rose-500/25 px-2.5 py-0.5 rounded-full">Out of Stock</span>
              }
            </div>

            <h1 className="text-slate-900 font-black text-2xl sm:text-3xl lg:text-4xl leading-tight mb-3">
              {product.name}
            </h1>

            {product.rating > 0 && (
              <div className="mb-4">
                <StarRating rating={product.rating} count={product.reviewCount} />
              </div>
            )}

            {/* Price block */}
            <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-slate-200/80">
              <span className="text-slate-900 font-black text-3xl sm:text-4xl tabular-nums">
                ₹{product.discountPrice || product.price}
              </span>
              {product.discountPrice && (
                <>
                  <span className="text-slate-400 line-through text-lg font-medium tabular-nums">₹{product.price}</span>
                  <span className="bg-emerald-500/15 text-emerald-700 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/25">
                    Save ₹{product.price - product.discountPrice}
                  </span>
                </>
              )}
            </div>

            {/* Flavor */}
            {product.flavors?.length > 0 && (
              <div className="mb-4">
                <div className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
                  Flavor: <span className="text-[#3365e2] font-black">{flavor}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {product.flavors.map(f => (
                    <button
                      key={f}
                      onClick={() => setFlavor(f)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        flavor === f
                          ? 'border-[#3365e2] bg-[#eff4fe] text-[#3365e2] shadow-xs'
                          : 'border-slate-200 text-slate-700 hover:border-[#3365e2]/40 bg-white'
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
                <div className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
                  Size: <span className="text-[#3365e2] font-black">{weight}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {product.weights.map(w => (
                    <button
                      key={w}
                      onClick={() => setWeight(w)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        weight === w
                          ? 'border-[#3365e2] bg-[#eff4fe] text-[#3365e2] shadow-xs'
                          : 'border-slate-200 text-slate-700 hover:border-[#3365e2]/40 bg-white'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty + CTA */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center text-slate-900 font-extrabold text-sm">{qty}</span>
                <button
                  onClick={() => setQty(q => q + 1)}
                  className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
              <span className="text-slate-500 text-xs font-medium">{product.stock > 0 ? `${product.stock} units available` : ''}</span>
            </div>

            {product.stock > 0 ? (
              <button
                onClick={handleAdd}
                className="group relative overflow-hidden w-full py-3.5 text-sm font-extrabold rounded-full mb-5 flex items-center justify-center gap-2 bg-[#3365e2] text-white shadow-[0_8px_20px_rgba(51,101,226,0.3)] transition-all active:scale-[0.99] cursor-pointer"
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
                  <ShoppingCart size={17} className="transition-transform group-hover:scale-110" />
                  <span>Add {qty} to Cart · ₹{((product.discountPrice || product.price) * qty).toFixed(0)}</span>
                </span>
              </button>
            ) : (
              <div className="w-full text-center text-slate-400 font-bold py-3.5 rounded-full border border-slate-200 bg-slate-100 mb-5 text-sm">
                Out of Stock
              </div>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { icon: <Truck size={16} className="text-[#3365e2]" />, label: 'Fast Dispatch', sub: 'Orders ₹999+' },
                { icon: <Shield size={16} className="text-emerald-500" />, label: '100% Genuine', sub: 'Lab certified' },
                { icon: <RotateCcw size={16} className="text-amber-500" />, label: 'Easy Support', sub: 'Gym floor return' },
              ].map((b, i) => (
                <div key={i} className="flex flex-col items-center text-center bg-white rounded-xl p-3 border border-slate-200/90 shadow-xs">
                  {b.icon}
                  <div className="text-slate-900 text-xs font-bold mt-1.5">{b.label}</div>
                  <div className="text-slate-500 text-[10.5px] mt-0.5">{b.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs: Description / Reviews ── */}
        <div className="mt-12 bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
          {/* Tab bar */}
          <div className="flex border-b border-slate-200 bg-slate-50">
            {['description', 'reviews'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider capitalize transition-all border-b-2 -mb-px cursor-pointer ${
                  tab === t
                    ? 'border-[#3365e2] text-[#3365e2] bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
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
                  <p className="text-slate-700 text-sm leading-relaxed">{product.description}</p>
                ) : (
                  <p className="text-slate-400 italic text-sm">No description available.</p>
                )}
              </div>
            ) : (
              <div>
                {product.reviews?.length > 0 ? (
                  <div className="space-y-4">
                    {product.reviews.map((r, i) => (
                      <div key={i} className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/60">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#3365e2] font-bold text-xs">
                              {r.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div className="text-slate-900 font-bold text-xs">{r.name}</div>
                              <div className="text-slate-400 text-[10px]">{new Date(r.date).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <StarRating rating={r.rating} size={12} />
                        </div>
                        <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star size={32} className="text-slate-300 mx-auto mb-2 opacity-50" />
                    <p className="text-slate-400 text-xs">No reviews yet. Be the first to review!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
