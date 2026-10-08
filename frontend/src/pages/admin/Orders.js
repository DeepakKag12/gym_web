import React, { useState, useEffect, useMemo } from 'react';
import {
  Package, ChevronDown, MapPin, Phone, User, IndianRupee,
  Search, Download, Eye, RefreshCw, CheckCircle2, Clock, ShoppingBag,
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import API, { cachedGet, bustCache, freshGet } from '../../utils/api';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';
import { thumb } from '../../utils/img';
import { downloadPdf, fetchPdfBlobUrl } from '../../utils/pdf';
import { PdfViewerModal, Button, Input } from '../../components/ui';

// Gym-pickup order flow
const STATUSES = ['placed', 'confirmed', 'ready', 'collected', 'cancelled'];

const STATUS_META = {
  placed:    { label: 'Order Placed',        color: 'text-sky-400 bg-sky-400/10 border-sky-400/20' },
  confirmed: { label: 'Confirmed',           color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  ready:     { label: 'Ready for Pickup',    color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  collected: { label: 'Collected',           color: 'text-green-400 bg-green-400/10 border-green-400/20' },
  cancelled: { label: 'Cancelled',           color: 'text-red-400 bg-red-400/10 border-red-400/20' },
};

const PAYMENT_META = {
  paid:    { label: 'Paid',    color: 'text-green-400 bg-green-400/10 border-green-400/20' },
  pending: { label: 'Pending', color: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
  failed:  { label: 'Failed',  color: 'text-red-400 bg-red-400/10 border-red-400/20' },
};

export default function AdminOrders() {
  const [orders,        setOrders]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [filterStatus,  setFilterStatus]  = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [search,        setSearch]        = useState('');
  const [pdfPreview,    setPdfPreview]    = useState(null);

  const load = (force = false) => {
    setLoading(true);
    const fetcher = force ? freshGet('/orders', { cache: 60 }) : cachedGet('/orders', { cache: 60 });
    fetcher
      .then(r => setOrders(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const refresh = () => {
    bustCache('/orders');
    bustCache('analytics');
    load(true);
  };

  const updateOrderStatus = async (id, orderStatus) => {
    try {
      await API.put(`/orders/${id}/status`, { orderStatus });
      setOrders(prev => prev.map(o => o._id === id ? { ...o, orderStatus } : o));
      bustCache('/orders');
      toast.success('Order status updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating status');
    }
  };

  const updatePaymentStatus = async (id, paymentStatus) => {
    try {
      await API.put(`/orders/${id}/status`, { paymentStatus });
      setOrders(prev => prev.map(o => o._id === id ? { ...o, paymentStatus } : o));
      bustCache('/orders');
      bustCache('analytics');
      bustCache('/payments');
      toast.success('Payment status updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating payment');
    }
  };

  const viewInvoice = async order => {
    try {
      const { blobUrl, filename } = await fetchPdfBlobUrl(`/orders/${order._id}/invoice`);
      setPdfPreview({
        blobUrl,
        title: `Store Invoice #${order._id.slice(-6).toUpperCase()}`,
        subtitle: `Customer: ${order.shippingAddress?.name || order.user?.name || 'Customer'} · ₹${order.totalAmount}`,
        fileName: filename || `order-invoice-${order._id.slice(-6)}.pdf`,
        endpoint: `/orders/${order._id}/invoice`,
      });
    } catch (err) {
      toast.error(err.message || 'Could not load order invoice.');
    }
  };

  const downloadInvoice = async order => {
    await downloadPdf({
      endpoint: `/orders/${order._id}/invoice`,
      defaultFilename: `order-invoice-${order._id.slice(-6)}.pdf`,
      toastMessage: `Invoice #${order._id.slice(-6).toUpperCase()} downloaded.`,
    });
  };

  // Filter & Search logic
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter(o => {
      if (filterStatus !== 'all' && o.orderStatus !== filterStatus) return false;
      if (filterPayment !== 'all' && o.paymentStatus !== filterPayment) return false;
      if (!q) return true;
      const orderNum = o._id.slice(-6).toLowerCase();
      const customer = (o.shippingAddress?.name || o.user?.name || '').toLowerCase();
      const phone = (o.shippingAddress?.phone || o.user?.phone || '').toLowerCase();
      const itemsMatch = o.items?.some(it => it.name?.toLowerCase().includes(q));
      return orderNum.includes(q) || customer.includes(q) || phone.includes(q) || itemsMatch;
    });
  }, [orders, filterStatus, filterPayment, search]);

  // Counts for pills
  const counts = useMemo(() => {
    return STATUSES.reduce((acc, s) => {
      acc[s] = orders.filter(o => o.orderStatus === s).length;
      return acc;
    }, {});
  }, [orders]);

  // Financial and fulfillment metrics
  const metrics = useMemo(() => {
    const totalRev = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const readyCount = orders.filter(o => o.orderStatus === 'ready').length;
    const pendingFulfill = orders.filter(o => ['placed', 'confirmed'].includes(o.orderStatus)).length;
    const unpaidCount = orders.filter(o => o.paymentStatus === 'pending' && o.orderStatus !== 'cancelled').length;
    return { totalRev, readyCount, pendingFulfill, unpaidCount };
  }, [orders]);

  return (
    <AdminLayout
      title="Store Orders"
      subtitle="Fulfill gym counter pickup orders and generate bills"
      actions={
        <Button icon={RefreshCw} onClick={refresh} disabled={loading}>
          Refresh
        </Button>
      }
    >
      <div className="space-y-4 max-w-5xl">
        {/* Quick Status Section Division Cards — All Orders, Needs Prep, Ready for Pickup, Collected */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-2">
          {/* 1. All Orders */}
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`p-3.5 sm:p-4 rounded-xl border text-left transition cursor-pointer relative overflow-hidden ${
              filterStatus === 'all'
                ? 'ring-2 ring-[var(--p-accent)] shadow-md'
                : 'hover:border-[var(--p-border-2)]'
            }`}
            style={{ background: 'var(--p-surface)', borderColor: 'var(--p-border)' }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--p-text-2)' }}>
                All Orders
              </span>
              <span className="p-1 rounded-md" style={{ background: 'var(--p-surface-2)', color: 'var(--p-text-2)' }}>
                <ShoppingBag size={14} />
              </span>
            </div>
            <div className="text-2xl font-bold tracking-tight" style={{ color: 'var(--p-text)' }}>
              {orders.length}
            </div>
            <p className="text-[11.5px] mt-0.5 truncate" style={{ color: 'var(--p-muted)' }}>
              Complete store ledger
            </p>
            {filterStatus === 'all' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--p-accent)]" />
            )}
          </button>

          {/* 2. Needs Prep */}
          <button
            type="button"
            onClick={() => setFilterStatus(filterStatus === 'placed' ? 'all' : 'placed')}
            className={`p-3.5 sm:p-4 rounded-xl border text-left transition cursor-pointer relative overflow-hidden ${
              ['placed', 'confirmed'].includes(filterStatus)
                ? 'ring-2 ring-amber-500 shadow-md'
                : 'hover:border-[var(--p-border-2)]'
            }`}
            style={{ background: 'var(--p-surface)', borderColor: 'var(--p-border)' }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Needs Prep
              </span>
              <span className="p-1 rounded-md bg-amber-500/10 text-amber-400">
                <Clock size={14} />
              </span>
            </div>
            <div className="text-2xl font-bold tracking-tight text-amber-400">
              {metrics.pendingFulfill}
            </div>
            <p className="text-[11.5px] mt-0.5 truncate text-amber-400/70">
              Placed & confirmed
            </p>
            {['placed', 'confirmed'].includes(filterStatus) && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
            )}
          </button>

          {/* 3. Ready for Pickup */}
          <button
            type="button"
            onClick={() => setFilterStatus(filterStatus === 'ready' ? 'all' : 'ready')}
            className={`p-3.5 sm:p-4 rounded-xl border text-left transition cursor-pointer relative overflow-hidden ${
              filterStatus === 'ready'
                ? 'ring-2 ring-purple-500 shadow-md'
                : 'hover:border-[var(--p-border-2)]'
            }`}
            style={{ background: 'var(--p-surface)', borderColor: 'var(--p-border)' }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                Ready for Pickup
              </span>
              <span className="p-1 rounded-md bg-purple-500/10 text-purple-400">
                <CheckCircle2 size={14} />
              </span>
            </div>
            <div className="text-2xl font-bold tracking-tight text-purple-400">
              {metrics.readyCount}
            </div>
            <p className="text-[11.5px] mt-0.5 truncate text-purple-400/70">
              Awaiting member pickup
            </p>
            {filterStatus === 'ready' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500" />
            )}
          </button>

          {/* 4. Collected / Fulfilled */}
          <button
            type="button"
            onClick={() => setFilterStatus(filterStatus === 'collected' ? 'all' : 'collected')}
            className={`p-3.5 sm:p-4 rounded-xl border text-left transition cursor-pointer relative overflow-hidden ${
              filterStatus === 'collected'
                ? 'ring-2 ring-emerald-500 shadow-md'
                : 'hover:border-[var(--p-border-2)]'
            }`}
            style={{ background: 'var(--p-surface)', borderColor: 'var(--p-border)' }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Collected
              </span>
              <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 size={14} />
              </span>
            </div>
            <div className="text-2xl font-bold tracking-tight text-emerald-400">
              {counts.collected || 0}
            </div>
            <p className="text-[11.5px] mt-0.5 truncate text-emerald-400/70">
              Completed pickups
            </p>
            {filterStatus === 'collected' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
            )}
          </button>
        </div>

        {/* Active Section Info Banner */}
        <div className="flex items-center justify-between p-3 mb-1 rounded-xl text-xs font-medium"
          style={{ background: 'var(--p-surface-2)', border: '1px solid var(--p-border)' }}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{
              background: filterStatus === 'ready' ? '#a855f7' :
                          ['placed', 'confirmed'].includes(filterStatus) ? 'var(--p-warn)' :
                          filterStatus === 'collected' ? 'var(--p-ok)' :
                          filterStatus === 'cancelled' ? 'var(--p-danger)' : 'var(--p-accent)'
            }} />
            <span style={{ color: 'var(--p-text)' }}>
              {filterStatus === 'ready' && `Ready for Pickup Section (${metrics.readyCount}) — Waiting for member pickup at desk`}
              {['placed', 'confirmed'].includes(filterStatus) && `Needs Preparation Section (${metrics.pendingFulfill}) — Orders being packed`}
              {filterStatus === 'collected' && `Collected Section (${counts.collected || 0}) — Successfully completed orders`}
              {filterStatus === 'cancelled' && `Cancelled Orders Section (${counts.cancelled || 0})`}
              {filterStatus === 'all' && `All Store Orders (${orders.length}) · Total Paid Revenue: ₹${metrics.totalRev.toLocaleString('en-IN')}`}
            </span>
          </div>
          {filterStatus !== 'all' && (
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className="text-[11.5px] underline hover:opacity-80 cursor-pointer"
              style={{ color: 'var(--p-accent)' }}
            >
              Show All
            </button>
          )}
        </div>

        {/* Search & Filters */}
        <div className="ui-card ui-card-pad space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="ui-search flex-1 min-w-[220px]">
              <Search size={18} />
              <Input
                placeholder="Search order #, customer, phone or product..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search orders"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">Payment:</span>
              <select
                value={filterPayment}
                onChange={e => setFilterPayment(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-white/10 outline-none bg-white/5 text-gray-300"
              >
                <option value="all" style={{ background: '#111318', color: '#f1f5f9' }}>All Payments</option>
                <option value="paid" style={{ background: '#111318', color: '#f1f5f9' }}>Paid Only</option>
                <option value="pending" style={{ background: '#111318', color: '#f1f5f9' }}>Pending Only</option>
                <option value="failed" style={{ background: '#111318', color: '#f1f5f9' }}>Failed Only</option>
              </select>
            </div>
          </div>

          {/* Status filter pills */}
          <div className="flex gap-2 flex-wrap pt-1 border-t border-white/5">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filterStatus === 'all'
                  ? 'bg-primary text-white shadow-sm font-semibold'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
              }`}
            >
              All Statuses <span className="opacity-70">({orders.length})</span>
            </button>
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all flex items-center gap-1.5 ${
                  filterStatus === s
                    ? 'bg-primary text-white shadow-sm font-semibold'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                }`}
              >
                {STATUS_META[s]?.label}
                {counts[s] > 0 && <span className="opacity-70">({counts[s]})</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Orders list */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500 ui-card ui-card-pad">
            <Package size={40} className="mx-auto mb-3 text-gray-700" />
            <p className="text-base font-semibold text-gray-300">No orders match your filter</p>
            <p className="text-xs text-gray-500 mt-1">Try resetting the status filter or searching with different terms.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(o => {
              const meta = STATUS_META[o.orderStatus] || STATUS_META.placed;
              const pmeta = PAYMENT_META[o.paymentStatus] || PAYMENT_META.pending;
              return (
                <div key={o._id} className="glass rounded-2xl p-4 transition-all hover:border-white/20">
                  {/* Top Bar: Order number, date, amount, and invoice buttons */}
                  <div className="flex items-start justify-between gap-3 mb-3 pb-3 border-b border-white/5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-sm tracking-wide">
                          #{o._id.slice(-6).toUpperCase()}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${meta.color}`}>
                          {meta.label}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${pmeta.color}`}>
                          {pmeta.label}
                        </span>
                      </div>
                      <div className="text-gray-500 text-xs mt-1">
                        {new Date(o.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right mr-1">
                        <div className="font-bold text-base" style={{ color: 'var(--p-text)' }}>₹{o.totalAmount}</div>
                        <div className="text-[11px] font-semibold uppercase" style={{ color: 'var(--p-muted)' }}>
                          {o.paymentMethod || 'COD'}
                        </div>
                      </div>

                      {/* Invoice action buttons */}
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={Eye}
                        onClick={() => viewInvoice(o)}
                        aria-label={`View Invoice for #${o._id.slice(-6).toUpperCase()}`}
                        title="View PDF invoice"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={Download}
                        onClick={() => downloadInvoice(o)}
                        aria-label={`Download Invoice for #${o._id.slice(-6).toUpperCase()}`}
                        title="Download PDF invoice"
                      />
                    </div>
                  </div>

                  {/* Customer info */}
                  <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-white/5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {(o.shippingAddress?.name || o.user?.name || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium flex items-center gap-1.5 truncate">
                        <User size={12} className="text-gray-500" />
                        {o.shippingAddress?.name || o.user?.name || 'Unknown Member'}
                      </div>
                      <div className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                        <Phone size={11} />
                        {o.shippingAddress?.phone || o.user?.phone || '—'}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full flex-shrink-0">
                      <MapPin size={10} /> Collect from Gym
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-1.5 mb-3.5 bg-black/20 p-2.5 rounded-xl border border-white/5">
                    {o.items?.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {item.image && (
                          <img
                            src={thumb(item.image, 72)}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="w-8 h-8 rounded-lg object-cover flex-shrink-0 bg-white/5"
                          />
                        )}
                        <span className="text-gray-300 text-xs flex-1 min-w-0 truncate">{item.name}</span>
                        {item.flavor && <span className="text-gray-500 text-xs flex-shrink-0">{item.flavor}</span>}
                        <span className="text-gray-400 text-xs flex-shrink-0">×{item.quantity}</span>
                        <span className="text-gray-300 text-xs font-semibold flex-shrink-0">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Controls & Quick Business Logic Actions */}
                  <div className="space-y-2 pt-1 border-t border-white/5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* Order status dropdown */}
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-xs flex-shrink-0 w-24">Status:</span>
                        <div className="relative flex-1">
                          <select
                            value={o.orderStatus}
                            onChange={e => updateOrderStatus(o._id, e.target.value)}
                            className="w-full text-xs px-3 py-2 rounded-xl border border-white/10 outline-none cursor-pointer bg-white/5 text-gray-300 appearance-none pr-7"
                          >
                            {STATUSES.map(s => (
                              <option key={s} value={s} style={{ background: '#111318', color: '#f1f5f9' }}>
                                {STATUS_META[s]?.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>
                      </div>

                      {/* Payment status dropdown */}
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-xs flex-shrink-0 w-24 flex items-center gap-1">
                          <IndianRupee size={10} /> Payment:
                        </span>
                        <div className="relative flex-1">
                          <select
                            value={o.paymentStatus}
                            onChange={e => updatePaymentStatus(o._id, e.target.value)}
                            className="w-full text-xs px-3 py-2 rounded-xl border border-white/10 outline-none cursor-pointer bg-white/5 text-gray-300 appearance-none pr-7"
                          >
                            {Object.entries(PAYMENT_META).map(([k, v]) => (
                              <option key={k} value={k} style={{ background: '#111318', color: '#f1f5f9' }}>
                                {v.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Quick 1-click status actions */}
                    <div className="flex items-center gap-2 flex-wrap pt-2">
                      <span className="text-[11px] text-gray-500">Quick actions:</span>
                      {o.orderStatus === 'placed' && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(o._id, 'confirmed')}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors font-medium"
                        >
                          Confirm Order
                        </button>
                      )}
                      {(o.orderStatus === 'placed' || o.orderStatus === 'confirmed') && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(o._id, 'ready')}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
                        >
                          Mark Ready for Pickup
                        </button>
                      )}
                      {o.orderStatus === 'ready' && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(o._id, 'collected')}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors font-semibold"
                        >
                          Mark Collected by Member
                        </button>
                      )}
                      {o.paymentStatus !== 'paid' && o.orderStatus !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => updatePaymentStatus(o._id, 'paid')}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors font-semibold"
                        >
                          Collect & Mark Paid
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {pdfPreview && (
          <PdfViewerModal
            key="order-pdf-preview"
            title={pdfPreview.title}
            subtitle={pdfPreview.subtitle}
            blobUrl={pdfPreview.blobUrl}
            fileName={pdfPreview.fileName}
            onClose={() => {
              if (pdfPreview?.blobUrl) URL.revokeObjectURL(pdfPreview.blobUrl);
              setPdfPreview(null);
            }}
            onDownload={() => {
              const a = document.createElement('a');
              a.href = pdfPreview.blobUrl;
              a.download = pdfPreview.fileName;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
