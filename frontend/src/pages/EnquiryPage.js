import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, Phone, MapPin, Clock } from 'lucide-react';
import API from '../utils/api';
import toast from 'react-hot-toast';

const ADMIN_WHATSAPP = '919999999999';

const INTERESTS = ['membership', 'personal-training', 'diet-plan', 'supplements', 'general'];

export default function EnquiryPage() {
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
    } catch { toast.error('Failed to submit. Try WhatsApp instead.'); }
    finally { setLoading(false); }
  };

  const whatsappMessage = `Hi FitnessByAjeet! My name is ${form.name || '[Your Name]'}. I'm interested in ${form.interest.replace('-', ' ')}. ${form.message}`;

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20">
      <div className="relative bg-gradient-to-br from-red-900/20 to-transparent border-b border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <MessageCircle size={40} className="text-green-400 mx-auto mb-4" />
          <h1 className="gym-font text-6xl text-white mb-3">GET IN <span className="gradient-text">TOUCH</span></h1>
          <p className="text-gray-400 text-lg">Ready to transform? Let's talk!</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-white font-bold text-2xl mb-6">Send an Enquiry</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm block mb-1">Name *</label>
                <input className="input-dark" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm block mb-1">Phone *</label>
                  <input className="input-dark" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-1">Email</label>
                  <input className="input-dark" name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" />
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">I'm interested in</label>
                <select className="input-dark" name="interest" value={form.interest} onChange={handleChange}>
                  {INTERESTS.map(i => <option key={i} value={i}>{i.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Message *</label>
                <textarea className="input-dark min-h-[120px] resize-y" name="message" value={form.message} onChange={handleChange} placeholder="Tell us more about your goals..." />
              </div>
              <div className="flex gap-4">
                <button type="submit" disabled={loading} className="btn-fire flex items-center gap-2 flex-1 justify-center py-3">
                  {loading ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" /> : <><Send size={17} /> Submit Enquiry</>}
                </button>
                <a
                  href={`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(whatsappMessage)}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-5 py-3 rounded-lg font-semibold transition-all"
                >
                  <MessageCircle size={18} /> WhatsApp
                </a>
              </div>
            </form>
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-white font-bold text-2xl mb-6">Visit Us</h2>
            <div className="glass rounded-xl p-5 flex items-start gap-4">
              <MapPin className="text-orange-500 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="text-white font-semibold mb-1">Address</h3>
                <p className="text-gray-400 text-sm">123 Fitness Street, Ajeet Nagar,<br />Your City - 400001</p>
              </div>
            </div>
            <div className="glass rounded-xl p-5 flex items-start gap-4">
              <Phone className="text-orange-500 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="text-white font-semibold mb-1">Phone / WhatsApp</h3>
                <a href={`https://wa.me/${ADMIN_WHATSAPP}`} className="text-green-400 hover:underline text-sm">+91 99999 99999</a>
              </div>
            </div>
            <div className="glass rounded-xl p-5 flex items-start gap-4">
              <Clock className="text-orange-500 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="text-white font-semibold mb-1">Gym Hours</h3>
                <p className="text-gray-400 text-sm">Mon – Sat: 5:00 AM – 10:00 PM<br />Sunday: 6:00 AM – 8:00 PM</p>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <div className="glass rounded-xl p-6 bg-green-500/5 border-green-500/20">
              <h3 className="text-white font-bold text-lg mb-2">Quick Connect</h3>
              <p className="text-gray-400 text-sm mb-4">Get instant response on WhatsApp! Tap below to start a conversation directly with us.</p>
              <a
                href={`https://wa.me/${ADMIN_WHATSAPP}?text=Hi%20FitnessByAjeet!%20I%20want%20to%20know%20more%20about%20your%20gym.`}
                target="_blank" rel="noreferrer"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-semibold transition-all w-full justify-center"
              >
                <MessageCircle size={20} /> Start WhatsApp Chat
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
