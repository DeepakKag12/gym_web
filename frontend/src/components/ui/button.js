import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';

import { cn } from '../../lib/utils';

/**
 * shadcn/ui Button, ported to JS.
 *
 * The colour tokens are pointed at this project's CSS variables (see
 * tailwind.config.js) rather than shadcn's, so it inherits the FitNation
 * palette and follows the light/dark panel switch automatically.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white font-semibold hover:bg-primary-hover shadow-sm',
        primary: 'bg-primary text-white font-semibold hover:bg-primary-hover shadow-sm',
        light: 'bg-white text-stone-900 font-semibold hover:bg-stone-100 shadow-sm border border-stone-200/80',
        dark: 'bg-stone-900 text-white font-semibold hover:bg-stone-800 shadow-sm border border-stone-700',
        secondary: 'bg-secondary text-foreground hover:bg-secondary/80 border border-input',
        outline: 'border border-input bg-transparent hover:bg-foreground/5 hover:text-foreground',
        ghost: 'hover:bg-foreground/5 hover:text-foreground',
        destructive: 'bg-destructive text-white hover:bg-destructive/90 shadow-sm',
        link: 'text-foreground hover:text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
