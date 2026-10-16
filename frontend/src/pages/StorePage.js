import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, ShoppingCart, ShoppingBag, X, Zap, Shield, Truck, RotateCcw } from 'lucide-react';
import { cachedGet } from '../utils/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { img } from '../utils/img';
import PillButton from '../components/ui/PillButton';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const CATEGORIES = [
  { key: 'all',          label: 'All Products' },
  { key: 'protein',      label: 'Protein' },
  { key: 'creatine',     label: 'Creatine' },
  { key: 'pre-workout',  label: 'Pre-Workout' },
  { key: 'vitamins',     label: 'Vitamins' },
  { key: 'weight-gainer',label: 'Weight Gainer' },
  { key: 'fat-burner',   label: 'Fat Burner' },
  { key: 'bcaa',         label: 'BCAA' },
  { key: 'accessories',  label: 'Accessories' },
  { key: 'apparel',      label: 'Apparel' },
];

const TRUST_BADGES = [
  { icon: <Truck size={16} />,     label: 'Free delivery on ₹999+' },
  { icon: <Shield size={16} />,    label: '100% Authentic' },
  { icon: <RotateCcw size={16} />, label: '7-day returns' },
  { icon: <Zap size={16} />,       label: 'Same-day dispatch' },
];


const ProductCard = React.memo(function ProductCard({ product, onAdd }) {
  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="product-card group flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(51,101,226,0.14)] hover:border-[#3365e2]/50 hover:-translate-y-1 transition-all duration-300">
      {/* ── Compact image area with fixed proportion ── */}
      <Link to={`/store/${product._id}`} className="block relative overflow-hidden flex-shrink-0 h-44 sm:h-48 bg-slate-50 border-b border-slate-100">
        <div className="absolute inset-0 p-3 flex items-center justify-center">
          {product.images?.[0] ? (
            <img
              src={img(product.images[0], 400)}
              alt={product.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-slate-400">
              <ShoppingBag size={32} />
              <span className="text-[11px]">No image</span>
            </div>
          )}
        </div>

        {/* Floating Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 pointer-events-none">
          {discount > 0 && (
            <span className="text-[10px] font-extrabold bg-[#3365e2] text-white px-2 py-0.5 rounded-full shadow-sm tracking-wide">
              {discount}% OFF
            </span>
          )}
          {product.isFeatured && (
            <span className="text-[9px] font-extrabold bg-[#15324d] text-white px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              Featured
            </span>
          )}
        </div>

        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs z-20">
            <span className="text-xs font-bold px-3 py-1 rounded-full text-white bg-slate-900/90 border border-white/20 shadow-md">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* ── Balanced, high-density info container ── */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Top category & rating row */}
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#3365e2] bg-[#eff4fe] px-2 py-0.5 rounded-md truncate max-w-[130px]">
              {product.brand || product.category || 'FitNation'}
            </span>
            {product.rating > 0 ? (
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                <Star size={11} fill="#f59e0b" />
                <span>{product.rating.toFixed(1)}</span>
                {product.reviewCount ? (
                  <span className="text-[10px] text-slate-400 font-normal">({product.reviewCount})</span>
                ) : null}
              </div>
            ) : (
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                Authentic
              </span>
            )}
          </div>

          {/* Title */}
          <Link to={`/store/${product._id}`}>
            <h3 className="font-bold text-sm leading-snug line-clamp-2 text-slate-900 group-hover:text-[#3365e2] transition-colors mb-2 min-h-[2.5rem]">
              {product.name}
            </h3>
          </Link>

          {/* Feature / Flavors Pill row (ensures zero empty space) */}
          <div className="mb-2">
            {product.flavors?.length > 0 ? (
              <div className="flex gap-1 flex-wrap">
                {product.flavors.slice(0, 2).map(f => (
                  <span
                    key={f}
                    className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-700 border border-slate-200/80 truncate max-w-[100px]"
                  >
                    {f}
                  </span>
                ))}
                {product.flavors.length > 2 && (
                  <span className="text-[10px] font-medium text-slate-400 self-center">
                    +{product.flavors.length - 2}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <Shield size={11} className="text-[#3365e2] shrink-0" />
                <span className="truncate">100% Genuine · Fast Dispatch</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Price and Quick Action Bar ── */}
        <div className="pt-2.5 mt-auto border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-base sm:text-lg text-slate-900 tabular-nums">
                ₹{product.discountPrice || product.price}
              </span>
              {product.discountPrice && (
                <span className="line-through text-[11px] text-slate-400 font-medium tabular-nums">
                  ₹{product.price}
                </span>
              )}
            </div>
            {discount > 0 ? (
              <span className="text-[10px] font-bold text-emerald-600 block">
                Save ₹{product.price - product.discountPrice}
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 block font-normal">
                Tax inclusive
              </span>
            )}
          </div>

          {product.stock > 0 ? (
            <PillButton
              size="sm"
              onClick={() => onAdd(product)}
              btnText="Add to Cart"
              icon={<ShoppingCart size={13} />}
              showDot={false}
              className="shrink-0"
            />
          ) : (
            <button
              disabled
              className="text-[11px] font-bold text-slate-400 py-1.5 px-3 rounded-full bg-slate-100 border border-slate-200/60 cursor-not-allowed shrink-0"
            >
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

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

  const handleAdd = useCallback((product) => {
    addToCart(product, 1);
    toast.success(`${product.name} added!`, {
      iconTheme: { primary: 'var(--color-primary, #3365e2)', secondary: '#fff' },
    });
  }, [addToCart]);

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
    <div className="min-h-screen bg-white text-oris-secondary relative font-sans selection:bg-[#3365e2] selection:text-white">

      {/* ── Landing Page White & Blue Hero Header ── */}
      <div className="relative overflow-hidden pt-28 sm:pt-36 pb-16 sm:pb-20 bg-[linear-gradient(to_bottom,#ffffff_0%,#eff6ff_20%,#bfdbfe_45%,#60a5fa_70%,#3365e2_100%)] text-slate-900 border-b border-[#3365e2]/20">
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#15324d_1.2px,transparent_1.2px)] [background-size:24px_24px]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#3365e2]/30 text-[#3365e2] text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
                <Zap size={13} className="text-[#3365e2]" />
                <span>100% Authentic Gym Grade Supplements</span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-3 uppercase">
                ATHLETIC SUPPLEMENT <span className="text-[#3365e2]">STORE</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
                Lab-tested proteins, creatine monohydrate, and pre-workouts · Fast direct gym dispatch at Rajgarh athletic center.
              </p>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
              {TRUST_BADGES.map((b, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-white/80 bg-white/90 text-slate-800 backdrop-blur-md shadow-xs"
                >
                  <span className="text-[#3365e2] shrink-0">{b.icon}</span>
                  <span className="text-xs font-bold whitespace-nowrap">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#f8fafc] text-slate-800 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 pb-20">

        {/* ── Search + Sort + Cart ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              className="bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#3365e2] focus:ring-2 focus:ring-[#3365e2]/20 rounded-xl pl-10 pr-10 h-11 text-sm w-full outline-none transition-all shadow-xs"
              placeholder="Search products or brands…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Clear search">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="bg-white border border-slate-300 text-slate-800 focus:border-[#3365e2] focus:ring-2 focus:ring-[#3365e2]/20 rounded-xl h-11 px-4 text-sm outline-none transition-all shadow-xs cursor-pointer"
            style={{ width: 'auto' }}
          >
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="rating">Top Rated</option>
            <option value="discount">Best Discount</option>
          </select>

          {/* Cart */}
          <Link
            to="/cart"
            className="h-11 flex items-center gap-2 px-5 rounded-full text-sm font-semibold transition-all btn-outline bg-white shadow-xs"
            style={{ minWidth: 'fit-content' }}
          >
            <ShoppingCart size={16} />
            <span>Cart</span>
            {count > 0 && (
              <span className="w-5 h-5 text-[10px] font-bold rounded-full flex items-center justify-center text-white bg-[#3365e2]">
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
              {cat.label}
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
            <span className="text-sm font-medium" style={{ color: 'var(--color-primary, #3365e2)' }}>
              Results for "<strong>{search}</strong>"
            </span>
          )}
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingBag size={52} className="mx-auto mb-4" style={{ color: 'var(--border)' }} />
            <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--muted2)' }}>No products found</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>Try a different category or search term</p>
            <button onClick={() => { setSearch(''); setCategory('all'); }} className="btn-secondary text-sm px-6 py-2.5">
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
              className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
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
  </div>
  );
}
