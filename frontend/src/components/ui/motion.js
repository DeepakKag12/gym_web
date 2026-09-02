/**
 * Motion vocabulary for the panel.
 *
 * One place defines how things enter, so every screen moves the same way and
 * a change to the feel happens once. The rules the panel follows:
 *
 *   • short — 0.18s to 0.32s, never long enough to wait for
 *   • small — a few pixels of travel, no scaling or spinning
 *   • honest — motion shows where something came from, it does not decorate
 *
 * Every variant collapses to a plain fade (or to nothing) when the visitor has
 * "reduce motion" turned on — see `useMotion` below.
 */
import { useReducedMotion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

/* ── Page level ──────────────────────────────────────────────────────────── */
export const pageVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.24, ease: EASE } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.16, ease: 'easeIn' } },
};

/* ── Lists and grids: children arrive one after another ──────────────────── */
export const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.045, delayChildren: 0.03 } },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.26, ease: EASE } },
};

/* ── Table rows: no travel, so columns never look like they are sliding ──── */
export const rowVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.18, ease: 'easeIn' } },
};

/* ── Dialogs ─────────────────────────────────────────────────────────────── */
export const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, transition: { duration: 0.14 } },
};

export const dialogVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.985 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.22, ease: EASE } },
  exit: { opacity: 0, y: 8, scale: 0.99, transition: { duration: 0.15, ease: 'easeIn' } },
};

/* ── Empty state: one small settle, never a loop ─────────────────────────── */
export const emptyVariants = {
  hidden: { opacity: 0, y: 6, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: EASE } },
};

/** A flat fade — what every variant degrades to under "reduce motion". */
const fadeOnly = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

const noStagger = { hidden: {}, visible: {} };

/**
 * useMotion() — hand a screen the right variants for this visitor.
 *
 * Returns the full set normally, and fade-only versions when the OS asks for
 * reduced motion, so no screen has to remember to check.
 */
export function useMotion() {
  const reduce = useReducedMotion();

  if (reduce) {
    return {
      reduce: true,
      page: fadeOnly,
      list: noStagger,
      item: fadeOnly,
      row: fadeOnly,
      overlay: fadeOnly,
      dialog: fadeOnly,
      empty: fadeOnly,
      hover: {},
      tap: {},
    };
  }

  return {
    reduce: false,
    page: pageVariants,
    list: listVariants,
    item: itemVariants,
    row: rowVariants,
    overlay: overlayVariants,
    dialog: dialogVariants,
    empty: emptyVariants,
    /* Buttons and cards: a nudge, not a jump. */
    hover: { y: -2, transition: { duration: 0.15, ease: 'easeOut' } },
    tap: { y: 0, scale: 0.985, transition: { duration: 0.1 } },
  };
}
