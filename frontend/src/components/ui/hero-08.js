import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { cn } from '../../lib/utils';

import { Cta } from './hero-08-utils/cta';

/**
 * hero-08 — ported to this project's stack.
 *
 * The original ships as TypeScript against Tailwind v4 and the shadcn `@/`
 * alias. This project is CRA + JavaScript + Tailwind v3, so four things were
 * translated. The layout, spacing and motion are unchanged.
 *
 *   motion/react      -> framer-motion          (already a dependency here)
 *   react-wrap-balancer -> `text-balance` utility (see note below)
 *   aspect-16/10      -> aspect-16/10           (declared in tailwind.config.js)
 *   bg-linear-to-br   -> bg-gradient-to-br      (v3 spelling)
 *   size-full         -> h-full w-full          (v4-only shorthand)
 *   outline-black/10  -> ring-1 ring-black/10   (v3 `outline` is not a border)
 *   @/components/...  -> relative imports       (no path alias configured)
 *
 * react-wrap-balancer was dropped rather than added. It balances line lengths
 * with a ResizeObserver, which fired "ResizeObserver loop completed with
 * undelivered notifications" on load and threw CRA's red error overlay over
 * the whole page in development. Tailwind 3.4 ships `text-balance`
 * (CSS text-wrap: balance), which does the same job in the browser with no
 * JavaScript, no dependency and no observer.
 *
 * One addition to the original API: `titleClassName`, so a page can put the
 * FitNation display face on the headline instead of the default serif without
 * forking the component.
 */

const variantStyles = {
  standard: {
    section: 'py-20 sm:py-28',
    title: 'text-3xl sm:text-4xl md:text-5xl',
    description: 'text-sm sm:text-base',
    header: 'gap-10 lg:gap-16',
    content: 'gap-12 sm:gap-16',
    grid: 'gap-5 sm:gap-6',
    card: 'aspect-16/10',
    cardTitle: 'text-2xl sm:text-3xl',
    cardBody: 'p-6 sm:p-8',
  },
  compact: {
    section: 'py-14 sm:py-20',
    title: 'text-2xl sm:text-3xl md:text-4xl',
    description: 'text-sm',
    header: 'gap-8 lg:gap-12',
    content: 'gap-10 sm:gap-12',
    grid: 'gap-4 sm:gap-5',
    card: 'aspect-16/11',
    cardTitle: 'text-xl sm:text-2xl',
    cardBody: 'p-5 sm:p-6',
  },
};

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const mediaItem = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

function Reveal({ active, variants, className, children }) {
  if (!active) return <div className={className}>{children}</div>;

  return (
    <motion.div variants={variants ?? item} className={className}>
      {children}
    </motion.div>
  );
}

function FeatureCard({ card, vs }) {
  // `text-on-photo`, not `text-white`: the public light theme remaps
  // `.text-white` to dark body copy, which would make these titles vanish
  // into the photograph behind them.
  const titleClass = card.invert ? 'text-on-photo' : 'text-foreground';
  const subtitleClass = card.invert ? 'text-white/80' : 'text-muted-foreground';

  return (
    <div
      className={cn(
        'relative isolate w-full overflow-hidden rounded-2xl ring-1 ring-white/10',
        vs.card,
      )}
    >
      {card.image && (
        <img
          src={card.image}
          alt={card.imageAlt ?? ''}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
      )}

      {card.invert && (
        // Deeper than the original from-black/40: FitNation's gym and food
        // photography is bright, and the subtitle failed contrast over it.
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-br from-black/75 via-black/45 to-black/10"
        />
      )}

      <div className={cn('flex h-full flex-col items-start', vs.cardBody)}>
        <h3 className={cn('font-semibold tracking-tight text-balance', vs.cardTitle, titleClass)}>
          {card.title}
        </h3>
        <p className={cn('mt-1 text-sm', subtitleClass)}>{card.subtitle}</p>
        {card.cta?.ctaEnabled && (
          <div className="mt-4">
            <Cta cta={card.cta} invert={card.invert} />
          </div>
        )}
      </div>
    </div>
  );
}

export function Hero08({
  title,
  description,
  socialProof,
  avatars,
  cards,
  animation = 'none',
  variant = 'standard',
  titleClassName,
}) {
  const reduce = useReducedMotion();
  const animate = animation === 'subtle' && !reduce;
  const vs = variantStyles[variant] ?? variantStyles.standard;

  const titleElement = title && (
    <h1
      className={cn(
        'text-foreground font-serif font-normal tracking-tight text-balance',
        vs.title,
        titleClassName,
      )}
    >
      {title}
    </h1>
  );

  const descriptionElement = description && (
    <p className={cn('text-muted-foreground max-w-sm text-pretty', vs.description)}>
      {description}
    </p>
  );

  const socialProofElement = (socialProof || avatars?.length) && (
    <div className="flex flex-col items-start gap-3">
      {socialProof && <p className="text-foreground text-sm font-semibold">{socialProof}</p>}
      {avatars?.length ? (
        <div className="flex -space-x-2.5">
          {avatars.map(a => (
            <Avatar key={a.src} className="h-9 w-9 ring-2 ring-background">
              <AvatarImage src={a.src} alt="" />
              <AvatarFallback className="text-xs">{a.fallback}</AvatarFallback>
            </Avatar>
          ))}
        </div>
      ) : null}
    </div>
  );

  const cardsElement = cards?.length ? (
    <div className={cn('grid grid-cols-1 md:grid-cols-2', vs.grid)}>
      {cards.map(card => (
        <FeatureCard key={card.title} card={card} vs={vs} />
      ))}
    </div>
  ) : null;

  return (
    <section className="bg-background relative isolate w-full overflow-hidden">
      <motion.div
        className={cn('relative z-10 mx-auto flex max-w-6xl flex-col px-6', vs.section, vs.content)}
        variants={animate ? container : undefined}
        initial={animate ? 'hidden' : false}
        whileInView={animate ? 'visible' : undefined}
        viewport={{ once: true, margin: '-80px' }}
      >
        <Reveal active={animate} className={cn('grid grid-cols-1 items-end lg:grid-cols-2', vs.header)}>
          {titleElement}
          <div className="flex flex-col items-start gap-5">
            {descriptionElement}
            {socialProofElement}
          </div>
        </Reveal>

        <Reveal active={animate} variants={mediaItem} className="w-full">
          {cardsElement}
        </Reveal>
      </motion.div>
    </section>
  );
}

export default Hero08;
