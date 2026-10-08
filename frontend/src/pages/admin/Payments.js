import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import {
  IndianRupee, ShoppingBag, UserSquare2, RefreshCw, AlertTriangle, Search, TrendingUp,
  UserPlus, CheckCircle2, FileText, Share2, Eye, Download, FileSpreadsheet,
} from 'lucide-react';

import API, { cachedGet, freshGet, bustCache, apiError } from '../../utils/api';
import AdminLayout from './AdminLayout';
import {
  Card, Button, Badge, Avatar, Input, EmptyState, SkeletonList, Table, TableRow,
  Tabs, FadeIn, Stagger, StatCard, timeAgo, Modal, Field, Select, PdfViewerModal,
} from '../../components/ui';
import { fmtDate } from '../../utils/membership';
import { downloadPdf, fetchPdfBlobUrl } from '../../utils/pdf';

/**
 * Payments — money in, split by where it came from.
 *
 * Membership fees and shop orders are different businesses: one is recurring
 * and tied to a period, the other is one-off and tied to stock. Reporting them
 * as a single "revenue" figure hid which half was actually growing, so they are
 * separated here and only added together in the headline total.
 *
 * Membership rows come from the Payment ledger, which did not exist before —
 * renewals used to overwrite the member's fee rather than record a payment, so
 * a year of renewals showed as a single month's income.
 */

const money = n => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const KIND = {
  'new-membership': 'Joining fee',
  renewal: 'Renewal',
  order: 'Shop order',
  adjustment: 'Adjustment',
};

