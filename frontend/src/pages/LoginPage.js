import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { apiError } from '../utils/api';

function Logo({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="44" stroke="url(#lring2)" strokeWidth="5" fill="none"/>
      <rect x="4"  y="46" width="18" height="8" rx="3" fill="url(#lbarb2)"/>
      <rect x="2"  y="42" width="6"  height="16" rx="2" fill="#10b981"/>
      <rect x="78" y="46" width="18" height="8" rx="3" fill="url(#lbarb2)"/>
      <rect x="92" y="42" width="6"  height="16" rx="2" fill="#176b45"/>
      <polygon points="50,18 28,75 72,75" fill="url(#ltri2)"/>
      <polygon points="50,40 40,65 60,65" fill="#0b0c0e"/>
      <defs>
        <linearGradient id="ltri2" x1="28" y1="18" x2="72" y2="75" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#176b45"/><stop offset="100%" stopColor="#10b981"/>
        </linearGradient>
        <linearGradient id="lring2" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#176b45"/><stop offset="100%" stopColor="#141211"/>
        </linearGradient>
        <linearGradient id="lbarb2" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981"/><stop offset="100%" stopColor="#141211"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'trainer') navigate('/trainer');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(apiError(err, 'Could not sign you in.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c0e] flex overflow-hidden">
      {/* Left — full gym photo */}
      <div className="hidden lg:block relative flex-1">
        <img
          src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&q=80"
          alt="gym"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0b0c0e]" />
        <div className="absolute inset-0 bg-[#0b0c0e]/40" />
        {/* Quote overlay */}
        <div className="absolute bottom-16 left-10 right-10">
          <p className="gym-font text-5xl text-white leading-tight">
            YOUR ONLY LIMIT<br/>IS <span className="gradient-text">YOUR MIND.</span>
          </p>
          <p className="text-gray-400 mt-3 text-sm">— FITNATION BY AJEET</p>
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <Logo size={42} />
            <div>
              <div className="gym-font text-2xl text-white tracking-widest">FITNATION</div>
              <div className="text-[10px] tracking-[3px] font-bold text-gray-400">BY AJEET</div>
            </div>
          </div>

          <h1 className="text-white font-bold text-3xl mb-1">Sign in</h1>
          <p className="text-gray-400 text-sm mb-8">Welcome back! Enter your credentials to continue.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="text-gray-300 text-xs font-semibold uppercase tracking-wider block mb-2">Email</label>
              <input
                id="login-email"
                className="input-dark w-full"
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="login-password" className="text-gray-300 text-xs font-semibold uppercase tracking-wider">Password</label>
                <a href="/enquiry" className="text-gray-400 hover:text-white text-xs hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  className="input-dark w-full pr-11"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
              className="btn-fire w-full py-3.5 text-base mt-2 flex items-center justify-center gap-2"
              aria-busy={loading}
            >
              {loading
                ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" aria-label="Signing in..." />
                : <><span>Sign In</span><ArrowRight size={17}/></>
              }
            </motion.button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/8 text-center">
            <p className="text-gray-500 text-sm">
              Not a member yet?{' '}
              <a href="/enquiry" className="text-white font-semibold hover:underline">Enquire to join →</a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
