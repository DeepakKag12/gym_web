import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { apiError } from '../utils/api';

function Logo({ size = 42 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <circle cx="50" cy="50" r="44" stroke="#3365e2" strokeWidth="5" fill="none"/>
      <rect x="4"  y="46" width="18" height="8" rx="2" fill="#3365e2"/>
      <rect x="2"  y="42" width="6"  height="16" rx="2" fill="#3365e2"/>
      <rect x="78" y="46" width="18" height="8" rx="2" fill="#3365e2"/>
      <rect x="92" y="42" width="6"  height="16" rx="2" fill="#3365e2"/>
      <polygon points="50,18 28,75 72,75" fill="#3365e2"/>
      <polygon points="50,42 42,65 58,65" fill="var(--bg, #0a0c10)"/>
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex overflow-hidden selection:bg-[#3365e2] selection:text-white">
      {/* Left — Landing Page White & Blue Hero Banner with Dot-Matrix Pattern & Athletic Photography */}
      <div className="hidden lg:flex relative flex-1 bg-[linear-gradient(to_bottom,#ffffff_0%,#eff6ff_20%,#bfdbfe_45%,#60a5fa_70%,#3365e2_100%)] overflow-hidden items-end p-12 text-slate-900 border-r border-[#3365e2]/20">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#15324d_1.2px,transparent_1.2px)] [background-size:24px_24px] pointer-events-none" />
        <img
          src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&q=80"
          alt="FitNation Training Floor"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30 filter brightness-[0.8]"
        />

        {/* Athletic Quote Overlay */}
        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#3365e2]/30 text-[#3365e2] text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#3365e2] animate-pulse" />
            <span>Athletic Discipline &amp; Periodization</span>
          </div>
          <p className="text-4xl sm:text-5xl font-black uppercase tracking-tight leading-tight text-slate-900">
            DISCIPLINE TODAY.<br /><span className="text-[#3365e2]">STRENGTH TOMORROW.</span>
          </p>
          <p className="text-slate-800 mt-3 text-xs uppercase tracking-[0.2em] font-bold">
            — FITNATION BY AJEET · RAJGARH (DHAR), MP
          </p>
        </div>
      </div>

      {/* Right — Clean White Login Card Surface */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 sm:py-16 bg-[#f8fafc]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white p-7 sm:p-9 rounded-[28px] border border-slate-200/90 shadow-[0_16px_40px_rgba(19,49,74,0.06)]"
        >
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-3 mb-6 group no-underline" aria-label="FitNation by Ajeet Home">
            <Logo size={36} />
            <div>
              <div className="text-2xl font-black text-[#13314a] tracking-tight group-hover:text-[#3365e2] transition-colors leading-none">
                FITNATION
              </div>
              <div className="text-[10px] tracking-[2.5px] font-bold text-[#3365e2] mt-0.5">
                BY AJEET
              </div>
            </div>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1 tracking-tight uppercase">
            MEMBER PORTAL
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mb-6 leading-relaxed">
            Enter your credentials to access your workouts, diets, and training progress.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="text-slate-700 text-xs font-bold uppercase tracking-wider block mb-1.5">
                Email Address
              </label>
              <input
                id="login-email"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-[#3365e2] focus:ring-3 focus:ring-[#3365e2]/15 transition-all"
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="text-slate-700 text-xs font-bold uppercase tracking-wider">
                  Password
                </label>
                <Link to="/enquiry" className="text-slate-400 hover:text-[#3365e2] text-xs font-medium transition-colors no-underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-11 text-slate-900 text-sm focus:outline-none focus:border-[#3365e2] focus:ring-3 focus:ring-[#3365e2]/15 transition-all"
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative overflow-hidden w-full py-3.5 px-6 rounded-full bg-[#3365e2] text-white text-xs font-bold uppercase tracking-wider mt-2 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all duration-300"
              aria-busy={loading}
            >
              <span
                aria-hidden="true"
                className="absolute rounded-full pointer-events-none transition-transform duration-500 ease-out group-hover:scale-100 scale-0 w-[350%] aspect-square bg-[#2552ca]"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  transitionTimingFunction: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)',
                }}
              />
              <span className="relative z-10 flex items-center gap-2">
                {loading
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-label="Signing in..." />
                  : <><span>Sign In to Account</span><ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" /></>
                }
              </span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-xs">
              Not an enrolled member yet?{' '}
              <Link to="/enquiry" className="text-[#3365e2] font-bold hover:underline no-underline">
                Enquire for membership →
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
