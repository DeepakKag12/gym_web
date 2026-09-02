import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cachedGet } from '../utils/api';

/**
 * The gym's own details, loaded once and shared by the whole site.
 *
 * The phone number, Instagram handle and opening hours used to be `const`
 * declarations copied into Navbar.js, Footer.js and HomePage.js. Three copies
 * meant three places to edit and three chances to disagree, and changing a
 * number needed a redeploy. They now come from /api/settings, which an admin
 * edits from the panel.
 *
 * Defaults are shipped in the bundle so the header and footer render correct
 * details on the very first paint, before the request finishes — a navbar that
 * flashes an empty phone number looks broken.
 */

const FALLBACK = {
  gymName: 'FitNation by Ajeet',
  ownerName: 'Ajeet Kag',
  tagline: 'Uniting a healthier world',
  phone: '9630906906',
  whatsapp: '9630906906',
  email: '',
  instagram: 'fitnation.by.ajeet',
  address: '',
  hours: ['Mon–Sat: 5 AM – 11 AM', 'Mon–Sat: 4 PM – 10 PM', 'Sunday: Closed'],
};

const SettingsContext = createContext(null);

/** Digits only, with India assumed for a bare 10-digit number. */
export function waNumber(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.length === 10 ? `91${digits}` : digits;
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(FALLBACK);

  const load = useCallback(() => {
    cachedGet('/settings', { cache: 300 })
      .then(r => {
        if (r?.data?.gymName) setSettings({ ...FALLBACK, ...r.data });
      })
      // A failed load is not worth surfacing: the shipped defaults are correct
      // enough to keep the site usable, and this is decoration on most pages.
      .catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const value = useMemo(() => ({
    ...settings,
    // Ready-made links, so no caller has to remember the wa.me format again.
    telHref: `tel:${settings.phone}`,
    waHref: `https://wa.me/${waNumber(settings.whatsapp || settings.phone)}`,
    instagramHref: `https://instagram.com/${settings.instagram}`,
    refreshSettings: load,
    setSettings,
  }), [settings, load]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

/** Never throws: a component outside the provider still gets usable defaults. */
export function useSettings() {
  return useContext(SettingsContext) || {
    ...FALLBACK,
    telHref: `tel:${FALLBACK.phone}`,
    waHref: `https://wa.me/${waNumber(FALLBACK.phone)}`,
    instagramHref: `https://instagram.com/${FALLBACK.instagram}`,
    refreshSettings: () => {},
    setSettings: () => {},
  };
}
