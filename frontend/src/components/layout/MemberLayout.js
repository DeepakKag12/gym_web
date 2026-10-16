import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

/**
 * MemberLayout
 * Shared shell for the member area, ensuring standard layout, responsive
 * width, uniform page headers, and clearance for fixed top navbar and mobile tab bar.
 */
export default function MemberLayout({ title, subtitle, backTo, actions, width = 'max-w-4xl', children }) {
  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] lg:pb-10 bg-[#f8fafc] dark:bg-[#070b14] text-slate-900 dark:text-slate-100 selection:bg-[#3365e2] selection:text-white">
      <div className={`${width} mx-auto px-3.5 sm:px-6 py-4 sm:py-6`}>
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

export { MemberLayout as MemberPage };
