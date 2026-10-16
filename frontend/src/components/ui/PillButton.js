import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

/**
 * PillButton
 * Exact reverse-engineered CTA Button from Oris Dental.
 * Features:
 *  1. Expanding circular background layer (width: 350%, transform scale(0) -> scale(1) via cubic-bezier(0.785, 0.135, 0.15, 0.86)).
 *  2. Kinetic character roll: Each character possesses a duplicate text shadow at 0px 1.3em currentColor.
 *     On hover, characters translate -1.3em with staggered delay, smoothly revealing the shadow.
 */
export default function PillButton({
  btnText = 'Claim Free Pass',
  href = '#oris-form',
  to,
  onClick,
  className = '',
  textClassName = '',
  bgColor = '#3365e2',
  textColor = '#ffffff',
  hoverTextColor = '#3365e2',
  hoverBgColor = '#ffffff',
  dotColor = '#ffffff',
  icon,
  size = 'default',
  showDot = true,
  ...props
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const charsRef = useRef([]);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (mq) {
      setReducedMotion(mq.matches);
      const handler = (e) => setReducedMotion(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, []);

  const chars = Array.from(btnText || '');

  const content = (
    <>
      {/* Expanding circular backdrop */}
      <span
        aria-hidden="true"
        className={`absolute rounded-full pointer-events-none transition-transform duration-500 ease-out ${
          isHovered ? 'scale-100' : 'scale-0 group-hover:scale-100'
        }`}
        style={{
          width: '350%',
          aspectRatio: '1 / 1',
          left: '50%',
          top: '50%',
          backgroundColor: hoverBgColor,
          translate: '-50% -50%',
          transitionTimingFunction: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)',
        }}
      />

      {/* Leading accent dot */}
      {showDot && (
        <span
          aria-hidden="true"
          className="relative z-10 flex shrink-0 items-center justify-center w-[6px] h-[6px] rounded-full transition-all duration-300 group-hover:scale-125"
          style={{
            backgroundColor: isHovered ? hoverTextColor : dotColor,
            transform: isHovered ? 'scale(1.25)' : undefined,
          }}
        />
      )}

      {/* Rolling Kinetic Text Container */}
      <span
        aria-hidden="true"
        className={`relative z-20 block h-[1.3em] overflow-hidden whitespace-nowrap font-medium transition-colors duration-300 group-hover:text-[var(--hover-text,inherit)] ${textClassName}`}
        style={{
          color: isHovered ? hoverTextColor : textColor,
          lineHeight: 1.3,
          '--hover-text': hoverTextColor,
        }}
      >
        {chars.map((char, i) => (
          <span
            key={i}
            ref={(el) => (charsRef.current[i] = el)}
            className="group-hover:-translate-y-[1.3em] inline-block relative"
            style={{
              textShadow: '0px 1.3em currentColor',
              transform: isHovered && !reducedMotion ? 'translateY(-1.3em)' : undefined,
              transitionDelay: reducedMotion ? '0s' : `${0.015 * i}s`,
              transitionProperty: 'transform, color',
              transitionDuration: '0.55s',
              transitionTimingFunction: 'cubic-bezier(0.625, 0.05, 0, 1)',
              whiteSpace: char === ' ' ? 'pre' : 'normal',
            }}
          >
            {char}
          </span>
        ))}
      </span>
      <span className="sr-only">{btnText}</span>

      {icon && (
        <span
          className="relative z-20 transition-transform duration-300 group-hover:translate-x-1"
          style={{ color: isHovered ? hoverTextColor : textColor }}
        >
          {icon}
        </span>
      )}
    </>
  );

  const sizeClasses = (size === 'nav' || size === 'sm')
    ? 'h-[38px] sm:h-[40px] min-h-[38px] sm:min-h-[40px] px-4 sm:px-5 gap-2 text-xs sm:text-sm font-semibold'
    : 'h-[3.4vw] min-h-[46px] px-[2vw] gap-[0.8vw]';

  const disabledClasses = props.disabled ? 'opacity-60 cursor-not-allowed pointer-events-none shadow-none' : 'cursor-pointer hover:shadow-md';

  const sharedClasses = `group relative inline-flex items-center justify-center ${sizeClasses} rounded-full overflow-hidden select-none no-underline border border-white/20 transition-all duration-300 shadow-sm focus-visible:ring-2 focus-visible:ring-[#3365e2] ${disabledClasses} ${className}`;

  if (to && !props.disabled) {
    return (
      <Link
        to={to}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={sharedClasses}
        style={{ backgroundColor: bgColor }}
        {...props}
      >
        {content}
      </Link>
    );
  }

  if (href && !onClick && !props.disabled) {
    return (
      <a
        href={href}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={sharedClasses}
        style={{ backgroundColor: bgColor }}
        {...props}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={props.type || 'button'}
      onClick={onClick}
      disabled={props.disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={sharedClasses}
      style={{ backgroundColor: bgColor }}
      {...props}
    >
      {content}
    </button>
  );
}
