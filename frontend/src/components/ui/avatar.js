import * as React from 'react';
import { cn } from '../../lib/utils';

/**
 * Avatar component with smooth image loading and fallback support.
 * Pure React implementation without fragile ESM subpath dependency issues.
 */
const AvatarContext = React.createContext({ status: 'idle', setStatus: () => {} });

const Avatar = React.forwardRef(({ className, children, ...props }, ref) => {
  const [status, setStatus] = React.useState('idle');
  return (
    <AvatarContext.Provider value={{ status, setStatus }}>
      <div
        ref={ref}
        className={cn(
          'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </AvatarContext.Provider>
  );
});
Avatar.displayName = 'Avatar';

const AvatarImage = React.forwardRef(({ className, src, alt = '', ...props }, ref) => {
  const { status, setStatus } = React.useContext(AvatarContext);

  React.useEffect(() => {
    if (!src) {
      setStatus('error');
      return;
    }
    const img = new Image();
    img.src = src;
    img.onload = () => setStatus('loaded');
    img.onerror = () => setStatus('error');
  }, [src, setStatus]);

  if (status !== 'loaded') return null;

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={cn('aspect-square h-full w-full object-cover', className)}
      {...props}
    />
  );
});
AvatarImage.displayName = 'AvatarImage';

const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => {
  const { status } = React.useContext(AvatarContext);
  if (status === 'loaded') return null;

  return (
    <div
      ref={ref}
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-white/10 text-white',
        className,
      )}
      {...props}
    />
  );
});
AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarImage, AvatarFallback };
