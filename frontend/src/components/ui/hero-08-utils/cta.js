import * as React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { cn } from '../../../lib/utils';

/**
 * The call-to-action inside a hero-08 card.
 *
 * This file was not supplied with the component — hero-08 imports it but no
 * source came with it — so it is written to the shape the component uses:
 * `{ ctaEnabled, text, link, size }` plus the card's `invert` flag.
 *
 * An internal `link` renders a react-router <Link> so it does not full-page
 * reload; an external one (http…) renders a plain anchor.
 */
export function Cta({ cta, invert, className }) {
  if (!cta?.ctaEnabled || !cta.text) return null;

  const sizeClass = {
    sm: 'h-9 px-4 text-[13px]',
    default: 'h-11 px-6 text-sm',
    lg: 'h-12 px-7 text-base',
  }[cta.size || 'default'];

  const classes = cn(
    'group inline-flex items-center justify-center gap-2 rounded-full font-bold',
    'transition-transform duration-200 hover:-translate-y-0.5',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    sizeClass,
    // On an image card the button sits on photography, so it stays the solid
    // brand cyan in both themes rather than following the page foreground.
    invert
      ? 'bg-[#22d3ee] text-black hover:bg-[#67e8f9] focus-visible:ring-white'
      : 'bg-foreground text-background hover:opacity-90 focus-visible:ring-primary',
    className,
  );

  const content = (
    <>
      {cta.text}
      <ArrowRight
        size={16}
        aria-hidden
        className="transition-transform duration-200 group-hover:translate-x-0.5"
      />
    </>
  );

  if (!cta.link) return <button type="button" className={classes}>{content}</button>;

  return /^https?:\/\//.test(cta.link)
    ? <a href={cta.link} target="_blank" rel="noreferrer" className={classes}>{content}</a>
    : <Link to={cta.link} className={classes}>{content}</Link>;
}

export default Cta;
