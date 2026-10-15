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
      <circle cx="50" cy="50" r="44" stroke="var(--primary, #16a34a)" strokeWidth="5" fill="none"/>
      <rect x="4"  y="46" width="18" height="8" rx="2" fill="var(--primary, #16a34a)"/>
      <rect x="2"  y="42" width="6"  height="16" rx="2" fill="var(--primary, #16a34a)"/>
      <rect x="78" y="46" width="18" height="8" rx="2" fill="var(--primary, #16a34a)"/>
      <rect x="92" y="42" width="6"  height="16" rx="2" fill="var(--primary, #16a34a)"/>
      <polygon points="50,18 28,75 72,75" fill="var(--primary, #16a34a)"/>
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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex overflow-hidden transition-colors duration-200">
      {/* Left — full gym photo */}
      <div className="hidden lg:block relative flex-1">
        <img
          src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&q=80"
          alt="FitNation Training Floor"
          className="w-full h-full object-cover filter brightness-[0.5]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[var(--bg)]" />
        {/* Quote overlay */}
        <div className="absolute bottom-16 left-12 right-12 text-white">
          <p className="gym-font text-5xl leading-tight">
            DISCIPLINE TODAY.<br/>STRENGTH TOMORROW.
          </p>
          <p className="text-slate-300 mt-3 text-xs uppercase tracking-[0.2em] font-bold">— FITNATION BY AJEET</p>
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-3 mb-8 group" aria-label="FitNation by Ajeet Home">
            <Logo size={38} />
            <div>
              <div className="gym-font text-2xl text-[var(--text-primary)] tracking-widest group-hover:text-[var(--primary)] transition-colors">FITNATION</div>
              <div className="text-[10px] tracking-[3px] font-bold text-[var(--primary)]">BY AJEET</div>
            </div>
          </Link>

          <h1 className="gym-font text-3xl sm:text-4xl text-[var(--text-primary)] mb-1">MEMBER PORTAL SIGN IN</h1>
          <p className="text-[var(--text-secondary)] text-xs sm:text-sm mb-8">Enter your credentials to access your workouts, diets, and attendance.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-wider block mb-2">Email Address</label>
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
                <label htmlFor="login-password" className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-wider">Password</label>
                <Link to="/enquiry" className="text-[var(--text-muted)] hover:text-[var(--primary)] text-xs transition-colors">Forgot password?</Link>
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-fire w-full py-3.5 text-xs font-bold uppercase tracking-wider rounded-md mt-2 flex items-center justify-center gap-2"
              aria-busy={loading}
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-label="Signing in..." />
                : <><span>Sign In to Account</span><ArrowRight size={15}/></>
              }
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[var(--border)] text-center">
            <p className="text-[var(--text-muted)] text-xs">
              Not an enrolled member yet?{' '}
              <Link to="/enquiry" className="text-[var(--primary)] font-bold hover:underline">Enquire for membership →</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
