import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, ShoppingCart, ShoppingBag, X, Zap, Shield, Truck, RotateCcw } from 'lucide-react';
import { cachedGet } from '../utils/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const CATEGORIES = [
  { key: 'all',          label: 'All Products',  icon: '🏪' },
  { key: 'protein',      label: 'Protein',        icon: '💪' },
  { key: 'creatine',     label: 'Creatine',       icon: '⚡' },
  { key: 'pre-workout',  label: 'Pre-Workout',    icon: '🔥' },
  { key: 'vitamins',     label: 'Vitamins',       icon: '💊' },
  { key: 'weight-gainer',label: 'Weight Gainer',  icon: '📈' },
  { key: 'fat-burner',   label: 'Fat Burner',     icon: '🌡️' },
  { key: 'bcaa',         label: 'BCAA',           icon: '🧬' },
  { key: 'accessories',  label: 'Accessories',    icon: '🎽' },
  { key: 'apparel',      label: 'Apparel',        icon: '👕' },
];

const TRUST_BADGES = [
  { icon: <Truck size={16} />,     label: 'Free delivery on ₹999+' },
  { icon: <Shield size={16} />,    label: '100% Authentic' },
  { icon: <RotateCcw size={16} />, label: '7-day returns' },
  { icon: <Zap size={16} />,       label: 'Same-day dispatch' },
];

function StarRating({ rating, count }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(s => (
          <Star key={s} size={12}
            className={s <= Math.round(rating) ? 'star-filled' : 'star-empty'}
            fill={s <= Math.round(rating) ? '#f59e0b' : 'none'}
          />
        ))}
      </div>
      {count !== undefined && <span className="text-xs" style={{ color: 'var(--muted)' }}>({count})</span>}
    </div>
  );
}

