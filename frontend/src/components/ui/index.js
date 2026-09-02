/**
 * Small shared UI kit for the admin / trainer / member panels.
 *
 * Everything here is a thin wrapper over the `.ui-*` classes in
 * src/styles/panel.css. The point is that a screen never hand-rolls another
 * button or card variant: the panel looks like one product, and a change to
 * the look happens in one place.
 *
 *   import { Page, Card, Button, Field, Modal, Badge } from '../../components/ui';
 */
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Inbox, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useMotion } from './motion';

export * from './motion';

/* ── Buttons ─────────────────────────────────────────────────────────────── */
export function Button({
  variant = 'secondary', size, icon: Icon, loading, block,
  to, href, className = '', children, ...rest
}) {
  const cls = [
    'ui-btn', `ui-btn-${variant}`,
    size === 'sm' ? 'ui-btn-sm' : '',
    block ? 'ui-btn-block' : '',
    !children ? 'ui-btn-icon' : '',
    className,
  ].filter(Boolean).join(' ');

  const inner = (
    <>
      {loading ? <Spinner size={15} light={variant === 'primary'} /> : Icon && <Icon size={size === 'sm' ? 15 : 16} />}
      {children}
    </>
  );

  if (to)   return <Link to={to} className={cls} {...rest}>{inner}</Link>;
  if (href) return <a href={href} className={cls} {...rest}>{inner}</a>;
  return <button className={cls} disabled={loading || rest.disabled} {...rest}>{inner}</button>;
}

export function Spinner({ size = 18, light }) {
  return (
    <span
      style={{
        width: size, height: size,
        border: `2px solid ${light ? 'rgba(255,255,255,.4)' : 'var(--p-border-2)'}`,
        borderTopColor: light ? '#fff' : 'var(--p-accent)',
        borderRadius: '50%',
        display: 'inline-block',
        animation: 'ui-spin 0.7s linear infinite',
      }}
    />
  );
}

/* ── Page scaffolding ────────────────────────────────────────────────────── */
export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
      <div className="min-w-0">
        <h1 className="ui-page-title">{title}</h1>
        {subtitle && <p className="ui-page-sub">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2 flex-wrap">{children}</div>}
    </div>
  );
}

/* ── Card ────────────────────────────────────────────────────────────────── */
export function Card({ title, action, padded = true, className = '', children, ...rest }) {
  return (
    <section className={`ui-card ${className}`} {...rest}>
      {(title || action) && (
        <header className="ui-card-head">
          <h2 className="ui-card-title">{title}</h2>
          {action}
        </header>
      )}
      <div className={padded ? 'ui-card-pad' : ''}>{children}</div>
    </section>
  );
}

/* ── Stat tile ───────────────────────────────────────────────────────────── */
export function StatTile({ label, value, icon: Icon, tone = 'neutral', to }) {
  const toneColor = {
    neutral: 'var(--p-text-2)',
    accent:  'var(--p-accent)',
    ok:      'var(--p-ok)',
    warn:    'var(--p-warn)',
    danger:  'var(--p-danger)',
  }[tone];

  const body = (
    <>
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon size={16} style={{ color: toneColor }} />}
        <span className="text-[13px] font-medium" style={{ color: 'var(--p-text-2)' }}>{label}</span>
      </div>
      <div className="text-[28px] font-bold leading-none" style={{ color: 'var(--p-text)' }}>{value}</div>
    </>
  );

  return to
    ? <Link to={to} className="ui-card ui-card-link ui-card-pad">{body}</Link>
    : <div className="ui-card ui-card-pad">{body}</div>;
}

