import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

/**
 * Shared shell for the member area, so every member screen has the same
 * width, spacing and heading treatment instead of each page inventing its own.
 * Top padding clears the fixed navbar; bottom padding clears the mobile tab bar.
 */
export default function MemberPage({ title, subtitle, backTo, actions, width = 'max-w-4xl', children }) {
  return (
    <div className="min-h-screen pt-16 sm:pt-20 pb-24 lg:pb-10" style={{ background: 'var(--p-bg)' }}>
      <div className={`${width} mx-auto px-4 sm:px-6 py-6`}>
        {(title || actions) && (
          <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
            <div className="min-w-0">
              {backTo && (
                <Link
                  to={backTo}
                  className="inline-flex items-center gap-1 text-[13px] mb-1"
                  style={{ color: 'var(--p-text-2)' }}
                >
                  <ChevronLeft size={15} /> Back
                </Link>
              )}
              <h1 className="ui-page-title">{title}</h1>
              {subtitle && <p className="ui-page-sub">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