export default function AdminPayments() {
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState({ membership: 0, store: 0, all: 0 });
  const [summary, setSummary] = useState(null);
  const [members, setMembers] = useState([]);
  const [due, setDue] = useState([]);
  const [dueTotal, setDueTotal] = useState(0);
  const [selectedDue, setSelectedDue] = useState([]);
  const [dueFormOpen, setDueFormOpen] = useState(false);
  const [dueForm, setDueForm] = useState({ member: '', amount: '', paidAmount: '', method: 'cash', note: '' });
  const [settlementMethod, setSettlementMethod] = useState('cash');
  const [statementSending, setStatementSending] = useState(null);
  const [statementSharing, setStatementSharing] = useState(null);
  const [statementViewing, setStatementViewing] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(null); // { blobUrl, title, subtitle, fileName, endpoint }
  const [dateRange, setDateRange] = useState('all'); // 'all', 'today', 'week', 'month'

  // Pay / Adjust Due modal state
  const [payDueMember, setPayDueMember] = useState(null);
  const [payDueForm, setPayDueForm] = useState({ mode: 'pay', paidAmount: '', newDue: '', method: 'cash', note: '' });
  const [savingPayDue, setSavingPayDue] = useState(false);

  const [savingDue, setSavingDue] = useState(false);
  const [settlingDue, setSettlingDue] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState('all');
  const [search, setSearch] = useState('');

  const load = useCallback((force = false) => {
    setLoading(true);
    setError(null);
    const get = force ? freshGet : cachedGet;
    Promise.all([
      get('/payments', { cache: 60 }),
      get('/payments/summary', { cache: 60 }),
      get('/payments/due', { cache: 30 }),
      get('/members', { cache: 60 }),
    ])
      .then(([p, s, d, m]) => {
        setRows(p.data?.payments || []);
        setTotals(p.data?.totals || { membership: 0, store: 0, all: 0 });
        setSummary(s.data || null);
        setDue(d.data?.members || []);
        setDueTotal(d.data?.total || 0);
        setMembers((m.data || []).filter(member => member.role === 'member' && member.isActive !== false));
      })
      .catch(err => setError(apiError(err, 'Could not load payments.')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const refresh = () => {
    bustCache('/payments');
    bustCache('/payments/due');
    bustCache('/payments/summary');
    bustCache('/members');
    bustCache('analytics');
    load(true);
  };

  const toggleDue = id => setSelectedDue(current =>
    current.includes(id) ? current.filter(item => item !== id) : [...current, id]
  );

  const addDue = async () => {
    if (!dueForm.member || !(Number(dueForm.amount) > 0)) {
      toast.error('Choose a member and enter a total fee amount.');
      return;
    }
    const total = Number(dueForm.amount);
    const paid = Number(dueForm.paidAmount || 0);
    if (paid < 0) {
      toast.error('Paid amount cannot be negative.');
      return;
    }
    if (paid > total) {
      toast.error('Paid amount cannot be greater than the total fee amount.');
      return;
    }
    setSavingDue(true);
    try {
      const { data } = await API.post('/payments/due', {
        member: dueForm.member,
        amount: total,
        paidAmount: paid,
        method: dueForm.method || 'cash',
        note: dueForm.note,
      });
      toast.success(data.message || 'Fee due added.');
      setDueFormOpen(false);
      setDueForm({ member: '', amount: '', paidAmount: '', method: 'cash', note: '' });
      refresh();
    } catch (err) { toast.error(apiError(err, 'Could not add this due fee.')); }
    finally { setSavingDue(false); }
  };

  const openPayDue = member => {
    setPayDueMember(member);
    setPayDueForm({
      mode: 'pay',
      paidAmount: String(member.dueAmount || ''),
      newDue: String(member.dueAmount || ''),
      method: 'cash',
      note: '',
    });
  };

  const submitPayDue = async () => {
    if (!payDueMember) return;
    setSavingPayDue(true);
    try {
      if (payDueForm.mode === 'pay') {
        const paid = Number(payDueForm.paidAmount);
        if (!(paid > 0)) {
          toast.error('Enter a payment amount greater than zero.');
          setSavingPayDue(false);
          return;
        }
        if (paid > Number(payDueMember.dueAmount)) {
          toast.error(`Payment cannot be greater than the outstanding due of ₹${payDueMember.dueAmount}.`);
          setSavingPayDue(false);
          return;
        }
        const { data } = await API.post('/payments', {
          member: payDueMember._id,
          amount: paid,
          method: payDueForm.method || 'cash',
          note: payDueForm.note || (paid === Number(payDueMember.dueAmount) ? 'Due fee settled' : 'Partial due payment'),
          kind: 'adjustment',
        });
        toast.success(data.message || 'Payment recorded successfully.');
      } else {
        const newDue = Number(payDueForm.newDue);
        if (isNaN(newDue) || newDue < 0) {
          toast.error('Enter a valid due amount (0 or higher).');
          setSavingPayDue(false);
          return;
        }
        const { data } = await API.patch(`/payments/due/${payDueMember._id}`, {
          dueAmount: newDue,
        });
        toast.success(data.message || 'Due amount updated.');
      }
      setPayDueMember(null);
      refresh();
    } catch (err) {
      toast.error(apiError(err, 'Could not process due action.'));
    } finally {
      setSavingPayDue(false);
    }
  };

  const settleSelected = async () => {
    if (!selectedDue.length) return;
    setSettlingDue(true);
    try {
      const { data } = await API.post('/payments/due/settle', { memberIds: selectedDue, method: settlementMethod });
      toast.success(data.message || 'Due fees marked paid.');
      setSelectedDue([]);
      refresh();
    } catch (err) { toast.error(apiError(err, 'Could not settle the selected fees.')); }
    finally { setSettlingDue(false); }
  };

  const sendStatement = async memberId => {
    setStatementSending(memberId);
    try {
      const { data } = await API.post(`/payments/${memberId}/statement/whatsapp`);
      toast.success(data.message || 'Statement sent on WhatsApp.');
    } catch (err) { toast.error(apiError(err, 'Could not send the statement.')); }
    finally { setStatementSending(null); }
  };

  const shareStatement = async member => {
    setStatementSharing(member._id);
    try {
      const { data } = await API.post(`/payments/${member._id}/statement`);
      const pdfUrl = data.url;

      // Try the native share sheet (works on Android Chrome, iOS Safari).
      // We attempt to share the file if the browser supports it, otherwise
      // fall back to sharing the URL so the admin can copy/paste it.
      if (navigator.share) {
        try {
          const response = await fetch(pdfUrl);
          const blob = await response.blob();
          const file = new File([blob], `${member.name || 'member'}-statement.pdf`, { type: 'application/pdf' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: `${member.name} payment statement`, text: 'FitNation payment statement' });
            return;
          }
          // Browsers that support share() but not file sharing — share the URL instead.
          await navigator.share({ url: pdfUrl, title: `${member.name} payment statement`, text: 'FitNation payment statement' });
          return;
        } catch (shareErr) {
          if (shareErr?.name === 'AbortError') return; // user cancelled
          // Share failed — fall through to manual options below
        }
      }

      // Desktop fallback: open the PDF in a new tab so the admin can view,
      // download, or copy the link and send it manually (e.g. paste into WhatsApp Web).
      const opened = window.open(pdfUrl, '_blank', 'noopener,noreferrer');
      if (!opened) {
        // Pop-up blocked — give the admin a direct download link instead.
        const a = document.createElement('a');
        a.href = pdfUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.download = `${member.name || 'member'}-statement.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      toast.success('PDF opened — you can now save or share it manually.');
    } catch (err) {
      if (err?.name !== 'AbortError') toast.error(apiError(err, 'Could not share the statement.'));
    } finally { setStatementSharing(null); }
  };

  const viewStatement = async member => {
    setStatementViewing(member._id);
    try {
      const { blobUrl, filename } = await fetchPdfBlobUrl(`/payments/${member._id}/statement`);
      setPdfPreview({
        blobUrl,
        title: `Statement: ${member.name || 'Member'}`,
        subtitle: `Membership Plan: ${(member.membershipPlan || 'Standard').toUpperCase()} · Phone: ${member.phone || '—'}`,
        fileName: filename || `${(member.name || 'member').replace(/\s+/g, '-')}-statement.pdf`,
        endpoint: `/payments/${member._id}/statement`,
      });
    } catch (err) {
      toast.error(apiError(err, 'Could not open the statement PDF.'));
    } finally { setStatementViewing(null); }
  };

  const downloadStatement = async member => {
    await downloadPdf({
      endpoint: `/payments/${member._id}/statement`,
      defaultFilename: `${(member.name || 'member').replace(/\s+/g, '-')}-statement.pdf`,
      toastMessage: `Statement for ${member.name || 'member'} downloaded.`,
    });
  };

  const viewReceipt = async payment => {
    try {
      const { blobUrl, filename } = await fetchPdfBlobUrl(`/payments/${payment._id}/receipt`);
      setPdfPreview({
        blobUrl,
        title: `Payment Receipt: ${payment.member?.name || 'Member'}`,
        subtitle: `Amount: ₹${Number(payment.amount).toLocaleString('en-IN')} · Ref: REC-${String(payment._id).slice(-6).toUpperCase()}`,
        fileName: filename || `receipt-${payment._id}.pdf`,
        endpoint: `/payments/${payment._id}/receipt`,
      });
    } catch (err) {
      toast.error(apiError(err, 'Could not open payment receipt.'));
    }
  };

  const downloadReceipt = async payment => {
    await downloadPdf({
      endpoint: `/payments/${payment._id}/receipt`,
      defaultFilename: `receipt-${(payment.member?.name || 'member').replace(/[^a-z0-9]/gi, '-')}-${String(payment._id).slice(-6)}.pdf`,
      toastMessage: 'Payment receipt downloaded.',
    });
  };

  const viewOrderInvoice = async row => {
    const orderId = row.order || (typeof row._id === 'string' && row._id.startsWith('order:') ? row._id.replace('order:', '') : row._id);
    try {
      const { blobUrl, filename } = await fetchPdfBlobUrl(`/orders/${orderId}/invoice`);
      setPdfPreview({
        blobUrl,
        title: `Order Invoice #${String(orderId).slice(-6).toUpperCase()}`,
        subtitle: `Customer: ${row.member?.name || 'Customer'} · Total: ₹${Number(row.amount).toLocaleString('en-IN')}`,
        fileName: filename || `order-invoice-${orderId}.pdf`,
        endpoint: `/orders/${orderId}/invoice`,
      });
    } catch (err) {
      toast.error(apiError(err, 'Could not open order invoice.'));
    }
  };

  const downloadOrderInvoice = async row => {
    const orderId = row.order || (typeof row._id === 'string' && row._id.startsWith('order:') ? row._id.replace('order:', '') : row._id);
    await downloadPdf({
      endpoint: `/orders/${orderId}/invoice`,
      defaultFilename: `order-invoice-${String(orderId).slice(-6)}.pdf`,
      toastMessage: 'Order invoice downloaded.',
    });
  };

  const exportCsv = () => {
    if (!shown.length) {
      toast.error('No payments to export.');
      return;
    }
    const headers = ['Date', 'Customer/Member', 'Phone', 'Source', 'Particulars', 'Payment Method', 'Amount (INR)', 'Note'];
    const lines = shown.map(r => [
      `"${new Date(r.createdAt).toLocaleDateString('en-IN')}"`,
      `"${(r.member?.name || '').replace(/"/g, '""')}"`,
      `"${r.member?.phone || ''}"`,
      `"${r.source || ''}"`,
      `"${(KIND[r.kind] || r.kind || '').replace(/"/g, '""')}"`,
      `"${(r.method || 'cash').toUpperCase()}"`,
      r.amount || 0,
      `"${(r.note || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...lines.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `payments-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Payments exported to CSV.');
  };

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = now.getTime() - 7 * 86400000;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return rows.filter(r => {
      if (source !== 'all' && r.source !== source) return false;
      if (dateRange !== 'all') {
        const time = new Date(r.createdAt).getTime();
        if (dateRange === 'today' && time < todayStart) return false;
        if (dateRange === 'week' && time < weekStart) return false;
        if (dateRange === 'month' && time < monthStart) return false;
      }
      if (!q) return true;
      return r.member?.name?.toLowerCase().includes(q)
        || r.member?.phone?.includes(q)
        || String(r.amount).includes(q)
        || (r.note && r.note.toLowerCase().includes(q))
        || (r.kind && r.kind.toLowerCase().includes(q));
    });
  }, [rows, source, search, dateRange]);

  const shownTotal = useMemo(() => shown.reduce((n, r) => n + (r.amount || 0), 0), [shown]);

  const columns = [
    { key: 'member', label: 'Member' },
    { key: 'source', label: 'From', width: 130 },
    { key: 'kind', label: 'Reason', width: 130 },
    { key: 'date', label: 'Date', width: 150 },
    { key: 'amount', label: 'Amount', width: 120, align: 'right' },
  ];

  // Last six months, so a bar chart is unnecessary to see the trend.
  const recentMonths = useMemo(() => (summary?.series || []).slice(-6), [summary]);
  const peak = Math.max(1, ...recentMonths.map(m => m.total));

  return (
    <AdminLayout
      title="Payments"
      subtitle="Membership fees and shop orders, kept apart"
      actions={
        <>
          <Button icon={FileSpreadsheet} onClick={exportCsv} disabled={!shown.length} title="Export current filtered list to CSV">Export CSV</Button>
          <Button icon={UserPlus} onClick={() => setDueFormOpen(true)}>Add fee due</Button>
          <Button icon={RefreshCw} onClick={refresh} disabled={loading}>Refresh</Button>
        </>
      }
    >
      {error ? (
        <Card>
          <EmptyState icon={AlertTriangle} title="Could not load payments" hint={error}>
            <Button variant="primary" icon={RefreshCw} onClick={() => load(true)}>Try again</Button>
          </EmptyState>
        </Card>
      ) : (
        <div className="space-y-4 max-w-5xl">
          <Card
            title={`Due fees${due.length ? ` (${due.length})` : ''}`}
            action={selectedDue.length > 0 ? (
              <div className="flex items-center gap-2">
                <Select value={settlementMethod} onChange={e => setSettlementMethod(e.target.value)} aria-label="Payment method">
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="online">Online</option>
                  <option value="other">Other</option>
                </Select>
                <Button size="sm" variant="primary" icon={CheckCircle2} loading={settlingDue} onClick={settleSelected}>
                  Mark {selectedDue.length} paid
                </Button>
              </div>
            ) : null}
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="text-[13px]" style={{ color: 'var(--p-text-2)' }}>
                {due.length ? `${money(dueTotal)} outstanding` : 'No unpaid membership fees.'}
              </p>
              {due.length > 0 && (
                <button
                  type="button"
                  className="text-[12px] font-medium"
                  style={{ color: 'var(--p-accent)' }}
                  onClick={() => setSelectedDue(selectedDue.length === due.length ? [] : due.map(member => member._id))}
                >
                  {selectedDue.length === due.length ? 'Clear selection' : 'Select all'}
                </button>
              )}
            </div>

            {due.length > 0 && (
              <div className="divide-y" style={{ borderColor: 'var(--p-border)' }}>
                {due.map(member => (
                  <label key={member._id} className="flex items-center gap-3 py-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedDue.includes(member._id)}
                      onChange={() => toggleDue(member._id)}
                      aria-label={`Select ${member.name}`}
                    />
                    <Avatar name={member.name} size={30} />
                    <span className="flex-1 min-w-0">
                      <span className="block text-[14px] font-semibold truncate" style={{ color: 'var(--p-text)' }}>{member.name}</span>
                      <span className="block text-[12px] truncate" style={{ color: 'var(--p-muted)' }}>{member.phone || member.email}</span>
                      <span className="block text-[11px] mt-1" style={{ color: 'var(--p-muted)' }}>
                        {member.memberMonths} month(s) · Paid {money(member.paidTotal)} of {money(member.totalFee)} · {member.dueMonths} month(s) due
                      </span>
                    </span>
                    <span className="text-right">
                      <strong className="block" style={{ color: 'var(--p-danger)' }}>{money(member.dueAmount)}</strong>
                      <span className="text-[11px]" style={{ color: 'var(--p-muted)' }}>due</span>
                    </span>
                    <Button
                      size="sm"
                      variant="primary"
                      icon={IndianRupee}
                      onClick={event => { event.preventDefault(); event.stopPropagation(); openPayDue(member); }}
                      aria-label={`Collect or edit due for ${member.name}`}
                      title="Collect payment (partial or full) or change due money"
                    >
                      Pay / Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={FileText}
                      loading={statementSending === member._id}
                      onClick={event => { event.preventDefault(); event.stopPropagation(); sendStatement(member._id); }}
                      aria-label={`Send ${member.name}'s statement`}
                      title="Send PDF statement on WhatsApp"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Share2}
                      loading={statementSharing === member._id}
                      onClick={event => { event.preventDefault(); event.stopPropagation(); shareStatement(member); }}
                      aria-label={`Share ${member.name}'s statement`}
                      title="Share PDF statement"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Download}
                      onClick={event => { event.preventDefault(); event.stopPropagation(); downloadStatement(member); }}
                      aria-label={`Download ${member.name}'s statement`}
                      title="Download PDF statement"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Eye}
                      loading={statementViewing === member._id}
                      onClick={event => { event.preventDefault(); event.stopPropagation(); viewStatement(member); }}
                      aria-label={`View ${member.name}'s statement`}
                      title="View PDF statement"
                    />
                  </label>
                ))}
              </div>
            )}
          </Card>

          {/* Quick Revenue Section Division Cards — All Revenue, Membership, Shop, Outstanding Dues */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-2">
            <button
              type="button"
              onClick={() => setSource('all')}
              className={`p-3.5 sm:p-4 rounded-xl border text-left transition cursor-pointer relative overflow-hidden ${
                source === 'all'
                  ? 'ring-2 ring-emerald-500 shadow-md'
                  : 'hover:border-[var(--p-border-2)]'
              }`}
              style={{ background: 'var(--p-surface)', borderColor: 'var(--p-border)' }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Total Taken
                </span>
                <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
                  <IndianRupee size={14} />
                </span>
              </div>
              <div className="text-2xl font-bold tracking-tight text-emerald-400">
                {money(totals.all)}
              </div>
              <p className="text-[11.5px] mt-0.5 truncate text-emerald-400/70">
                Both sources together
              </p>
              {source === 'all' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setSource('membership')}
              className={`p-3.5 sm:p-4 rounded-xl border text-left transition cursor-pointer relative overflow-hidden ${
                source === 'membership'
                  ? 'ring-2 ring-[var(--p-accent)] shadow-md'
                  : 'hover:border-[var(--p-border-2)]'
              }`}
              style={{ background: 'var(--p-surface)', borderColor: 'var(--p-border)' }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--p-text-2)' }}>
                  Membership Fees
                </span>
                <span className="p-1 rounded-md" style={{ background: 'var(--p-surface-2)', color: 'var(--p-text-2)' }}>
                  <UserSquare2 size={14} />
                </span>
              </div>
              <div className="text-2xl font-bold tracking-tight" style={{ color: 'var(--p-text)' }}>
                {money(totals.membership)}
              </div>
              <p className="text-[11.5px] mt-0.5 truncate" style={{ color: 'var(--p-muted)' }}>
                Joining fees & renewals
              </p>
              {source === 'membership' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--p-accent)]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setSource('store')}
              className={`p-3.5 sm:p-4 rounded-xl border text-left transition cursor-pointer relative overflow-hidden ${
                source === 'store'
                  ? 'ring-2 ring-blue-500 shadow-md'
                  : 'hover:border-[var(--p-border-2)]'
              }`}
              style={{ background: 'var(--p-surface)', borderColor: 'var(--p-border)' }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  Shop Orders
                </span>
                <span className="p-1 rounded-md bg-blue-500/10 text-blue-400">
                  <ShoppingBag size={14} />
                </span>
              </div>
              <div className="text-2xl font-bold tracking-tight text-blue-400">
                {money(totals.store)}
              </div>
              <p className="text-[11.5px] mt-0.5 truncate text-blue-400/70">
                Product sales revenue
              </p>
              {source === 'store' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />
              )}
            </button>

            <div
              className="p-3.5 sm:p-4 rounded-xl border text-left relative overflow-hidden"
              style={{ background: 'var(--p-surface)', borderColor: 'var(--p-border)' }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
                  Pending Dues
                </span>
                <span className="p-1 rounded-md bg-rose-500/10 text-rose-400">
                  <AlertTriangle size={14} />
                </span>
              </div>
              <div className="text-2xl font-bold tracking-tight text-rose-400">
                {money(dueTotal)}
              </div>
              <p className="text-[11.5px] mt-0.5 truncate text-rose-400/70">
                {due.length} members with balances
              </p>
            </div>
          </div>

          {summary?.thisMonth && (
            <FadeIn delay={0.05}>
              <Card title="This month">
                <div className="flex flex-wrap gap-6">
                  <div>
                    <p className="text-[12.5px]" style={{ color: 'var(--p-text-2)' }}>Membership</p>
                    <p className="text-[22px] font-bold" style={{ color: 'var(--p-text)' }}>{money(summary.thisMonth.membership)}</p>
                  </div>
                  <div>
                    <p className="text-[12.5px]" style={{ color: 'var(--p-text-2)' }}>Shop</p>
                    <p className="text-[22px] font-bold" style={{ color: 'var(--p-text)' }}>{money(summary.thisMonth.store)}</p>
                  </div>
                  <div>
                    <p className="text-[12.5px]" style={{ color: 'var(--p-text-2)' }}>Together</p>
                    <p className="text-[22px] font-bold" style={{ color: 'var(--p-accent)' }}>{money(summary.thisMonth.all)}</p>
                  </div>
                </div>

                {recentMonths.length > 1 && (
                  <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--p-border)' }}>
                    <p className="ui-section-label mb-3">Last {recentMonths.length} months</p>
                    <div className="flex items-end gap-2" style={{ height: 90 }}>
                      {recentMonths.map(m => (
                        <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
                          {/* Two stacked segments, so the split stays visible
                              rather than being flattened into one bar. */}
                          <div className="w-full flex flex-col justify-end" style={{ height: 64 }}
                            title={`${m.month}: membership ${money(m.membership)}, shop ${money(m.store)}`}>
                            <div style={{ height: `${(m.store / peak) * 100}%`, background: 'var(--p-info)', borderRadius: '3px 3px 0 0' }} />
                            <div style={{ height: `${(m.membership / peak) * 100}%`, background: 'var(--p-accent)' }} />
                          </div>
                          <span className="text-[11px]" style={{ color: 'var(--p-muted)' }}>
                            {m.month.slice(5)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-4 mt-3 text-[12px]" style={{ color: 'var(--p-text-2)' }}>
                      <span className="flex items-center gap-1.5">
                        <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--p-accent)' }} /> Membership
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--p-info)' }} /> Shop
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            </FadeIn>
          )}

          <div className="ui-toolbar flex-wrap gap-2">
            <div className="ui-search flex-1 min-w-[200px]">
              <Search size={18} />
              <Input placeholder="Search member, phone, note or amount" value={search}
                onChange={e => setSearch(e.target.value)} aria-label="Search payments" />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all', label: 'All Time' },
                { id: 'today', label: 'Today' },
                { id: 'week', label: '7 Days' },
                { id: 'month', label: 'This Month' },
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setDateRange(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                    dateRange === t.id
                      ? 'shadow-sm font-bold'
                      : 'hover:bg-[var(--p-surface-2)]'
                  }`}
                  style={{
                    background: dateRange === t.id ? 'var(--p-accent)' : 'var(--p-surface)',
                    color: dateRange === t.id ? '#ffffff' : 'var(--p-text-2)',
                    borderColor: dateRange === t.id ? 'var(--p-accent)' : 'var(--p-border)',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <Tabs
            value={source}
            onChange={setSource}
            options={[
              { value: 'all', label: 'Everything', count: rows.length },
              { value: 'membership', label: 'Membership', count: rows.filter(r => r.source === 'membership').length },
              { value: 'store', label: 'Shop', count: rows.filter(r => r.source === 'store').length },
            ]}
          />

          {loading ? (
            <SkeletonList rows={6} h={56} />
          ) : shown.length === 0 ? (
            <Card>
              <EmptyState
                icon={IndianRupee}
                title={rows.length === 0 ? 'No payments recorded yet' : 'Nothing matches'}
                hint={rows.length === 0
                  ? 'Membership fees are recorded when you add or renew a member. Shop payments appear when an order is marked paid.'
                  : 'Try another search or source.'}
              />
            </Card>
          ) : (
            <FadeIn>
              <Card padded={false} className="hidden md:block">
                <Table columns={columns}>
                  {shown.map(r => (
                    <TableRow key={r._id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={r.member?.name} size={30} />
                          <span className="min-w-0">
                            <span className="block font-semibold" style={{ color: 'var(--p-text)' }}>
                              {r.member?.name || 'Unknown'}
                            </span>
                            <span className="block text-[12px]" style={{ color: 'var(--p-muted)' }}>
                              {r.member?.phone || '—'}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td>
                        <Badge tone={r.source === 'membership' ? 'accent' : 'info'}>
                          {r.source === 'membership' ? 'Membership' : 'Shop'}
                        </Badge>
                      </td>
                      <td>{KIND[r.kind] || r.kind}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {fmtDate(r.createdAt)}
                        <span className="block text-[11.5px]" style={{ color: 'var(--p-muted)' }}>
                          {timeAgo(r.createdAt)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div className="flex items-center justify-end gap-1.5">
                          <strong style={{ color: 'var(--p-text)' }}>{money(r.amount)}</strong>
                          {r.source === 'membership' ? (
                            <>
                              <Button size="sm" variant="ghost" icon={Eye}
                                onClick={() => viewReceipt(r)}
                                aria-label="View payment receipt"
                                title="View payment receipt PDF" />
                              <Button size="sm" variant="ghost" icon={Download}
                                onClick={() => downloadReceipt(r)}
                                aria-label="Download payment receipt"
                                title="Download payment receipt PDF" />
                              {r.member?._id && (
                                <>
                                  <Button size="sm" variant="ghost" icon={FileText}
                                    loading={statementSending === r.member._id}
                                    onClick={() => sendStatement(r.member._id)}
                                    aria-label={`Send ${r.member.name}'s statement on WhatsApp`}
                                    title="Send statement on WhatsApp" />
                                  <Button size="sm" variant="ghost" icon={Share2}
                                    loading={statementSharing === r.member._id}
                                    onClick={() => shareStatement(r.member)}
                                    aria-label={`Share ${r.member.name}'s statement`}
                                    title="Share statement" />
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="ghost" icon={Eye}
                                onClick={() => viewOrderInvoice(r)}
                                aria-label="View order invoice"
                                title="View order invoice PDF" />
                              <Button size="sm" variant="ghost" icon={Download}
                                onClick={() => downloadOrderInvoice(r)}
                                aria-label="Download order invoice"
                                title="Download order invoice PDF" />
                            </>
                          )}
                        </div>
                      </td>
                    </TableRow>
                  ))}
                </Table>
              </Card>

              <Card padded={false} className="md:hidden">
                <ul>
                  {shown.map((r, i) => (
                    <li key={r._id} className="flex items-center gap-3 px-4 py-3"
                      style={{ borderTop: i ? '1px solid var(--p-border)' : 'none' }}>
                      <Avatar name={r.member?.name} size={34} />
                      <span className="flex-1 min-w-0">
                        <span className="block text-[14.5px] font-semibold truncate" style={{ color: 'var(--p-text)' }}>
                          {r.member?.name || 'Unknown'}
                        </span>
                        <span className="block text-[12px]" style={{ color: 'var(--p-muted)' }}>
                          {KIND[r.kind] || r.kind} · {fmtDate(r.createdAt)}
                        </span>
                      </span>
                      <span className="text-right">
                        <strong className="block" style={{ color: 'var(--p-text)' }}>{money(r.amount)}</strong>
                        <Badge tone={r.source === 'membership' ? 'accent' : 'info'}>
                          {r.source === 'membership' ? 'Membership' : 'Shop'}
                        </Badge>
                        <span className="flex justify-end gap-1 mt-1">
                          {r.source === 'membership' ? (
                            <>
                              <Button size="sm" variant="ghost" icon={Eye}
                                onClick={() => viewReceipt(r)}
                                aria-label="View receipt"
                                title="View payment receipt PDF" />
                              <Button size="sm" variant="ghost" icon={Download}
                                onClick={() => downloadReceipt(r)}
                                aria-label="Download receipt"
                                title="Download payment receipt PDF" />
                              {r.member?._id && (
                                <Button size="sm" variant="ghost" icon={FileText}
                                  loading={statementSending === r.member._id}
                                  onClick={() => sendStatement(r.member._id)}
                                  aria-label="Send WhatsApp"
                                  title="Send statement on WhatsApp" />
                              )}
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="ghost" icon={Eye}
                                onClick={() => viewOrderInvoice(r)}
                                aria-label="View invoice"
                                title="View order invoice PDF" />
                              <Button size="sm" variant="ghost" icon={Download}
                                onClick={() => downloadOrderInvoice(r)}
                                aria-label="Download invoice"
                                title="Download order invoice PDF" />
                            </>
                          )}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>

              <p className="text-[13px] text-center mt-4" style={{ color: 'var(--p-muted)' }}>
                <TrendingUp size={13} className="inline mr-1" />
                {shown.length} payment{shown.length === 1 ? '' : 's'} shown · {money(shownTotal)}
              </p>
            </FadeIn>
          )}
        </div>
      )}

      {dueFormOpen && (
        <Modal
          title="Add fee due"
          onClose={savingDue ? () => {} : () => setDueFormOpen(false)}
          width={460}
          footer={
            <>
              <Button onClick={() => setDueFormOpen(false)} disabled={savingDue}>Cancel</Button>
              <Button variant="primary" onClick={addDue} loading={savingDue}>
                {Number(dueForm.paidAmount || 0) > 0
                  ? `Record ${money(dueForm.paidAmount)} & Add Due`
                  : 'Add to due list'}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Field label="Member" required hint="Choose the member who owes the fee.">
              <Select
                value={dueForm.member}
                onChange={e => {
                  const member = members.find(item => item._id === e.target.value);
                  setDueForm(prev => ({
                    ...prev,
                    member: e.target.value,
                    amount: member?.dueAmount || member?.feeAmount || '',
                    paidAmount: '',
                  }));
                }}
              >
                <option value="">Choose a member</option>
                {members.map(member => <option key={member._id} value={member._id}>{member.name}</option>)}
              </Select>
            </Field>

            <Field label="Total fee amount (₹)" required>
              <Input
                type="number"
                min="1"
                value={dueForm.amount}
                onChange={e => setDueForm(current => ({ ...current, amount: e.target.value }))}
                placeholder="2000"
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Paid today (₹)" hint="Leave 0 if unpaid">
                <Input
                  type="number"
                  min="0"
                  max={dueForm.amount || undefined}
                  value={dueForm.paidAmount}
                  onChange={e => setDueForm(current => ({ ...current, paidAmount: e.target.value }))}
                  placeholder="0"
                />
              </Field>

              <Field label="Payment method">
                <Select
                  value={dueForm.method || 'cash'}
                  onChange={e => setDueForm(current => ({ ...current, method: e.target.value }))}
                  disabled={!Number(dueForm.paidAmount || 0)}
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="online">Online</option>
                  <option value="other">Other</option>
                </Select>
              </Field>
            </div>

            {Number(dueForm.paidAmount || 0) > 0 && (
              <div className="p-3 rounded-lg text-[13px] space-y-1.5" style={{ background: 'var(--p-surface-2)', border: '1px solid var(--p-border)' }}>
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--p-muted)' }}>Paid today (added to Total Revenue):</span>
                  <strong style={{ color: 'var(--p-ok)' }}>{money(dueForm.paidAmount)}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--p-muted)' }}>Remaining in due list:</span>
                  <strong style={{ color: 'var(--p-danger)' }}>{money(Math.max(0, Number(dueForm.amount || 0) - Number(dueForm.paidAmount || 0)))}</strong>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {payDueMember && (
        <Modal
          title={`Due fee for ${payDueMember.name}`}
          onClose={savingPayDue ? () => {} : () => setPayDueMember(null)}
          width={460}
          footer={
            <>
              <Button onClick={() => setPayDueMember(null)} disabled={savingPayDue}>Cancel</Button>
              <Button variant="primary" onClick={submitPayDue} loading={savingPayDue}>
                {payDueForm.mode === 'pay'
                  ? `Record ${money(payDueForm.paidAmount || 0)} payment`
                  : `Update due to ${money(payDueForm.newDue || 0)}`}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--p-surface-2)', border: '1px solid var(--p-border)' }}>
              <div>
                <span className="block text-[13px] font-semibold" style={{ color: 'var(--p-text)' }}>{payDueMember.name}</span>
                <span className="block text-[12px]" style={{ color: 'var(--p-muted)' }}>{payDueMember.phone || payDueMember.email}</span>
              </div>
              <div className="text-right">
                <span className="block text-[11px] uppercase tracking-wide" style={{ color: 'var(--p-muted)' }}>Outstanding due</span>
                <strong className="text-[17px]" style={{ color: 'var(--p-danger)' }}>{money(payDueMember.dueAmount)}</strong>
              </div>
            </div>

            <div className="flex rounded-lg p-1" style={{ background: 'var(--p-surface-2)', border: '1px solid var(--p-border)' }}>
              <button
                type="button"
                className="flex-1 py-1.5 text-[13px] font-medium rounded-md transition-colors"
                style={{
                  background: payDueForm.mode === 'pay' ? 'var(--p-surface)' : 'transparent',
                  color: payDueForm.mode === 'pay' ? 'var(--p-text)' : 'var(--p-muted)',
                  boxShadow: payDueForm.mode === 'pay' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
                onClick={() => setPayDueForm(prev => ({ ...prev, mode: 'pay' }))}
              >
                Collect payment
              </button>
              <button
                type="button"
                className="flex-1 py-1.5 text-[13px] font-medium rounded-md transition-colors"
                style={{
                  background: payDueForm.mode === 'adjust' ? 'var(--p-surface)' : 'transparent',
                  color: payDueForm.mode === 'adjust' ? 'var(--p-text)' : 'var(--p-muted)',
                  boxShadow: payDueForm.mode === 'adjust' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
                onClick={() => setPayDueForm(prev => ({ ...prev, mode: 'adjust' }))}
              >
                Change due amount
              </button>
            </div>

            {payDueForm.mode === 'pay' ? (
              <>
                <div>
                  <Field label="Paid amount (₹)" required hint="Enter amount collected today">
                    <Input
                      type="number"
                      min="1"
                      max={payDueMember.dueAmount}
                      value={payDueForm.paidAmount}
                      onChange={e => setPayDueForm(prev => ({ ...prev, paidAmount: e.target.value }))}
                      placeholder={String(payDueMember.dueAmount)}
                      autoFocus
                    />
                  </Field>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      className="text-[12px] px-2.5 py-1 rounded border hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      style={{ borderColor: 'var(--p-border)', color: 'var(--p-text-2)' }}
                      onClick={() => setPayDueForm(prev => ({ ...prev, paidAmount: String(Math.round(payDueMember.dueAmount / 2)) }))}
                    >
                      Half (50%): {money(Math.round(payDueMember.dueAmount / 2))}
                    </button>
                    <button
                      type="button"
                      className="text-[12px] px-2.5 py-1 rounded border hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      style={{ borderColor: 'var(--p-border)', color: 'var(--p-text-2)' }}
                      onClick={() => setPayDueForm(prev => ({ ...prev, paidAmount: String(payDueMember.dueAmount) }))}
                    >
                      Full (100%): {money(payDueMember.dueAmount)}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Payment method" required>
                    <Select
                      value={payDueForm.method}
                      onChange={e => setPayDueForm(prev => ({ ...prev, method: e.target.value }))}
                    >
                      <option value="cash">Cash</option>
                      <option value="upi">UPI</option>
                      <option value="card">Card</option>
                      <option value="online">Online</option>
                      <option value="other">Other</option>
                    </Select>
                  </Field>
                  <Field label="Note" hint="Optional">
                    <Input
                      value={payDueForm.note}
                      onChange={e => setPayDueForm(prev => ({ ...prev, note: e.target.value }))}
                      placeholder="e.g. Part payment via GPay"
                    />
                  </Field>
                </div>

                <div className="p-3 rounded-lg text-[13px] space-y-1.5" style={{ background: 'var(--p-surface-2)', border: '1px solid var(--p-border)' }}>
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'var(--p-muted)' }}>Payment today (to Total Revenue):</span>
                    <strong style={{ color: 'var(--p-ok)' }}>{money(payDueForm.paidAmount || 0)}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'var(--p-muted)' }}>Remaining due:</span>
                    <strong style={{ color: Math.max(0, payDueMember.dueAmount - Number(payDueForm.paidAmount || 0)) > 0 ? 'var(--p-danger)' : 'var(--p-ok)' }}>
                      {money(Math.max(0, payDueMember.dueAmount - Number(payDueForm.paidAmount || 0)))}
                    </strong>
                  </div>
                  <p className="text-[11.5px] pt-1" style={{ color: 'var(--p-muted)', borderTop: '1px solid var(--p-border)' }}>
                    {Math.max(0, payDueMember.dueAmount - Number(payDueForm.paidAmount || 0)) === 0
                      ? '✓ Fully clears this member’s due balance. They will be removed from Due Fees.'
                      : '⏳ The remaining balance will stay in Due Fees until paid.'}
                  </p>
                </div>
              </>
            ) : (
              <>
                <Field label="New due amount (₹)" required hint="Change the due amount directly without creating a payment record">
                  <Input
                    type="number"
                    min="0"
                    value={payDueForm.newDue}
                    onChange={e => setPayDueForm(prev => ({ ...prev, newDue: e.target.value }))}
                    placeholder="0"
                    autoFocus
                  />
                </Field>
                <p className="text-[12.5px]" style={{ color: 'var(--p-muted)' }}>
                  {Number(payDueForm.newDue) === 0
                    ? 'Setting to ₹0 marks this member as having no outstanding fee due.'
                    : `Updates the outstanding due fee to ${money(payDueForm.newDue)}.`}
                </p>
              </>
            )}
          </div>
        </Modal>
      )}

      <AnimatePresence>
        {pdfPreview && (
          <PdfViewerModal
            key="pdf-preview-modal"
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
