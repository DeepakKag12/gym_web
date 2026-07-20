import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, Package, Edit2, Upload, ImageIcon, Star, ToggleLeft, ToggleRight } from 'lucide-react';
import API, { cachedGet, bustCache, freshGet } from '../../utils/api';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';

const CATEGORIES = ['protein','creatine','pre-workout','vitamins','weight-gainer','fat-burner','bcaa','accessories','apparel','other'];

const emptyForm = {
  name: '', description: '', category: 'protein', brand: '', price: '', discountPrice: '',
  stock: '', flavors: '', weights: '', video: '', isFeatured: false, isActive: true,
};

function ProductModal({ editData, onClose, onSaved }) {
  const [form, setForm] = useState(editData ? {
    ...editData,
    flavors: editData.flavors?.join(', ') || '',
    weights: editData.weights?.join(', ') || '',
  } : { ...emptyForm });
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews]     = useState(editData?.images || []);
  const [saving, setSaving]         = useState(false);
  const fileRef = useRef();

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    const urls = files.map(f => URL.createObjectURL(f));
    setPreviews(urls);
  };

  const save = async () => {
    if (!form.name || !form.price) { toast.error('Name and price are required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'flavors') fd.append(k, JSON.stringify(v ? v.split(',').map(s => s.trim()).filter(Boolean) : []));
        else if (k === 'weights') fd.append(k, JSON.stringify(v ? v.split(',').map(s => s.trim()).filter(Boolean) : []));
        else fd.append(k, v);
      });
      imageFiles.forEach(f => fd.append('images', f));

      if (editData) {
        await API.put(`/store/${editData._id}`, fd);
        toast.success('Product updated!');
      } else {
        await API.post('/store', fd);
        toast.success('Product added!');
      }
      onSaved();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="admin-modal-overlay">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="admin-modal-box">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-xl">{editData ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Product Name *</label>
            <input className="input-dark text-sm" name="name" value={form.name} onChange={handleChange} placeholder="Whey Protein Gold Standard 1kg" />
          </div>
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Brand</label>
            <input className="input-dark text-sm" name="brand" value={form.brand} onChange={handleChange} placeholder="MuscleBlaze" />
          </div>
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Category</label>
            <select className="input-dark text-sm" name="category" value={form.category} onChange={handleChange}>
              {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1).replace(/-/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-1.5">MRP Price (₹) *</label>
            <input className="input-dark text-sm" name="price" type="number" value={form.price} onChange={handleChange} placeholder="1999" />
          </div>
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Sale Price (₹) <span className="text-gray-600">optional</span></label>
            <input className="input-dark text-sm" name="discountPrice" type="number" value={form.discountPrice} onChange={handleChange} placeholder="1499" />
          </div>
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Stock Qty</label>
            <input className="input-dark text-sm" name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="50" />
          </div>
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Flavors <span className="text-gray-600">(comma separated)</span></label>
            <input className="input-dark text-sm" name="flavors" value={form.flavors} onChange={handleChange} placeholder="Chocolate, Vanilla, Strawberry" />
          </div>
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Sizes / Weights <span className="text-gray-600">(comma separated)</span></label>
            <input className="input-dark text-sm" name="weights" value={form.weights} onChange={handleChange} placeholder="1kg, 2kg, 4kg" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Product Video <span className="text-gray-600">(YouTube URL or Cloudinary mp4 link — optional)</span></label>
            <input className="input-dark text-sm" name="video" value={form.video || ''} onChange={handleChange} placeholder="https://youtu.be/... or https://res.cloudinary.com/.../video.mp4" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Description</label>
            <textarea className="input-dark text-sm min-h-[80px] resize-none" name="description" value={form.description} onChange={handleChange}
              placeholder="Describe the product — ingredients, benefits, usage..." />
          </div>

          {/* Flags */}
          <div className="flex gap-5 items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} className="w-4 h-4 accent-amber-400" />
              <span className="text-gray-300 text-sm flex items-center gap-1.5"><Star size={13} className="text-amber-400" /> Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="w-4 h-4 accent-emerald-400" />
              <span className="text-gray-300 text-sm">Active</span>
            </label>
          </div>

          {/* Image upload */}
          <div className="sm:col-span-2">
            <label className="text-gray-400 text-xs font-medium block mb-2 flex items-center gap-1.5">
              <ImageIcon size={13} /> Product Images {editData && <span className="text-gray-600">(upload new to replace existing)</span>}
            </label>
            {/* Preview strip */}
            {previews.length > 0 && (
              <div className="flex gap-2 mb-3 flex-wrap">
                {previews.map((url, i) => (
                  <img key={i} src={url} alt={`img-${i}`}
                    className="w-16 h-16 rounded-xl object-cover border border-white/10" />
                ))}
              </div>
            )}
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-white/10 hover:border-[#22d3ee]/40 rounded-xl p-5 text-center cursor-pointer transition-all group">
              <Upload size={20} className="text-gray-600 group-hover:text-[#22d3ee] mx-auto mb-1.5 transition-colors" />
              <p className="text-gray-500 text-xs group-hover:text-gray-300 transition-colors">Click to upload images (multiple supported)</p>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="btn-ghost px-5 py-2.5 text-sm">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-fire px-6 py-2.5 text-sm">
            {saving ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : (editData ? 'Update Product' : 'Add Product')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminStore() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null); // null | 'new' | product
  const [search, setSearch]     = useState('');
  const [catFilter, setCatFilter] = useState('all');

  const load = (force = false) => {
    setLoading(true);
    const fetcher = force ? freshGet('/store', { cache: 60 }) : cachedGet('/store', { cache: 60 });
    fetcher.then(r => setProducts(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const del = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await API.delete(`/store/${id}`);
      // Optimistically remove from UI immediately — no waiting for re-fetch
      setProducts(prev => prev.filter(p => p._id !== id));
      bustCache('/store');
      toast.success('Product deleted');
    } catch { toast.error('Delete failed'); }
  };

  const toggleActive = async (p) => {
    try {
      await API.put(`/store/${p._id}`, { isActive: !p.isActive });
      setProducts(prev => prev.map(x => x._id === p._id ? { ...x, isActive: !p.isActive } : x));
      bustCache('/store');
      toast.success(p.isActive ? 'Product hidden' : 'Product active');
    } catch { toast.error('Update failed'); }
  };

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    const matchQ = !q || p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q);
    const matchC = catFilter === 'all' || p.category === catFilter;
    return matchQ && matchC;
  });

  return (
    <AdminLayout title="Supplement Store">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-5 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Package size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input className="input-dark pl-9 py-2 text-sm w-48" placeholder="Search products…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input-dark py-2 text-sm" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
        </div>
        <button onClick={() => setModal('new')} className="btn-fire text-sm py-2 px-4 gap-2">
          <Plus size={15} /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#22d3ee] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <Package size={40} className="text-gray-700 mx-auto mb-3" />
          <div className="text-gray-500">No products found. Add your first supplement!</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p, i) => {
            const disc = p.discountPrice ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : 0;
            return (
              <motion.div key={p._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className={`glass rounded-2xl overflow-hidden transition-all ${!p.isActive ? 'opacity-50' : ''}`}>
                {/* Image */}
                <div className="relative h-44 bg-[#0d0e11] overflow-hidden">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={40} className="text-gray-700" />
                    </div>
                  )}
                  {disc > 0 && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      -{disc}%
                    </div>
                  )}
                  {p.isFeatured && (
                    <div className="absolute top-2 right-2 bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Star size={9} /> Featured
                    </div>
                  )}
                  {/* Image count */}
                  {p.images?.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-gray-300 text-[9px] px-1.5 py-0.5 rounded-full">
                      +{p.images.length - 1} more
                    </div>
                  )}
                </div>
                {/* Body */}
                <div className="p-3.5">
                  <div className="text-white font-semibold text-sm line-clamp-1 mb-0.5">{p.name}</div>
                  <div className="text-gray-500 text-xs mb-2 capitalize">{p.brand} · {p.category}</div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="text-[#22d3ee] font-bold text-sm">₹{p.discountPrice || p.price}</span>
                    {p.discountPrice && <span className="text-gray-600 line-through text-xs">₹{p.price}</span>}
                    <span className={`ml-auto text-xs ${p.stock > 10 ? 'text-emerald-400' : p.stock > 0 ? 'text-amber-400' : 'text-red-400'}`}>
                      Stock: {p.stock}
                    </span>
                  </div>
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(p.flavors || []).slice(0, 2).map((f, fi) => (
                      <span key={fi} className="text-[9px] bg-white/5 text-gray-500 px-1.5 py-0.5 rounded-full">{f}</span>
                    ))}
                    {(p.weights || []).slice(0, 2).map((w, wi) => (
                      <span key={wi} className="text-[9px] bg-white/5 text-gray-500 px-1.5 py-0.5 rounded-full">{w}</span>
                    ))}
                  </div>
                  {/* Actions */}
                  <div className="flex gap-2 border-t border-white/5 pt-3">
                    <button onClick={() => toggleActive(p)} title={p.isActive ? 'Hide' : 'Show'}
                      className={`p-1.5 rounded-lg transition-all flex-shrink-0 ${p.isActive ? 'text-emerald-400 hover:bg-emerald-400/10' : 'text-gray-600 hover:bg-white/5'}`}>
                      {p.isActive ? <ToggleRight size={17} /> : <ToggleLeft size={17} />}
                    </button>
                    <button onClick={() => setModal(p)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs text-amber-400 hover:bg-amber-400/10 rounded-lg py-1.5 transition-all">
                      <Edit2 size={13} /> Edit
                    </button>
                    <button onClick={() => del(p._id)}
                      className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <ProductModal
            editData={modal === 'new' ? null : modal}
            onClose={() => setModal(null)}
            onSaved={() => { bustCache('/store'); setModal(null); load(true); }}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
