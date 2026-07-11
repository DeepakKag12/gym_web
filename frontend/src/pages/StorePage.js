import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, ShoppingCart, ShoppingBag, SlidersHorizontal, X, ChevronRight, Zap, Shield, Truck, RotateCcw } from 'lucide-react';
import API from '../utils/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

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
  { icon: <Truck size={18} className="text-blue-600" />,    label: 'Free delivery on ₹999+' },
  { icon: <Shield size={18} className="text-green-600" />,  label: '100% Authentic products' },
  { icon: <RotateCcw size={18} className="text-orange-500" />, label: 'Easy 7-day returns' },
  { icon: <Zap size={18} className="text-purple-600" />,    label: 'Same-day dispatch' },
];

function StarRating({ rating, count, size = 13 }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(s => (
          <Star key={s} size={size} className={s <= Math.round(rating) ? 'star-filled' : 'star-empty'} fill={s <= Math.round(rating) ? '#f59e0b' : 'none'} />
        ))}
      </div>
      {count !== undefined && <span className="text-gray-400 text-xs">({count})</span>}
    </div>
  );
}

function ProductCard({ product, onAdd }) {
  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="product-card flex flex-col h-full">
      {/* Image */}
      <Link to={`/store/${product._id}`} className="block relative overflow-hidden bg-gray-50" style={{ paddingBottom: '100%' }}>
        <div className="absolute inset-0">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="product-img w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-50 to-indigo-50">
              <ShoppingBag size={40} className="text-blue-200" />
              <span className="text-xs text-gray-300 font-medium">No image</span>
            </div>
          )}
        </div>
        {/* Badges */}
        {discount > 0 && <span className="badge-discount">{discount}% OFF</span>}
        {product.isFeatured && <span className="badge-new">★ Featured</span>}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-gray-500 font-semibold text-sm bg-white px-3 py-1 rounded-full border">Out of Stock</span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        {product.brand && (
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">{product.brand}</div>
        )}
        <Link to={`/store/${product._id}`}>
          <h3 className="text-gray-900 font-semibold text-sm leading-snug mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.rating > 0 && (
          <div className="mb-2">
            <StarRating rating={product.rating} count={product.reviewCount} />
          </div>
        )}

        {/* Flavors preview */}
        {product.flavors?.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-2">
            {product.flavors.slice(0, 3).map(f => (
              <span key={f} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{f}</span>
            ))}
            {product.flavors.length > 3 && <span className="text-[10px] text-gray-400">+{product.flavors.length - 3}</span>}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto mb-3">
          <span className="text-gray-900 font-bold text-lg">₹{product.discountPrice || product.price}</span>
          {product.discountPrice && (
            <>
              <span className="text-gray-400 line-through text-sm">₹{product.price}</span>
              <span className="text-green-600 text-xs font-semibold bg-green-50 px-1.5 py-0.5 rounded">Save ₹{product.price - product.discountPrice}</span>
            </>
          )}
        </div>

        {/* CTA */}
        {product.stock > 0 ? (
          <button
            onClick={() => onAdd(product)}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-200"
          >
            <ShoppingCart size={15} /> Add to Cart
          </button>
        ) : (
          <button disabled className="w-full text-center text-gray-400 text-sm font-medium py-2.5 rounded-xl border border-gray-200 bg-gray-50 cursor-not-allowed">
            Out of Stock
          </button>
        )}
      </div>
    </div>
  );
}

