import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
  UserPlus, Search, Pencil, Trash2, Ban, CheckCircle2, Eye, Users,
  RefreshCw, AlertTriangle, FlaskConical, EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';
import API, { cachedGet, bustCache, freshGet } from '../../utils/api';
import { DEMO_ENABLED, DEMO_USERS } from '../../utils/demoData';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from './AdminLayout';
import {
  Card, Button, Badge, Avatar, Field, Input, Select,
  Modal, ConfirmDialog, EmptyState, SkeletonList, Table, TableRow, FadeIn,
} from '../../components/ui';

/**
 * Users — the one screen for finding and managing everyone with an account.
 *
 * Six columns, four actions, one search box. Anything that needed a decision
 * before you could use it (filters, bulk tools, column pickers, saved views)
 * is deliberately absent: a new admin should be able to add, find, edit and
 * manage users on their first day without being shown how.
 */

/* ── plain-language helpers ─────────────────────────────────────────────── */

const ROLES = {
  admin:   { label: 'Admin',   tone: 'accent', hint: 'Runs the gym — full access to everything' },
  trainer: { label: 'Trainer', tone: 'info',   hint: 'Manages workouts, diets and their own members' },
  member:  { label: 'Member',  tone: 'neutral', hint: 'Trains at the gym — sees only their own plans' },
};

/** Roles this screen can actually create. See createUser() for why not admin. */
const CREATABLE_ROLES = ['member', 'trainer'];

const fmtDate = d =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

/** One word and one colour, so status is readable without being explained. */
function statusOf(user) {
  if (user.isActive === false) return { label: 'Disabled', tone: 'neutral' };
  const end = user.membershipEnd ? new Date(user.membershipEnd).getTime() : null;
  if (user.membershipStatus === 'expired' || (end !== null && end < Date.now())) {
    return { label: 'Expired', tone: 'danger' };
  }
  return { label: 'Active', tone: 'ok' };
}

/* ── Add / edit user ────────────────────────────────────────────────────── */

const blankUser = { name: '', email: '', phone: '', password: '', role: 'member' };

/**
 * The whole form is four fields. Everything the API also wants (a start date,
 * a plan) is filled in with a sensible default rather than asked for, because
 * an admin adding someone at the front desk should not have to make five
 * decisions to do it.
 */
