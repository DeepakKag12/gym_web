import React, { useEffect, useRef, useState } from 'react';
import { Save, Phone, MessageCircle, AtSign, Mail, MapPin, Clock, Building2, Upload, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

import API, { cachedGet, bustCache, apiError } from '../../utils/api';
import { useSettings } from '../../context/SettingsContext';
import AdminLayout from './AdminLayout';
import { Card, Button, Field, Input, Textarea, Skeleton, FadeIn } from '../../components/ui';

/**
 * Gym details — the contact information and homepage imagery shown across the public website.
 */
export default function GymDetails() {
  const { refreshSettings } = useSettings();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const workoutFileRef = useRef(null);
  const joinFileRef = useRef(null);
  const ctaFileRef = useRef(null);

  useEffect(() => {
    cachedGet('/settings', { cache: 0 })
      .then(r => setForm({ ...r.data, hours: (r.data.hours || []).join('\n') }))
      .catch(err => setLoadError(apiError(err, 'Could not load the gym details.')));
  }, []);

  const set = (name, value) => {
    setForm(f => ({ ...f, [name]: value }));
    setErrors(e => ({ ...e, [name]: undefined }));
  };
  const bind = name => ({ value: form?.[name] ?? '', onChange: e => set(name, e.target.value) });

  const handleFileUpload = async (fieldName, file) => {
    if (!file) return;
    setUploadingField(fieldName);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const { data } = await API.post('/settings/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data?.url) {
        set(fieldName, data.url);
        toast.success('Photo uploaded successfully! Remember to save changes.');
      }
    } catch (err) {
      toast.error(apiError(err, 'Could not upload image. You can also paste an image URL directly.'));
    } finally {
      setUploadingField(null);
    }
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
      const { data } = await API.put('/settings', {
        ...form,
        instagram: String(form.instagram || '').replace(/^@/, ''),
        hours: form.hours,
      });
      // The public read is cached client-side too, so the site would otherwise
      // keep showing the old number for up to five minutes.
      bustCache('/settings');
      refreshSettings();
      toast.success(data.message || 'Gym details updated.');
    } catch (err) {
      toast.error(apiError(err, 'Could not save the gym details.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Gym details"
      subtitle="Shown across the website — header, footer and home page"
      actions={form && <Button variant="primary" icon={Save} loading={saving} onClick={save}>Save changes</Button>}
    >
      {loadError ? (
        <Card><p className="text-[14px]" style={{ color: 'var(--p-danger)' }}>{loadError}</p></Card>
      ) : !form ? (
        <div className="space-y-3 max-w-2xl">
          <Skeleton h={180} /><Skeleton h={220} />
        </div>
      ) : (
        <FadeIn>
          <div className="space-y-4 max-w-2xl">
            <Card title="The gym">
              <div className="space-y-4">
                <Field label="Gym name" required error={errors.gymName}
                  hint="Used in messages and email subjects">
                  <Input {...bind('gymName')} placeholder="FitNation by Ajeet" />
                </Field>
                <Field label="Owner / trainer name"
                  hint="The person members are dealing with">
                  <Input {...bind('ownerName')} placeholder="Ajeet Kag" />
                </Field>
                <Field label="Tagline">
                  <Input {...bind('tagline')} placeholder="Uniting a healthier world" />
                </Field>
              </div>
            </Card>

            <Card title="How members reach you">
              <div className="space-y-4">
                <Field label="Phone" required error={errors.phone}
                  hint="Shown in the header, footer and home page">
                  <Input type="tel" inputMode="numeric" {...bind('phone')} placeholder="9630906906" />
                </Field>
                <Field label="WhatsApp" error={errors.whatsapp}
                  hint="Leave empty to use the phone number above">
                  <Input type="tel" inputMode="numeric" {...bind('whatsapp')} placeholder="Same as phone" />
                </Field>
                <Field label="Instagram handle" hint="Without the @">
                  <Input {...bind('instagram')} placeholder="fitnation.by.ajeet" />
                </Field>
                <Field label="Email" error={errors.email}>
                  <Input type="email" {...bind('email')} placeholder="hello@fitnation.in" />
                </Field>
                <Field label="Address">
                  <Input {...bind('address')} placeholder="Street, city" />
                </Field>
                <Field label="Gym UPI ID" hint="Used for fee collection & statements (e.g. 9630906906@upi or gym@okaxis)">
                  <Input {...bind('upiId')} placeholder="gymname@upi" />
                </Field>
              </div>
            </Card>

            <Card title="Opening hours">
              <Field label="One line per row" hint="However you would say it to a member">
                <Textarea
                  rows={4}
                  {...bind('hours')}
                  placeholder={'Mon–Sat: 5 AM – 11 AM\nMon–Sat: 4 PM – 10 PM\nSunday: Closed'}
                />
              </Field>
            </Card>

            <Card title="Landing page imagery (real gym & member photography)">
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon size={16} style={{ color: 'var(--p-accent)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--p-muted)' }}>
                  Upload authentic photographs of your gym floor, trainers, or member transformations.
                </span>
              </div>
              <p className="text-xs mb-5 leading-relaxed" style={{ color: 'var(--p-text-2)' }}>
                Images are automatically rendered with a subtle cinematic contrast overlay so titles and buttons remain 100% readable.
              </p>
              <div className="space-y-6">
                {/* 1. Explore Workouts card */}
                <div className="space-y-2">
                  <Field
                    label="Workouts feature card (hero left)"
                    hint="Featured photo for the 'Explore Workouts' card at the top of the homepage"
                  >
                    <div className="flex gap-2">
                      <Input
                        value={form.heroWorkoutImage || ''}
                        onChange={e => set('heroWorkoutImage', e.target.value)}
                        placeholder="https://... or upload a photo"
                      />
                      <input
                        type="file"
                        ref={workoutFileRef}
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          if (e.target.files?.[0]) handleFileUpload('heroWorkoutImage', e.target.files[0]);
                        }}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        icon={Upload}
                        loading={uploadingField === 'heroWorkoutImage'}
                        onClick={() => workoutFileRef.current?.click()}
                      >
                        Upload
                      </Button>
                    </div>
                  </Field>
                  {form.heroWorkoutImage && (
                    <div className="relative rounded-xl overflow-hidden h-28 border border-white/10 max-w-md">
                      <img src={form.heroWorkoutImage} alt="Workouts card" className="w-full h-full object-cover opacity-75" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent flex items-end p-2.5">
                        <span className="text-xs text-white/90 font-medium">Hero Left: Explore Workouts</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Join FitNation card */}
                <div className="space-y-2">
                  <Field
                    label="Membership feature card (hero right)"
                    hint="Featured photo for the 'Join FitNation' card at the top of the homepage"
                  >
                    <div className="flex gap-2">
                      <Input
                        value={form.heroJoinImage || ''}
                        onChange={e => set('heroJoinImage', e.target.value)}
                        placeholder="https://... or upload a photo"
                      />
                      <input
                        type="file"
                        ref={joinFileRef}
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          if (e.target.files?.[0]) handleFileUpload('heroJoinImage', e.target.files[0]);
                        }}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        icon={Upload}
                        loading={uploadingField === 'heroJoinImage'}
                        onClick={() => joinFileRef.current?.click()}
                      >
                        Upload
                      </Button>
                    </div>
                  </Field>
                  {form.heroJoinImage && (
                    <div className="relative rounded-xl overflow-hidden h-28 border border-white/10 max-w-md">
                      <img src={form.heroJoinImage} alt="Membership card" className="w-full h-full object-cover opacity-75" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent flex items-end p-2.5">
                        <span className="text-xs text-white/90 font-medium">Hero Right: Join FitNation</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. CTA bottom banner */}
                <div className="space-y-2">
                  <Field
                    label="Transformation banner background (bottom CTA)"
                    hint="Wide photo behind the 'Start Your Transformation' WhatsApp section"
                  >
                    <div className="flex gap-2">
                      <Input
                        value={form.ctaBannerImage || ''}
                        onChange={e => set('ctaBannerImage', e.target.value)}
                        placeholder="https://... or upload a photo"
                      />
                      <input
                        type="file"
                        ref={ctaFileRef}
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          if (e.target.files?.[0]) handleFileUpload('ctaBannerImage', e.target.files[0]);
                        }}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        icon={Upload}
                        loading={uploadingField === 'ctaBannerImage'}
                        onClick={() => ctaFileRef.current?.click()}
                      >
                        Upload
                      </Button>
                    </div>
                  </Field>
                  {form.ctaBannerImage && (
                    <div className="relative rounded-xl overflow-hidden h-28 border border-white/10 max-w-md">
                      <img src={form.ctaBannerImage} alt="CTA banner" className="w-full h-full object-cover opacity-70" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent flex items-end p-2.5">
                        <span className="text-xs text-white/90 font-medium">Bottom CTA: Start Transformation Banner</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* What the visitor will actually see, so a mistake is obvious
                before it reaches the website. */}
            <Card title="Preview">
              <div className="flex flex-wrap items-center gap-5 text-[14px]" style={{ color: 'var(--p-text-2)' }}>
                <span className="flex items-center gap-2">
                  <Building2 size={14} style={{ color: 'var(--p-accent)' }} />
                  {form.gymName || '—'}
                </span>
                <span className="flex items-center gap-2">
                  <Phone size={14} style={{ color: 'var(--p-accent)' }} />
                  {form.phone || '—'}
                </span>
                <span className="flex items-center gap-2">
                  <MessageCircle size={14} style={{ color: 'var(--p-accent)' }} />
                  {form.whatsapp || form.phone || '—'}
                </span>
                <span className="flex items-center gap-2">
                  <AtSign size={14} style={{ color: 'var(--p-accent)' }} />
                  @{String(form.instagram || '').replace(/^@/, '') || '—'}
                </span>
                {form.email && (
                  <span className="flex items-center gap-2">
                    <Mail size={14} style={{ color: 'var(--p-accent)' }} />{form.email}
                  </span>
                )}
                {form.address && (
                  <span className="flex items-center gap-2">
                    <MapPin size={14} style={{ color: 'var(--p-accent)' }} />{form.address}
                  </span>
                )}
              </div>
              {form.hours?.trim() && (
                <div className="flex items-start gap-2 mt-3 pt-3 text-[14px]"
                  style={{ borderTop: '1px solid var(--p-border)', color: 'var(--p-text-2)' }}>
                  <Clock size={14} className="mt-0.5" style={{ color: 'var(--p-accent)' }} />
                  <span>
                    {form.hours.split('\n').filter(Boolean).map((l, i) => <div key={i}>{l}</div>)}
                  </span>
                </div>
              )}
            </Card>

            <Button block variant="primary" icon={Save} loading={saving} onClick={save}>
              Save changes
            </Button>
          </div>
        </FadeIn>
      )}
    </AdminLayout>
  );
}