export default function StorePage() {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [searchParams]            = useSearchParams();
  const [category, setCategory]   = useState(searchParams.get('category') || 'all');
  const [sort, setSort]           = useState('default');
  const [showFilter, setShowFilter] = useState(false);
  const { addToCart, count }      = useCart();

  useEffect(() => {
    setLoading(true);
    const q = category !== 'all' ? `?category=${category}` : '';
    API.get(`/store${q}`)
      .then(r => setProducts(r.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category]);

  const handleAdd = (product) => {
    addToCart(product, 1);
    toast.success(`${product.name} added!`, {
      style: { background: '#fff', color: '#111', border: '1px solid #e2e8f0' },
      iconTheme: { primary: '#2563eb', secondary: '#fff' },
    });
  };

  let filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.brand || '').toLowerCase().includes(search.toLowerCase())
  );
  if (sort === 'price-asc')  filtered = [...filtered].sort((a,b) => (a.discountPrice||a.price) - (b.discountPrice||b.price));
  if (sort === 'price-desc') filtered = [...filtered].sort((a,b) => (b.discountPrice||b.price) - (a.discountPrice||a.price));
  if (sort === 'rating')     filtered = [...filtered].sort((a,b) => b.rating - a.rating);
  if (sort === 'discount')   filtered = [...filtered].sort((a,b) => {
    const da = a.discountPrice ? Math.round(((a.price-a.discountPrice)/a.price)*100) : 0;
    const db = b.discountPrice ? Math.round(((b.price-b.discountPrice)/b.price)*100) : 0;
    return db - da;
  });

  const activeLabel = CATEGORIES.find(c => c.key === category)?.label || 'All';

  return (
    <div className="min-h-screen bg-gray-50 pt-16">

      {/* ── Hero banner ── */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="section-pill !bg-white/20 !text-white mb-2">
                <Zap size={12} /> Premium Supplements
              </div>
              <h1 className="gym-font text-5xl md:text-6xl mb-2">SUPPLEMENT <span className="text-cyan-300">STORE</span></h1>
              <p className="text-blue-100 text-base">Authentic products · Fast delivery · Best prices</p>
            </div>
            <div className="flex gap-4 flex-wrap">
              {TRUST_BADGES.slice(0,2).map((b,i) => (
                <div key={i} className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2.5 backdrop-blur-sm border border-white/20">
                  <span className="text-white">{b.icon}</span>
                  <span className="text-white text-sm font-medium">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Trust strip ── */}
      <div className="trust-strip">
        <div className="max-w-7xl mx-auto px-6 py-3 flex gap-6 overflow-x-auto">
          {TRUST_BADGES.map((b,i) => (
            <div key={i} className="flex items-center gap-2 flex-shrink-0">
              {b.icon}
              <span className="text-gray-700 text-xs font-medium whitespace-nowrap">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* ── Search + controls ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input-light pl-10 h-11"
              placeholder="Search products or brands…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={15} />
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="h-11 px-4 pr-8 rounded-xl border-1.5 border-gray-200 bg-white text-gray-700 text-sm font-medium outline-none focus:border-blue-500 cursor-pointer"
            style={{ border: '1.5px solid #e2e8f0' }}
          >
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="discount">Best Discount</option>
          </select>

          {/* Cart button */}
          <Link
            to="/cart"
            className="h-11 flex items-center gap-2 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 hover:text-blue-600 px-5 rounded-xl text-sm font-semibold transition-all"
          >
            <ShoppingCart size={17} />
            Cart
            {count > 0 && (
              <span className="w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{count}</span>
            )}
          </Link>
        </div>

        {/* ── Category scrollable pills ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
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

        {/* ── Results header ── */}
        <div className="flex items-center justify-between mb-5">
          <div className="text-gray-500 text-sm">
            {loading ? 'Loading…' : (
              <span><span className="text-gray-900 font-semibold">{filtered.length}</span> products in {activeLabel}</span>
            )}
          </div>
          {search && (
            <span className="text-sm text-blue-600 font-medium">
              Results for "<span className="font-bold">{search}</span>"
            </span>
          )}
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="product-card animate-pulse">
                <div className="bg-gray-100" style={{ paddingBottom: '100%' }} />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="h-10 bg-gray-100 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingBag size={56} className="text-gray-200 mx-auto mb-4" />
            <h3 className="text-gray-500 font-semibold text-lg mb-2">No products found</h3>
            <p className="text-gray-400 text-sm mb-4">Try a different category or search term</p>
            <button onClick={() => { setSearch(''); setCategory('all'); }} className="btn-fire text-sm px-5 py-2.5">
              Show all products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filtered.map((p, i) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35 }}
                className="flex"
              >
                <ProductCard product={p} onAdd={handleAdd} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
