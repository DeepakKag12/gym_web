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

  // Support explicit variant or choose contextually based on image brightness:
  // On dark photos (invert), 'light' button (white + dark text) provides brilliant, immediate readability.
  const variant = cta.variant || (invert ? 'light' : 'primary');

  const variantStyles = {
    light: 'bg-white text-stone-900 hover:bg-stone-100 shadow-md ring-1 ring-black/5 font-semibold focus-visible:ring-white',
    primary: 'bg-primary text-white hover:bg-primary-hover shadow-sm font-semibold focus-visible:ring-primary',
    dark: 'bg-stone-900 text-white hover:bg-stone-800 shadow-sm font-semibold border border-white/10 focus-visible:ring-stone-400',
    outline: 'border-2 border-white/80 bg-black/25 backdrop-blur-md text-white hover:bg-white/15 hover:border-white font-semibold focus-visible:ring-white',
    secondary: 'bg-stone-800/80 backdrop-blur-md text-white hover:bg-stone-700 border border-white/10 font-semibold focus-visible:ring-white',
    ghost: 'bg-transparent text-white/90 hover:bg-white/10 font-semibold focus-visible:ring-white',
  };

  const classes = cn(
    'group inline-flex items-center justify-center gap-2 rounded-lg font-semibold',
    'transition-all duration-200 hover:-translate-y-0.5',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    sizeClass,
    variantStyles[variant] || variantStyles.light,
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
