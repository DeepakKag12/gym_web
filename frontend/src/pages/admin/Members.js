import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
  UserPlus, Search, RefreshCw, AlertTriangle, UserSquare2, Pencil,
  CalendarPlus, Eye, Send, Download, FileText, CheckCircle2, Clock,
  CalendarClock, IndianRupee, Users as UsersIcon, MessageSquare, Mail,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';
import { apiError } from '../../utils/api';
import {
  Card, Button, Badge, Avatar, Field, Input, Select, Modal,
  EmptyState, SkeletonList, Table, TableRow, FadeIn, Tabs, WhatsAppButton, timeAgo, Check,
  PdfViewerModal,
} from '../../components/ui';
import {
  PLANS, PLAN_PRICES, loadUsers, statusOf, daysUntil, fmtDate, calcExpiry,
  EXPIRY_FILTERS, bustUserCaches, updateUser, sendReminder, runReminderSweep,
  whatsappPending,
} from './userService';
import { downloadPdf, fetchPdfBlobUrl } from '../../utils/pdf';

/**
 * Members — the gym-membership view of the same people the Users screen lists.
 *
 * Users is about accounts (roles, passwords, access). This screen is about
 * memberships: who is paid up, who lapses this week, and renewing them. The
 * split matters because those are two different jobs done at different times.
 */

/* ── Renew ──────────────────────────────────────────────────────────────── */

/**
 * Renewal extends from whichever is later: today, or the current expiry.
 *
 * Extending from today would silently throw away the days a member has already
 * paid for when they renew early — the single most common way a gym overcharges
 * someone by accident.
 */
function renewalStart(member) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const end = member.membershipEnd ? new Date(member.membershipEnd) : null;
  if (end && end > today) return end.toISOString().split('T')[0];
  return today.toISOString().split('T')[0];
}

