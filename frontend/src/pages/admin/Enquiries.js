import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Search, RefreshCw, AlertTriangle, Trash2, Reply,
  Phone, Mail, CheckCircle2, Clock, UserPlus,
} from 'lucide-react';
import toast from 'react-hot-toast';

import API, { cachedGet, freshGet, bustCache, apiError } from '../../utils/api';
import AdminLayout from './AdminLayout';
import {
  Card, Button, Badge, Avatar, Field, Textarea, Select, Input, Modal,
  ConfirmDialog, EmptyState, SkeletonList, Tabs, FadeIn, WhatsAppButton, timeAgo,
} from '../../components/ui';

/**
 * Enquiries — people asking about joining, and what was said back.
 *
 * Rebuilt from a hand-rolled dark screen onto the shared UI kit, and given the
 * thing it was missing: a way to actually reply.
 *
 * Replying sends the email server-side and hands the same text to WhatsApp, so
 * one action covers both channels. The enquiry records when it was answered, so
 * "new" means genuinely unanswered rather than merely unmarked.
 */

const STATUS = {
  new:       { label: 'New',       tone: 'warn' },
  contacted: { label: 'Contacted', tone: 'info' },
  converted: { label: 'Joined',    tone: 'ok' },
  closed:    { label: 'Closed',    tone: 'neutral' },
};

const INTEREST = {
  membership: 'Membership',
  'personal-training': 'Personal training',
  'diet-plan': 'Diet plan',
  supplements: 'Supplements',
  general: 'General',
};

/* ── Reply ──────────────────────────────────────────────────────────────── */

