import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, CheckCircle, AlertCircle, Settings } from 'lucide-react';
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

export default function SettingsPage() {
  const { user, updateUser } = useAuth();

  // Change Email state
  const [emailForm, setEmailForm] = useState({ currentPassword: '', newEmail: '' });
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMsg, setEmailMsg] = useState(null); // { type: 'success'|'error', text }

  // Change Password state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
            <p className="text-gray-400 text-sm">Manage your email and password</p>
          </motion.div>
        )}

        {/* Current info card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="glass rounded-xl p-4 mb-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="text-white font-semibold text-sm">{user?.name}</div>
            <div className="text-gray-400 text-xs">{user?.email}</div>
            <div className="text-orange-400 text-xs capitalize">{user?.role}</div>
          </div>
        </motion.div>

        {/* Change Email */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
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
              {emailMsg && (
                <div className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 ${
                  emailMsg.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {emailMsg.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                  {emailMsg.text}
                </div>
              )}
              <button type="submit" disabled={emailLoading}
                className="btn-fire px-5 py-2 text-sm w-full disabled:opacity-60">
                {emailLoading ? 'Updating...' : 'Update Email'}
              </button>
            </form>
          </Section>
        </motion.div>

        {/* Change Password */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Section title="Change Password" icon={<Lock size={16} className="text-purple-400" />}>
            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    placeholder="Enter current password"
                    value={pwForm.currentPassword}
                    onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                    className={inputCls + ' pr-10'}
                  />
                  <button type="button" onClick={() => setShowCurrent(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={pwForm.newPassword}
                    onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                    className={inputCls + ' pr-10'}
                  />
                  <button type="button" onClick={() => setShowNew(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat new password"
                    value={pwForm.confirmPassword}
                    onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    className={inputCls + ' pr-10'}
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              {pwMsg && (
                <div className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 ${
                  pwMsg.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {pwMsg.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                  {pwMsg.text}
                </div>
              )}
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