function UserForm({ editing, onClose, onSaved }) {
  const isEdit = Boolean(editing);
  const [form, setForm] = useState(() => (isEdit
    ? {
        name: editing.name || '',
        email: editing.email || '',
        phone: editing.phone || '',
        password: '',
        role: editing.role || 'member',
      }
    : { ...blankUser }));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const set = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };
  const bind = name => ({ value: form[name], onChange: e => set(name, e.target.value) });

  /** Runs before anything is sent, so a mistake is shown next to the field. */
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Please enter their name.';
    else if (form.name.trim().length < 2) e.name = 'That name looks too short.';

    if (!form.email.trim()) e.email = 'Please enter their email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'That email does not look right.';

    if (form.phone && !/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) {
      e.phone = 'Enter a 10-digit mobile number, or leave it empty.';
    }

    // On create a password is required: the server falls back to the phone
    // number when one is missing, which quietly creates an account nobody can
    // sign in to if the phone is empty too.
    if (!isEdit && !form.password) e.password = 'Set a password so they can sign in.';
    if (form.password && form.password.length < 6) e.password = 'Use at least 6 characters.';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const saved = await (isEdit ? updateUser(editing, form) : createUser(form));
      onSaved(saved, isEdit
        ? `${form.name.trim()} was updated.`
        : `${form.name.trim()} was added and can sign in now.`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not save. Please try again.';
      // Put the server's complaint on the field it is about, not just in a toast.
      if (/email/i.test(msg)) setErrors(p => ({ ...p, email: 'Someone already uses this email.' }));
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={isEdit ? `Edit ${editing.name}` : 'Add a new user'}
      onClose={saving ? () => {} : onClose}
      width={460}
      footer={
        <>
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={save} loading={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add user'}
          </Button>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={e => { e.preventDefault(); save(); }}
      >
        <Field label="Full name" required error={errors.name}>
          <Input {...bind('name')} placeholder="Ajeet Kumar" autoFocus autoComplete="name" />
        </Field>

        <Field label="Email" required error={errors.email} hint="They sign in with this">
          <Input type="email" {...bind('email')} placeholder="name@gmail.com" autoComplete="email" />
        </Field>

        <Field label="Mobile number" error={errors.phone} hint="Optional — used for WhatsApp reminders">
          <Input type="tel" inputMode="numeric" {...bind('phone')} placeholder="9876543210" />
        </Field>

        <Field
          label="Role"
          required
          error={errors.role}
          hint={isEdit ? 'A role cannot be changed after the account is made.' : ROLES[form.role]?.hint}
        >
          <Select {...bind('role')} disabled={isEdit}>
            {CREATABLE_ROLES.map(r => (
              <option key={r} value={r}>{ROLES[r].label}</option>
            ))}
            {/* An existing admin is shown so the field is not blank when editing one */}
            {isEdit && form.role === 'admin' && <option value="admin">Admin</option>}
          </Select>
        </Field>

        <Field
          label={isEdit ? 'New password' : 'Password'}
          required={!isEdit}
          error={errors.password}
          hint={isEdit ? 'Leave empty to keep their current password' : 'At least 6 characters'}
        >
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              {...bind('password')}
              placeholder={isEdit ? 'Unchanged' : 'At least 6 characters'}
              autoComplete="new-password"
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg"
              style={{ color: 'var(--p-muted)', minHeight: 'unset' }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>

        {/* Lets Enter submit the form without a second visible button */}
        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </Modal>
  );
}

/* ── API calls ──────────────────────────────────────────────────────────── */

/**
 * Creating an admin is deliberately not possible here.
 *
 * The API has no endpoint for it, and the member/trainer endpoints hardcode the
 * role on the server precisely so that a request body can never promote someone
 * to admin. Offering an "Admin" option that silently created a member would be
 * worse than not offering it, so the form lists only what really works.
 */
function createUser(form) {
  const payload = {
    name: form.name.trim(),
    email: form.email.trim().toLowerCase(),
    phone: form.phone.replace(/\D/g, '') || undefined,
    password: form.password,
  };

  if (form.role === 'trainer') {
    return API.post('/trainers', payload).then(r => r.data);
  }

  // A new member starts today on a monthly plan; the admin can change either
  // from the member's own screen. Sending nothing would leave them with no
  // membership dates at all.
  return API.post('/members', {
    ...payload,
    membershipPlan: 'monthly',
    membershipStart: new Date().toISOString().split('T')[0],
  }).then(r => r.data);
}

function updateUser(user, form) {
  const payload = {
    name: form.name.trim(),
    email: form.email.trim().toLowerCase(),
    phone: form.phone.replace(/\D/g, '') || undefined,
  };
  if (form.password) payload.password = form.password;

  const base = user.role === 'trainer' ? '/trainers' : '/members';
  return API.put(`${base}/${user._id}`, payload).then(r => r.data);
}

function setUserActive(user, isActive) {
  const base = user.role === 'trainer' ? '/trainers' : '/members';
  return API.put(`${base}/${user._id}`, { isActive }).then(r => r.data);
}

function deleteUser(user) {
  const base = user.role === 'trainer' ? '/trainers' : '/members';
  return API.delete(`${base}/${user._id}`);
}

/* ── View user ──────────────────────────────────────────────────────────── */

function UserDetails({ user, canManage, isSelf, onClose, onEdit, onToggleActive, onDelete }) {
  const status = statusOf(user);
  const role = ROLES[user.role] || ROLES.member;
  const disabled = user.isActive === false;

  const row = (label, value) => (
    <div className="ui-dl-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );

  return (
    <Modal title="User details" onClose={onClose} width={440}>
      <div className="flex items-center gap-3 mb-4">
        <Avatar name={user.name} size={48} />
        <div className="min-w-0">
          <p className="text-[16px] font-semibold" style={{ color: 'var(--p-text)' }}>{user.name}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <Badge tone={role.tone}>{role.label}</Badge>
            <Badge tone={status.tone}>{status.label}</Badge>
          </div>
        </div>
      </div>

      <dl className="mb-5">
        {row('Email', user.email)}
        {row('Mobile', user.phone || '—')}
        {row('Role', role.label)}
        {row('Status', status.label)}
        {row('Created', fmtDate(user.createdAt))}
        {user.membershipEnd && row('Membership ends', fmtDate(user.membershipEnd))}
      </dl>

      {canManage ? (
        <div className="space-y-2">
          <Button block icon={Pencil} onClick={onEdit}>Edit user</Button>
          {isSelf ? (
            <p className="text-[13px] text-center pt-1" style={{ color: 'var(--p-muted)' }}>
              This is your own account, so it cannot be disabled or deleted here.
            </p>
          ) : (
            <>
              <Button block icon={disabled ? CheckCircle2 : Ban} onClick={onToggleActive}>
                {disabled ? 'Turn sign in back on' : 'Disable user'}
              </Button>
              <Button block variant="danger" icon={Trash2} onClick={onDelete}>Delete user</Button>
            </>
          )}
        </div>
      ) : (
        <p className="text-[13px]" style={{ color: 'var(--p-muted)' }}>
          Only an admin can change user accounts.
        </p>
      )}
    </Modal>
  );
}

/* ── Row actions, shared by the table and the mobile list ───────────────── */

function RowActions({ user, canManage, isSelf, onView, onEdit, onToggle, onDelete }) {
  const disabled = user.isActive === false;
  return (
    <div className="ui-row-actions">
      {/* Icon-only: `icon` + no children is what makes Button render a square
          tap target. Every one carries an aria-label and a hover title, so the
          icons are never the only explanation of what they do. */}
      <Button size="sm" variant="ghost" icon={Eye} onClick={onView}
        aria-label={`View ${user.name}`} title="View user" />
      {canManage && (
        <Button size="sm" variant="ghost" icon={Pencil} onClick={onEdit}
          aria-label={`Edit ${user.name}`} title="Edit user" />
      )}
      {canManage && !isSelf && (
        <>
          <Button
            size="sm" variant="ghost" icon={disabled ? CheckCircle2 : Ban} onClick={onToggle}
            aria-label={`${disabled ? 'Enable' : 'Disable'} ${user.name}`}
            title={disabled ? 'Turn sign in back on' : 'Disable user'}
          />
          <Button
            size="sm" variant="ghost" icon={Trash2} onClick={onDelete}
            aria-label={`Delete ${user.name}`} title="Delete user"
            style={{ color: 'var(--p-danger)' }}
          />
        </>
      )}
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */

export default function AdminUsers() {
  const [params, setParams] = useSearchParams();
  const { user: me } = useAuth();
  const canManage = me?.role === 'admin';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [search, setSearch] = useState('');

  const [formFor, setFormFor] = useState(params.get('add') ? 'new' : null);
  const [detailsFor, setDetailsFor] = useState(null);
  const [confirm, setConfirm] = useState(null);   // { kind, user }
  const [busy, setBusy] = useState(false);

  const load = useCallback((force = false) => {
    setLoading(true);
    setError(null);
    const get = force ? freshGet : cachedGet;

    // Members and trainers are separate endpoints; the screen shows one list
    // of people, so they are merged here and the real role is kept on each.
    Promise.all([
      get('/members', { cache: 60 }),
      get('/trainers', { cache: 180 }),
    ])
      .then(([m, t]) => {
        const list = [
          ...(Array.isArray(m.data) ? m.data : []).map(u => ({ ...u, role: u.role || 'member' })),
          ...(Array.isArray(t.data) ? t.data : []).map(u => ({ ...u, role: 'trainer' })),
        ].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        if (list.length === 0 && DEMO_ENABLED) {
          setUsers(DEMO_USERS);
          setIsDemo(true);
        } else {
          setUsers(list);
          setIsDemo(false);
        }
      })
      .catch(err => {
        if (DEMO_ENABLED) {
          setUsers(DEMO_USERS);
          setIsDemo(true);
          return;
        }
        setError(err.response?.data?.message || 'Could not load your users. Check your connection and try again.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Clear ?add=1 once the form has opened, so a refresh does not reopen it.
  useEffect(() => {
    if (!params.get('add')) return;
    const next = new URLSearchParams(params);
    next.delete('add');
    setParams(next, { replace: true });
  }, [params, setParams]);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u =>
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.includes(q));
  }, [users, search]);

  /* actions ------------------------------------------------------------- */

  const refresh = () => { bustCache('/members'); bustCache('/trainers'); bustCache('analytics'); load(true); };

  const doDelete = async (user) => {
    if (isDemo) { toast.error('This is sample data — nothing to delete.'); setConfirm(null); return; }
    setBusy(true);
    try {
      await deleteUser(user);
      setUsers(prev => prev.filter(u => u._id !== user._id));
      bustCache('/members'); bustCache('/trainers'); bustCache('analytics');
      toast.success(`${user.name} was deleted.`);
      setConfirm(null);
      setDetailsFor(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete this user.');
    } finally { setBusy(false); }
  };

  const doToggleActive = async (user) => {
    if (isDemo) { toast.error('This is sample data — nothing to change.'); setConfirm(null); return; }
    const turningOff = user.isActive !== false;
    setBusy(true);
    try {
      const updated = await setUserActive(user, !turningOff);
      const next = updated?.isActive ?? !turningOff;
      setUsers(prev => prev.map(u => (u._id === user._id ? { ...u, isActive: next } : u)));
      bustCache('/members'); bustCache('/trainers'); bustCache('analytics');
      toast.success(turningOff
        ? `${user.name} can no longer sign in.`
        : `${user.name} can sign in again.`);
      setConfirm(null);
      setDetailsFor(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update this user.');
    } finally { setBusy(false); }
  };

  const isSelf = user => user._id === me?._id;

  const rowHandlers = user => ({
    onView: () => setDetailsFor(user),
    onEdit: () => setFormFor(user),
    onToggle: () => setConfirm({ kind: 'toggle', user }),
    onDelete: () => setConfirm({ kind: 'delete', user }),
  });

  const columns = [
    { key: 'name', label: 'User' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', width: 110 },
    { key: 'status', label: 'Status', width: 110 },
    { key: 'created', label: 'Created', width: 140 },
    { key: 'actions', label: 'Actions', width: 160, align: 'right' },
  ];

  /* render -------------------------------------------------------------- */

  const listEmpty = (
    <EmptyState
      icon={Users}
      title={users.length === 0 ? 'No users yet' : 'Nobody matches that search'}
      hint={users.length === 0
        ? 'Add your first user and they can sign in straight away.'
        : 'Try part of a name, an email address or a phone number.'}
    >
      {users.length === 0
        ? canManage && <Button variant="primary" icon={UserPlus} onClick={() => setFormFor('new')}>Add user</Button>
        : <Button onClick={() => setSearch('')}>Clear search</Button>}
    </EmptyState>
  );

  return (
    <AdminLayout
      title="Users"
      subtitle="Everyone with an account at your gym"
      actions={canManage && (
        <Button variant="primary" icon={UserPlus} onClick={() => setFormFor('new')}>Add user</Button>
      )}
    >
      {isDemo && (
        <div className="ui-demo-note mb-4">
          <FlaskConical size={15} className="flex-shrink-0" />
          Showing sample data — no real users were found. Changes are not saved.
        </div>
      )}

      {/* Find someone */}
      <div className="ui-toolbar">
        <div className="ui-search">
          <Search size={18} />
          <Input
            placeholder="Search by name, email or phone"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search users"
          />
        </div>
        <Button icon={RefreshCw} onClick={refresh} disabled={loading} aria-label="Reload users">
          Refresh
        </Button>
      </div>

      {error ? (
        <Card>
          <EmptyState icon={AlertTriangle} title="Could not load users" hint={error}>
            <Button variant="primary" icon={RefreshCw} onClick={() => load(true)}>Try again</Button>
          </EmptyState>
        </Card>
      ) : loading ? (
        <SkeletonList rows={6} h={64} />
      ) : shown.length === 0 ? (
        <Card>{listEmpty}</Card>
      ) : (
        <FadeIn>
          {/* Desktop: the six columns asked for */}
          <Card padded={false} className="hidden md:block">
            <Table columns={columns}>
              <AnimatePresence initial={false}>
                {shown.map(user => {
                  const status = statusOf(user);
                  const role = ROLES[user.role] || ROLES.member;
                  return (
                    <TableRow key={user._id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={user.name} size={34} />
                          <span className="font-semibold" style={{ color: 'var(--p-text)' }}>
                            {user.name}
                            {isSelf(user) && (
                              <span className="text-[12px] font-normal ml-1.5" style={{ color: 'var(--p-muted)' }}>
                                (you)
                              </span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td style={{ wordBreak: 'break-all' }}>{user.email}</td>
                      <td><Badge tone={role.tone}>{role.label}</Badge></td>
                      <td><Badge tone={status.tone}>{status.label}</Badge></td>
                      <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(user.createdAt)}</td>
                      <td>
                        <RowActions
                          user={user}
                          canManage={canManage}
                          isSelf={isSelf(user)}
                          {...rowHandlers(user)}
                        />
                      </td>
                    </TableRow>
                  );
                })}
              </AnimatePresence>
            </Table>
          </Card>

          {/* Mobile: the same information stacked, no sideways scrolling */}
          <Card padded={false} className="md:hidden">
            <ul>
              {shown.map((user, i) => {
                const status = statusOf(user);
                const role = ROLES[user.role] || ROLES.member;
                return (
                  <li
                    key={user._id}
                    className="px-4 py-3.5"
                    style={{ borderTop: i ? '1px solid var(--p-border)' : 'none' }}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} size={40} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-semibold truncate" style={{ color: 'var(--p-text)' }}>
                          {user.name}
                        </p>
                        <p className="text-[13px] truncate" style={{ color: 'var(--p-text-2)' }}>{user.email}</p>
                        <p className="text-[12px] mt-0.5" style={{ color: 'var(--p-muted)' }}>
                          Created {fmtDate(user.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <Badge tone={role.tone}>{role.label}</Badge>
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </div>
                    </div>
                    <div className="mt-2.5">
                      <RowActions
                        user={user}
                        canManage={canManage}
                        isSelf={isSelf(user)}
                        {...rowHandlers(user)}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>

          <p className="text-[13px] text-center mt-4" style={{ color: 'var(--p-muted)' }}>
            Showing {shown.length} of {users.length} {users.length === 1 ? 'user' : 'users'}
          </p>
        </FadeIn>
      )}

      {/* ── dialogs ── */}
      <AnimatePresence>
        {formFor && (
          <UserForm
            key="form"
            editing={formFor === 'new' ? null : formFor}
            onClose={() => setFormFor(null)}
            onSaved={(saved, message) => {
              setFormFor(null);
              setDetailsFor(null);
              toast.success(message);
              if (isDemo) return;
              refresh();
            }}
          />
        )}

        {detailsFor && (
          <UserDetails
            key="details"
            user={detailsFor}
            canManage={canManage}
            isSelf={isSelf(detailsFor)}
            onClose={() => setDetailsFor(null)}
            onEdit={() => setFormFor(detailsFor)}
            onToggleActive={() => setConfirm({ kind: 'toggle', user: detailsFor })}
            onDelete={() => setConfirm({ kind: 'delete', user: detailsFor })}
          />
        )}

        {confirm?.kind === 'delete' && (
          <ConfirmDialog
            key="delete"
            title={`Delete ${confirm.user.name}?`}
            message={`Their account and everything in it is removed for good. They will not be able to sign in again, and this cannot be undone. If you only want to stop them signing in, use Disable user instead.`}
            confirmLabel="Delete user"
            cancelLabel="Keep user"
            loading={busy}
            onConfirm={() => doDelete(confirm.user)}
            onCancel={() => setConfirm(null)}
          />
        )}

        {confirm?.kind === 'toggle' && (
          <ConfirmDialog
            key="toggle"
            title={confirm.user.isActive === false
              ? `Let ${confirm.user.name} sign in again?`
              : `Disable ${confirm.user.name}?`}
            message={confirm.user.isActive === false
              ? `${confirm.user.name} will be able to sign in and see their plans again.`
              : `${confirm.user.name} will not be able to sign in. Everything of theirs stays saved, and you can turn this back on at any time.`}
            confirmLabel={confirm.user.isActive === false ? 'Turn sign in on' : 'Disable user'}
            tone={confirm.user.isActive === false ? 'primary' : 'danger'}
            loading={busy}
            onConfirm={() => doToggleActive(confirm.user)}
            onCancel={() => setConfirm(null)}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
