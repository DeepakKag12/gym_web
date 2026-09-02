import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
  UserPlus, Search, Pencil, Trash2, Ban, CheckCircle2, Eye, Users as UsersIcon,
  RefreshCw, AlertTriangle, KeyRound, Shield, EyeOff, MoreVertical,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { apiError } from '../../utils/api';
import {
  Card, Button, Badge, Avatar, Field, Input, Select,
  Modal, ConfirmDialog, EmptyState, SkeletonList, Table, TableRow, FadeIn,
  WhatsAppButton,
} from '../../components/ui';
import {
  ROLES, PLANS, loadUsers, statusOf, fmtDate, calcExpiry, bustUserCaches,
  createUser, updateUser, setUserActive, resetPassword, changeRole, deleteUser,
  buildCredentialsMessage, waLink,
} from './userService';

/**
 * Users — every account in the system, and everything you can do to one.
 *
 * Eight columns and eight actions, all reachable without leaving the row.
 * Destructive actions confirm first, every action reports what happened, and
 * nothing is hidden behind a hover.
 */

/* ── Add / edit ─────────────────────────────────────────────────────────── */

const blank = {
  name: '', email: '', phone: '', password: '', role: 'member',
  membershipPlan: 'monthly',
  membershipStart: new Date().toISOString().split('T')[0],
  feeAmount: '',
};