function RenewModal({ member, onClose, onSaved }) {
  const [plan, setPlan] = useState(member.membershipPlan || 'monthly');
  const [start, setStart] = useState(() => renewalStart(member));
  const [fee, setFee] = useState(member.feeAmount ?? '');
  const [feeDue, setFeeDue] = useState(member.feePaid === false);
  const [initialPayment, setInitialPayment] = useState(() => member.feePaid === false ? '' : (member.feeAmount ?? ''));
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [saving, setSaving] = useState(false);

  const end = calcExpiry(start, plan);
  const extendingEarly = member.membershipEnd && new Date(member.membershipEnd) > new Date();

  const submit = async () => {
    if (Number(initialPayment || 0) > Number(fee || 0)) {
      toast.error('Paid today cannot be greater than the renewal fee.');
      return;
    }
    setSaving(true);
    try {
      await updateUser(
        { ...member, role: 'member' },
        {
          name: member.name, email: member.email, phone: member.phone || '',
          membershipPlan: plan, membershipStart: start, membershipEnd: end,
          feePaid: !feeDue && Number(initialPayment || 0) >= Number(fee || 0),
          feeAmount: fee === '' ? undefined : fee,
          initialPayment: initialPayment === '' ? undefined : initialPayment,
          paymentMethod,
        },
      );
      onSaved(`${member.name}'s membership now runs to ${fmtDate(end)}.`);
    } catch (err) {
      toast.error(apiError(err, 'Could not renew this membership.'));
    } finally { setSaving(false); }
  };

  return (
    <Modal
      title={`Renew ${member.name}`}
      onClose={saving ? () => {} : onClose}
      width={430}
      footer={
        <>
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={submit} loading={saving}>Renew membership</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Plan length">
            <Select
              value={plan}
              onChange={e => {
                const nextPlan = e.target.value;
                setPlan(nextPlan);
                const standardFee = PLAN_PRICES[nextPlan] || '';
                setFee(standardFee);
                if (!feeDue) setInitialPayment(standardFee);
              }}
              autoFocus
            >
              {Object.entries(PLANS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </Field>
          <Field label="Starts from">
            <Input type="date" value={start} onChange={e => setStart(e.target.value)} />
          </Field>
        </div>

        <Field label="Fee collected (₹)" hint="Optional">
          <Input type="number" min="0" value={fee} onChange={e => setFee(e.target.value)} placeholder="1500" />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Paid today (₹)" hint="Leave 0 if nothing was collected">
            <Input type="number" min="0" value={initialPayment}
              onChange={e => setInitialPayment(e.target.value)} placeholder="0" />
          </Field>
          <Field label="Payment method">
            <Select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="online">Online</option>
              <option value="other">Other</option>
            </Select>
          </Field>
        </div>

        <Check
          checked={feeDue}
          onChange={setFeeDue}
          label="Keep remaining balance due"
          hint="Renew now and put the unpaid remainder in Payments → Due fees."
        />

        {extendingEarly && (
          <p className="text-[13px]" style={{ color: 'var(--p-muted)' }}>
            Their current membership has not run out yet, so this starts from the
            existing expiry — no paid days are lost.
          </p>
        )}

        <p className="text-[14px] p-3 rounded-lg" style={{
          background: 'var(--p-accent-soft)', border: '1px solid var(--p-accent-line)', color: 'var(--p-text)',
        }}>
          New expiry: <strong>{fmtDate(end)}</strong>
        </p>
      </div>
    </Modal>
  );
}

/* ── View ───────────────────────────────────────────────────────────────── */

function MemberDetails({ member, onClose, onRenew, onViewStatement, onDownloadStatement }) {
  const status = statusOf(member);
  const left = daysUntil(member.membershipEnd);
  const row = (l, v) => <div className="ui-dl-row"><dt>{l}</dt><dd>{v}</dd></div>;

  return (
    <Modal
      title="Member details"
      onClose={onClose}
      width={460}
      footer={
        <div className="flex items-center justify-between w-full gap-2">
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="secondary" icon={FileText} onClick={() => onViewStatement(member)}>
              Statement
            </Button>
            <Button size="sm" variant="secondary" icon={Download} onClick={() => onDownloadStatement(member)}>
              PDF
            </Button>
          </div>
          <Button variant="primary" icon={CalendarPlus} onClick={onRenew}>Renew membership</Button>
        </div>
      }
    >
      <div className="flex items-center gap-3 mb-4">
        <Avatar name={member.name} size={48} />
        <div className="min-w-0">
          <p className="text-[16px] font-semibold" style={{ color: 'var(--p-text)' }}>{member.name}</p>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
      </div>
      <dl>
        {row('Email', member.email)}
        {row('Phone', member.phone || '—')}
        {row('Plan', PLANS[member.membershipPlan] || '—')}
        {row('Started', fmtDate(member.membershipStart || member.createdAt))}
        {row('Expires', fmtDate(member.membershipEnd))}
        {row('Days left', left === null ? '—' : left < 0 ? `${Math.abs(left)} days overdue` : `${left} days`)}
        {member.feeAmount ? row('Total fee', `₹${Number(member.feeAmount).toLocaleString('en-IN')}`) : null}
        {member.feeDueAmount > 0 ? (
          <div className="ui-dl-row">
            <dt>Fee due</dt>
            <dd style={{ color: 'var(--p-danger)', fontWeight: 600 }}>₹{Number(member.feeDueAmount).toLocaleString('en-IN')}</dd>
          </div>
        ) : null}
        {member.assignedTrainer?.name ? row('Trainer', member.assignedTrainer.name) : null}
      </dl>
    </Modal>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */

export default function AdminMembers() {
  const [params, setParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(params.get('filter') || 'all');

  const [viewing, setViewing] = useState(null);
  const [renewing, setRenewing] = useState(null);
  const [sweepingEmail, setSweepingEmail] = useState(false);
  const [sweepingWA, setSweepingWA] = useState(false);
  const [pdfPreview, setPdfPreview] = useState(null);

  const viewStatement = async member => {
    try {
      const { blobUrl, filename } = await fetchPdfBlobUrl(`/payments/${member._id}/statement`);
      setPdfPreview({
        blobUrl,
        title: `Statement: ${member.name || 'Member'}`,
        subtitle: `Plan: ${(member.membershipPlan || 'Standard').toUpperCase()} · Expires: ${fmtDate(member.membershipEnd)}`,
        fileName: filename || `${(member.name || 'member').replace(/\s+/g, '-')}-statement.pdf`,
        endpoint: `/payments/${member._id}/statement`,
      });
    } catch (err) {
      toast.error(apiError(err, 'Could not load member statement.'));
    }
  };

  const downloadStatement = async member => {
    await downloadPdf({
      endpoint: `/payments/${member._id}/statement`,
      defaultFilename: `${(member.name || 'member').replace(/\s+/g, '-')}-statement.pdf`,
      toastMessage: `Statement for ${member.name || 'member'} downloaded.`,
    });
  };

  const load = useCallback((force = false) => {
    setLoading(true);
    setError(null);
    loadUsers({ force })
      .then(all => setUsers(all.filter(u => u.role === 'member')))
      .catch(err => setError(apiError(err, 'Could not load your members.')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Keep the address bar in step so the dashboard's "See all" link lands right.
  useEffect(() => {
    const next = new URLSearchParams(params);
    if (filter === 'all') next.delete('filter'); else next.set('filter', filter);
    setParams(next, { replace: true });
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = () => { bustUserCaches(); load(true); };

  const counts = useMemo(() => {
    const c = {};
    EXPIRY_FILTERS.forEach(f => { c[f.value] = users.filter(f.test).length; });
    return c;
  }, [users]);

  const shown = useMemo(() => {
    const active = EXPIRY_FILTERS.find(f => f.value === filter) || EXPIRY_FILTERS[0];
    const q = search.trim().toLowerCase();
    return users.filter(u => {
      if (!active.test(u)) return false;
      if (!q) return true;
      return u.name?.toLowerCase().includes(q)
        || u.email?.toLowerCase().includes(q)
        || u.phone?.includes(q);
    });
  }, [users, filter, search]);

  const columns = [
    { key: 'name',   label: 'Member',            width: 220 },
    { key: 'plan',   label: 'Plan & Status',     width: 170 },
    { key: 'period', label: 'Membership Period', width: 160 },
    { key: 'act',    label: 'Actions',           width: 150, align: 'right' },
  ];

  return (
    <AdminLayout
      title="Members"
      subtitle="Memberships, renewals and expiry"
      actions={<Button variant="primary" icon={UserPlus} to="/admin/users?add=1">Add member</Button>}
    >
      {/* Quick Status Section Division Cards — All Members, Active, Expiring in 5 Days, Expired, Fee Due */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-5">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`p-3.5 sm:p-4 rounded-xl border text-left transition cursor-pointer relative overflow-hidden ${
            filter === 'all'
              ? 'ring-2 ring-[var(--p-accent)] shadow-md'
              : 'hover:border-[var(--p-border-2)]'
          }`}
          style={{ background: 'var(--p-surface)', borderColor: 'var(--p-border)' }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--p-text-2)' }}>
              All Members
            </span>
            <span className="p-1 rounded-md" style={{ background: 'var(--p-surface-2)', color: 'var(--p-text-2)' }}>
              <UsersIcon size={14} />
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight" style={{ color: 'var(--p-text)' }}>
            {users.length}
          </div>
          <p className="text-[11.5px] mt-0.5 truncate" style={{ color: 'var(--p-muted)' }}>
            Complete roster
          </p>
          {filter === 'all' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--p-accent)]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setFilter('active')}
          className={`p-3.5 sm:p-4 rounded-xl border text-left transition cursor-pointer relative overflow-hidden ${
            filter === 'active'
              ? 'ring-2 ring-emerald-500 shadow-md'
              : 'hover:border-[var(--p-border-2)]'
          }`}
          style={{ background: 'var(--p-surface)', borderColor: 'var(--p-border)' }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Active
            </span>
            <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 size={14} />
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-emerald-400">
            {counts.active || 0}
          </div>
          <p className="text-[11.5px] mt-0.5 truncate text-emerald-400/70">
            Valid & training
          </p>
          {filter === 'active' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setFilter('expiring5')}
          className={`p-3.5 sm:p-4 rounded-xl border text-left transition cursor-pointer relative overflow-hidden ${
            filter === 'expiring5'
              ? 'ring-2 ring-amber-500 shadow-md'
              : 'hover:border-[var(--p-border-2)]'
          }`}
          style={{ background: 'var(--p-surface)', borderColor: 'var(--p-border)' }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Expiring ≤ 5d
            </span>
            <span className="p-1 rounded-md bg-amber-500/10 text-amber-400">
              <CalendarClock size={14} />
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-amber-400">
            {counts.expiring5 || 0}
          </div>
          <p className="text-[11.5px] mt-0.5 truncate text-amber-400/70">
            Needs renewal
          </p>
          {filter === 'expiring5' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setFilter('expired')}
          className={`p-3.5 sm:p-4 rounded-xl border text-left transition cursor-pointer relative overflow-hidden ${
            filter === 'expired'
              ? 'ring-2 ring-rose-500 shadow-md'
              : 'hover:border-[var(--p-border-2)]'
          }`}
          style={{ background: 'var(--p-surface)', borderColor: 'var(--p-border)' }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
              Expired
            </span>
            <span className="p-1 rounded-md bg-rose-500/10 text-rose-400">
              <Clock size={14} />
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-rose-400">
            {counts.expired || 0}
          </div>
          <p className="text-[11.5px] mt-0.5 truncate text-rose-400/70">
            Lapsed plans
          </p>
          {filter === 'expired' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setFilter('due')}
          className={`p-3.5 sm:p-4 rounded-xl border text-left transition cursor-pointer relative overflow-hidden col-span-2 sm:col-span-1 ${
            filter === 'due'
              ? 'ring-2 ring-purple-500 shadow-md'
              : 'hover:border-[var(--p-border-2)]'
          }`}
          style={{ background: 'var(--p-surface)', borderColor: 'var(--p-border)' }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
              Fee Due
            </span>
            <span className="p-1 rounded-md bg-purple-500/10 text-purple-400">
              <IndianRupee size={14} />
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-purple-400">
            {counts.due || 0}
          </div>
          <p className="text-[11.5px] mt-0.5 truncate text-purple-400/70">
            Pending fees
          </p>
          {filter === 'due' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500" />
          )}
        </button>
      </div>

      {/* Active Section Info Banner */}
      <div className="flex items-center justify-between p-3 mb-4 rounded-xl text-xs font-medium"
        style={{ background: 'var(--p-surface-2)', border: '1px solid var(--p-border)' }}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{
            background: filter === 'active' ? 'var(--p-ok)' :
                        filter === 'expiring5' ? 'var(--p-warn)' :
                        filter === 'expired' ? 'var(--p-danger)' :
                        filter === 'due' ? '#a855f7' : 'var(--p-accent)'
          }} />
          <span style={{ color: 'var(--p-text)' }}>
            {filter === 'active' && `Active Members Section (${counts.active || 0}) — Fully paid and valid`}
            {filter === 'expiring5' && `Expiring in ≤ 5 Days Section (${counts.expiring5 || 0}) — Immediate renewal follow-up required`}
            {filter === 'expired' && `Expired Members Section (${counts.expired || 0}) — Lapsed members for re-activation`}
            {filter === 'due' && `Fee Due Section (${counts.due || 0}) — Members with pending dues`}
            {filter === 'towhatsapp' && `WhatsApp Pending Section (${counts.towhatsapp || 0}) — Awaiting reminder`}
            {filter === 'all' && `All Members Section (${users.length}) — Complete member roster`}
          </span>
        </div>
        {filter !== 'all' && (
          <button
            type="button"
            onClick={() => setFilter('all')}
            className="text-[11.5px] underline hover:opacity-80 cursor-pointer"
            style={{ color: 'var(--p-accent)' }}
          >
            Show All
          </button>
        )}
      </div>

      <div className="ui-toolbar flex-wrap gap-2.5">
        <div className="ui-search flex-1 min-w-[220px]">
          <Search size={18} />
          <Input placeholder="Search by name, email or phone" value={search}
            onChange={e => setSearch(e.target.value)} aria-label="Search members" />
        </div>
        <Button icon={RefreshCw} onClick={refresh} disabled={loading}>Refresh</Button>
        <Button
          variant={filter === 'expiring5' ? 'primary' : 'secondary'}
          icon={MessageSquare}
          loading={sweepingWA}
          className="hover:border-emerald-500/50"
          onClick={async () => {
            setSweepingWA(true);
            try {
              const r = await runReminderSweep(['whatsapp'], 7);
              toast.success(r.message || 'WhatsApp reminders dispatched.');
              refresh();
            } catch (err) {
              toast.error(apiError(err, 'Could not send WhatsApp reminders.'));
            } finally { setSweepingWA(false); }
          }}
        >
          WhatsApp everyone expiring
        </Button>
        <Button
          variant="secondary"
          icon={Mail}
          loading={sweepingEmail}
          onClick={async () => {
            setSweepingEmail(true);
            try {
              const r = await runReminderSweep(['email'], 7);
              toast.success(r.message || 'Email reminders dispatched.');
              refresh();
            } catch (err) {
              toast.error(apiError(err, 'Could not send email reminders.'));
            } finally { setSweepingEmail(false); }
          }}
        >
          Email everyone expiring
        </Button>
      </div>

      <div className="mb-4">
        <Tabs
          value={filter}
          onChange={setFilter}
          options={EXPIRY_FILTERS.map(f => ({ value: f.value, label: f.label, count: counts[f.value] }))}
        />
      </div>

      {error ? (
        <Card>
          <EmptyState icon={AlertTriangle} title="Could not load members" hint={error}>
            <Button variant="primary" icon={RefreshCw} onClick={() => load(true)}>Try again</Button>
          </EmptyState>
        </Card>
      ) : loading ? (
        <SkeletonList rows={6} h={64} />
      ) : shown.length === 0 ? (
        <Card>
          <EmptyState
            icon={UserSquare2}
            title={users.length === 0 ? 'No members yet' : 'Nobody in this list'}
            hint={users.length === 0
              ? 'Add your first member and they can sign in straight away.'
              : 'Nothing matches this filter right now — which is usually good news.'}
          >
            {users.length === 0
              ? <Button variant="primary" icon={UserPlus} to="/admin/users?add=1">Add member</Button>
              : <Button onClick={() => { setSearch(''); setFilter('all'); }}>Show everyone</Button>}
          </EmptyState>
        </Card>
      ) : (
        <FadeIn>
          <Card padded={false} className="hidden md:block">
            <Table columns={columns}>
              {shown.map(m => {
                const status = statusOf(m);
                return (
                  <TableRow key={m._id}>
                    <td>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar name={m.name} size={32} />
                        <div className="min-w-0 max-w-[170px]">
                          <div className="font-semibold truncate text-[13.5px]" style={{ color: 'var(--p-text)' }}>{m.name}</div>
                          <div className="text-[12px] truncate" style={{ color: 'var(--p-muted)' }}>
                            {m.phone || m.email || '—'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-[13px]" style={{ color: 'var(--p-text)' }}>
                            {PLANS[m.membershipPlan] || 'Standard'}
                          </span>
                          <Badge tone={status.tone}>{status.label}</Badge>
                        </div>
                        {whatsappPending(m) ? (
                          <span className="text-[11px]" style={{ color: 'var(--p-warn)' }}>
                            WhatsApp pending
                          </span>
                        ) : m.lastWhatsAppAt ? (
                          <span className="text-[11px]" style={{ color: 'var(--p-muted)' }}>
                            WhatsApp {timeAgo(m.lastWhatsAppAt)}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <div className="text-[12.5px] whitespace-nowrap" style={{ color: 'var(--p-text)' }}>
                        Ends <span className="font-semibold">{fmtDate(m.membershipEnd)}</span>
                      </div>
                      <div className="text-[11.5px] whitespace-nowrap" style={{ color: 'var(--p-muted)' }}>
                        Started {fmtDate(m.membershipStart || m.createdAt)}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="ui-row-actions flex items-center justify-end gap-1 flex-nowrap">
                        <Button size="sm" variant="ghost" icon={Eye} onClick={() => setViewing(m)}
                          aria-label={`View ${m.name}`} title="View member details" />
                        <Button size="sm" variant="ghost" icon={FileText} onClick={() => viewStatement(m)}
                          aria-label={`View statement for ${m.name}`} title="View PDF statement" />
                        <Button size="sm" variant="ghost" icon={CalendarPlus} onClick={() => setRenewing(m)}
                          aria-label={`Renew ${m.name}`} title="Renew membership" />
                        <Button size="sm" variant="ghost" icon={Pencil} to={`/admin/users?edit=${m._id}`}
                          aria-label={`Edit ${m.name}`} title="Edit member" />
                        <WhatsAppButton
                          size="sm"
                          variant="ghost"
                          label=""
                          onBeforeOpen={async () => {
                            const r = await sendReminder(m);
                            toast.success(r.message || 'Reminder emailed.');
                            return r;
                          }}
                          buildHref={r => r?.whatsappUrl}
                        />
                      </div>
                    </td>
                  </TableRow>
                );
              })}
            </Table>
          </Card>

          <Card padded={false} className="md:hidden">
            <ul>
              {shown.map((m, i) => {
                const status = statusOf(m);
                return (
                  <li key={m._id} className="px-4 py-3.5" style={{ borderTop: i ? '1px solid var(--p-border)' : 'none' }}>
                    <div className="flex items-center gap-3">
                      <Avatar name={m.name} size={40} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-semibold truncate" style={{ color: 'var(--p-text)' }}>{m.name}</p>
                        <p className="text-[13px] truncate" style={{ color: 'var(--p-text-2)' }}>{m.phone || m.email}</p>
                        <p className="text-[12px] mt-0.5" style={{ color: 'var(--p-muted)' }}>
                          {PLANS[m.membershipPlan] || '—'} · Expires {fmtDate(m.membershipEnd)}
                        </p>
                      </div>
                      <span className="flex-shrink-0 text-right">
                        <Badge tone={status.tone}>{status.label}</Badge>
                        {/* The reminder state drove the whole WhatsApp workflow but
                            was printed in the desktop table only, so on a phone
                            there was no way to tell who still needed messaging. */}
                        {whatsappPending(m) ? (
                          <span className="block text-[11px] mt-1" style={{ color: 'var(--p-warn)' }}>
                            WhatsApp pending
                          </span>
                        ) : m.lastWhatsAppAt ? (
                          <span className="block text-[11px] mt-1" style={{ color: 'var(--p-muted)' }}>
                            WA {timeAgo(m.lastWhatsAppAt)}
                          </span>
                        ) : null}
                      </span>
                    </div>
                    {/* Every action the desktop table offers. These used to be
                        View and Renew only, so sending a member their reminder
                        on WhatsApp — the job this screen exists for — could not
                        be done from a phone at all. */}
                    {/* One row, so a hundred members stay scannable. The two
                        actions with a name are the ones this screen is for;
                        view and edit are icons with accessible labels. */}
                    <div className="mt-2.5 flex items-center gap-2">
                      <Button size="sm" variant="primary" icon={CalendarPlus} onClick={() => setRenewing(m)}>Renew</Button>
                      <WhatsAppButton
                        size="sm"
                        label="WhatsApp"
                        onBeforeOpen={async () => {
                          const r = await sendReminder(m);
                          toast.success(r.message || 'Reminder emailed.');
                          return r;
                        }}
                        buildHref={r => r?.whatsappUrl}
                      />
                      <span className="flex gap-1.5 ml-auto">
                        <Button size="sm" icon={FileText} onClick={() => viewStatement(m)}
                          aria-label={`Statement ${m.name}`} title="View statement" />
                        <Button size="sm" icon={Eye} onClick={() => setViewing(m)}
                          aria-label={`View ${m.name}`} title="View member" />
                        <Button size="sm" icon={Pencil} to={`/admin/users?edit=${m._id}`}
                          aria-label={`Edit ${m.name}`} title="Edit member" />
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>

          <p className="text-[13px] text-center mt-4" style={{ color: 'var(--p-muted)' }}>
            Showing {shown.length} of {users.length} member{users.length === 1 ? '' : 's'}
            {filter !== 'all' && <> · <button onClick={() => setFilter('all')} style={{ color: 'var(--p-accent)' }}>show everyone</button></>}
          </p>
        </FadeIn>
      )}

      <AnimatePresence>
        {viewing && (
          <MemberDetails
            key="view"
            member={viewing}
            onClose={() => setViewing(null)}
            onRenew={() => { setRenewing(viewing); setViewing(null); }}
            onViewStatement={viewStatement}
            onDownloadStatement={downloadStatement}
          />
        )}
        {renewing && (
          <RenewModal
            key="renew"
            member={renewing}
            onClose={() => setRenewing(null)}
            onSaved={msg => { setRenewing(null); toast.success(msg); refresh(); }}
          />
        )}
        {pdfPreview && (
          <PdfViewerModal
            key="member-pdf-preview"
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
