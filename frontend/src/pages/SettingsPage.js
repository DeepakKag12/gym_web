import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, CheckCircle, AlertCircle, Settings, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import AdminLayout from './admin/AdminLayout';

function Section({ title, icon, children }) {
  return (
    <div className="glass rounded-xl p-5 mb-5">
      <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  );
}

function Msg({ msg }) {
  if (!msg) return null;
  return (
    <div className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 ${
      msg.type === 'success'
        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
        : 'bg-red-500/10 text-red-400 border border-red-500/20'
    }`}>
      {msg.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
      {msg.text}
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

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-all';
  const isAdminOrTrainer = user?.role === 'admin' || user?.role === 'trainer';

  const content = (
    <div className={isAdminOrTrainer ? '' : 'min-h-screen bg-[#0a0a0f] pt-20 pb-24 lg:pb-8'}>
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">

        {!isAdminOrTrainer && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h1 className="gym-font text-3xl text-white mb-1 flex items-center gap-2">
              <Settings size={26} className="text-orange-400" /> Account Settings
            </h1>
            <p className="text-gray-400 text-sm">Manage your profile, email and password</p>
          </motion.div>
        )}

        {/* Current info card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="glass rounded-xl p-4 mb-5 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold">{user?.name}</div>
            <div className="text-gray-400 text-xs">{user?.email}</div>
            <div className="text-orange-400 text-xs capitalize">{user?.role}</div>
          </div>
        </motion.div>

        {/* ── Edit Profile ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <Section title="Edit Profile" icon={<User size={16} className="text-orange-400" />}>
            <form onSubmit={handleProfileSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={profileForm.name}
                    onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Phone *</label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile"
                    value={profileForm.phone}
                    onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">WhatsApp Number</label>
                  <input
                    type="tel"
                    placeholder="If different from phone"
                    value={profileForm.whatsapp}
                    onChange={e => setProfileForm(f => ({ ...f, whatsapp: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Date of Birth</label>
                  <input
                    type="date"
                    value={profileForm.dob}
                    onChange={e => setProfileForm(f => ({ ...f, dob: e.target.value }))}
                    className={inputCls}
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Gender</label>
                  <select
                    value={profileForm.gender}
                    onChange={e => setProfileForm(f => ({ ...f, gender: e.target.value }))}
                    className={inputCls}
                  >
                    <option value="" style={{ background: '#111318', color: '#f1f5f9' }}>Select gender</option>
                    <option value="male"   style={{ background: '#111318', color: '#f1f5f9' }}>Male</option>
                    <option value="female" style={{ background: '#111318', color: '#f1f5f9' }}>Female</option>
                    <option value="other"  style={{ background: '#111318', color: '#f1f5f9' }}>Other</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-gray-400 text-xs mb-1 block">Address</label>
                  <input
                    type="text"
                    placeholder="Your home address"
                    value={profileForm.address}
                    onChange={e => setProfileForm(f => ({ ...f, address: e.target.value }))}
                    className={inputCls}
                  />
                </div>
              </div>
              <Msg msg={profileMsg} />
              <button type="submit" disabled={profileLoading}
                className="btn-fire px-5 py-2 text-sm w-full disabled:opacity-60">
                {profileLoading ? 'Saving…' : 'Save Profile'}
              </button>
            </form>
          </Section>
        </motion.div>

        {/* ── Change Email ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <Section title="Change Email" icon={<Mail size={16} className="text-blue-400" />}>
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">New Email Address</label>
                <input
                  type="email"
                  placeholder="Enter new email"
                  value={emailForm.newEmail}
                  onChange={e => setEmailForm(f => ({ ...f, newEmail: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Current Password (to confirm)</label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={emailForm.currentPassword}
                  onChange={e => setEmailForm(f => ({ ...f, currentPassword: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <Msg msg={emailMsg} />
              <button type="submit" disabled={emailLoading}
                className="btn-fire px-5 py-2 text-sm w-full disabled:opacity-60">
                {emailLoading ? 'Updating...' : 'Update Email'}
              </button>
            </form>
          </Section>
        </motion.div>

        {/* ── Change Password ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <Section title="Change Password" icon={<Lock size={16} className="text-purple-400" />}>
            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              {[
                { label: 'Current Password', key: 'currentPassword', show: showCurrent, toggle: () => setShowCurrent(v => !v), placeholder: 'Enter current password' },
                { label: 'New Password',      key: 'newPassword',     show: showNew,     toggle: () => setShowNew(v => !v),     placeholder: 'At least 6 characters' },
                { label: 'Confirm New Password', key: 'confirmPassword', show: showConfirm, toggle: () => setShowConfirm(v => !v), placeholder: 'Repeat new password' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-gray-400 text-xs mb-1 block">{f.label}</label>
                  <div className="relative">
                    <input
                      type={f.show ? 'text' : 'password'}
                      placeholder={f.placeholder}
                      value={pwForm[f.key]}
                      onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className={inputCls + ' pr-10'}
                    />
                    <button type="button" onClick={f.toggle}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                      {f.show ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              ))}
              <Msg msg={pwMsg} />
              <button type="submit" disabled={pwLoading}
                className="btn-fire px-5 py-2 text-sm w-full disabled:opacity-60">
                {pwLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </Section>
        </motion.div>

      </div>
    </div>
  );

  if (isAdminOrTrainer) {
    return <AdminLayout title="Account Settings">{content}</AdminLayout>;
  }
  return content;
}
