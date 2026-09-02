import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';

import { useTheme } from '../context/ThemeContext';

/**
 * The site-wide light / dark control.
 *
 * The icon does not simply swap. The outgoing one falls and rotates away while
 * the incoming one rises into place, which reads as one object turning over
 * rather than two images cross-fading — a small thing, but it is the difference
 * between the control feeling built and feeling generic.
 *
 * The whole effect collapses to a plain swap when the visitor has "reduce
 * motion" turned on.
 */
export default function ThemeSwitch({ className = '', size = 19 }) {
  const { isDark, toggleTheme } = useTheme();
  const reduce = useReducedMotion();
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  const spin = reduce
    ? { initial: false, animate: {}, exit: {} }
    : {
        initial: { y: 10, opacity: 0, rotate: -70, scale: 0.6 },
        animate: { y: 0, opacity: 1, rotate: 0, scale: 1 },
        exit: { y: -10, opacity: 0, rotate: 70, scale: 0.6 },
      };

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      whileTap={reduce ? undefined : { scale: 0.9 }}
      className={
        'relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl ' +
        'text-gray-400 transition-colors hover:text-[#22d3ee] hover:bg-white/5 ' +
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22d3ee]/60 ' +
        className
      }
      style={{ minHeight: 0 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? 'moon' : 'sun'}
          {...spin}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="absolute grid place-items-center"
        >
          {isDark ? <Moon size={size} /> : <Sun size={size} />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
