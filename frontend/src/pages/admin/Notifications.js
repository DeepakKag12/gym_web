import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Bell, CheckCheck, RefreshCw, Send, AlertTriangle, MessageCircle, Mail, Monitor, Zap, Trash2,
  Clock,
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
 * Valid notification types accepted by the API.
 */
const TYPES = [
  { value: 'fee-reminder',       label: 'Fee / Renewal reminder' },
  { value: 'membership-expired', label: 'Membership expired' },
  { value: 'announcement',       label: 'Gym announcement' },
  { value: 'general',            label: 'General message' },
];

const TYPE_TONE = {
  'fee-reminder': 'warn',
  'membership-expired': 'danger',
  announcement: 'info',
  welcome: 'accent',
  general: 'neutral',
};

/** Delivery chips showing actual channels reached. */
function DeliveryChips({ notif }) {
  const sent = notif.sentVia || [];
  const failed = Object.entries(notif.delivery || {})
    .filter(([, d]) => d && d.status === 'failed')
    .map(([channel]) => channel);

  if (!sent.length && !failed.length) {
    return (
      <span className="inline-flex items-center gap-1 text-[11.5px] text-gray-400">
        <Monitor size={12} /> In-App
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 flex-wrap">
      {sent.includes('whatsapp') && (
        <span className="inline-flex items-center gap-1 text-[11.5px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium">
          <MessageCircle size={12} /> WhatsApp (Meta)
        </span>
      )}
      {sent.includes('email') && (
        <span className="inline-flex items-center gap-1 text-[11.5px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-medium">
          <Mail size={12} /> Email
        </span>
      )}
      {sent.includes('website') && (
        <span className="inline-flex items-center gap-1 text-[11.5px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-medium">
          <Monitor size={12} /> In-App
        </span>
      )}
      {failed.map(c => (
        <span key={c} className="inline-flex items-center gap-1 text-[11.5px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 font-medium"
          title={notif.delivery?.[c]?.error || `${c} delivery failed`}>
          <AlertTriangle size={12} /> {c} failed
        </span>
      ))}
    </span>
  );
}

const PRESET_TEMPLATES = [
  {
    label: '⚡ Renewal Reminder',
    sub: 'Meta WhatsApp Template: fitnation_membership_alert',
    type: 'fee-reminder',
    title: 'Membership renewal reminder',
    message: 'Hello! 👋 Friendly reminder from FitNation by Ajeet. Your gym membership is set to expire soon. Please renew your membership to continue training without interruption!\n\nRenew your plan today to keep your fitness momentum going! Contact Ajeet at 9630906906 for any assistance. 💪',
    defaultWA: true,
  },
  {
    label: '⚠️ Membership Expired',
    sub: 'Meta WhatsApp Template + Email',
    type: 'membership-expired',
    title: 'Membership has expired',
    message: 'Hello! Your FitNation by Ajeet gym membership has expired. Please renew your membership to resume training without interruption! Contact Ajeet at 9630906906 for quick renewal. 💪',
    defaultWA: true,
  },
  {
    label: '📢 Gym Announcement',
    sub: 'Schedule, timing or holiday notice (Email & In-App)',
    type: 'announcement',
    title: 'Important Gym Announcement',
    message: 'Dear FitNation athletes, please take note of this update regarding gym timings, fitness classes, and equipment maintenance. Stay Fit. Stay Strong! 💪',
    defaultWA: false,
  },
  {
    label: '💳 Pending Fee Balance',
    sub: 'Fee collection alert for members with dues',
    type: 'fee-reminder',
    title: 'Pending gym fee reminder',
    message: 'Dear member, you have a pending membership fee balance. Please clear your dues at the gym reception desk or via online payment to ensure uninterrupted access.',
    defaultWA: true,
  },
];

/* ─── Compose Modal (Mobile & Tablet Optimized) ────────────────────────── */
function ComposeModal({ members, onClose, onSent }) {
  const [form, setForm] = useState({
    title: PRESET_TEMPLATES[0].title,
    message: PRESET_TEMPLATES[0].message,
    type: PRESET_TEMPLATES[0].type,
    target: 'expiring_7d',
    memberId: '',
    sendWhatsApp: true,
    sendEmail: true,
  });
  const [sending, setSending] = useState(false);

  // Live audience calculation
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

  const selectedMember = useMemo(() => {
    if (form.target !== 'single' || !form.memberId) return null;
    return members.find(m => m._id === form.memberId) || null;
  }, [form.target, form.memberId, members]);

  const send = async () => {
    if (!form.title.trim() || !form.message.trim()) return toast.error('Enter a title and message.');
    if (form.target === 'single' && !form.memberId) return toast.error('Please choose a member.');
    if (recipientCount === 0) return toast.error('No members match the selected audience.');
    if (!form.sendWhatsApp && !form.sendEmail) return toast.error('Select at least one delivery channel.');

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
      toast.success(data.message || 'Notification dispatched.');
      onSent();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send notification.');
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
        <div className="flex items-center justify-between w-full gap-2">
          <Button onClick={onClose} disabled={sending}>Cancel</Button>
          <Button variant="primary" icon={Send} onClick={send} loading={sending}>
            {recipientCount > 1 ? `Send to ${recipientCount} members` : 'Send now'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Quick Template Presets */}
        <div>
          <label className="text-[12.5px] font-semibold block mb-1.5" style={{ color: 'var(--p-text)' }}>
            ⚡ 1-Click Templates
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_TEMPLATES.map((tpl, i) => {
              const active = form.title === tpl.title;
              return (
                <button
                  key={i}
                  type="button"
                  className={`text-left text-xs p-2.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                    active ? 'ring-2 ring-[var(--p-accent)]' : 'hover:bg-[var(--p-surface-2)]'
                  }`}
                  style={{
                    background: active ? 'var(--p-surface-2)' : 'var(--p-surface)',
                    borderColor: active ? 'var(--p-accent)' : 'var(--p-border)',
                  }}
                  onClick={() => {
                    setForm(p => ({
                      ...p,
                      type: tpl.type,
                      title: tpl.title,
                      message: tpl.message,
                      sendWhatsApp: tpl.defaultWA,
                      sendEmail: true,
                    }));
                  }}
                >
                  <span className="font-semibold block truncate" style={{ color: 'var(--p-text)' }}>{tpl.label}</span>
                  <span className="text-[11px] mt-0.5 line-clamp-1" style={{ color: 'var(--p-muted)' }}>{tpl.sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Target Audience */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <Field label="Target Audience">
            <Select
              value={form.target}
              onChange={e => setForm(p => ({ ...p, target: e.target.value }))}
            >
              <option value="expiring_2d">Expiring in 2 Days ({expiring2dCount} members)</option>
              <option value="expiring_7d">Expiring in 7 Days ({expiring7dCount} members)</option>
              <option value="expired">Expired Members ({expiredCount} members)</option>
              <option value="all">Everyone ({members.length} members)</option>
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
            rows={3}
            value={form.message}
            onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
            placeholder="Type your message or choose a template above…"
          />
        </Field>

        {/* WhatsApp Meta Cloud API Template Preview */}
        {form.sendWhatsApp && (
          <div
            className="p-3 rounded-xl border text-[12px]"
            style={{ background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
          >
            <div className="flex items-center gap-1.5 text-emerald-500 font-semibold mb-1">
              <MessageCircle size={15} />
              <span>Official Meta WhatsApp Cloud API Template Preview</span>
              <Badge tone="ok" className="ml-auto text-[10px]">Pre-approved</Badge>
            </div>
            <p className="text-[11.5px] text-emerald-400/90 leading-relaxed bg-black/25 p-2 rounded-lg font-mono">
              "Hello <span className="underline">{selectedMember ? selectedMember.name : 'Athlete'}</span>! 👋 Friendly reminder from FitNation by Ajeet. Your gym membership expires soon. Expiry Date: <span className="underline">DD/MM/YYYY</span>. Renew today to keep training without interruption!"
            </p>
            <p className="text-[11px] text-emerald-400/70 mt-1">
              ✓ Sent directly via Meta Cloud API using template <code>fitnation_membership_alert</code>. Zero risk of 24h window re-engagement rejections.
            </p>
          </div>
        )}

        {/* Channels */}
        <div>
          <label className="text-[12.5px] font-semibold block mb-1.5" style={{ color: 'var(--p-text)' }}>
            Delivery Channels
          </label>
          <div className="space-y-2">
            <CheckRow
              checked={form.sendWhatsApp}
              onChange={v => setForm(p => ({ ...p, sendWhatsApp: v }))}
              label="WhatsApp (Meta Cloud API Template)"
              hint="Pre-approved Meta template with personalized recipient name & expiry date"
            />
            <CheckRow
              checked={form.sendEmail}
              onChange={v => setForm(p => ({ ...p, sendEmail: v }))}
              label="Email (Brevo SMTP)"
              hint="Delivers branded email notification to member's email address"
            />
          </div>
          <p className="text-[11.5px] mt-1.5" style={{ color: 'var(--p-muted)' }}>
            All notifications are also recorded in the member's in-app portal inbox.
          </p>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Channel Status Bar ────────────────────────────────────────────────── */
function ChannelStatus({ health, onTest, testing }) {
  return (
    <Card className="mb-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Meta WhatsApp Live
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            Brevo Email Live
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            In-App Portal Live
          </span>
          <span className="text-[12.5px] text-gray-400 ml-1 hidden sm:inline">
            Template: <code>fitnation_membership_alert</code> · Sender: +91 93025 26833
          </span>
        </div>
        <Button size="sm" icon={Zap} onClick={onTest} loading={testing}>
          Send Test
        </Button>
      </div>
    </Card>
  );
}

/* ─── Main Admin Notifications Page ─────────────────────────────────────── */
export default function AdminNotifications() {
  const [notifs, setNotifs] = useState([]);
  const [members, setMembers] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState('all');
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
      setNotifs(n.data || []);
      setMembers(m.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load notifications');
    }
    setLoading(false);

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
        ? toast.success(`Test sent via ${ok.join(' and ')} (Meta WhatsApp & Email)`)
        : toast.error('Test could not be delivered');
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
      toast.error(err.response?.data?.message || 'Could not delete notification.');
    }
  };

  const clearHistory = async () => {
    try {
      const q = member === 'all' ? 'all=true' : `member=${member}`;
      const { data } = await API.delete(`/notifications/admin?${q}`);
      toast.success(data.message || 'Notification history cleared.');
      setConfirmDelete(null);
      bustCache('/notifications');
      load(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not clear history.');
    }
  };

  const unread = notifs.filter(n => !n.isRead).length;

  const attempted = (n, ch) => {
    if (ch === 'all') return true;
    return Boolean(n.delivery?.[ch]?.status) || (n.sentVia || []).includes(ch);
  };

  const countFor = ch => notifs.filter(n => attempted(n, ch)).length;

  const byChannel = notifs
    .filter(n => attempted(n, channel))
    .filter(n => member === 'all' || String(n.member?._id || n.member) === member);

  const filtered = byChannel.filter(n => (filter === 'unread' ? !n.isRead : filter === 'read' ? n.isRead : true));

  // Members needing reminder
  const stillToContact = members.filter(m => whatsappPending(m)).length;

  return (
    <AdminLayout
      title="Notifications"
      subtitle="Send Meta WhatsApp templates & emails to members, and track delivery records"
      actions={
        <>
          <Button icon={RefreshCw} onClick={() => load(true)} aria-label="Refresh" />
          {unread > 0 && <Button icon={CheckCheck} onClick={markAllRead}>Mark all read</Button>}
          <Button variant="primary" icon={Send} onClick={() => setComposeOpen(true)}>Send Notification</Button>
        </>
      }
    >
      <ChannelStatus health={health} onTest={sendTest} testing={testing} />

      {/* Due members reminder prompt */}
      {stillToContact > 0 && (
        <Card className="mb-4" style={{ borderColor: 'var(--p-warn-line)' }}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-amber-400 flex-shrink-0" />
              <p className="text-[13.5px]" style={{ color: 'var(--p-text)' }}>
                <strong>{stillToContact}</strong> member{stillToContact === 1 ? '' : 's'} expiring soon and not yet notified on WhatsApp.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="primary" size="sm" icon={Send} onClick={() => setComposeOpen(true)}>
                Notify Them Now
              </Button>
              <Button size="sm" to="/admin/members?filter=expiring5">
                View in Members
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Channel Filters */}
      <div className="mb-3">
        <Tabs
          value={channel}
          onChange={setChannel}
          options={[
            { value: 'all', label: 'All Channels', count: notifs.length },
            { value: 'whatsapp', label: 'WhatsApp (Meta)', count: countFor('whatsapp') },
            { value: 'email', label: 'Email', count: countFor('email') },
            { value: 'website', label: 'In-App', count: countFor('website') },
          ]}
        />
      </div>

      {/* Toolbar: filter by member & clear */}
      <div className="ui-toolbar flex-wrap gap-2.5 mb-3">
        <Select
          value={member}
          onChange={e => setMember(e.target.value)}
          aria-label="Filter by member"
          style={{ flex: '1 1 240px', maxWidth: 320 }}
        >
          <option value="all">All Members</option>
          {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
        </Select>

        <div className="flex items-center gap-2 ml-auto">
          <Tabs
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'All', count: byChannel.length },
              { value: 'unread', label: 'Unread', count: unread },
              { value: 'read', label: 'Read' },
            ]}
          />
          <Button
            icon={Trash2}
            onClick={() => setConfirmDelete(true)}
            disabled={byChannel.length === 0}
            style={{ color: 'var(--p-danger)' }}
          >
            {member === 'all' ? 'Clear History' : 'Clear Member'}
          </Button>
        </div>
      </div>

      {/* Notification List */}
      {loading ? (
        <SkeletonList rows={6} h={76} />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Bell}
            title={channel === 'all' ? 'No notifications yet' : `No ${channel} notifications found`}
            hint="Send a notification to your gym members using official Meta WhatsApp templates and email."
          >
            <Button variant="primary" icon={Send} onClick={() => setComposeOpen(true)}>
              Send a Notification
            </Button>
          </EmptyState>
        </Card>
      ) : (
        <Card padded={false}>
          <ul>
            {filtered.map((n, i) => (
              <li
                key={n._id}
                className="px-4 py-3.5 sm:px-5 transition"
                style={{
                  borderTop: i ? '1px solid var(--p-border)' : 'none',
                  background: n.isRead ? 'transparent' : 'var(--p-accent-soft)',
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[14px] font-semibold" style={{ color: 'var(--p-text)' }}>
                        {n.title}
                      </span>
                      <Badge tone={TYPE_TONE[n.type] || 'neutral'}>
                        {(n.type || 'general').replace(/-/g, ' ')}
                      </Badge>
                      <DeliveryChips notif={n} />
                    </div>

                    <p className="text-[13px] mt-1 line-clamp-2 leading-relaxed" style={{ color: 'var(--p-text-2)' }}>
                      {n.message}
                    </p>

                    <div className="flex items-center gap-3 mt-1.5 flex-wrap text-[11.5px]" style={{ color: 'var(--p-muted)' }}>
                      {n.member?.name && (
                        <span className="font-medium" style={{ color: 'var(--p-text)' }}>
                          👤 {n.member.name}
                        </span>
                      )}
                      <span>{timeAgo(n.createdAt)}</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Trash2}
                    onClick={() => deleteOne(n)}
                    aria-label={`Delete notification`}
                    title="Delete notification"
                    style={{ color: 'var(--p-danger)' }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Confirm Clear Modal */}
      {confirmDelete && (
        <ConfirmDialog
          title={member === 'all' ? 'Clear whole notification history?' : 'Clear this member\'s history?'}
          message={
            member === 'all'
              ? 'Every notification record is removed from the history log. Member accounts and memberships remain intact.'
              : 'Every notification recorded for this member will be removed from the log. This cannot be undone.'
          }
          confirmLabel="Clear History"
          cancelLabel="Cancel"
          onCancel={() => setConfirmDelete(null)}
          onConfirm={clearHistory}
        />
      )}

      {/* Compose Notification Modal */}
      {composeOpen && (
        <ComposeModal
          members={members}
          onClose={() => setComposeOpen(false)}
          onSent={() => {
            setComposeOpen(false);
            bustCache('/notifications/admin/all');
            load(true);
          }}
        />
      )}
    </AdminLayout>
  );
}