function ProductCard({ product, onAdd }) {
  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="product-card flex flex-col h-full">
      {/* ── Square image area ── */}
      <Link to={`/store/${product._id}`} className="block relative overflow-hidden flex-shrink-0" style={{ paddingBottom: '100%' }}>
        <div className="absolute inset-0">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} className="product-img w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2" style={{ background: 'var(--bg3)' }}>
              <ShoppingBag size={36} style={{ color: 'var(--border)' }} />
              <span className="text-xs" style={{ color: 'var(--muted)' }}>No image</span>
            </div>
          )}
        </div>
        {/* Overlay gradient at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-12 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(17,19,24,0.6), transparent)' }} />
        {/* Badges */}
        {discount > 0 && <span className="badge-discount">{discount}% OFF</span>}
        {product.isFeatured && <span className="badge-new">★ Featured</span>}
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(11,12,14,0.7)' }}>
            <span className="text-sm font-semibold px-3 py-1 rounded-full"
              style={{ color: 'var(--muted2)', border: '1px solid var(--border)', background: 'var(--bg2)' }}>
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* ── Info ── */}
      <div className="p-4 flex flex-col flex-1">
        {product.brand && (
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--cyan)' }}>
            {product.brand}
          </div>
        )}

        <Link to={`/store/${product._id}`}>
          <h3 className="font-semibold text-sm leading-snug mb-2 line-clamp-2 transition-colors hover:text-cyan-400"
            style={{ color: 'var(--text)' }}>
            {product.name}
          </h3>
        </Link>

        {product.rating > 0 && (
          <div className="mb-2">
            <StarRating rating={product.rating} count={product.reviewCount} />
          </div>
        )}

        {/* Flavors */}
        {product.flavors?.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-3">
            {product.flavors.slice(0, 3).map(f => (
              <span key={f} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ background: 'var(--surface)', color: 'var(--muted2)', border: '1px solid var(--border)' }}>
                {f}
              </span>
            ))}
            {product.flavors.length > 3 && (
              <span className="text-[10px]" style={{ color: 'var(--muted)' }}>+{product.flavors.length - 3} more</span>
            )}
          </div>
        )}

        {/* Price — pushed to bottom */}
        <div className="flex items-baseline gap-2 mt-auto mb-3">
          <span className="font-bold text-lg" style={{ color: 'var(--text)' }}>
            ₹{product.discountPrice || product.price}
          </span>
          {product.discountPrice && (
            <>
              <span className="line-through text-sm" style={{ color: 'var(--muted)' }}>₹{product.price}</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(34,211,238,0.1)', color: 'var(--cyan)' }}>
                Save ₹{product.price - product.discountPrice}
              </span>
            </>
          )}
        </div>

        {/* CTA */}
        {product.stock > 0 ? (
          <button
            onClick={() => onAdd(product)}
            className="btn-fire w-full text-sm py-2.5 rounded-xl gap-2"
          >
            <ShoppingCart size={14} /> Add to Cart
          </button>
        ) : (
          <button disabled
            className="w-full text-center text-sm font-medium py-2.5 rounded-xl cursor-not-allowed"
            style={{ border: '1px solid var(--border)', color: 'var(--muted)', background: 'var(--surface)' }}>
            Out of Stock
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Skeleton loader card ── */
function SkeletonCard() {
  return (
    <div className="product-card animate-pulse">
      <div style={{ paddingBottom: '100%', background: 'var(--bg3)' }} />
      <div className="p-4 space-y-3">
        <div className="h-3 rounded w-1/3" style={{ background: 'var(--bg3)' }} />
        <div className="h-4 rounded w-full" style={{ background: 'var(--bg3)' }} />
        <div className="h-4 rounded w-2/3" style={{ background: 'var(--bg3)' }} />
        <div className="h-10 rounded-xl" style={{ background: 'var(--bg3)' }} />
      </div>
    </div>
  );
}

export default function StorePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [searchParams]          = useSearchParams();
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sort, setSort]         = useState('default');
  const { addToCart, count }    = useCart();
  const debouncedSearch         = useDebounce(search, 250);

  useEffect(() => {
    setLoading(true);
    const q = category !== 'all' ? `?category=${category}` : '';
    cachedGet(`/store${q}`, { cache: 60 })
      .then(r => setProducts(r.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category]);

  const handleAdd = (product) => {
    addToCart(product, 1);
    toast.success(`${product.name} added!`, {
      iconTheme: { primary: '#22d3ee', secondary: '#000' },
    });
  };

  const filtered = useMemo(() => {
    let result = products.filter(p =>
      p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (p.brand || '').toLowerCase().includes(debouncedSearch.toLowerCase())
    );
    if (sort === 'price-asc')  result = [...result].sort((a,b) => (a.discountPrice||a.price) - (b.discountPrice||b.price));
    if (sort === 'price-desc') result = [...result].sort((a,b) => (b.discountPrice||b.price) - (a.discountPrice||a.price));
    if (sort === 'rating')     result = [...result].sort((a,b) => b.rating - a.rating);
    if (sort === 'discount')   result = [...result].sort((a,b) => {
      const da = a.discountPrice ? Math.round(((a.price-a.discountPrice)/a.price)*100) : 0;
      const db = b.discountPrice ? Math.round(((b.price-b.discountPrice)/b.price)*100) : 0;
      return db - da;
    });
    return result;
  }, [products, debouncedSearch, sort]);

  const activeLabel = CATEGORIES.find(c => c.key === category)?.label || 'All';

  return (
    <div className="min-h-screen pt-16" style={{ background: 'var(--bg)' }}>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden" style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
        {/* Glow accents */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-10 right-10 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.07) 0%, transparent 70%)' }} />

        <div className="max-w-7xl mx-auto px-6 py-14 relative">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <div className="section-pill mb-3">
                <Zap size={11} /> Premium Supplements
              </div>
              <h1 className="gym-font text-5xl md:text-7xl mb-2">
                SUPPLEMENT <span className="gradient-text">STORE</span>
              </h1>
              <p className="text-base" style={{ color: 'var(--muted2)' }}>
                Authentic products · Fast delivery · Best prices
              </p>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3">
              {TRUST_BADGES.map((b, i) => (
                <div key={i} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--cyan)' }}>
                  {b.icon}
                  <span className="text-xs font-medium whitespace-nowrap" style={{ color: 'var(--muted2)' }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Search + Sort + Cart ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
            <input
              className="input-dark pl-10 h-11"
              placeholder="Search products or brands…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 icon-btn"
                style={{ color: 'var(--muted)' }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="input-dark h-11 px-4 text-sm"
            style={{ width: 'auto' }}
          >
            <option value="default"    style={{ background: '#fff', color: '#111' }}>Sort: Default</option>
            <option value="price-asc"  style={{ background: '#fff', color: '#111' }}>Price: Low → High</option>
            <option value="price-desc" style={{ background: '#fff', color: '#111' }}>Price: High → Low</option>
            <option value="rating"     style={{ background: '#fff', color: '#111' }}>Top Rated</option>
            <option value="discount"   style={{ background: '#fff', color: '#111' }}>Best Discount</option>
          </select>

          {/* Cart */}
          <Link
            to="/cart"
            className="h-11 flex items-center gap-2 px-5 rounded-xl text-sm font-semibold transition-all btn-outline"
            style={{ minWidth: 'fit-content' }}
          >
            <ShoppingCart size={16} />
            Cart
            {count > 0 && (
              <span className="w-5 h-5 text-[10px] font-bold rounded-full flex items-center justify-center"
                style={{ background: 'var(--cyan)', color: '#000' }}>
                {count}
              </span>
            )}
          </Link>
        </div>

        {/* ── Category pills ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`cat-pill flex items-center gap-1.5 flex-shrink-0 ${category === cat.key ? 'active' : ''}`}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>

        {/* ── Results count ── */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {loading ? 'Loading…' : (
              <><span style={{ color: 'var(--text)' }} className="font-semibold">{filtered.length}</span> products in {activeLabel}</>
            )}
          </p>
          {search && (
            <span className="text-sm font-medium" style={{ color: 'var(--cyan)' }}>
              Results for "<strong>{search}</strong>"
            </span>
          )}
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingBag size={52} className="mx-auto mb-4" style={{ color: 'var(--border)' }} />
            <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--muted2)' }}>No products found</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>Try a different category or search term</p>
            <button onClick={() => { setSearch(''); setCategory('all'); }} className="btn-fire text-sm px-6 py-2.5">
              Show all products
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={category + search + sort}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"
            >
              {filtered.map((p, i) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  className="flex"
                  style={{ minWidth: 0 }}
                >
                  <div className="w-full">
                    <ProductCard product={p} onAdd={handleAdd} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
