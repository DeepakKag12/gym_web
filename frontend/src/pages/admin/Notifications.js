import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Bell, CheckCheck, RefreshCw, Send, AlertTriangle, MessageCircle, Mail, Monitor, Zap, Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import API, { cachedGet, bustCache, freshGet } from '../../utils/api';
import AdminLayout from './AdminLayout';
import { whatsappPending } from './userService';
import {
  Card, Button, Badge, Field, Input, Select, Textarea, Check as CheckRow,
  Modal, Tabs, EmptyState, SkeletonList, ConfirmDialog, timeAgo,
} from '../../components/ui';

/**
 * Notification types must match the enum in the API's Notification model.
 * They previously did not — the compose box sent `fee_reminder` / `plan_expiry`
 * / `message`, none of which the server accepts, so those sends failed.
 */
const TYPES = [
  { value: 'announcement',       label: 'Announcement' },
  { value: 'general',            label: 'General' },
  { value: 'fee-reminder',       label: 'Fee reminder' },
  { value: 'membership-expired', label: 'Membership expired' },
];

const TYPE_TONE = {
  'fee-reminder': 'warn',
  'membership-expired': 'danger',
  announcement: 'info',
  welcome: 'accent',
};

const CHANNEL_ICON = { website: Monitor, whatsapp: MessageCircle, email: Mail };

/** Where a single notification actually landed. */
function DeliveryChips({ notif }) {
  const sent = notif.sentVia || [];
  const failed = Object.entries(notif.delivery || {})
    .filter(([, d]) => d && d.status === 'failed')
    .map(([channel]) => channel);

  if (!sent.length && !failed.length) return null;
  return (
    <span className="flex items-center gap-1.5 flex-wrap">
      {sent.map(c => {
        const Icon = CHANNEL_ICON[c] || Monitor;
        return (
          <span key={c} className="inline-flex items-center gap-1 text-[12px]" style={{ color: 'var(--p-muted)' }}>
            <Icon size={12} /> {c}
          </span>
        );
      })}
      {failed.map(c => (
        <span key={c} className="inline-flex items-center gap-1 text-[12px]" style={{ color: 'var(--p-danger)' }}>
          <AlertTriangle size={12} /> {c} failed
        </span>
      ))}
    </span>
  );
}

const PRESET_TEMPLATES = [
  {
    label: '⚡ WhatsApp Meta Template',
    sub: 'Uses approved "fitnation_by_ajeet" (Name & Days variables)',
    type: 'fee-reminder',
    title: 'Membership renewal reminder',
    message: 'Hello! 👋 Friendly reminder from FitNation by Ajeet 💪 Your gym membership is set to expire soon. Please renew your membership to continue your fitness journey with us! 🏋️‍♂️🔥\n\n💳 Renew your membership today and keep training without a break!\n\nFor more details or assistance, please contact Ajeet at 9630906906 📞\n\nStay Fit. Stay Strong. 💪',
    defaultWA: true,
  },
  {
    label: '📢 Custom Announcement (Email)',
    sub: 'Free broadcast — deliver custom text to inboxes & app',
    type: 'announcement',
    title: 'Important Gym Announcement',
    message: 'Dear FitNation athletes, please take note of this update regarding gym timings, fitness classes, and equipment maintenance. Stay Fit. Stay Strong! 💪',
    defaultWA: false,
  },
  {
    label: '⚠️ Membership Expired Notice',
    sub: 'Targeted to expired members (WhatsApp + Email)',
    type: 'membership-expired',
    title: 'Membership has expired',
    message: 'Hello! Your FitNation by Ajeet gym membership has expired. Please renew your membership to resume training without interruption! Contact Ajeet at 9630906906 for quick renewal. 💪',
    defaultWA: true,
  },
  {
    label: '💳 Pending Fee Balance (Email)',
    sub: 'Custom fee collection alert for members with dues',
    type: 'fee-reminder',
    title: 'Pending gym fee reminder',
    message: 'Dear member, you have a pending membership fee balance. Please clear your dues at the gym reception desk or via online payment.',
    defaultWA: false,
  },
];