/* ── Badge ───────────────────────────────────────────────────────────────── */
export function Badge({ tone = 'neutral', icon: Icon, children }) {
  return (
    <span className={`ui-badge ui-badge-${tone}`}>
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
}

/** Membership status → badge tone, used on several screens. */
export const STATUS_TONE = { active: 'ok', expired: 'danger', pending: 'warn' };

/* ── Form fields ─────────────────────────────────────────────────────────── */
/**
 * A labelled form control with an optional hint and inline error.
 *
 * The error is tied to the input with aria-describedby and announced with
 * role="alert", so a screen reader reports it the moment it appears — a toast
 * alone leaves keyboard and screen-reader users with no idea which field failed.
 */
export function Field({ label, hint, error, required, children }) {
  const id = React.useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(' ') || undefined;

  const control = React.isValidElement(children)
    ? React.cloneElement(children, {
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
        style: error ? { ...(children.props.style || {}), borderColor: 'var(--p-danger)' } : children.props.style,
      })
    : children;

  return (
    <div className="block">
      {label && (
        <label htmlFor={id} className="ui-label">
          {label}{required && <span style={{ color: 'var(--p-danger)' }}> *</span>}
        </label>
      )}
      {control}
      {error
        ? <span id={`${id}-err`} role="alert" className="ui-hint" style={{ color: 'var(--p-danger)' }}>{error}</span>
        : hint && <span id={`${id}-hint`} className="ui-hint">{hint}</span>}
    </div>
  );
}

export const Input    = React.forwardRef((p, ref) => <input    ref={ref} {...p} className={`ui-input ${p.className || ''}`} />);
export const Textarea = React.forwardRef((p, ref) => <textarea ref={ref} {...p} className={`ui-input ${p.className || ''}`} />);
export const Select   = React.forwardRef(({ children, ...p }, ref) => (
  <select ref={ref} {...p} className={`ui-input ${p.className || ''}`}>{children}</select>
));

/** Checkbox as a full-width tappable row — much easier to hit on a phone. */
export function Check({ checked, onChange, label, hint }) {
  return (
    <label className={`ui-check ${checked ? 'ui-check-on' : ''}`}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="min-w-0">
        <span className="block text-[14px] font-medium" style={{ color: 'var(--p-text)' }}>{label}</span>
        {hint && <span className="block text-[12px] mt-0.5" style={{ color: 'var(--p-text-2)' }}>{hint}</span>}
      </span>
    </label>
  );
}

/* ── Tabs ────────────────────────────────────────────────────────────────── */
export function Tabs({ value, onChange, options }) {
  return (
    <div className="ui-tabs" role="tablist">
      {options.map(o => {
        const val = o.value ?? o;
        const label = o.label ?? o;
        return (
          <button
            key={val}
            role="tab"
            aria-selected={value === val}
            onClick={() => onChange(val)}
            className={`ui-tab ${value === val ? 'ui-tab-on' : ''}`}
          >
            {label}{o.count != null && <span className="opacity-60"> ({o.count})</span>}
          </button>
        );
      })}
    </div>
  );
}

/* ── Modal ───────────────────────────────────────────────────────────────── */
export function Modal({ title, onClose, footer, width = 560, children }) {
  const boxRef = React.useRef(null);
  const m = useMotion();

  // Move focus into the dialog so it is announced and Escape works at once.
  // Fields first: querying 'input, …, button' together returns whatever comes
  // first in the document, which is the header's Close button — so every form
  // opened with the cursor parked on Close instead of on the first question.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const field = el.querySelector('.ui-modal-body input, .ui-modal-body textarea, .ui-modal-body select');
    const fallback = el.querySelector('button');
    (field || fallback || el).focus({ preventScroll: true });
  }, []);

  // Escape to close + no background scrolling while open.
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  return (
    <motion.div
      className="ui-modal-overlay"
      variants={m.overlay}
      initial="hidden"
      animate="visible"
      exit="exit"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        ref={boxRef}
        tabIndex={-1}
        className="ui-modal"
        style={{ maxWidth: width, outline: 'none' }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        variants={m.dialog}
      >
        <header className="ui-modal-head">
          <h2 className="ui-modal-title">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close"><X size={18} /></Button>
        </header>
        <div className="ui-modal-body">{children}</div>
        {footer && <footer className="ui-modal-foot">{footer}</footer>}
      </motion.div>
    </motion.div>
  );
}

/* ── Confirmation for destructive actions ────────────────────────────────── */
/**
 * Every irreversible action goes through this: it names the thing being acted
 * on, spells out the consequence in plain words, and puts the safe choice
 * first. window.confirm() could not do any of that.
 */
export function ConfirmDialog({
  title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  tone = 'danger', loading, onConfirm, onCancel,
}) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      width={420}
      footer={
        <>
          <Button onClick={onCancel} disabled={loading}>{cancelLabel}</Button>
          <Button variant={tone === 'danger' ? 'primary' : 'primary'} onClick={onConfirm} loading={loading}
            style={tone === 'danger' ? { background: 'var(--p-danger)' } : undefined}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-[15px] leading-relaxed" style={{ color: 'var(--p-text-2)' }}>{message}</p>
    </Modal>
  );
}

/* ── Empty state ─────────────────────────────────────────────────────────── */
export function EmptyState({ icon: Icon = Inbox, title, hint, children }) {
  const m = useMotion();
  return (
    <motion.div className="ui-empty" variants={m.empty} initial="hidden" animate="visible">
      <div className="ui-empty-icon"><Icon size={20} /></div>
      <p className="text-[15px] font-medium" style={{ color: 'var(--p-text)' }}>{title}</p>
      {hint && <p className="text-[13px] mt-1" style={{ color: 'var(--p-text-2)' }}>{hint}</p>}
      {children && <div className="mt-4 flex justify-center">{children}</div>}
    </motion.div>
  );
}

/* ── Loading skeletons ───────────────────────────────────────────────────── */
export function Skeleton({ h = 16, w = '100%', className = '' }) {
  return <div className={`ui-skeleton ${className}`} style={{ height: h, width: w }} />;
}

