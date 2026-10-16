import React, { useState } from 'react';
import { ChevronDown, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../utils/api';

export default function FreeTrialForm({
  bgImage = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1600&auto=format&fit=crop',
  headline = 'Take the first step toward elite athletic fitness',
  subheading = 'Leave your details and Coach Ajeet Kag or our training coordinator will call you back within 15 minutes. Your first trial assessment and movement screen are 100% free.',
}) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    topic: 'Strength & Hypertrophy',
    message: '',
    agreeTerms: false,
  });

  const [countryCode, setCountryCode] = useState('+91');
  const [showCodeMenu, setShowCodeMenu] = useState(false);
  const [showTopicMenu, setShowTopicMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  const topics = [
    'Strength & Hypertrophy',
    'Fat Loss & Conditioning',
    'Athletic Performance & Speed',
    'Personal Coaching with Ajeet Kag',
    'Movement Screen & Joint Rehab',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error('Please enter your name and phone number.');
      return;
    }
    if (!form.agreeTerms) {
      toast.error('Please agree to terms to proceed.');
      return;
    }

    setLoading(true);
    try {
      const fullPhone = form.phone.trim().startsWith('+') ? form.phone.trim() : `${countryCode} ${form.phone.trim()}`;
      await API.post('/enquiries', {
        name: form.name.trim(),
        phone: fullPhone,
        email: form.email.trim() || undefined,
        interest: 'membership',
        message: `Free Trial Pass Request: ${form.topic}. ${form.message ? `Notes: ${form.message}` : ''}`.trim(),
      });
      toast.success('Your free pass request was received! We will call within 15 minutes.');
      setForm({
        name: '',
        email: '',
        phone: '',
        topic: 'Strength & Hypertrophy',
        message: '',
        agreeTerms: false,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit request. Please call +91 96309 06906.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="oris-form" className="w-full bg-white pt-[6vw] max-[1025px]:pt-12 text-slate-800">
      <div className="relative w-full rounded-t-[2.2vw] max-[1025px]:rounded-t-3xl overflow-hidden min-h-[80vh] max-[1025px]:min-h-0 flex items-start justify-between oris-paddx py-[5.6vw] max-[1025px]:p-8 max-md:p-6 max-[1025px]:py-20 max-[1025px]:flex-col max-[1025px]:gap-10">
        {/* Full Cover Facility Photo */}
        <img
          src={bgImage}
          alt="FitNation Facility Floor"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0 brightness-[0.35]"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-transparent z-1" />

        {/* Left Column: Heading & Guarantee */}
        <div className="relative z-10 text-white flex pt-[1vw] max-[1025px]:pt-0 flex-col justify-center max-[1025px]:max-w-full">
          <h2 className="max-[1025px]:text-[6vw] max-md:text-[7.5vw] text-[4.2vw] max-w-[34vw] max-[1025px]:max-w-full font-normal leading-tight tracking-tight">
            {headline}
          </h2>
          <p className="oris-text22 max-w-[36vw] max-[1025px]:max-w-xl mt-[2vw] max-[1025px]:mt-4 text-white/85 leading-relaxed">
            {subheading}
          </p>

          <div className="mt-8 flex items-center gap-3 text-sm text-emerald-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span>Guaranteed 15-Minute Response Time</span>
          </div>
        </div>

        {/* Right Column: Form Card (Screenshot 11) */}
        <div className="relative z-10 bg-white rounded-[32px] p-8 lg:p-10 w-full max-w-[520px] shadow-2xl border border-slate-100">
          <h3 className="text-2xl sm:text-3xl font-medium text-oris-secondary mb-6 tracking-tight">
            Get in touch
          </h3>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
            {/* Floating Label: Name */}
            <div className="relative w-full">
              <label
                htmlFor="oris-name"
                className={`absolute left-3 transition-all duration-200 pointer-events-none px-1 bg-white text-xs ${
                  form.name
                    ? 'top-[-0.3vw] text-slate-500 font-semibold'
                    : 'top-1/2 -translate-y-1/2 text-sm text-slate-400'
                }`}
              >
                Full Name*
              </label>
              <input
                id="oris-name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-lg bg-white h-12 pl-4 pr-4 text-sm text-slate-800 outline-none transition-all border-slate-200 focus:border-[#3365e2]"
              />
            </div>

            {/* Floating Label: Email */}
            <div className="relative w-full">
              <label
                htmlFor="oris-email"
                className={`absolute left-3 transition-all duration-200 pointer-events-none px-1 bg-white text-xs ${
                  form.email
                    ? 'top-[-0.3vw] text-slate-500 font-semibold'
                    : 'top-1/2 -translate-y-1/2 text-sm text-slate-400'
                }`}
              >
                Email Address
              </label>
              <input
                id="oris-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border rounded-lg bg-white h-12 pl-4 pr-4 text-sm text-slate-800 outline-none transition-all border-slate-200 focus:border-[#3365e2]"
              />
            </div>

            {/* Phone with Country Code Selector */}
            <div className="flex items-center w-full border rounded-lg bg-white h-12 transition-all relative border-slate-200 focus-within:border-[#3365e2]">
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCodeMenu(!showCodeMenu)}
                  className="flex items-center gap-1.5 px-3 h-12 text-sm text-slate-700 bg-transparent cursor-pointer"
                >
                  <span className="text-sm">{countryCode === '+91' ? '🇮🇳' : '🇺🇸'}</span>
                  <span className="text-xs font-semibold text-slate-700">{countryCode}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showCodeMenu && (
                  <div className="absolute top-full left-0 mt-1 w-24 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-30">
                    <button
                      type="button"
                      onClick={() => {
                        setCountryCode('+91');
                        setShowCodeMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center gap-1.5"
                    >
                      <span>🇮🇳</span> <span>+91</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCountryCode('+1');
                        setShowCodeMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center gap-1.5"
                    >
                      <span>🇺🇸</span> <span>+1</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="w-[1px] h-6 bg-slate-200 shrink-0" />

              <div className="relative flex-1 h-full flex items-center">
                <label
                  htmlFor="oris-phone"
                  className={`absolute left-3 transition-all duration-200 pointer-events-none px-1 bg-white text-xs ${
                    form.phone
                      ? 'top-[-0.3vw] text-slate-500 font-semibold'
                      : 'top-1/2 -translate-y-1/2 text-sm text-slate-400'
                  }`}
                >
                  Phone Number*
                </label>
                <input
                  id="oris-phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full h-full px-3 text-sm text-slate-800 outline-none bg-transparent rounded-r-lg"
                />
              </div>
            </div>

            {/* Topic Dropdown */}
            <div className="relative w-full">
              <span className="absolute left-3 top-[-0.3vw] text-xs font-semibold text-slate-500 px-1 bg-white z-10 pointer-events-none">
                Primary Goal / Discipline*
              </span>
              <button
                type="button"
                onClick={() => setShowTopicMenu(!showTopicMenu)}
                className="w-full border rounded-lg bg-white h-12 pl-4 pr-10 text-left text-sm text-slate-800 outline-none border-slate-200 flex items-center justify-between cursor-pointer"
              >
                <span>{form.topic}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {showTopicMenu && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-30">
                  {topics.map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setForm({ ...form, topic: t });
                        setShowTopicMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 text-slate-700 font-medium"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Checkbox */}
            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                role="checkbox"
                aria-checked={form.agreeTerms}
                onClick={() => setForm({ ...form, agreeTerms: !form.agreeTerms })}
                className={`w-4 h-4 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${
                  form.agreeTerms
                    ? 'bg-[#3365e2] border-[#3365e2] text-white'
                    : 'bg-white border-slate-300'
                }`}
              >
                {form.agreeTerms && <Check size={10} strokeWidth={3} />}
              </button>
              <span
                onClick={() => setForm({ ...form, agreeTerms: !form.agreeTerms })}
                className="text-xs text-slate-600 select-none cursor-pointer"
              >
                I agree to the facility rules and consent to WhatsApp/call contact.
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#3365e2] hover:bg-[#2853be] text-white text-sm font-semibold px-8 py-3.5 rounded-full transition-all duration-300 cursor-pointer hover:scale-[0.98] active:scale-95 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Booking Your Pass...</span>
                  </>
                ) : (
                  <span>Claim 3-Day Free Pass</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export { FreeTrialForm as OrisTrialForm };
