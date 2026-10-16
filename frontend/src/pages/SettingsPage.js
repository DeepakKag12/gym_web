import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, CheckCircle, AlertCircle, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import AdminLayout from './admin/AdminLayout';
import MemberPage from '../components/MemberPage';

function Section({ title, icon, children }) {
  return (
    <div className="bg-white dark:bg-[#0e1526] rounded-2xl p-5 sm:p-6 mb-5 border border-slate-200/90 dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      <h2 className="text-slate-900 dark:text-white font-bold text-base mb-4 flex items-center gap-2">
        {icon}
        <span>{title}</span>
      </h2>
      {children}
    </div>
  );
}

function Msg({ msg }) {
  if (!msg) return null;
  return (
    <div className={`flex items-center gap-2 text-sm rounded-xl px-3.5 py-2.5 my-3 ${
      msg.type === 'success'
        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
        : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20'
    }`}>
      {msg.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
      <span>{msg.text}</span>
    </div>
  );
}

export default function SettingsPage() {
  const { user, updateUser } = useAuth();

  // ── Profile (name / phone / etc.) ─────────────────────────────────────────
  const [profileForm, setProfileForm] = useState({
    name:     user?.name     || '',
    phone:    user?.phone    || '',
    whatsapp: user?.whatsapp || '',
    address:  user?.address  || '',
    dob:      user?.dob      ? new Date(user.dob).toISOString().split('T')[0] : '',
    gender:   user?.gender   || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg,     setProfileMsg]     = useState(null);

  // ── Change Email ───────────────────────────────────────────────────────────
  const [emailForm, setEmailForm] = useState({ currentPassword: '', newEmail: '' });
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMsg, setEmailMsg] = useState(null);

  // ── Change Password ────────────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    if (!profileForm.name.trim()) return setProfileMsg({ type: 'error', text: 'Name is required' });
    if (!profileForm.phone.trim()) return setProfileMsg({ type: 'error', text: 'Phone is required' });
    setProfileLoading(true);
    try {
      const res = await API.put('/auth/update-profile', profileForm);
      updateUser(res.data.user);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailMsg(null);
    if (!emailForm.newEmail) return setEmailMsg({ type: 'error', text: 'New email is required' });
    if (!emailForm.currentPassword) return setEmailMsg({ type: 'error', text: 'Current password is required' });
    setEmailLoading(true);
    try {
      const res = await API.put('/auth/update-credentials', {
        currentPassword: emailForm.currentPassword,
        newEmail: emailForm.newEmail,
      });
      updateUser(res.data.user);
      setEmailMsg({ type: 'success', text: 'Email updated successfully!' });
      setEmailForm({ currentPassword: '', newEmail: '' });
    } catch (err) {
      setEmailMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update email' });
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwMsg(null);
    if (!pwForm.currentPassword) return setPwMsg({ type: 'error', text: 'Current password is required' });
    if (!pwForm.newPassword) return setPwMsg({ type: 'error', text: 'New password is required' });
    if (pwForm.newPassword.length < 6) return setPwMsg({ type: 'error', text: 'New password must be at least 6 characters' });
    if (pwForm.newPassword !== pwForm.confirmPassword) return setPwMsg({ type: 'error', text: 'Passwords do not match' });
    setPwLoading(true);
    try {
      const res = await API.put('/auth/update-credentials', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      updateUser(res.data.user);
      setPwMsg({ type: 'success', text: 'Password updated successfully!' });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update password' });
    } finally {
      setPwLoading(false);
    }
  };

  const inputCls = 'w-full bg-slate-50 dark:bg-[#080d19] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:border-[#3365e2] focus:ring-2 focus:ring-[#3365e2]/15 transition-all';
  const labelCls = 'text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider mb-1.5 block';
  const btnCls = 'w-full py-3 px-5 rounded-full bg-[#3365e2] hover:bg-[#2552ca] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-50';
  const isAdminOrTrainer = user?.role === 'admin' || user?.role === 'trainer';

  const formSections = (
    <div className="space-y-5">
      {/* Current info card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#0e1526] rounded-2xl p-5 border border-slate-200/90 dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-full bg-[#3365e2] flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-sm">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-slate-900 dark:text-white font-bold text-base leading-snug">{user?.name}</div>
          <div className="text-slate-500 dark:text-slate-400 text-xs truncate">{user?.email}</div>
          <div className="text-[#3365e2] text-xs font-bold uppercase tracking-wider mt-0.5">{user?.role}</div>
        </div>
      </motion.div>

      {/* ── Edit Profile ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Section title="Profile Information" icon={<User size={18} className="text-[#3365e2]" />}>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Full Name *</label>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={profileForm.name}
                  onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Phone Number *</label>
                <input
                  type="tel"
                  placeholder="10-digit mobile"
                  value={profileForm.phone}
                  onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>WhatsApp Number</label>
                <input
                  type="tel"
                  placeholder="If different from phone"
                  value={profileForm.whatsapp}
                  onChange={e => setProfileForm(f => ({ ...f, whatsapp: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Date of Birth</label>
                <input
                  type="date"
                  value={profileForm.dob}
                  onChange={e => setProfileForm(f => ({ ...f, dob: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Gender</label>
                <select
                  value={profileForm.gender}
                  onChange={e => setProfileForm(f => ({ ...f, gender: e.target.value }))}
                  className={inputCls}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Residential Address</label>
                <input
                  type="text"
                  placeholder="Your address"
                  value={profileForm.address}
                  onChange={e => setProfileForm(f => ({ ...f, address: e.target.value }))}
                  className={inputCls}
                />
              </div>
            </div>
            <Msg msg={profileMsg} />
            <button type="submit" disabled={profileLoading} className={btnCls}>
              {profileLoading ? 'Saving…' : 'Save Profile Changes'}
            </button>
          </form>
        </Section>
      </motion.div>

      {/* ── Change Email ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Section title="Change Email" icon={<Mail size={18} className="text-[#3365e2]" />}>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className={labelCls}>New Email Address</label>
              <input
                type="email"
                placeholder="Enter new email"
                value={emailForm.newEmail}
                onChange={e => setEmailForm(f => ({ ...f, newEmail: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Current Password (to confirm)</label>
              <input
                type="password"
                placeholder="Enter current password"
                value={emailForm.currentPassword}
                onChange={e => setEmailForm(f => ({ ...f, currentPassword: e.target.value }))}
                className={inputCls}
              />
            </div>
            <Msg msg={emailMsg} />
            <button type="submit" disabled={emailLoading} className={btnCls}>
              {emailLoading ? 'Updating...' : 'Update Email Address'}
            </button>
          </form>
        </Section>
      </motion.div>

      {/* ── Change Password ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Section title="Change Security Password" icon={<Lock size={18} className="text-[#3365e2]" />}>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {[
              { label: 'Current Password', key: 'currentPassword', show: showCurrent, toggle: () => setShowCurrent(v => !v), placeholder: 'Enter current password' },
              { label: 'New Password',      key: 'newPassword',     show: showNew,     toggle: () => setShowNew(v => !v),     placeholder: 'At least 6 characters' },
              { label: 'Confirm New Password', key: 'confirmPassword', show: showConfirm, toggle: () => setShowConfirm(v => !v), placeholder: 'Repeat new password' },
            ].map(f => (
              <div key={f.key}>
                <label className={labelCls}>{f.label}</label>
                <div className="relative">
                  <input
                    type={f.show ? 'text' : 'password'}
                    placeholder={f.placeholder}
                    value={pwForm[f.key]}
                    onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className={inputCls + ' pr-11'}
                  />
                  <button type="button" onClick={f.toggle}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                    {f.show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            ))}
            <Msg msg={pwMsg} />
            <button type="submit" disabled={pwLoading} className={btnCls}>
              {pwLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </Section>
      </motion.div>
    </div>
  );

  if (isAdminOrTrainer) {
    return <AdminLayout title="Account Settings">{formSections}</AdminLayout>;
  }

  return (
    <MemberPage
      title="Account Settings"
      subtitle="Manage your profile information, credentials, and password"
      width="max-w-2xl"
    >
      {formSections}
    </MemberPage>
  );
}
