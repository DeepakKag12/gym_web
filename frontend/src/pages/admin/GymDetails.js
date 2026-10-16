import React, { useEffect, useRef, useState } from 'react';
import {
  Save, Phone, MessageCircle, AtSign, Mail, MapPin, Clock, Building2,
  Upload, Image as ImageIcon, Sparkles, Compass, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

import API, { cachedGet, bustCache, apiError } from '../../utils/api';
import { useSettings } from '../../context/SettingsContext';
import AdminLayout from './AdminLayout';
import { Card, Button, Field, Input, Textarea, Skeleton, FadeIn } from '../../components/ui';

/**
 * GymDetails & Landing Page Visual Studio
 *
 * Provides a unified, transparent management interface for:
 * 1. Gym contact, location, UPI billing, and operating hours.
 * 2. Landing page photo uploads with unambiguous destination mapping,
 *    aspect ratio recommendations, and live contextual mockups.
 * 3. Landing page headline, quote, and badge copy customization.
 * 4. Interactive Website Blueprint explaining how every field connects to the public site.
 */
export default function GymDetails() {
  const { refreshSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('photos'); // 'photos' | 'info' | 'copy' | 'blueprint'

  const [form, setForm] = useState(null);
  const [landing, setLanding] = useState(null);
  const [landingForm, setLandingForm] = useState({
    heroBadge: '',
    heroHeadline: '',
    heroSubtext: '',
    heroCount: '',
    heroCountLabel: '',
    aboutStatement: '',
    parallaxQuote: '',
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState(null);
  const [loadError, setLoadError] = useState(null);

  // File upload refs
  const workoutFileRef = useRef(null);
  const joinFileRef = useRef(null);
  const parallaxFileRef = useRef(null);
  const ctaFileRef = useRef(null);
  const sig1FileRef = useRef(null);
  const sig2FileRef = useRef(null);
  const sig3FileRef = useRef(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      cachedGet('/settings', { cache: 0 }),
      cachedGet('/landing', { cache: 0 }).catch(() => ({ data: null })),
    ])
      .then(([settingsRes, landingRes]) => {
        if (!alive) return;
        const s = settingsRes.data;
        setForm({
          ...s,
          hours: (s.hours || []).join('\n'),
          parallaxImage: s.parallaxImage || landingRes.data?.parallax?.image || '',
        });

        if (landingRes?.data) {
          const l = landingRes.data;
          setLanding(l);
          setLandingForm({
            heroBadge: l.hero?.badge || 'Rajgarh (Dhar) · FITNATION BY AJEET',
            heroHeadline: l.hero?.headline || 'Forge your ultimate physique with elite coaching',
            heroSubtext: l.hero?.subtext || 'We engineer periodized athletic training that builds unbreakable strength, high-output conditioning, and lifelong physical resilience.',
            heroCount: l.hero?.socialProofCount || '500+',
            heroCountLabel: l.hero?.socialProofText || 'Satisfied athletes',
            aboutStatement: l.about?.statement || 'At FITNATION BY AJEET, our 4000 sq ft facility in Rajgarh (Dhar) is dedicated to authentic strength coaching, progressive overload, and an uncompromising standard of fitness for every member.',
            parallaxQuote: l.parallax?.quote || 'At FitNation by Ajeet, our training environment is calibrated for athletic excellence: from Olympic barbells and custom power cages to metabolic conditioning rigs and contrast therapy, every square foot is calibrated for your peak output.',
          });
        }
      })
      .catch((err) => {
        if (!alive) return;
        setLoadError(apiError(err, 'Could not load gym and landing details.'));
      });

    return () => {
      alive = false;
    };
  }, []);

  const set = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const setCopy = (field, value) => {
    setLandingForm((f) => ({ ...f, [field]: value }));
  };

  const bind = (name) => ({
    value: form?.[name] ?? '',
    onChange: (e) => set(name, e.target.value),
  });

  const handleFileUpload = async (fieldName, file, sigIndex = null) => {
    if (!file) return;
    setUploadingField(fieldName);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const { data } = await API.post('/settings/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data?.url) {
        if (sigIndex !== null) {
          // Update nested signature program card in landing config
          setLanding((prev) => {
            if (!prev) return prev;
            const progs = Array.isArray(prev.featuredPrograms)
              ? [...prev.featuredPrograms]
              : [
                  { title: "Strength Mastery & Heavy Compound Lifts", tags: ['Chest', 'Back', 'Progressive Overload'], description: "Master the deadlift, squat, and bench press through micro-periodization and mechanical optimization.", image: '', bgColor: '#13314a' },
                  { title: "High-Velocity HIIT & Metabolic Conditioning", tags: ['Shoulders', 'Arms', 'Continuous Burn'], description: "High-intensity athletic conditioning structured in tactical work-to-rest ratios.", image: '', bgColor: '#3365e2' },
                  { title: "Athletic Mobility & Olympic Weightlifting", tags: ['Clean & Jerk', 'Thoracic Extension', 'Tendon Longevity'], description: "Dynamic power generation through Olympic barbell pulling patterns.", image: '', bgColor: '#13314a' },
                ];
            if (progs[sigIndex]) {
              progs[sigIndex] = { ...progs[sigIndex], image: data.url };
            }
            return { ...prev, featuredPrograms: progs };
          });
          toast.success('Signature program photo uploaded! Click "Save changes" to make it live.');
        } else {
          set(fieldName, data.url);
          toast.success('Photo uploaded successfully! Click "Save changes" to make it live.');
        }
      }
    } catch (err) {
      toast.error(apiError(err, 'Could not upload image. You can also paste an image URL directly.'));
    } finally {
      setUploadingField(null);
    }
  };

  const updateSignatureProgramImage = (sigIndex, url) => {
    setLanding((prev) => {
      if (!prev) return prev;
      const progs = Array.isArray(prev.featuredPrograms)
        ? [...prev.featuredPrograms]
        : [
            { title: "Strength Mastery & Heavy Compound Lifts", tags: ['Chest', 'Back', 'Progressive Overload'], description: "Master the deadlift, squat, and bench press through micro-periodization and mechanical optimization.", image: '', bgColor: '#13314a' },
            { title: "High-Velocity HIIT & Metabolic Conditioning", tags: ['Shoulders', 'Arms', 'Continuous Burn'], description: "High-intensity athletic conditioning structured in tactical work-to-rest ratios.", image: '', bgColor: '#3365e2' },
            { title: "Athletic Mobility & Olympic Weightlifting", tags: ['Clean & Jerk', 'Thoracic Extension', 'Tendon Longevity'], description: "Dynamic power generation through Olympic barbell pulling patterns.", image: '', bgColor: '#13314a' },
          ];
      if (progs[sigIndex]) {
        progs[sigIndex] = { ...progs[sigIndex], image: url };
      }
      return { ...prev, featuredPrograms: progs };
    });
  };

  const validate = () => {
    const e = {};
    if (!form.gymName?.trim()) e.gymName = 'The gym needs a name.';
    if (!form.phone?.trim()) e.phone = 'A contact number is required.';
    else if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) e.phone = 'Enter a 10-digit mobile number.';
    if (form.whatsapp && !/^\d{10}$/.test(form.whatsapp.replace(/\D/g, ''))) {
      e.whatsapp = 'Enter a 10-digit number, or leave it empty to use the phone number.';
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      e.email = 'That email does not look right.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      // 1. Save general settings
      const settingsPayload = {
        ...form,
        instagram: String(form.instagram || '').replace(/^@/, ''),
        hours: form.hours,
      };
      await API.put('/settings', settingsPayload);

      // 2. Save landing page configuration
      if (landing) {
        const landingPayload = {
          hero: {
            ...landing.hero,
            badge: landingForm.heroBadge,
            headline: landingForm.heroHeadline,
            subtext: landingForm.heroSubtext,
            socialProofCount: landingForm.heroCount,
            socialProofText: landingForm.heroCountLabel,
          },
          about: {
            ...landing.about,
            statement: landingForm.aboutStatement,
          },
          parallax: {
            ...landing.parallax,
            quote: landingForm.parallaxQuote,
            image: form.parallaxImage || landing.parallax?.image,
          },
          featuredPrograms: landing.featuredPrograms,
        };
        await API.put('/landing', landingPayload);
      }

      bustCache('/settings');
      bustCache('/landing');
      refreshSettings();
      toast.success('Gym profile & landing page content updated successfully!');
    } catch (err) {
      toast.error(apiError(err, 'Could not save changes.'));
    } finally {
      setSaving(false);
    }
  };

  // Extract signature programs for display
  const sigCards = landing?.featuredPrograms || [
    { title: "Strength Mastery & Heavy Compound Lifts", tags: ['Chest', 'Back', 'Progressive Overload'], description: "Master the deadlift, squat, and bench press through micro-periodization and mechanical optimization.", image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop', bgColor: '#13314a' },
    { title: "High-Velocity HIIT & Metabolic Conditioning", tags: ['Shoulders', 'Arms', 'Continuous Burn'], description: "High-intensity athletic conditioning structured in tactical work-to-rest ratios.", image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop', bgColor: '#3365e2' },
    { title: "Athletic Mobility & Olympic Weightlifting", tags: ['Clean & Jerk', 'Thoracic Extension', 'Tendon Longevity'], description: "Dynamic power generation through Olympic barbell pulling patterns.", image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1200&auto=format&fit=crop', bgColor: '#13314a' },
  ];

  return (
    <AdminLayout
      title="Gym Profile & Landing Page Studio"
      subtitle="Edit your gym identity, contact lines, landing page photos, and public headlines"
      actions={
        form && (
          <Button variant="primary" icon={Save} loading={saving} onClick={save}>
            Save all changes
          </Button>
        )
      }
    >
      {loadError ? (
        <Card>
          <p className="text-[14px]" style={{ color: 'var(--p-danger)' }}>
            {loadError}
          </p>
        </Card>
      ) : !form ? (
        <div className="space-y-3 max-w-3xl">
          <Skeleton h={140} />
          <Skeleton h={260} />
        </div>
      ) : (
        <FadeIn>
          {/* Top Operational Navigation Tabs */}
          <div className="flex items-center gap-2 border-b pb-3 mb-6 overflow-x-auto max-w-4xl" style={{ borderColor: 'var(--p-border)' }}>
            <button
              type="button"
              onClick={() => setActiveTab('photos')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'photos'
                  ? 'bg-[#3365e2] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
              }`}
            >
              <ImageIcon size={16} />
              <span>Landing Photos &amp; Destinations</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20">7 Photos</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'info'
                  ? 'bg-[#3365e2] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
              }`}
            >
              <Building2 size={16} />
              <span>Gym Contacts &amp; Hours</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('copy')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'copy'
                  ? 'bg-[#3365e2] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
              }`}
            >
              <Sparkles size={16} />
              <span>Headlines &amp; Quotes</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('blueprint')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'blueprint'
                  ? 'bg-[#3365e2] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
              }`}
            >
              <Compass size={16} />
              <span>Website Blueprint Map</span>
            </button>
          </div>

          <div className="space-y-6 max-w-4xl">
            {/* ══════════════════════════════════════════════════════════════════════
                TAB 1: PHOTO UPLOADS & DESTINATIONS
               ══════════════════════════════════════════════════════════════════════ */}
            {activeTab === 'photos' && (
              <div className="space-y-6">
                {/* Information Header Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-[#3365e2]/5 to-transparent border border-[#3365e2]/25">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-[#3365e2] text-white shrink-0 mt-0.5">
                      <Layers size={18} />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        Photo Destination &amp; Transparency System
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        Every photograph you upload here is mapped to a specific visible section on your public landing page.
                        Use the <strong>Live Mockup Previews</strong> below to see how each image looks with its exact headline overlay before saving.
                      </p>
                    </div>
                  </div>
                </div>

                {/* ── Photo 1: Hero Left Card (Explore Workouts) ── */}
                <Card>
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3" style={{ borderColor: 'var(--p-border)' }}>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#3365e2] text-white">
                            📍 Destination: Hero Section · Left Action Card
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                            Aspect Ratio: 4:3 Card (Rec: 1200 x 900px)
                          </span>
                        </div>
                        <h3 className="text-base font-bold mt-1 text-slate-900 dark:text-white">
                          Workouts Feature Card (Hero Left)
                        </h3>
                      </div>
                      <span className="text-xs text-slate-500">Live on: Home Page Top</span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      This photo is displayed at the top of the homepage on the primary athletic action card welcoming athletes to explore workouts.
                    </p>

                    <Field label="Image File or URL" hint="Upload from device or paste direct image link">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          value={form.heroWorkoutImage || ''}
                          onChange={(e) => set('heroWorkoutImage', e.target.value)}
                          placeholder="https://images.unsplash.com/... or upload photo"
                        />
                        <input
                          type="file"
                          ref={workoutFileRef}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleFileUpload('heroWorkoutImage', e.target.files[0]);
                          }}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          icon={Upload}
                          loading={uploadingField === 'heroWorkoutImage'}
                          onClick={() => workoutFileRef.current?.click()}
                          className="shrink-0"
                        >
                          Upload Photo
                        </Button>
                      </div>
                    </Field>

                    {/* Contextual Live Mockup Preview */}
                    <div className="pt-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                        Live Preview as Seen by Visitors:
                      </span>
                      <div className="relative rounded-2xl overflow-hidden h-40 sm:h-44 border border-black/10 dark:border-white/10 max-w-lg shadow-md group">
                        <img
                          src={form.heroWorkoutImage || 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1200&auto=format&fit=crop'}
                          alt="Hero Workouts Mockup"
                          className="w-full h-full object-cover brightness-[0.75] group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-4 text-white">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                            Explore Programs
                          </span>
                          <span className="text-base sm:text-lg font-bold leading-tight mt-0.5">
                            Periodized Workout Architecture
                          </span>
                          <span className="text-xs text-white/80 mt-1">
                            Chest · Back · Heavy Compound Mastery
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* ── Photo 2: Hero Right / Founder Profile ── */}
                <Card>
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3" style={{ borderColor: 'var(--p-border)' }}>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#3365e2] text-white">
                            📍 Destination: Hero Right &amp; /about Head Coach Profile
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                            Aspect Ratio: 3:4 Portrait (Rec: 900 x 1200px)
                          </span>
                        </div>
                        <h3 className="text-base font-bold mt-1 text-slate-900 dark:text-white">
                          Head Coach &amp; Founder Athletic Photo (Ajeet Kag)
                        </h3>
                      </div>
                      <span className="text-xs text-slate-500">Live on: Home Hero &amp; About Page</span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Featured photo for Coach Ajeet Kag. Displayed on the Hero right card and prominently on the /about page as the Founder &amp; Head Strength Coach.
                    </p>

                    <Field label="Image File or URL" hint="Upload portrait photo or paste URL">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          value={form.heroJoinImage || ''}
                          onChange={(e) => set('heroJoinImage', e.target.value)}
                          placeholder="https://images.unsplash.com/... or upload photo"
                        />
                        <input
                          type="file"
                          ref={joinFileRef}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleFileUpload('heroJoinImage', e.target.files[0]);
                          }}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          icon={Upload}
                          loading={uploadingField === 'heroJoinImage'}
                          onClick={() => joinFileRef.current?.click()}
                          className="shrink-0"
                        >
                          Upload Photo
                        </Button>
                      </div>
                    </Field>

                    {/* Contextual Live Mockup Preview */}
                    <div className="pt-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                        Live Preview as Seen by Visitors:
                      </span>
                      <div className="relative rounded-2xl overflow-hidden h-40 sm:h-44 border border-black/10 dark:border-white/10 max-w-lg shadow-md group">
                        <img
                          src={form.heroJoinImage || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop'}
                          alt="Coach Profile Mockup"
                          className="w-full h-full object-cover brightness-[0.75] group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-4 text-white">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                            Founder &amp; Head Coach
                          </span>
                          <span className="text-base sm:text-lg font-bold leading-tight mt-0.5">
                            {form.ownerName || 'Ajeet Kag'}
                          </span>
                          <span className="text-xs text-white/80 mt-1">
                            Certified Strength &amp; Biomechanics Specialist
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* ── Photo 3: Parallax Facility Band ── */}
                <Card>
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3" style={{ borderColor: 'var(--p-border)' }}>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#3365e2] text-white">
                            📍 Destination: Full-Width Parallax Facility Band
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                            Aspect Ratio: 21:9 Ultra-Wide (Rec: 2000 x 850px)
                          </span>
                        </div>
                        <h3 className="text-base font-bold mt-1 text-slate-900 dark:text-white">
                          Gym Floor Interior Photo (Parallax Band)
                        </h3>
                      </div>
                      <span className="text-xs text-slate-500">Live on: Home Page Section 6</span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      This wide photograph creates the full-bleed kinetic scrolling band between Signature Programs and Athlete Transformations. The philosophy quote illuminates word-by-word over this image as the visitor scrolls.
                    </p>

                    <Field label="Image File or URL" hint="Upload wide facility photo or paste URL">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          value={form.parallaxImage || ''}
                          onChange={(e) => set('parallaxImage', e.target.value)}
                          placeholder="https://images.unsplash.com/... or upload photo"
                        />
                        <input
                          type="file"
                          ref={parallaxFileRef}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleFileUpload('parallaxImage', e.target.files[0]);
                          }}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          icon={Upload}
                          loading={uploadingField === 'parallaxImage'}
                          onClick={() => parallaxFileRef.current?.click()}
                          className="shrink-0"
                        >
                          Upload Photo
                        </Button>
                      </div>
                    </Field>

                    {/* Contextual Live Mockup Preview */}
                    <div className="pt-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                        Live Preview as Seen by Visitors:
                      </span>
                      <div className="relative rounded-2xl overflow-hidden h-36 sm:h-40 border border-black/10 dark:border-white/10 w-full shadow-md group">
                        <img
                          src={form.parallaxImage || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2000&auto=format&fit=crop'}
                          alt="Parallax Mockup"
                          className="w-full h-full object-cover brightness-[0.4] group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                          <p className="text-xs sm:text-sm font-semibold text-white drop-shadow-md max-w-xl leading-relaxed">
                            "{landingForm.parallaxQuote || 'At FitNation by Ajeet, our training environment is calibrated for athletic excellence...'}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* ── Photo 4: Bottom Free Pass & WhatsApp Banner ── */}
                <Card>
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3" style={{ borderColor: 'var(--p-border)' }}>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#3365e2] text-white">
                            📍 Destination: Bottom 3-Day Free Pass &amp; WhatsApp Section
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                            Aspect Ratio: 16:9 Landscape (Rec: 1600 x 900px)
                          </span>
                        </div>
                        <h3 className="text-base font-bold mt-1 text-slate-900 dark:text-white">
                          Bottom Free Pass &amp; Transformation Banner
                        </h3>
                      </div>
                      <span className="text-xs text-slate-500">Live on: Home Page Section 10</span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Serves as the cinematic background behind the free trial pass claim form and the 15-minute response guarantee hotline right above the footer curtain.
                    </p>

                    <Field label="Image File or URL" hint="Upload background photo or paste URL">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          value={form.ctaBannerImage || ''}
                          onChange={(e) => set('ctaBannerImage', e.target.value)}
                          placeholder="https://images.unsplash.com/... or upload photo"
                        />
                        <input
                          type="file"
                          ref={ctaFileRef}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleFileUpload('ctaBannerImage', e.target.files[0]);
                          }}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          icon={Upload}
                          loading={uploadingField === 'ctaBannerImage'}
                          onClick={() => ctaFileRef.current?.click()}
                          className="shrink-0"
                        >
                          Upload Photo
                        </Button>
                      </div>
                    </Field>

                    {/* Contextual Live Mockup Preview */}
                    <div className="pt-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                        Live Preview as Seen by Visitors:
                      </span>
                      <div className="relative rounded-2xl overflow-hidden h-36 sm:h-40 border border-black/10 dark:border-white/10 w-full shadow-md group">
                        <img
                          src={form.ctaBannerImage || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1600&auto=format&fit=crop'}
                          alt="CTA Banner Mockup"
                          className="w-full h-full object-cover brightness-[0.4] group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent flex items-center p-6 text-white">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                              Guaranteed 15-Minute Callback
                            </span>
                            <h4 className="text-base sm:text-lg font-bold mt-0.5">
                              Claim Your 3-Day Free Trial Pass
                            </h4>
                            <p className="text-xs text-white/80 max-w-sm mt-0.5">
                              Free movement screen and assessment with Coach Ajeet Kag.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* ── Photos 5, 6, 7: Signature Programs Stacking Deck ── */}
                <Card title="Signature Training Programs (Pinned Stacking Deck)">
                  <div className="space-y-4">
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      These 3 featured programs form the pinned stacking card deck in Section 5 of the homepage. Each card displays an authentic photograph alongside its discipline tags and periodization summary.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      {/* Card 1 */}
                      <div className="p-3.5 rounded-xl border border-black/10 dark:border-white/10 space-y-3 bg-slate-50/50 dark:bg-white/[0.02]">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#13314a] text-white inline-block">
                          Card 1 · Strength Mastery
                        </span>
                        <div className="aspect-[4/3] rounded-lg overflow-hidden relative border border-black/10">
                          <img
                            src={sigCards[0]?.image || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop'}
                            alt="Card 1"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <input
                          type="file"
                          ref={sig1FileRef}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleFileUpload('sig1', e.target.files[0], 0);
                          }}
                        />
                        <div className="flex gap-1.5">
                          <Input
                            size="sm"
                            value={sigCards[0]?.image || ''}
                            onChange={(e) => updateSignatureProgramImage(0, e.target.value)}
                            placeholder="URL..."
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            loading={uploadingField === 'sig1'}
                            onClick={() => sig1FileRef.current?.click()}
                          >
                            <Upload size={14} />
                          </Button>
                        </div>
                      </div>

                      {/* Card 2 */}
                      <div className="p-3.5 rounded-xl border border-black/10 dark:border-white/10 space-y-3 bg-slate-50/50 dark:bg-white/[0.02]">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#3365e2] text-white inline-block">
                          Card 2 · HIIT &amp; Conditioning
                        </span>
                        <div className="aspect-[4/3] rounded-lg overflow-hidden relative border border-black/10">
                          <img
                            src={sigCards[1]?.image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop'}
                            alt="Card 2"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <input
                          type="file"
                          ref={sig2FileRef}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleFileUpload('sig2', e.target.files[0], 1);
                          }}
                        />
                        <div className="flex gap-1.5">
                          <Input
                            size="sm"
                            value={sigCards[1]?.image || ''}
                            onChange={(e) => updateSignatureProgramImage(1, e.target.value)}
                            placeholder="URL..."
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            loading={uploadingField === 'sig2'}
                            onClick={() => sig2FileRef.current?.click()}
                          >
                            <Upload size={14} />
                          </Button>
                        </div>
                      </div>

                      {/* Card 3 */}
                      <div className="p-3.5 rounded-xl border border-black/10 dark:border-white/10 space-y-3 bg-slate-50/50 dark:bg-white/[0.02]">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#13314a] text-white inline-block">
                          Card 3 · Olympic Weightlifting
                        </span>
                        <div className="aspect-[4/3] rounded-lg overflow-hidden relative border border-black/10">
                          <img
                            src={sigCards[2]?.image || 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1200&auto=format&fit=crop'}
                            alt="Card 3"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <input
                          type="file"
                          ref={sig3FileRef}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleFileUpload('sig3', e.target.files[0], 2);
                          }}
                        />
                        <div className="flex gap-1.5">
                          <Input
                            size="sm"
                            value={sigCards[2]?.image || ''}
                            onChange={(e) => updateSignatureProgramImage(2, e.target.value)}
                            placeholder="URL..."
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            loading={uploadingField === 'sig3'}
                            onClick={() => sig3FileRef.current?.click()}
                          >
                            <Upload size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Button block variant="primary" icon={Save} loading={saving} onClick={save}>
                  Save all photo changes
                </Button>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════════
                TAB 2: GYM CONTACT & BASIC INFO
               ══════════════════════════════════════════════════════════════════════ */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                <Card title="The Gym Identity">
                  <div className="space-y-4">
                    <Field label="Gym name" required error={errors.gymName} hint="Shown in the header, footer, WhatsApp messages, and notifications">
                      <Input {...bind('gymName')} placeholder="FitNation by Ajeet" />
                    </Field>
                    <Field label="Owner / Trainer name" hint="Displayed on About page as Founder & Head Coach">
                      <Input {...bind('ownerName')} placeholder="Ajeet Kag" />
                    </Field>
                    <Field label="Tagline" hint="Displayed in the header and footer badge">
                      <Input {...bind('tagline')} placeholder="Uniting a Healthier World" />
                    </Field>
                  </div>
                </Card>

                <Card title="How Members Reach You">
                  <div className="space-y-4">
                    <Field label="Phone number" required error={errors.phone} hint="10-digit mobile number for call button & member enquiries">
                      <Input type="tel" inputMode="numeric" {...bind('phone')} placeholder="9630906906" />
                    </Field>
                    <Field label="WhatsApp number" error={errors.whatsapp} hint="Leave blank to use phone number. Powers wa.me quick chat buttons">
                      <Input type="tel" inputMode="numeric" {...bind('whatsapp')} placeholder="Same as phone" />
                    </Field>
                    <Field label="Instagram handle" hint="Without the @ symbol">
                      <Input {...bind('instagram')} placeholder="fitnation.by.ajeet" />
                    </Field>
                    <Field label="Email" error={errors.email} hint="For enquiries and contact information">
                      <Input type="email" {...bind('email')} placeholder="hello@fitnation.in" />
                    </Field>
                    <Field label="Physical Address" hint="Ground location in Rajgarh (Dhar)">
                      <Input {...bind('address')} placeholder="Fourlane Square, Tridalam Arcade, First Floor, Rajgarh (Dhar), MP" />
                    </Field>
                    <Field label="Gym UPI ID" hint="Used for member fee payments & receipts (e.g. 9630906906@upi or gym@okaxis)">
                      <Input {...bind('upiId')} placeholder="gymname@upi" />
                    </Field>
                  </div>
                </Card>

                <Card title="Opening Hours & Schedule">
                  <Field label="Operating timings (one line per row)" hint="Shown in the footer and mobile info bar">
                    <Textarea
                      rows={4}
                      {...bind('hours')}
                      placeholder={'Morning Session: 5:00 AM – 11:00 AM (Mon–Sat)\nEvening Session: 4:00 PM – 10:00 PM (Mon–Sat)\nSunday: Closed'}
                    />
                  </Field>
                </Card>

                {/* Contact Card Live Preview */}
                <Card title="Contact Card Live Preview">
                  <div className="flex flex-wrap items-center gap-5 text-sm text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                      <Building2 size={16} className="text-[#3365e2]" />
                      {form.gymName || 'FitNation'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone size={15} className="text-[#3365e2]" />
                      {form.phone || '—'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageCircle size={15} className="text-emerald-500" />
                      {form.whatsapp || form.phone || '—'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <AtSign size={15} className="text-[#3365e2]" />
                      @{String(form.instagram || '').replace(/^@/, '') || '—'}
                    </span>
                    {form.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail size={15} className="text-[#3365e2]" />
                        {form.email}
                      </span>
                    )}
                  </div>
                  {form.address && (
                    <div className="flex items-start gap-1.5 text-xs text-slate-500 mt-3 pt-3 border-t" style={{ borderColor: 'var(--p-border)' }}>
                      <MapPin size={14} className="text-[#3365e2] shrink-0 mt-0.5" />
                      <span>{form.address}</span>
                    </div>
                  )}
                  {form.hours?.trim() && (
                    <div className="flex items-start gap-1.5 text-xs text-slate-500 mt-2">
                      <Clock size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        {form.hours.split('\n').filter(Boolean).map((line, i) => (
                          <div key={i}>{line}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>

                <Button block variant="primary" icon={Save} loading={saving} onClick={save}>
                  Save all gym contacts
                </Button>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════════
                TAB 3: LANDING HEADLINES & COPY
               ══════════════════════════════════════════════════════════════════════ */}
            {activeTab === 'copy' && (
              <div className="space-y-6">
                <Card title="Hero Section Copy (Top of Homepage)">
                  <div className="space-y-4">
                    <Field label="Hero Location Badge" hint="Small pill badge displayed above the main heading">
                      <Input
                        value={landingForm.heroBadge}
                        onChange={(e) => setCopy('heroBadge', e.target.value)}
                        placeholder="Rajgarh (Dhar) · FITNATION BY AJEET"
                      />
                    </Field>

                    <Field label="Main Hero Headline (H1)" hint="The bold kinetic statement introducing the gym">
                      <Input
                        value={landingForm.heroHeadline}
                        onChange={(e) => setCopy('heroHeadline', e.target.value)}
                        placeholder="Forge your ultimate physique with elite coaching"
                      />
                    </Field>

                    <Field label="Hero Subtext" hint="Supporting paragraph in the hero header">
                      <Textarea
                        rows={3}
                        value={landingForm.heroSubtext}
                        onChange={(e) => setCopy('heroSubtext', e.target.value)}
                        placeholder="We engineer periodized athletic training that builds unbreakable strength, high-output conditioning, and lifelong physical resilience."
                      />
                    </Field>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Social Proof Number" hint="Displayed in the floating social proof card">
                        <Input
                          value={landingForm.heroCount}
                          onChange={(e) => setCopy('heroCount', e.target.value)}
                          placeholder="500+"
                        />
                      </Field>
                      <Field label="Social Proof Label" hint="Sub-label in the social proof card">
                        <Input
                          value={landingForm.heroCountLabel}
                          onChange={(e) => setCopy('heroCountLabel', e.target.value)}
                          placeholder="Satisfied athletes"
                        />
                      </Field>
                    </div>
                  </div>
                </Card>

                <Card title="Facility Philosophy &amp; Parallax Quotes">
                  <div className="space-y-4">
                    <Field label="About Statement (Section 3)" hint="The verified mission text following the counters">
                      <Textarea
                        rows={3}
                        value={landingForm.aboutStatement}
                        onChange={(e) => setCopy('aboutStatement', e.target.value)}
                        placeholder="At FITNATION BY AJEET, our 4000 sq ft facility in Rajgarh (Dhar) is dedicated to authentic strength coaching, progressive overload, and an uncompromising standard of fitness for every member."
                      />
                    </Field>

                    <Field label="Parallax Kinetic Scrub Quote (Section 6)" hint="The words illuminated as the visitor scrolls through the interior facility band">
                      <Textarea
                        rows={3}
                        value={landingForm.parallaxQuote}
                        onChange={(e) => setCopy('parallaxQuote', e.target.value)}
                        placeholder="At FitNation by Ajeet, our training environment is calibrated for athletic excellence: from Olympic barbells and custom power cages to metabolic conditioning rigs and contrast therapy, every square foot is calibrated for your peak output."
                      />
                    </Field>
                  </div>
                </Card>

                <Button block variant="primary" icon={Save} loading={saving} onClick={save}>
                  Save all text headlines
                </Button>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════════
                TAB 4: WEBSITE BLUEPRINT MAP
               ══════════════════════════════════════════════════════════════════════ */}
            {activeTab === 'blueprint' && (
              <div className="space-y-6">
                <Card title="Interactive Website Blueprint Map">
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    This blueprint illustrates the exact vertical flow of the public website. Each layer highlights the content and images managed in this admin panel.
                  </p>

                  <div className="space-y-3 font-mono text-xs">
                    {/* 1. Header */}
                    <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-[#3365e2] text-white flex items-center justify-center font-bold text-[11px]">
                          01
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          Header &amp; Sliding Navbar
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Mapped to: Gym Name · Phone · WhatsApp
                      </span>
                    </div>

                    {/* 2. Hero */}
                    <div className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-50/50 dark:bg-purple-950/20 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-purple-600 text-white flex items-center justify-center font-bold text-[11px]">
                            02
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            Sticky Hero &amp; 3D Dumbbell Visualizer
                          </span>
                        </div>
                        <span className="text-[11px] text-purple-600 font-bold">2 Photos Active</span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 pl-8 space-y-0.5 font-sans">
                        <div>• <strong>Left Card:</strong> Workouts Feature Photo ("Explore Workouts")</div>
                        <div>• <strong>Right Card:</strong> Head Coach Profile Photo (Ajeet Kag)</div>
                        <div>• <strong>Headlines:</strong> Hero Badge, Main Title, Subtext, Social Proof Count</div>
                      </div>
                    </div>

                    {/* 3. Statement */}
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-slate-700 text-white flex items-center justify-center font-bold text-[11px]">
                          03
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          Philosophy &amp; Mechanical Slot Counters
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        4,000+ sq ft · 8 Programs · 6 Days · 12 Hours
                      </span>
                    </div>

                    {/* 4. Programs Carousel */}
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-slate-700 text-white flex items-center justify-center font-bold text-[11px]">
                          04
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          Periodized Training Carousel
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Built for Lasting Progress
                      </span>
                    </div>

                    {/* 5. Signature Deck */}
                    <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-[#3365e2] text-white flex items-center justify-center font-bold text-[11px]">
                            05
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            Signature Programs Pinned Stacking Deck
                          </span>
                        </div>
                        <span className="text-[11px] text-[#3365e2] font-bold">3 Photos Active</span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 pl-8 space-y-0.5 font-sans">
                        <div>• <strong>Card 1:</strong> Strength Mastery &amp; Heavy Compound Lifts</div>
                        <div>• <strong>Card 2:</strong> High-Velocity HIIT &amp; Metabolic Conditioning</div>
                        <div>• <strong>Card 3:</strong> Athletic Mobility &amp; Olympic Weightlifting</div>
                      </div>
                    </div>

                    {/* 6. Parallax */}
                    <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-amber-600 text-white flex items-center justify-center font-bold text-[11px]">
                            06
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            Cinematic Facility Interior Band (Parallax)
                          </span>
                        </div>
                        <span className="text-[11px] text-amber-600 font-bold">1 Full-Bleed Photo</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 pl-8 font-sans">
                        Illuminates the philosophy quote word-by-word over the interior facility photograph as the user scrolls.
                      </p>
                    </div>

                    {/* 7. Results Matrix */}
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-slate-700 text-white flex items-center justify-center font-bold text-[11px]">
                          07
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          Athlete Transformations (3-Strip Matrix)
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Managed via: /admin/transformations
                      </span>
                    </div>

                    {/* 8. Recovery */}
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-slate-700 text-white flex items-center justify-center font-bold text-[11px]">
                          08
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          Mind-Body Focus &amp; Active Recovery
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Breath Bloom Kinetic Module
                      </span>
                    </div>

                    {/* 9. Coaches Lineup */}
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-slate-700 text-white flex items-center justify-center font-bold text-[11px]">
                          09
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          Coaches &amp; Leadership Lineup
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Managed via: /admin/trainers
                      </span>
                    </div>

                    {/* 10. Pass Form & Curtain Footer */}
                    <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px]">
                            10
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            3-Day Free Trial Pass Form &amp; Curtain Footer
                          </span>
                        </div>
                        <span className="text-[11px] text-emerald-600 font-bold">1 Background Photo</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 pl-8 font-sans">
                        Covered by the Bottom CTA Banner Photo. Submitting sends an instant lead enquiry directly to /admin/enquiries.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </FadeIn>
      )}
    </AdminLayout>
  );
}
