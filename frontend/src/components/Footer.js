import React from 'react';
import LayoutFooter from './layout/Footer';
import { useSettings } from '../context/SettingsContext';

/**
 * Footer
 * Standardized application-wide footer delegating to components/layout/Footer.
 */
export default function Footer(props) {
  const site = useSettings?.() || {};
  return (
    <LayoutFooter
      brandName={site?.gymName || 'FITNATION'}
      phone={site?.phone ? `+91 ${site.phone}` : undefined}
      address={site?.address || 'Fourlane Square, Tridalam Arcade, First Floor, Rajgarh (Dhar), MP'}
      {...props}
    />
  );
}

export { LayoutFooter as OrisCurtainFooter };