/* ─── Compose ───────────────────────────────────────────────────────────── */
function ComposeModal({ members, onClose, onSent }) {
  const [form, setForm] = useState({
    title: '', message: '', type: 'fee-reminder',
    target: 'expiring_2d', memberId: '',
    sendWhatsApp: true, sendEmail: true,
  });
  const [sending, setSending] = useState(false);

  // Compute live audience counts
  const now = useMemo(() => new Date(), []);
  const in2Days = useMemo(() => new Date(Date.now() + 2 * 86400000), []);
  const in7Days = useMemo(() => new Date(Date.now() + 7 * 86400000), []);

  const expiring2dCount = useMemo(() => members.filter(m => {
    if (!m.membershipEnd || m.membershipStatus === 'expired') return false;
    const d = new Date(m.membershipEnd);
    return d >= now && d <= in2Days;
  }).length, [members, now, in2Days]);

  const expiring7dCount = useMemo(() => members.filter(m => {
    if (!m.membershipEnd || m.membershipStatus === 'expired') return false;
    const d = new Date(m.membershipEnd);
    return d >= now && d <= in7Days;
  }).length, [members, now, in7Days]);

  const expiredCount = useMemo(() => members.filter(m => {
    if (m.membershipStatus === 'expired') return true;
    if (!m.membershipEnd) return false;
    return new Date(m.membershipEnd) < now;
  }).length, [members, now]);

  const recipientCount = useMemo(() => {
    if (form.target === 'single') return form.memberId ? 1 : 0;
    if (form.target === 'expiring_2d') return expiring2dCount;
    if (form.target === 'expiring_7d') return expiring7dCount;
    if (form.target === 'expired') return expiredCount;
    return members.length;
  }, [form.target, form.memberId, expiring2dCount, expiring7dCount, expiredCount, members.length]);

  const isBroadcastAll = form.target === 'all';

  const send = async () => {
    if (!form.title || !form.message) return toast.error('Add a title and a message');
    if (form.target === 'single' && !form.memberId) return toast.error('Select a member');
    if (recipientCount === 0) return toast.error('No members found in selected audience');

    if (isBroadcastAll && form.sendWhatsApp) {
      if (!window.confirm(`⚠️ WhatsApp is a paid Meta service.\n\nAre you sure you want to send WhatsApp to all ${members.length} members? You can switch to Email-only or select "Expiring Members" to save costs.`)) {
        return;
      }
    } else if (isBroadcastAll && !window.confirm(`Send notification to all ${members.length} members?`)) {
      return;
    }

    setSending(true);
    try {
      const payload = {
        title: form.title,
        message: form.message,
        type: form.type,
        sendWhatsApp: form.sendWhatsApp,
        sendEmail: form.sendEmail,
        ...(form.target === 'single' ? { memberId: form.memberId } : { target: form.target }),
      };
      const { data } = await API.post('/notifications/admin/send', payload);
      toast.success(data.message || 'Notification dispatched');
      onSent();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      title="Send Member Notification"
      onClose={onClose}
      width={560}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" icon={Send} onClick={send} loading={sending}>
            {recipientCount > 1 ? `Send to ${recipientCount} members` : 'Send now'}
          </Button>
        </>
      }
    >
      <div className="space-y-3.5">
        {/* 1-Click Template presets */}
        <div>
          <label className="text-[12px] font-semibold block mb-1.5" style={{ color: 'var(--p-text-2)' }}>
            ⚡ 1-Click Ready Templates (No typing needed)
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {PRESET_TEMPLATES.map((tpl, i) => (
              <button
                key={i}
                type="button"
                className="text-left text-[12px] p-2 rounded transition-all flex flex-col justify-between"
                style={{
                  background: form.title === tpl.title ? 'var(--p-primary-soft)' : 'var(--p-bg-subtle)',
                  color: form.title === tpl.title ? 'var(--p-primary)' : 'var(--p-text)',
                  border: form.title === tpl.title ? '1px solid var(--p-primary)' : '1px solid var(--p-border)',
                }}
                onClick={() => {
                  setForm(p => ({
                    ...p,
                    type: tpl.type,
                    title: tpl.title,
                    message: tpl.message,
                    // Safety: uncheck WhatsApp if broadcasting to all, unless targeted
                    sendWhatsApp: p.target === 'all' ? false : tpl.defaultWA,
                    sendEmail: true,
                  }));
                  toast.success(`Template loaded: ${tpl.title}`);
                }}
              >
                <span className="font-semibold truncate">{tpl.label}</span>
                <span className="text-[11px] opacity-75 mt-0.5 line-clamp-1">{tpl.sub || tpl.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Audience Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Field label="Target Audience">
            <Select
              value={form.target}
              onChange={e => {
                const target = e.target.value;
                setForm(p => ({
                  ...p,
                  target,
                  // When switching to 'all', default WhatsApp to false to save Meta costs
                  sendWhatsApp: target === 'all' ? false : p.sendWhatsApp,
                }));
              }}
            >
              <option value="expiring_2d">Expiring in 2 Days ({expiring2dCount} members)</option>
              <option value="expiring_7d">Expiring in 7 Days ({expiring7dCount} members)</option>
              <option value="expired">Expired Members ({expiredCount} members)</option>
              <option value="all">Everyone ({members.length} members) — Email Recommended</option>
              <option value="single">Single Specific Member</option>
            </Select>
          </Field>

          <Field label="Category / Type">
            <Select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
          </Field>
        </div>

        {form.target === 'single' && (
          <Field label="Select Member" required>
            <Select value={form.memberId} onChange={e => setForm(p => ({ ...p, memberId: e.target.value }))}>
              <option value="">Choose a member…</option>
              {members.map(m => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.phone || 'No phone'} · {m.membershipStatus || 'active'})
                </option>
              ))}
            </Select>
          </Field>
        )}

        <Field label="Notification Title" required>
          <Input
            value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            placeholder="e.g. Membership renewal reminder"
          />
        </Field>

        <Field label="Message Text" required>
          <Textarea
            rows={4}
            value={form.message}
            onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
            placeholder="Type your message or click a 1-Click template above…"
          />
        </Field>

        {/* WhatsApp Paid Cost Notice when Broadcast to All */}
        {isBroadcastAll && form.sendWhatsApp && (
          <div
            className="p-2.5 rounded text-[12px] flex items-start gap-2"
            style={{
              background: 'rgba(234, 179, 8, 0.12)',
              color: '#d97706',
              border: '1px solid rgba(234, 179, 8, 0.3)',
            }}
          >
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
            <span>
              <strong>Meta WhatsApp Cost Alert:</strong> WhatsApp Cloud API charges per conversation. To save costs, send WhatsApp to <strong>Expiring Members</strong> or specific individuals. Broadcast to all is recommended via Email & in-app.
            </span>
          </div>
        )}

        <div>
          <p className="ui-section-label pt-1 font-semibold text-[13px]">Delivery Channels</p>
          <div className="space-y-1.5 mt-1">
            <CheckRow
              checked={form.sendWhatsApp}
              onChange={v => setForm(p => ({ ...p, sendWhatsApp: v }))}
              label="WhatsApp (Meta Cloud API)"
              hint={isBroadcastAll ? '⚠️ Paid per message. Best for expiring / selected members.' : 'Sent directly via Meta WhatsApp to recipient'}
            />
            <CheckRow
              checked={form.sendEmail}
              onChange={v => setForm(p => ({ ...p, sendEmail: v }))}
              label="Email (Brevo SMTP)"
              hint="Free, branded email delivered to members inbox"
            />
          </div>
          <p className="ui-hint mt-1.5">Members always receive this notification in their gym portal account.</p>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Channel setup banner ──────────────────────────────────────────────── */
function ChannelStatus({ health, onTest, testing }) {
  if (!health) return null;
  const off = ['whatsapp', 'email'].filter(c => health[c] && !health[c].configured);
  // A configured channel can still carry a setup warning (e.g. credentials in
  // the wrong variable), so it is shown even when nothing is switched off.
  const warnings = ['whatsapp', 'email'].filter(c => health[c]?.warning);

  if (!off.length) {
    return (
      <Card className="mb-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge tone="ok">Meta WhatsApp Live</Badge>
            <span className="text-[14px]" style={{ color: 'var(--p-text-2)' }}>
              Meta Cloud API (Template: {health?.whatsapp?.template || 'fitnation_by_ajeet'} · Phone ID: {health?.whatsapp?.from || '1399463199911717'}) & Email active.
            </span>
          </div>
          <Button size="sm" icon={Zap} onClick={onTest} loading={testing}>Send test</Button>
        </div>
        {warnings.map(c => (
          <p key={c} className="ui-hint mt-2 flex items-start gap-1.5">
            <AlertTriangle size={13} style={{ color: 'var(--p-warn)' }} className="flex-shrink-0 mt-0.5" />
            <span className="capitalize">{c}</span>: {health[c]?.warning}
          </p>
        ))}
      </Card>
    );
  }

  return (
    <Card className="mb-4" style={{ borderColor: 'var(--p-warn-line)' }}>
      <div className="flex items-start gap-3">
        <AlertTriangle size={18} style={{ color: 'var(--p-warn)' }} className="flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold" style={{ color: 'var(--p-text)' }}>
            {off.join(' and ')} {off.length > 1 ? 'are' : 'is'} not set up
          </p>
          <ul className="mt-1 space-y-0.5">
            {off.map(c => (
              <li key={c} className="text-[13px]" style={{ color: 'var(--p-text-2)' }}>
                <span className="capitalize font-medium">{c}</span>: {health[c].reason}
              </li>
            ))}
          </ul>
          <p className="ui-hint">Notifications still appear in the app, and any channel that IS working still delivers. Add the missing values to your server environment to enable the rest.</p>
          <div className="mt-3"><Button size="sm" icon={Zap} onClick={onTest} loading={testing}>Send test</Button></div>
        </div>
      </div>
    </Card>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */
export default function AdminNotifications() {
  const [notifs, setNotifs] = useState([]);
  const [members, setMembers] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState('email');
  const [filter, setFilter] = useState('all');
  const [composeOpen, setComposeOpen] = useState(false);
  const [testing, setTesting] = useState(false);
  const [member, setMember] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async (force = false) => {
    setLoading(true);
    const get = force ? freshGet : cachedGet;
    try {
      const [n, m] = await Promise.all([
        get('/notifications/admin/all', { cache: 30 }),
        cachedGet('/members', { cache: 60 }),
      ]);
      setNotifs(n.data);
      setMembers(m.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load notifications');
    }
    setLoading(false);
    // Channel setup is a separate, non-critical call — an older API without this
    // endpoint simply leaves the banner hidden.
    cachedGet('/notifications/admin/channels', { cache: 300 })
      .then(r => setHealth(r.data))
      .catch(() => setHealth(null));
  }, []);

  useEffect(() => { load(); }, [load]);

  const markAllRead = async () => {
    await API.put('/notifications/admin/mark-all-read');
    bustCache('/notifications/admin/all');
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
    toast.success('All marked as read');
  };

  const sendTest = async () => {
    setTesting(true);
    try {
      const { data } = await API.post('/notifications/admin/test', {});
      const ok = data.delivered || [];
      ok.length
        ? toast.success(`Test sent to you via ${ok.join(' and ')}`)
        : toast.error('Test could not be delivered on any channel');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Test failed');
    } finally {
      setTesting(false);
    }
  };

  const deleteOne = async n => {
    try {
      await API.delete(`/notifications/admin/${n._id}`);
      setNotifs(prev => prev.filter(x => x._id !== n._id));
      bustCache('/notifications');
      toast.success('Notification deleted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete this notification.');
    }
  };

  const clearHistory = async () => {
    try {
      // Scoped by whoever is selected, so "clear" never means more than the
      // admin can see on screen.
      const q = member === 'all' ? 'all=true' : `member=${member}`;
      const { data } = await API.delete(`/notifications/admin?${q}`);
      toast.success(data.message);
      setConfirmDelete(null);
      bustCache('/notifications');
      load(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not clear the history.');
    }
  };

  const unread = notifs.filter(n => !n.isRead).length;

  /**
   * Email and WhatsApp are separated because they are not the same kind of
   * record. Email is sent by the server and its outcome is known — accepted,
   * failed, or skipped. WhatsApp is currently handed to the admin's own phone
   * through a wa.me link, so the most that can honestly be said is that a
   * message was prepared. Mixing them in one list implied a delivery guarantee
   * for WhatsApp that does not exist.
   */
  const attempted = (n, ch) => Boolean(n.delivery?.[ch]?.status) || (n.sentVia || []).includes(ch);

  // Separating by person matters once the list is long: an admin checking
  // "did this member actually get told" should not have to scan everything.
  const byChannel = notifs
    .filter(n => attempted(n, channel))
    .filter(n => member === 'all' || String(n.member?._id || n.member) === member);
  const filtered = byChannel.filter(n => (filter === 'unread' ? !n.isRead : filter === 'read' ? n.isRead : true));

  const countFor = ch => notifs.filter(n => attempted(n, ch)).length;
  const failedFor = ch => notifs.filter(n => n.delivery?.[ch]?.status === 'failed').length;

  // Members who are due a reminder and have not been handed to WhatsApp yet.
  const stillToContact = members.filter(m => whatsappPending(m)).length;

  return (
    <AdminLayout
      title="Notifications"
      subtitle="Everything sent to members, and what reached them"
      actions={
        <>
          <Button icon={RefreshCw} onClick={() => load(true)} aria-label="Refresh" />
          {unread > 0 && <Button icon={CheckCheck} onClick={markAllRead}>Mark all read</Button>}
          <Button variant="primary" icon={Send} onClick={() => setComposeOpen(true)}>Send</Button>
        </>
      }
    >
      <ChannelStatus health={health} onTest={sendTest} testing={testing} />

      <div className="mb-3">
        <Tabs
          value={channel}
          onChange={c => { setChannel(c); setFilter('all'); }}
          options={[
            { value: 'email', label: 'Email', count: countFor('email') },
            { value: 'whatsapp', label: 'WhatsApp', count: countFor('whatsapp') },
          ]}
        />
      </div>

      {/* What this channel can and cannot tell you, said once at the top. */}
      <p className="text-[12.5px] mb-3" style={{ color: 'var(--p-muted)' }}>
        {channel === 'email'
          ? 'Sent automatically by the server. Status below is the mail provider\u2019s response.'
          : 'Automated WhatsApp needs a registered WhatsApp Business sender. Until then messages are opened from your own phone, so delivery cannot be confirmed here.'}
        {failedFor(channel) > 0 && (
          <strong style={{ color: 'var(--p-danger)' }}>
            {' '}{failedFor(channel)} failed.
          </strong>
        )}
      </p>

      {channel === 'whatsapp' && stillToContact > 0 && (
        <Card className="mb-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-[14.5px]" style={{ color: 'var(--p-text)' }}>
              <strong>{stillToContact}</strong> member{stillToContact === 1 ? '' : 's'} due a reminder
              {' '}and not yet messaged on WhatsApp.
            </p>
            <Button variant="primary" size="sm" to="/admin/members?filter=towhatsapp">
              Show them
            </Button>
          </div>
        </Card>
      )}

      <div className="ui-toolbar">
        <Select value={member} onChange={e => setMember(e.target.value)}
          aria-label="Filter by member" style={{ flex: '1 1 240px', maxWidth: 320 }}>
          <option value="all">Everyone</option>
          {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
        </Select>
        <Button icon={Trash2} onClick={() => setConfirmDelete(true)} disabled={byChannel.length === 0}
          style={{ color: 'var(--p-danger)' }}>
          {member === 'all' ? 'Clear all history' : 'Clear this member'}
        </Button>
      </div>

      <div className="mb-4 max-w-sm">
        <Tabs
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All', count: byChannel.length },
            { value: 'unread', label: 'Unread', count: unread },
            { value: 'read', label: 'Read' },
          ]}
        />
      </div>

      {loading ? (
        <SkeletonList rows={6} h={76} />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Bell}
            title={`Nothing sent by ${channel === 'email' ? 'email' : 'WhatsApp'} yet`}
            hint="Reminders sent automatically by the system also appear here."
          >
            <Button variant="primary" icon={Send} onClick={() => setComposeOpen(true)}>Send a notification</Button>
          </EmptyState>
        </Card>
      ) : (
        <Card padded={false}>
          <ul>
            {filtered.map((n, i) => (
              <li
                key={n._id}
                className="px-4 py-3.5 sm:px-5"
                style={{ borderTop: i ? '1px solid var(--p-border)' : 'none', background: n.isRead ? 'transparent' : 'var(--p-accent-soft)' }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[14px] font-semibold" style={{ color: 'var(--p-text)' }}>{n.title}</span>
                      <Badge tone={TYPE_TONE[n.type] || 'neutral'}>{(n.type || 'general').replace(/-/g, ' ')}</Badge>
                    </div>
                    <p className="text-[13px] mt-1 line-clamp-2" style={{ color: 'var(--p-text-2)' }}>{n.message}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap text-[12px]" style={{ color: 'var(--p-muted)' }}>
                      {n.member?.name && <span>{n.member.name}</span>}
                      <span>{timeAgo(n.createdAt)}</span>
                      <DeliveryChips notif={n} />
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" icon={Trash2} onClick={() => deleteOne(n)}
                    aria-label={`Delete notification for ${n.member?.name || 'member'}`} title="Delete"
                    style={{ color: 'var(--p-danger)' }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title={member === 'all' ? 'Clear the whole notification history?' : 'Clear this member\u2019s history?'}
          message={member === 'all'
            ? 'Every notification record is removed for good, for every member and both channels. Members keep their accounts and memberships \u2014 only the message history goes. This cannot be undone.'
            : 'Every notification recorded for this member is removed for good. Their account and membership are untouched. This cannot be undone.'}
          confirmLabel="Clear history"
          cancelLabel="Cancel"
          onCancel={() => setConfirmDelete(null)}
          onConfirm={clearHistory}
        />
      )}

      {composeOpen && (
        <ComposeModal
          members={members}
          onClose={() => setComposeOpen(false)}
          onSent={() => { setComposeOpen(false); bustCache('/notifications/admin/all'); load(true); }}
        />
      )}
    </AdminLayout>
  );
}
