import React, { useEffect, useState } from 'react';
import { Save, Phone, MessageCircle, AtSign, Mail, MapPin, Clock, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

import API, { cachedGet, bustCache, apiError } from '../../utils/api';
import { useSettings } from '../../context/SettingsContext';
import AdminLayout from './AdminLayout';
import { Card, Button, Field, Input, Textarea, Skeleton, FadeIn } from '../../components/ui';

/**
 * Gym details — the contact information shown across the public website.
 *
 * These were hardcoded constants duplicated in the navbar, the footer and the
 * homepage, so changing a phone number meant a code edit and a redeploy. Saving
 * here updates every one of those places at once.
 */
export default function GymDetails() {
  const { refreshSettings } = useSettings();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);

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