export function SkeletonList({ rows = 4, h = 64 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, i) => <Skeleton key={i} h={h} />)}
    </div>
  );
}

/* ── Avatar ──────────────────────────────────────────────────────────────── */
export function Avatar({ name, size = 36 }) {
  return (
    <span
      className="flex items-center justify-center rounded-full font-semibold flex-shrink-0"
      style={{
        width: size, height: size,
        background: 'var(--p-accent-soft)',
        color: 'var(--p-accent)',
        border: '1px solid var(--p-accent-line)',
        fontSize: size * 0.4,
      }}
    >
      {name?.[0]?.toUpperCase() || '?'}
    </span>
  );
}

/* ── Relative time, shared by the notification screens ───────────────────── */
export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/* ── Theme toggle ────────────────────────────────────────────────────────── */
/**
 * The panel's one and only theme control. It lives in the top-right corner of
 * every admin screen and nowhere else — there is no theme section in Settings,
 * no per-page override, and no "system" third state to explain. One button,
 * two outcomes, remembered for next time.
 */
export function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`ui-theme-toggle ${className}`}
      title={label}
      aria-label={label}
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

/* ── Page transition ─────────────────────────────────────────────────────── */
/** Wraps a screen's body so every admin page arrives the same way. */
export function PageTransition({ children, className = '' }) {
  const m = useMotion();
  return (
    <motion.div className={className} variants={m.page} initial="hidden" animate="visible">
      {children}
    </motion.div>
  );
}

/** A grid or stack whose children arrive one after another. */
export function Stagger({ children, className = '', ...rest }) {
  const m = useMotion();
  return (
    <motion.div className={className} variants={m.list} initial="hidden" animate="visible" {...rest}>
      {children}
    </motion.div>
  );
}

/** One child of a <Stagger>. */
export function StaggerItem({ children, className = '', ...rest }) {
  const m = useMotion();
  return (
    <motion.div className={className} variants={m.item} {...rest}>
      {children}
    </motion.div>
  );
}

/* ── Stat card ───────────────────────────────────────────────────────────── */
/**
 * One number and what it means. `hint` carries the plain-language explanation
 * so the admin never has to work out what "active" counts.
 */
export function StatCard({ label, value, hint, icon: Icon, tone = 'accent', loading }) {
  const m = useMotion();
  const color = {
    accent: 'var(--p-accent)',
    ok: 'var(--p-ok)',
    warn: 'var(--p-warn)',
    danger: 'var(--p-danger)',
    info: 'var(--p-info)',
  }[tone];
  const soft = {
    accent: 'var(--p-accent-soft)',
    ok: 'var(--p-ok-soft)',
    warn: 'var(--p-warn-soft)',
    danger: 'var(--p-danger-soft)',
    info: 'var(--p-info-soft)',
  }[tone];

  return (
    <motion.div className="ui-card ui-card-pad" variants={m.item} whileHover={m.hover}>
      <div className="flex items-start gap-3">
        {Icon && (
          <span className="ui-stat-icon" style={{ background: soft, color }}>
            <Icon size={19} />
          </span>
        )}
        <div className="min-w-0">
          <p className="text-[13px] font-medium" style={{ color: 'var(--p-text-2)' }}>{label}</p>
          {loading ? (
            <Skeleton h={30} w={72} className="mt-1.5" />
          ) : (
            <p className="text-[30px] font-bold leading-tight mt-0.5" style={{ color: 'var(--p-text)' }}>
              {value}
            </p>
          )}
          {hint && <p className="text-[12px] mt-0.5" style={{ color: 'var(--p-muted)' }}>{hint}</p>}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Table ───────────────────────────────────────────────────────────────── */
/**
 * A table that survives a narrow screen: it scrolls sideways inside its own
 * card rather than forcing the whole page to scroll. `columns` is a plain
 * array so a screen declares its headings once.
 */
export function Table({ columns, children, empty }) {
  if (empty) return empty;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="ui-table">
        <thead>
          <tr>
            {columns.map(c => (
              <th
                key={c.key ?? c.label}
                style={{ width: c.width, textAlign: c.align || 'left' }}
                className={c.hideBelow ? `hidden ${c.hideBelow}:table-cell` : undefined}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

/** A table row that fades in with its list and fades out when removed. */
export function TableRow({ children, ...rest }) {
  const m = useMotion();
  return (
    <motion.tr variants={m.row} initial="hidden" animate="visible" exit="exit" layout={!m.reduce} {...rest}>
      {children}
    </motion.tr>
  );
}

/** A standalone element that fades in on its own, outside any <Stagger>. */
export function FadeIn({ children, delay = 0, className = '', ...rest }) {
  const m = useMotion();
  return (
    <motion.div
      className={className}
      variants={m.item}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export { default as WhatsAppButton } from './WhatsAppButton';
