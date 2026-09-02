import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from './index';

/**
 * "Send on WhatsApp" — opens the admin's own WhatsApp with the message already
 * written, so all they do is press send.
 *
 * Why a link rather than an API call: sending WhatsApp automatically needs a
 * WhatsApp Business sender registered with Meta, and until that exists every
 * automated attempt fails silently. A wa.me link works today, costs nothing,
 * and arrives from the gym's real number instead of a test sender.
 *
 * `onBeforeOpen` is where the email goes out. It runs first and is awaited, so
 * the member always gets the email even if the admin never presses send in
 * WhatsApp — the two channels do not depend on each other.
 *
 * The window is opened synchronously on click and its URL filled in afterwards:
 * calling window.open() after an await lands outside the user gesture and Safari
 * blocks it as a popup.
 */
export default function WhatsAppButton({
  phone,
  text,
  onBeforeOpen,
  label = 'Send on WhatsApp',
  variant = 'primary',
  size,
  block,
  buildHref,
  disabled,
}) {
  const [busy, setBusy] = useState(false);

  const handle = async () => {
    if (busy) return;
    setBusy(true);

    // Claim the popup inside the click, before any awaiting happens.
    const win = window.open('', '_blank');

    try {
      const result = onBeforeOpen ? await onBeforeOpen() : null;
      const href = buildHref
        ? buildHref(result)
        : `https://wa.me/${String(phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(text || '')}`;

      if (!href || href.includes('wa.me/?')) {
        win?.close();
        toast.error('No WhatsApp number on record for this member.');
        return;
      }
      if (win) win.location.href = href;
      else window.location.href = href;   // popup blocked — navigate instead
    } catch (err) {
      win?.close();
      toast.error(err?.message || 'Could not prepare the WhatsApp message.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      block={block}
      icon={MessageCircle}
      loading={busy}
      disabled={disabled}
      onClick={handle}
    >
      {label}
    </Button>
  );
}
