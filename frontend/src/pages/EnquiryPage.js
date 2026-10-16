import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Phone, MapPin, Clock } from 'lucide-react';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { useSettings, waNumber } from '../context/SettingsContext';
import PillButton from '../components/ui/PillButton';

const INTERESTS = ['membership', 'personal-training', 'diet-plan', 'supplements', 'general'];

export default function EnquiryPage() {
  const site = useSettings();
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '', interest: 'general' });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) { toast.error('Please fill required fields'); return; }
    setLoading(true);
    try {
      await API.post('/enquiries', form);
      toast.success('Enquiry submitted! We\'ll contact you soon.');
      setForm({ name: '', phone: '', email: '', message: '', interest: 'general' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit. Try WhatsApp instead.'); }
    finally { setLoading(false); }
  };

  const whatsappPhone = waNumber(site.whatsapp || site.phone);
  const whatsappMessage = `Hi ${site.gymName || 'FitNation'}! My name is ${form.name || '[Your Name]'}. I'm interested in ${form.interest.replace('-', ' ')}. ${form.message}`;

  return (
    <div className="min-h-screen bg-white text-oris-secondary relative font-sans selection:bg-[#3365e2] selection:text-white">
      {/* ── Landing Page White & Blue Hero Header ── */}
      <div className="relative overflow-hidden pt-28 sm:pt-36 pb-16 sm:pb-20 bg-[linear-gradient(to_bottom,#ffffff_0%,#eff6ff_20%,#bfdbfe_45%,#60a5fa_70%,#3365e2_100%)] text-slate-900 border-b border-[#3365e2]/20">
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#15324d_1.2px,transparent_1.2px)] [background-size:24px_24px]" />
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#3365e2]/30 text-[#3365e2] text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <MessageCircle size={13} /> Direct Communication
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 mb-4 tracking-tight uppercase">
            CONNECT WITH <span className="text-[#3365e2]">COACH AJEET</span>
          </h1>
          <p className="text-slate-700 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-medium">
            Ready to commit to your training? Send an enquiry or message Head Coach Ajeet directly on WhatsApp.
          </p>
        </div>
      </div>

      <div className="bg-[#f8fafc] text-slate-800 min-h-[60vh]">
        <div className="max-w-6xl mx-auto px-6 py-14 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Form — 7 cols */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-7">
            <div className="rounded-[22px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="gym-font text-2xl text-slate-900 mb-6 uppercase tracking-tight">SEND AN ENQUIRY</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block mb-1">Full Name *</label>
                  <input className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#3365e2]/30 focus:border-[#3365e2] transition-colors" name="name" value={form.name} onChange={handleChange} placeholder="Your name" required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block mb-1">Phone Number *</label>
                    <input className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#3365e2]/30 focus:border-[#3365e2] transition-colors" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" required />
                  </div>
                  <div>
                    <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block mb-1">Email Address</label>
                    <input className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#3365e2]/30 focus:border-[#3365e2] transition-colors" name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" />
                  </div>
                </div>
                <div>
                  <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block mb-1">Program of Interest</label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#3365e2]/30 focus:border-[#3365e2] transition-colors" name="interest" value={form.interest} onChange={handleChange}>
                    {INTERESTS.map(i => <option key={i} value={i}>{i.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block mb-1">Your Message / Fitness Goals *</label>
                  <textarea className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#3365e2]/30 focus:border-[#3365e2] transition-colors min-h-[110px] resize-y" name="message" value={form.message} onChange={handleChange} placeholder="Tell us your current fitness level, goals, or preferred training time..." required />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <PillButton
                    type="submit"
                    disabled={loading}
                    btnText={loading ? 'Submitting...' : 'Submit Enquiry'}
                    size="md"
                    className="flex-1 justify-center py-3.5 shadow-sm"
                  />
                  <a
                    href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`}
                    target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd5a] text-white px-5 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
                  >
                    <MessageCircle size={16} /> WhatsApp Directly
                  </a>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Info — 5 cols */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-5 space-y-4">
            <h2 className="gym-font text-2xl text-slate-900 mb-6 uppercase tracking-tight">VISIT OUR GYM</h2>

            <div className="rounded-[22px] border border-slate-200/90 bg-white p-5 flex items-start gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#3365e2]/10 border border-[#3365e2]/20 flex items-center justify-center text-[#3365e2] flex-shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <h3 className="text-slate-900 font-extrabold text-sm mb-1">Gym Location</h3>
                <p className="text-slate-600 text-xs sm:text-sm whitespace-pre-line leading-relaxed">{site.address || `${site.gymName || 'FitNation'}, Main Training Center`}</p>
              </div>
            </div>

            <div className="rounded-[22px] border border-slate-200/90 bg-white p-5 flex items-start gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#3365e2]/10 border border-[#3365e2]/20 flex items-center justify-center text-[#3365e2] flex-shrink-0">
                <Phone size={18} />
              </div>
              <div>
                <h3 className="text-slate-900 font-extrabold text-sm mb-1">Direct Calling</h3>
                <a href={site.telHref} className="text-[#3365e2] font-bold text-sm hover:underline">{site.phone}</a>
                <p className="text-slate-500 text-xs mt-0.5">Mon–Sat: 5:00 AM – 10:00 PM</p>
              </div>
            </div>

            <div className="rounded-[22px] border border-slate-200/90 bg-white p-5 flex items-start gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#3365e2]/10 border border-[#3365e2]/20 flex items-center justify-center text-[#3365e2] flex-shrink-0">
                <Clock size={18} />
              </div>
              <div>
                <h3 className="text-slate-900 font-extrabold text-sm mb-1">Session Hours</h3>
                <div className="space-y-1 text-xs text-slate-600 mt-1">
                  <div>Morning: 5:00 AM – 11:00 AM</div>
                  <div>Evening: 4:00 PM – 10:00 PM</div>
                  <div className="text-rose-500 font-semibold pt-1">Sunday: Closed for Recovery</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  </div>
);
}
