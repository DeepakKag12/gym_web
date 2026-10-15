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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] pt-16 transition-colors duration-200">

      {/* ── Breadcrumb ── */}
      <div className="bg-[var(--surface)] border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium">
          <Link to="/" className="hover:text-[var(--primary)] transition-colors">Home</Link>
          <ChevronRight size={13} className="text-[var(--border)]" />
          <Link to="/store" className="hover:text-[var(--primary)] transition-colors">Store</Link>
          <ChevronRight size={13} className="text-[var(--border)]" />
          {product.category && (
            <>
              <Link to={`/store?category=${product.category}`} className="hover:text-[var(--primary)] capitalize transition-colors">{product.category}</Link>
              <ChevronRight size={13} className="text-[var(--border)]" />
            </>
          )}
          <span className="text-[var(--text-primary)] font-semibold line-clamp-1 max-w-xs">{product.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">

          {/* ── Images panel ── */}
          <div>
            {/* Main image */}
            <div className="relative bg-[var(--surface-raised)] rounded-lg overflow-hidden border border-[var(--border)] mb-3"
                 style={{ aspectRatio: '1/1' }}>
              {product.images?.[activeImg] ? (
                <motion.img
                  key={activeImg}
                  initial={{ opacity: 0.8, scale: 1.01 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  src={product.images[activeImg]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[var(--text-muted)]">
                  <Package size={48} />
                  <span className="text-xs">No image uploaded</span>
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {discount > 0 && (
                  <span className="bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                    {discount}% OFF
                  </span>
                )}
                {product.isFeatured && (
                  <span className="bg-[var(--primary)] text-white text-[11px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
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
                    className={`w-16 h-16 rounded-md overflow-hidden border-2 flex-shrink-0 transition-all ${
                      activeImg === i ? 'border-[var(--primary)]' : 'border-[var(--border)] opacity-60 hover:opacity-100'
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
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {product.brand && (
                <span className="text-[var(--text-muted)] text-[11px] font-bold uppercase tracking-wider bg-[var(--surface-raised)] border border-[var(--border)] px-2.5 py-0.5 rounded-sm">
                  {product.brand}
                </span>
              )}
              {product.stock > 0
                ? <span className="text-emerald-500 text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-sm flex items-center gap-1"><CheckCircle size={11} /> In Stock</span>
                : <span className="text-rose-500 text-xs font-semibold bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-sm">Out of Stock</span>
              }
            </div>

            <h1 className="text-[var(--text-primary)] font-bold text-2xl sm:text-3xl leading-tight mb-3">{product.name}</h1>

            {product.rating > 0 && (
              <div className="mb-4">
                <StarRating rating={product.rating} count={product.reviewCount} />
              </div>
            )}

            {/* Price block */}
            <div className="flex items-center gap-3 mb-5 pb-5 border-b border-[var(--border)]">
              <span className="text-[var(--text-primary)] font-black text-3xl sm:text-4xl">₹{product.discountPrice || product.price}</span>
              {product.discountPrice && (
                <>
                  <span className="text-[var(--text-muted)] line-through text-lg">₹{product.price}</span>
                  <span className="bg-emerald-500/10 text-[var(--primary)] text-xs font-bold px-2 py-0.5 rounded-sm border border-emerald-500/20">
                    Save ₹{product.price - product.discountPrice}
                  </span>
                </>
              )}
            </div>

            {/* Flavor */}
            {product.flavors?.length > 0 && (
              <div className="mb-4">
                <div className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-wider mb-2">
                  Flavor: <span className="text-[var(--primary)] font-bold">{flavor}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {product.flavors.map(f => (
                    <button
                      key={f}
                      onClick={() => setFlavor(f)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
                        flavor === f
                          ? 'border-[var(--primary)] bg-[var(--surface-raised)] text-[var(--primary)] font-semibold'
                          : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-subtle)] bg-[var(--surface)]'
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
                <div className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-wider mb-2">
                  Size: <span className="text-[var(--primary)] font-bold">{weight}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {product.weights.map(w => (
                    <button
                      key={w}
                      onClick={() => setWeight(w)}
                      className={`px-3.5 py-1.5 rounded-md text-xs font-semibold border transition-all ${
                        weight === w
                          ? 'border-[var(--primary)] bg-[var(--surface-raised)] text-[var(--primary)]'
                          : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-subtle)] bg-[var(--surface)]'
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
              <div className="flex items-center border border-[var(--border)] rounded-md overflow-hidden bg-[var(--surface)]">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)] transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center text-[var(--text-primary)] font-bold text-sm">{qty}</span>
                <button
                  onClick={() => setQty(q => q + 1)}
                  className="w-10 h-10 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)] transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
              <span className="text-[var(--text-muted)] text-xs">{product.stock > 0 ? `${product.stock} units available` : ''}</span>
            </div>

            {product.stock > 0 ? (
              <button
                onClick={handleAdd}
                className="btn-fire w-full py-3.5 text-sm font-bold rounded-md mb-4 flex items-center justify-center gap-2 shadow-xs"
              >
                <ShoppingCart size={18} /> Add {qty} to Cart · ₹{((product.discountPrice || product.price) * qty).toFixed(0)}
              </button>
            ) : (
              <div className="w-full text-center text-[var(--text-muted)] font-semibold py-3.5 rounded-md border border-[var(--border)] bg-[var(--surface)] mb-4 text-sm">
                Out of Stock
              </div>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 mt-1">
              {[
                { icon: <Truck size={15} className="text-[var(--primary)]" />, label: 'Fast Dispatch', sub: 'Orders ₹999+' },
                { icon: <Shield size={15} className="text-emerald-500" />, label: '100% Genuine', sub: 'Lab certified' },
                { icon: <RotateCcw size={15} className="text-amber-500" />, label: 'Easy Support', sub: 'Gym floor return' },
              ].map((b, i) => (
                <div key={i} className="flex flex-col items-center text-center bg-[var(--surface)] rounded-md p-2.5 border border-[var(--border)]">
                  {b.icon}
                  <div className="text-[var(--text-primary)] text-xs font-semibold mt-1">{b.label}</div>
                  <div className="text-[var(--text-muted)] text-[10px]">{b.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs: Description / Reviews ── */}
        <div className="mt-12 bg-[var(--surface)] rounded-lg border border-[var(--border)] overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-[var(--border)]">
            {['description', 'reviews'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider capitalize transition-all border-b-2 -mb-px ${
                  tab === t
                    ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--surface-raised)]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
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
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{product.description}</p>
                ) : (
                  <p className="text-[var(--text-muted)] italic text-sm">No description available.</p>
                )}
              </div>
            ) : (
              <div>
                {product.reviews?.length > 0 ? (
                  <div className="space-y-4">
                    {product.reviews.map((r, i) => (
                      <div key={i} className="border border-[var(--border)] rounded-md p-4 bg-[var(--surface-raised)]">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] font-bold text-xs">
                              {r.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div className="text-[var(--text-primary)] font-semibold text-xs">{r.name}</div>
                              <div className="text-[var(--text-muted)] text-[10px]">{new Date(r.date).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <StarRating rating={r.rating} size={12} />
                        </div>
                        <p className="text-[var(--text-secondary)] text-xs sm:text-sm leading-relaxed">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star size={32} className="text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
                    <p className="text-[var(--text-muted)] text-xs">No reviews yet. Be the first to review!</p>
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