function UserForm({ editing, onClose, onSaved }) {
  const isEdit = Boolean(editing);
  const [form, setForm] = useState(() => (isEdit
    ? {
        ...blank,
        name: editing.name || '',
        email: editing.email || '',
        phone: editing.phone || '',
        password: '',
        role: editing.role || 'member',
        membershipPlan: editing.membershipPlan || 'monthly',
        membershipStart: editing.membershipStart?.split('T')[0] || '',
        membershipEnd: editing.membershipEnd?.split('T')[0] || '',
        feeAmount: editing.feeAmount ?? '',
      }
    : { ...blank }));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const set = (name, value) => {
    setForm(prev => {
      const next = { ...prev, [name]: value };
      // The admin never works out an expiry date by hand.
      if (name === 'membershipPlan' || name === 'membershipStart') {
        next.membershipEnd = calcExpiry(next.membershipStart, next.membershipPlan);
      }
      return next;
    });
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };
  const bind = name => ({ value: form[name] ?? '', onChange: e => set(name, e.target.value) });

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Please enter their name.';
    else if (form.name.trim().length < 2) e.name = 'That name looks too short.';

    if (!form.email.trim()) e.email = 'Please enter their email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'That email does not look right.';

    if (!form.phone.trim()) e.phone = 'Please enter a mobile number.';
    else if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) e.phone = 'Enter a 10-digit mobile number.';

    // Optional: left blank, the member's mobile number becomes their password.
    // Nothing secret then needs to be transmitted — they already know it.
    if (form.password && form.password.length < 6) e.password = 'Use at least 6 characters.';

    if (form.role === 'member' && !isEdit && !form.membershipStart) {
      e.membershipStart = 'Pick the day their membership starts.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const saved = await (isEdit ? updateUser(editing, form) : createUser(form));
      onSaved(
        isEdit
          ? `${form.name.trim()} was updated.`
          : `${form.name.trim()} was added and can sign in now.`,
        // Only on create, and only in memory — this is the one moment the
        // plaintext password exists outside the admin's own typing.
        isEdit ? null : {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone,
          password: form.password || form.phone.replace(/\D/g, ''),
          usedPhone: !form.password,
          _id: saved?._id,
        },
      );
    } catch (err) {
      const msg = apiError(err, 'Could not save this user.');
      // A duplicate comes back as 409 naming the field that clashed, so the
      // error lands on that input rather than only in a toast the admin has to
      // translate back into "which box do I fix".
      const field = err?.response?.status === 409 ? err.response.data?.field : null;
      if (field === 'email' || field === 'phone') {
        setErrors(p => ({ ...p, [field]: msg }));
      } else if (/email/i.test(msg)) {
        setErrors(p => ({ ...p, email: msg }));
      }
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const expiry = form.membershipEnd || calcExpiry(form.membershipStart, form.membershipPlan);
  const showMembership = form.role === 'member';

  return (
    <Modal
      title={isEdit ? `Edit ${editing.name}` : 'Add a new user'}
      onClose={saving ? () => {} : onClose}
      width={480}
      footer={
        <>
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={save} loading={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add user'}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={e => { e.preventDefault(); save(); }}>
        <Field label="Full name" required error={errors.name}>
          <Input {...bind('name')} placeholder="Ajeet Kumar" autoFocus autoComplete="name" />
        </Field>

        <Field label="Email" required error={errors.email} hint="They sign in with this">
          <Input type="email" {...bind('email')} placeholder="name@gmail.com" autoComplete="email" />
        </Field>

        <Field label="Mobile number" required error={errors.phone} hint="Used for WhatsApp reminders">
          <Input type="tel" inputMode="numeric" {...bind('phone')} placeholder="9876543210" />
        </Field>

        <Field
          label="Role"
          required
          hint={isEdit ? 'Use Change role on the row to move someone between roles.' : ROLES[form.role]?.hint}
        >
          <Select {...bind('role')} disabled={isEdit}>
            <option value="member">Member</option>
            <option value="trainer">Trainer</option>
            {isEdit && form.role === 'admin' && <option value="admin">Admin</option>}
          </Select>
        </Field>

        <Field
          label={isEdit ? 'New password' : 'Password'}
          error={errors.password}
          hint={isEdit
            ? 'Leave empty to keep their current password'
            : 'Leave empty and their mobile number becomes the password'}
        >
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              {...bind('password')}
              placeholder={isEdit ? 'Unchanged' : 'Mobile number'}
              autoComplete="new-password"
              style={{ paddingRight: 44 }}
            />
            <button type="button" onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg"
              style={{ color: 'var(--p-muted)', minHeight: 'unset' }}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>

        {showMembership && (
          <div className="pt-1 space-y-4" style={{ borderTop: '1px solid var(--p-border)' }}>
            <p className="ui-section-label pt-3">Membership</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Plan length">
                <Select {...bind('membershipPlan')}>
                  {Object.entries(PLANS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </Select>
              </Field>
              <Field label="Starts on" required={!isEdit} error={errors.membershipStart}>
                <Input type="date" {...bind('membershipStart')} />
              </Field>
            </div>
            <Field label="Fee amount (₹)" hint="Optional">
              <Input type="number" min="0" {...bind('feeAmount')} placeholder="1500" />
            </Field>
            {expiry && (
              <p className="text-[13.5px] p-3 rounded-lg" style={{
                background: 'var(--p-accent-soft)', border: '1px solid var(--p-accent-line)', color: 'var(--p-text)',
              }}>
                Membership ends on <strong>{fmtDate(expiry)}</strong>.
              </p>
            )}
          </div>
        )}

        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </Modal>
  );
}

/* ── Reset password ─────────────────────────────────────────────────────── */

function ResetPasswordModal({ user, onClose, onDone }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [show, setShow] = useState(false);

  const submit = async () => {
    if (password.length < 6) return setError('Use at least 6 characters.');
    setSaving(true);
    try {
      await resetPassword(user, password);
      onDone(`${user.name}'s password was reset. Tell them the new one.`);
    } catch (err) {
      toast.error(apiError(err, 'Could not reset the password.'));
    } finally { setSaving(false); }
  };

  return (
    <Modal
      title={`Reset password for ${user.name}`}
      onClose={saving ? () => {} : onClose}
      width={420}
      footer={
        <>
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={submit} loading={saving}>Reset password</Button>
        </>
      }
    >
      <p className="text-[14px] mb-4" style={{ color: 'var(--p-text-2)' }}>
        Their old password stops working immediately. Nothing is emailed automatically,
        so make a note of the new one and pass it on.
      </p>
      <Field label="New password" required error={error} hint="At least 6 characters">
        <div className="relative">
          <Input
            type={show ? 'text' : 'password'}
            value={password}
            onChange={e => { setPassword(e.target.value); setError(null); }}
            autoFocus
            autoComplete="new-password"
            style={{ paddingRight: 44 }}
          />
          <button type="button" onClick={() => setShow(v => !v)}
            aria-label={show ? 'Hide password' : 'Show password'}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg"
            style={{ color: 'var(--p-muted)', minHeight: 'unset' }}>
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </Field>
    </Modal>
  );
}

/* ── Change role ────────────────────────────────────────────────────────── */

function ChangeRoleModal({ user, onClose, onDone }) {
  const [role, setRole] = useState(user.role);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (role === user.role) return onClose();
    setSaving(true);
    try {
      const res = await changeRole(user, role);
      onDone(res?.message || `${user.name} is now a ${role}.`);
    } catch (err) {
      toast.error(apiError(err, 'Could not change this role.'));
    } finally { setSaving(false); }
  };

  return (
    <Modal
      title={`Change role for ${user.name}`}
      onClose={saving ? () => {} : onClose}
      width={420}
      footer={
        <>
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={submit} loading={saving} disabled={role === user.role}>
            Change role
          </Button>
        </>
      }
    >
      <Field label="Role" hint={ROLES[role]?.hint}>
        <Select value={role} onChange={e => setRole(e.target.value)} autoFocus>
          <option value="member">Member</option>
          <option value="trainer">Trainer</option>
          <option value="admin">Admin</option>
        </Select>
      </Field>
      {role === 'admin' && user.role !== 'admin' && (
        <p className="text-[13.5px] mt-3 p-3 rounded-lg" style={{
          background: 'var(--p-warn-soft)', border: '1px solid var(--p-warn-line)', color: 'var(--p-warn)',
        }}>
          An admin can see and change everything, including other users. Only do this
          for someone you trust to run the gym.
        </p>
      )}
    </Modal>
  );
}

/* ── View ───────────────────────────────────────────────────────────────── */

function UserDetails({ user, onClose }) {
  const status = statusOf(user);
  const role = ROLES[user.role] || ROLES.member;
  const row = (label, value) => (
    <div className="ui-dl-row"><dt>{label}</dt><dd>{value}</dd></div>
  );

  return (
    <Modal title="User details" onClose={onClose} width={430}>
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
      <dl>
        {row('Email', user.email)}
        {row('Phone', user.phone || '—')}
        {row('Role', role.label)}
        {row('Status', user.isActive === false ? 'Disabled' : 'Can sign in')}
        {row('Joined', fmtDate(user.createdAt))}
        {user.role === 'member' && row('Membership', PLANS[user.membershipPlan] || '—')}
        {user.role === 'member' && row('Expires', fmtDate(user.membershipEnd))}
        {user.feeAmount ? row('Fee', `₹${user.feeAmount}`) : null}
      </dl>
    </Modal>
  );
}

/* ── Row actions ────────────────────────────────────────────────────────── */

function RowActions({ user, isSelf, on }) {
  const [open, setOpen] = useState(false);
  const disabled = user.isActive === false;

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);

  return (
    <div className="ui-row-actions">
      <Button size="sm" variant="ghost" icon={Eye} onClick={() => on.view(user)}
        aria-label={`View ${user.name}`} title="View user" />
      <Button size="sm" variant="ghost" icon={Pencil} onClick={() => on.edit(user)}
        aria-label={`Edit ${user.name}`} title="Edit user" />

      {/* The rarer, riskier four sit one tap deeper so the row stays readable */}
      <div className="relative" onClick={e => e.stopPropagation()}>
        <Button size="sm" variant="ghost" icon={MoreVertical} onClick={() => setOpen(v => !v)}
          aria-label={`More actions for ${user.name}`} title="More actions" aria-expanded={open} />
        {open && (
          <div className="absolute right-0 top-full mt-1 z-30 py-1 rounded-lg" style={{
            minWidth: 190, background: 'var(--p-surface)',
            border: '1px solid var(--p-border)', boxShadow: 'var(--p-shadow-lg)',
          }}>
            <button className="ui-menu-item" onClick={() => { setOpen(false); on.password(user); }}>
              <KeyRound size={15} /> Reset password
            </button>
            {!isSelf && (
              <button className="ui-menu-item" onClick={() => { setOpen(false); on.role(user); }}>
                <Shield size={15} /> Change role
              </button>
            )}
            {!isSelf && (
              <button className="ui-menu-item" onClick={() => { setOpen(false); on.toggle(user); }}>
                {disabled ? <><CheckCircle2 size={15} /> Activate user</> : <><Ban size={15} /> Disable user</>}
              </button>
            )}
            {!isSelf && (
              <button className="ui-menu-item ui-menu-item-danger" onClick={() => { setOpen(false); on.remove(user); }}>
                <Trash2 size={15} /> Delete user
              </button>
            )}
            {isSelf && (
              <p className="px-3 py-2 text-[12px]" style={{ color: 'var(--p-muted)' }}>
                This is your own account.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Credentials handover ───────────────────────────────────────────────── */

/**
 * Shown once, immediately after a user is created.
 *
 * The welcome email has already gone out by this point. This dialog exists for
 * the second channel: WhatsApp cannot be sent automatically without a
 * registered WhatsApp Business sender, so the admin sends it from their own
 * number with one tap.
 *
 * The password appears here and nowhere else — it is deliberately not written
 * to the notification history, so it cannot be read back later.
 */
function CredentialsModal({ credentials, onClose }) {
  const text = buildCredentialsMessage(credentials);
  const href = waLink(credentials.phone, text);

  return (
    <Modal
      title="User created"
      onClose={onClose}
      width={430}
      footer={<Button variant="primary" onClick={onClose}>Done</Button>}
    >
      <p className="text-[14.5px] mb-4" style={{ color: 'var(--p-text-2)' }}>
        <strong style={{ color: 'var(--p-text)' }}>{credentials.name}</strong> can sign in now.
        The welcome email with these details has already been sent.
      </p>

      <div className="ui-card ui-card-pad mb-4" style={{ background: 'var(--p-surface-2)', boxShadow: 'none' }}>
        <p className="text-[12.5px]" style={{ color: 'var(--p-text-2)' }}>Email</p>
        <p className="text-[15px] font-medium break-all mb-3" style={{ color: 'var(--p-text)' }}>{credentials.email}</p>
        <p className="text-[12.5px]" style={{ color: 'var(--p-text-2)' }}>Password</p>
        <p className="text-[15px] font-medium" style={{ color: 'var(--p-text)' }}>
          {credentials.password}
          {credentials.usedPhone && (
            <span className="text-[12.5px] font-normal ml-2" style={{ color: 'var(--p-muted)' }}>
              (their mobile number)
            </span>
          )}
        </p>
      </div>

      {href ? (
        <WhatsAppButton block phone={credentials.phone} text={text} label="Send on WhatsApp" />
      ) : (
        <p className="text-[13px]" style={{ color: 'var(--p-muted)' }}>
          No mobile number on record, so there is nothing to WhatsApp. The email has still gone out.
        </p>
      )}

      <p className="text-[12px] mt-3" style={{ color: 'var(--p-muted)' }}>
        {credentials.usedPhone
          ? 'The welcome email tells them to sign in with their mobile number. No password is sent by email.'
          : 'The password is not included in the email and is not stored anywhere you can read it again — send it now.'}
      </p>
    </Modal>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */

export default function AdminUsers() {
  const [params, setParams] = useSearchParams();
  const { user: me } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const [formFor, setFormFor] = useState(params.get('add') ? 'new' : null);
  const [viewing, setViewing] = useState(null);
  const [pwFor, setPwFor] = useState(null);
  const [roleFor, setRoleFor] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback((force = false) => {
    setLoading(true);
    setError(null);
    loadUsers({ force })
      .then(setUsers)
      .catch(err => setError(apiError(err, 'Could not load your users.')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Drop ?add=1 once the form is open so a refresh does not reopen it.
  useEffect(() => {
    if (!params.get('add')) return;
    const next = new URLSearchParams(params);
    next.delete('add');
    setParams(next, { replace: true });
  }, [params, setParams]);

  const refresh = () => { bustUserCaches(); load(true); };

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter(u => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (!q) return true;
      return u.name?.toLowerCase().includes(q)
        || u.email?.toLowerCase().includes(q)
        || u.phone?.includes(q);
    });
  }, [users, search, roleFilter]);

  const isSelf = u => u._id === me?._id;

  /** Every write follows the same shape: run, report, refresh, close. */
  const run = async (fn, successMessage, failMessage) => {
    setBusy(true);
    try {
      const res = await fn();
      toast.success(typeof successMessage === 'function' ? successMessage(res) : successMessage);
      setConfirm(null); setPwFor(null); setRoleFor(null); setViewing(null);
      refresh();
    } catch (err) {
      toast.error(apiError(err, failMessage));
    } finally { setBusy(false); }
  };

  const on = {
    view: setViewing,
    edit: setFormFor,
    password: setPwFor,
    role: setRoleFor,
    toggle: u => setConfirm({ kind: 'toggle', user: u }),
    remove: u => setConfirm({ kind: 'delete', user: u }),
  };

  const columns = [
    { key: 'name',   label: 'Name' },
    { key: 'email',  label: 'Email' },
    { key: 'phone',  label: 'Phone', width: 130 },
    { key: 'role',   label: 'Role', width: 100 },
    { key: 'status', label: 'Membership', width: 130 },
    { key: 'joined', label: 'Join date', width: 130 },
    { key: 'expiry', label: 'Expiry date', width: 130 },
    { key: 'act',    label: 'Actions', width: 140, align: 'right' },
  ];

  return (
    <AdminLayout
      title="Users"
      subtitle="Everyone with an account"
      actions={<Button variant="primary" icon={UserPlus} onClick={() => setFormFor('new')}>Add user</Button>}
    >
      <div className="ui-toolbar">
        <div className="ui-search">
          <Search size={18} />
          <Input placeholder="Search by name, email or phone" value={search}
            onChange={e => setSearch(e.target.value)} aria-label="Search users" />
        </div>
        <Select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          aria-label="Filter by role" style={{ width: 150, height: 42 }}>
          <option value="all">All roles</option>
          <option value="member">Members</option>
          <option value="trainer">Trainers</option>
          <option value="admin">Admins</option>
        </Select>
        <Button icon={RefreshCw} onClick={refresh} disabled={loading}>Refresh</Button>
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
        <Card>
          <EmptyState
            icon={UsersIcon}
            title={users.length === 0 ? 'No users yet' : 'Nobody matches'}
            hint={users.length === 0
              ? 'Add your first user and they can sign in straight away.'
              : 'Try part of a name, an email address or a phone number.'}
          >
            {users.length === 0
              ? <Button variant="primary" icon={UserPlus} onClick={() => setFormFor('new')}>Add user</Button>
              : <Button onClick={() => { setSearch(''); setRoleFilter('all'); }}>Clear filters</Button>}
          </EmptyState>
        </Card>
      ) : (
        <FadeIn>
          <Card padded={false} className="hidden md:block">
            <Table columns={columns}>
              {shown.map(u => {
                const status = statusOf(u);
                const role = ROLES[u.role] || ROLES.member;
                return (
                  <TableRow key={u._id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={u.name} size={34} />
                        <span className="min-w-0">
                          <span className="block font-semibold" style={{ color: 'var(--p-text)' }}>
                            {u.name}
                            {isSelf(u) && <span className="text-[12px] font-normal ml-1.5" style={{ color: 'var(--p-muted)' }}>(you)</span>}
                          </span>
                          {/* Two members can genuinely share a name; the number
                              is what tells them apart at a glance. */}
                          <span className="block text-[12px]" style={{ color: 'var(--p-muted)' }}>
                            {u.phone || 'No phone'}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td style={{ wordBreak: 'break-all' }}>{u.email}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{u.phone || '—'}</td>
                    <td><Badge tone={role.tone}>{role.label}</Badge></td>
                    <td><Badge tone={status.tone}>{status.label}</Badge></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(u.createdAt)}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{u.role === 'member' ? fmtDate(u.membershipEnd) : '—'}</td>
                    <td><RowActions user={u} isSelf={isSelf(u)} on={on} /></td>
                  </TableRow>
                );
              })}
            </Table>
          </Card>

          {/* Mobile: same data, stacked, no sideways scrolling */}
          <Card padded={false} className="md:hidden">
            <ul>
              {shown.map((u, i) => {
                const status = statusOf(u);
                const role = ROLES[u.role] || ROLES.member;
                return (
                  <li key={u._id} className="px-4 py-3.5" style={{ borderTop: i ? '1px solid var(--p-border)' : 'none' }}>
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} size={40} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-semibold truncate" style={{ color: 'var(--p-text)' }}>{u.name}</p>
                        <p className="text-[13px] truncate" style={{ color: 'var(--p-text-2)' }}>{u.email}</p>
                        <p className="text-[12px] mt-0.5" style={{ color: 'var(--p-muted)' }}>
                          {u.phone || 'No phone'} · Joined {fmtDate(u.createdAt)}
                          {u.role === 'member' && u.membershipEnd ? ` · Ends ${fmtDate(u.membershipEnd)}` : ''}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <Badge tone={role.tone}>{role.label}</Badge>
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </div>
                    </div>
                    <div className="mt-2.5"><RowActions user={u} isSelf={isSelf(u)} on={on} /></div>
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

      <AnimatePresence>
        {formFor && (
          <UserForm
            key="form"
            editing={formFor === 'new' ? null : formFor}
            onClose={() => setFormFor(null)}
            onSaved={(msg, creds) => {
              setFormFor(null);
              toast.success(msg);
              if (creds) setCredentials(creds);
              refresh();
            }}
          />
        )}

        {credentials && (
          <CredentialsModal key="creds" credentials={credentials} onClose={() => setCredentials(null)} />
        )}

        {viewing && <UserDetails key="view" user={viewing} onClose={() => setViewing(null)} />}

        {pwFor && (
          <ResetPasswordModal
            key="pw"
            user={pwFor}
            onClose={() => setPwFor(null)}
            onDone={msg => { setPwFor(null); toast.success(msg); refresh(); }}
          />
        )}

        {roleFor && (
          <ChangeRoleModal
            key="role"
            user={roleFor}
            onClose={() => setRoleFor(null)}
            onDone={msg => { setRoleFor(null); toast.success(msg); refresh(); }}
          />
        )}

        {confirm?.kind === 'delete' && (
          <ConfirmDialog
            key="del"
            title={`Are you sure you want to delete ${confirm.user.name}?`}
            message="Their account and everything in it is removed for good. They will not be able to sign in again, and this cannot be undone. To stop them signing in without losing their records, use Disable user instead."
            confirmLabel="Delete"
            cancelLabel="Cancel"
            loading={busy}
            onCancel={() => setConfirm(null)}
            onConfirm={() => run(
              () => deleteUser(confirm.user),
              `${confirm.user.name} was deleted.`,
              'Could not delete this user.',
            )}
          />
        )}

        {confirm?.kind === 'toggle' && (
          <ConfirmDialog
            key="tog"
            title={confirm.user.isActive === false
              ? `Activate ${confirm.user.name}?`
              : `Disable ${confirm.user.name}?`}
            message={confirm.user.isActive === false
              ? `${confirm.user.name} will be able to sign in again. Nothing else changes.`
              : `${confirm.user.name} will not be able to sign in. Everything of theirs stays saved and you can turn this back on at any time.`}
            confirmLabel={confirm.user.isActive === false ? 'Activate' : 'Disable'}
            cancelLabel="Cancel"
            tone={confirm.user.isActive === false ? 'primary' : 'danger'}
            loading={busy}
            onCancel={() => setConfirm(null)}
            onConfirm={() => run(
              () => setUserActive(confirm.user, confirm.user.isActive === false),
              confirm.user.isActive === false
                ? `${confirm.user.name} can sign in again.`
                : `${confirm.user.name} can no longer sign in.`,
              'Could not update this user.',
            )}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
