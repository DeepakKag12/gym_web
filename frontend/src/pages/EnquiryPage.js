import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, Phone, MapPin, Clock } from 'lucide-react';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { useSettings, waNumber } from '../context/SettingsContext';

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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] pt-20 transition-colors duration-200">
      <div className="border-b border-[var(--border)] bg-[var(--surface)] py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--primary)] text-xs font-bold uppercase tracking-[0.16em] mb-3">
            <MessageCircle size={13} /> Direct Communication
          </div>
          <h1 className="gym-font text-5xl sm:text-6xl text-[var(--text-primary)] mb-3 tracking-wide">
            GET IN TOUCH
          </h1>
          <p className="text-[var(--text-secondary)] text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Ready to commit to your training? Send an enquiry or message Head Coach Ajeet directly on WhatsApp.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Form — 7 cols */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-7">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
              <h2 className="gym-font text-2xl text-[var(--text-primary)] mb-6">SEND AN ENQUIRY</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-wider block mb-1">Full Name *</label>
                  <input className="input-dark w-full" name="name" value={form.name} onChange={handleChange} placeholder="Your name" required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-wider block mb-1">Phone Number *</label>
                    <input className="input-dark w-full" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" required />
                  </div>
                  <div>
                    <label className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-wider block mb-1">Email Address</label>
                    <input className="input-dark w-full" name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" />
                  </div>
                </div>
                <div>
                  <label className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-wider block mb-1">Program of Interest</label>
                  <select className="input-dark w-full" name="interest" value={form.interest} onChange={handleChange}>
                    {INTERESTS.map(i => <option key={i} value={i}>{i.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-wider block mb-1">Your Message / Fitness Goals *</label>
                  <textarea className="input-dark w-full min-h-[110px] resize-y" name="message" value={form.message} onChange={handleChange} placeholder="Tell us your current fitness level, goals, or preferred training time..." required />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button type="submit" disabled={loading} className="btn-fire flex items-center gap-2 flex-1 justify-center py-3 text-xs font-bold uppercase tracking-wider rounded-md">
                    {loading ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" /> : <><Send size={15} /> Submit Enquiry</>}
                  </button>
                  <a
                    href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`}
                    target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd5a] text-white px-5 py-3 rounded-md text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    <MessageCircle size={16} /> WhatsApp Directly
                  </a>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Info — 5 cols */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-5 space-y-4">
            <h2 className="gym-font text-2xl text-[var(--text-primary)] mb-6">VISIT OUR GYM</h2>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 flex items-start gap-4">
              <div className="w-9 h-9 rounded-md bg-[var(--surface-raised)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] flex-shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <h3 className="text-[var(--text-primary)] font-bold text-sm mb-1">Gym Location</h3>
                <p className="text-[var(--text-secondary)] text-xs sm:text-sm whitespace-pre-line leading-relaxed">{site.address || `${site.gymName || 'FitNation'}, Main Training Center`}</p>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 flex items-start gap-4">
              <div className="w-9 h-9 rounded-md bg-[var(--surface-raised)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] flex-shrink-0">
                <Phone size={18} />
              </div>
              <div>
                <h3 className="text-[var(--text-primary)] font-bold text-sm mb-1">Direct Calling</h3>
                <a href={site.telHref} className="text-[var(--primary)] font-bold text-sm hover:underline">{site.phone}</a>
                <p className="text-[var(--text-muted)] text-xs mt-0.5">Mon–Sat: 5:00 AM – 10:00 PM</p>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 flex items-start gap-4">
              <div className="w-9 h-9 rounded-md bg-[var(--surface-raised)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] flex-shrink-0">
                <Clock size={18} />
              </div>
              <div>
                <h3 className="text-[var(--text-primary)] font-bold text-sm mb-1">Session Hours</h3>
                <div className="space-y-1 text-xs text-[var(--text-secondary)] mt-1">
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
  );
}