function ReplyModal({ enquiry, onClose, onDone }) {
  const [message, setMessage] = useState(
    `Hi ${enquiry.name}, thanks for getting in touch with FitNation. `,
  );
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!message.trim()) return setError('Write a reply first.');
    setSending(true);
    try {
      const { data } = await API.post(`/enquiries/${enquiry._id}/reply`, { message });
      onDone(data);
    } catch (err) {
      toast.error(apiError(err, 'Could not send this reply.'));
    } finally { setSending(false); }
  };

  return (
    <Modal
      title={`Reply to ${enquiry.name}`}
      onClose={sending ? () => {} : onClose}
      width={520}
      footer={
        <>
          <Button onClick={onClose} disabled={sending}>Cancel</Button>
          {/* Email always goes; WhatsApp opens afterwards with the same text. */}
          <WhatsAppButton
            label="Send email + WhatsApp"
            onBeforeOpen={async () => {
              // The parent reports the outcome, so no toast here — otherwise
              // the admin gets the same confirmation twice.
              const { data } = await API.post(`/enquiries/${enquiry._id}/reply`, { message });
              onDone(data);
              return data;
            }}
            buildHref={r => r?.whatsappUrl}
            disabled={!message.trim()}
          />
          <Button variant="primary" icon={Mail} onClick={send} loading={sending}>
            Email only
          </Button>
        </>
      }
    >
      <div className="ui-card ui-card-pad mb-4" style={{ background: 'var(--p-surface-2)', boxShadow: 'none' }}>
        <p className="text-[12.5px] mb-1" style={{ color: 'var(--p-muted)' }}>They wrote</p>
        <p className="text-[14px]" style={{ color: 'var(--p-text)' }}>{enquiry.message}</p>
      </div>

      <Field
        label="Your reply"
        required
        error={error}
        hint={enquiry.email
          ? `Emailed to ${enquiry.email}. WhatsApp opens with the same text.`
          : 'No email address on this enquiry — WhatsApp only.'}
      >
        <Textarea
          rows={6}
          value={message}
          autoFocus
          onChange={e => { setMessage(e.target.value); setError(null); }}
        />
      </Field>
    </Modal>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('new');
  const [search, setSearch] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback((force = false) => {
    setLoading(true);
    setError(null);
    (force ? freshGet : cachedGet)('/enquiries', { cache: 60 })
      .then(r => setEnquiries(Array.isArray(r.data) ? r.data : []))
      .catch(err => setError(apiError(err, 'Could not load enquiries.')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const refresh = () => { bustCache('/enquiries'); bustCache('analytics'); load(true); };

  const counts = useMemo(() => {
    const c = { all: enquiries.length };
    Object.keys(STATUS).forEach(k => { c[k] = enquiries.filter(e => e.status === k).length; });
    return c;
  }, [enquiries]);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enquiries.filter(e => {
      if (tab !== 'all' && e.status !== tab) return false;
      if (!q) return true;
      return e.name?.toLowerCase().includes(q)
        || e.phone?.includes(q)
        || e.email?.toLowerCase().includes(q)
        || e.message?.toLowerCase().includes(q);
    });
  }, [enquiries, tab, search]);

  const setStatus = async (e, status) => {
    try {
      await API.put(`/enquiries/${e._id}`, { status });
      setEnquiries(prev => prev.map(x => (x._id === e._id ? { ...x, status } : x)));
      bustCache('/enquiries');
      toast.success(`Marked ${STATUS[status].label.toLowerCase()}.`);
    } catch (err) {
      toast.error(apiError(err, 'Could not update this enquiry.'));
    }
  };

  const remove = async e => {
    setBusy(true);
    try {
      await API.delete(`/enquiries/${e._id}`);
      setEnquiries(prev => prev.filter(x => x._id !== e._id));
      bustCache('/enquiries');
      toast.success('Enquiry deleted.');
      setConfirm(null);
    } catch (err) {
      toast.error(apiError(err, 'Could not delete this enquiry.'));
    } finally { setBusy(false); }
  };

  return (
    <AdminLayout
      title="Enquiries"
      subtitle="People asking about joining your gym"
      actions={<Button icon={RefreshCw} onClick={refresh} disabled={loading}>Refresh</Button>}
    >
      {/* Quick Status Section Division Cards — All Enquiries, New, Contacted, Joined */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
        <button
          type="button"
          onClick={() => setTab('all')}
          className={`p-3.5 sm:p-4 rounded-xl border text-left transition cursor-pointer relative overflow-hidden ${
            tab === 'all'
              ? 'ring-2 ring-[var(--p-accent)] shadow-md'
              : 'hover:border-[var(--p-border-2)]'
          }`}
          style={{ background: 'var(--p-surface)', borderColor: 'var(--p-border)' }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--p-text-2)' }}>
              All Inquiries
            </span>
            <span className="p-1 rounded-md" style={{ background: 'var(--p-surface-2)', color: 'var(--p-text-2)' }}>
              <MessageSquare size={14} />
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight" style={{ color: 'var(--p-text)' }}>
            {counts.all || 0}
          </div>
          <p className="text-[11.5px] mt-0.5 truncate" style={{ color: 'var(--p-muted)' }}>
            Total prospective leads
          </p>
          {tab === 'all' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--p-accent)]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setTab('new')}
          className={`p-3.5 sm:p-4 rounded-xl border text-left transition cursor-pointer relative overflow-hidden ${
            tab === 'new'
              ? 'ring-2 ring-amber-500 shadow-md'
              : 'hover:border-[var(--p-border-2)]'
          }`}
          style={{ background: 'var(--p-surface)', borderColor: 'var(--p-border)' }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              New Leads
            </span>
            <span className="p-1 rounded-md bg-amber-500/10 text-amber-400">
              <Clock size={14} />
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-amber-400">
            {counts.new || 0}
          </div>
          <p className="text-[11.5px] mt-0.5 truncate text-amber-400/70">
            Awaiting first response
          </p>
          {tab === 'new' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setTab('contacted')}
          className={`p-3.5 sm:p-4 rounded-xl border text-left transition cursor-pointer relative overflow-hidden ${
            tab === 'contacted'
              ? 'ring-2 ring-blue-500 shadow-md'
              : 'hover:border-[var(--p-border-2)]'
          }`}
          style={{ background: 'var(--p-surface)', borderColor: 'var(--p-border)' }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Contacted
            </span>
            <span className="p-1 rounded-md bg-blue-500/10 text-blue-400">
              <Reply size={14} />
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-blue-400">
            {counts.contacted || 0}
          </div>
          <p className="text-[11.5px] mt-0.5 truncate text-blue-400/70">
            Discussion in progress
          </p>
          {tab === 'contacted' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setTab('converted')}
          className={`p-3.5 sm:p-4 rounded-xl border text-left transition cursor-pointer relative overflow-hidden ${
            tab === 'converted'
              ? 'ring-2 ring-emerald-500 shadow-md'
              : 'hover:border-[var(--p-border-2)]'
          }`}
          style={{ background: 'var(--p-surface)', borderColor: 'var(--p-border)' }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Joined Gym
            </span>
            <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 size={14} />
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-emerald-400">
            {counts.converted || 0}
          </div>
          <p className="text-[11.5px] mt-0.5 truncate text-emerald-400/70">
            Converted athletes
          </p>
          {tab === 'converted' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
          )}
        </button>
      </div>

      {/* Active Section Info Banner */}
      <div className="flex items-center justify-between p-3 mb-4 rounded-xl text-xs font-medium"
        style={{ background: 'var(--p-surface-2)', border: '1px solid var(--p-border)' }}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{
            background: tab === 'new' ? 'var(--p-warn)' :
                        tab === 'contacted' ? 'var(--p-info)' :
                        tab === 'converted' ? 'var(--p-ok)' :
                        tab === 'closed' ? 'var(--p-muted)' : 'var(--p-accent)'
          }} />
          <span style={{ color: 'var(--p-text)' }}>
            {tab === 'new' && `New Leads Section (${counts.new || 0}) — Direct replies and WhatsApp follow-up needed`}
            {tab === 'contacted' && `Contacted Leads Section (${counts.contacted || 0}) — In discussion`}
            {tab === 'converted' && `Joined Athletes Section (${counts.converted || 0}) — Successfully enrolled`}
            {tab === 'closed' && `Closed Inquiries Section (${counts.closed || 0}) — Archived`}
            {tab === 'all' && `All Inquiries Section (${counts.all || 0}) — Full lead pipeline`}
          </span>
        </div>
        {tab !== 'all' && (
          <button
            type="button"
            onClick={() => setTab('all')}
            className="text-[11.5px] underline hover:opacity-80 cursor-pointer"
            style={{ color: 'var(--p-accent)' }}
          >
            Show All
          </button>
        )}
      </div>

      <div className="ui-toolbar">
        <div className="ui-search">
          <Search size={18} />
          <Input placeholder="Search by name, phone, email or message"
            value={search} onChange={e => setSearch(e.target.value)} aria-label="Search enquiries" />
        </div>
      </div>

      <div className="mb-4">
        <Tabs
          value={tab}
          onChange={setTab}
          options={[
            { value: 'new', label: 'New', count: counts.new },
            { value: 'contacted', label: 'Contacted', count: counts.contacted },
            { value: 'converted', label: 'Joined', count: counts.converted },
            { value: 'closed', label: 'Closed', count: counts.closed },
            { value: 'all', label: 'Everyone', count: counts.all },
          ]}
        />
      </div>

      {error ? (
        <Card>
          <EmptyState icon={AlertTriangle} title="Could not load enquiries" hint={error}>
            <Button variant="primary" icon={RefreshCw} onClick={() => load(true)}>Try again</Button>
          </EmptyState>
        </Card>
      ) : loading ? (
        <SkeletonList rows={4} h={120} />
      ) : shown.length === 0 ? (
        <Card>
          <EmptyState
            icon={MessageSquare}
            title={enquiries.length === 0 ? 'No enquiries yet' : 'Nothing in this list'}
            hint={enquiries.length === 0
              ? 'Enquiries from your website land here.'
              : tab === 'new' ? 'Everyone has been replied to — good.' : 'Try another filter or search.'}
          />
        </Card>
      ) : (
        <FadeIn>
          <div className="space-y-3">
            {shown.map(e => {
              const st = STATUS[e.status] || STATUS.new;
              return (
                <Card key={e._id}>
                  <div className="flex items-start gap-3 flex-wrap">
                    <Avatar name={e.name} size={40} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[15px] font-semibold" style={{ color: 'var(--p-text)' }}>{e.name}</span>
                        <Badge tone={st.tone}>{st.label}</Badge>
                        <Badge tone="neutral">{INTEREST[e.interest] || 'General'}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[13px] flex-wrap" style={{ color: 'var(--p-text-2)' }}>
                        <a href={`tel:${e.phone}`} className="flex items-center gap-1.5">
                          <Phone size={12} /> {e.phone}
                        </a>
                        {e.email && (
                          <a href={`mailto:${e.email}`} className="flex items-center gap-1.5">
                            <Mail size={12} /> {e.email}
                          </a>
                        )}
                        <span className="flex items-center gap-1.5" style={{ color: 'var(--p-muted)' }}>
                          <Clock size={12} /> {timeAgo(e.createdAt)}
                        </span>
                      </div>
                    </div>
                    <Select
                      value={e.status}
                      onChange={ev => setStatus(e, ev.target.value)}
                      aria-label={`Status for ${e.name}`}
                      style={{ width: 150 }}
                    >
                      {Object.entries(STATUS).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </Select>
                  </div>

                  <p className="text-[14px] mt-3 p-3 rounded-lg"
                    style={{ background: 'var(--p-surface-2)', color: 'var(--p-text)' }}>
                    {e.message}
                  </p>

                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <Button variant="primary" size="sm" icon={Reply} onClick={() => setReplyTo(e)}>
                      Reply
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      icon={UserPlus}
                      to={`/admin/users?add=1&name=${encodeURIComponent(e.name)}&email=${encodeURIComponent(e.email || '')}&phone=${encodeURIComponent(e.phone || '')}`}
                    >
                      Convert to Member
                    </Button>
                    <Button size="sm" variant="ghost" icon={Trash2} onClick={() => setConfirm(e)}
                      aria-label={`Delete enquiry from ${e.name}`} title="Delete"
                      style={{ color: 'var(--p-danger)' }} />

                    {/* Reply history, so nobody is answered twice or missed */}
                    <span className="ml-auto text-[12.5px] flex items-center gap-1.5"
                      style={{ color: e.repliedAt ? 'var(--p-ok)' : 'var(--p-muted)' }}>
                      {e.repliedAt ? (
                        <>
                          <CheckCircle2 size={13} />
                          Replied {timeAgo(e.repliedAt)}
                          {e.replyCount > 1 ? ` · ${e.replyCount} times` : ''}
                        </>
                      ) : 'Not replied yet'}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>

          <p className="text-[13px] text-center mt-4" style={{ color: 'var(--p-muted)' }}>
            Showing {shown.length} of {enquiries.length}
          </p>
        </FadeIn>
      )}

      <AnimatePresence>
        {replyTo && (
          <ReplyModal
            key="reply"
            enquiry={replyTo}
            onClose={() => setReplyTo(null)}
            onDone={data => {
              setReplyTo(null);
              if (data?.message) toast.success(data.message);
              setEnquiries(prev => prev.map(x => (x._id === data.enquiry._id ? data.enquiry : x)));
              bustCache('/enquiries');
            }}
          />
        )}

        {confirm && (
          <ConfirmDialog
            key="del"
            title={`Delete the enquiry from ${confirm.name}?`}
            message="This removes their message and your reply history for good. It cannot be undone."
            confirmLabel="Delete"
            cancelLabel="Cancel"
            loading={busy}
            onCancel={() => setConfirm(null)}
            onConfirm={() => remove(confirm)}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
