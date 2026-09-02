import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * cn() — the shadcn class helper.
 *
 * clsx flattens conditionals, twMerge resolves Tailwind conflicts so a class
 * passed in from outside wins over the component's own default (`p-6` + `p-8`
 * becomes `p-8` rather than both being emitted and the cascade deciding).
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
