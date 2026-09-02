import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';

/**
 * The site's only theme control.
 *
 * Two choices, light and dark — nothing else. One preference covers the whole
 * app: the public marketing pages and the admin panel. It is stored in
 * localStorage so it survives a refresh, a new tab and a sign-out, and it is
 * read back by the inline script in public/index.html before React mounts so
 * nothing ever flashes the wrong colour on load.
 *
 * Both `theme-light` and `theme-dark` are written explicitly rather than
 * treating "no class" as one of them, because the two areas have opposite
 * natural defaults — the marketing site is dark, the panel is light — and an
 * absent class would mean different things in each.
 *
 *   src/styles/theme.css  reads them for the public pages
 *   src/styles/panel.css  reads them for the admin panel
 *
 * Both files only swap CSS variable values, so every screen follows.
 */

export const THEME_KEY = 'fn-panel-theme';

const ThemeContext = createContext(null);

/**
 * Reads the stored choice, defaulting to light.
 *
 * Once a visitor picks a side it is remembered, so this only decides the very
 * first visit.
 */
export function readStoredTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    /* Safari private mode throws on localStorage — fall through to the default. */
  }
  return 'light';
}

function applyTheme(theme) {
  const dark = theme === 'dark';
  [document.documentElement, document.body].forEach(el => {
    el.classList.toggle('theme-dark', dark);
    el.classList.toggle('theme-light', !dark);
  });
  // Keeps the mobile browser chrome (status bar, address bar) in step.
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', dark ? '#0a0b0d' : '#fbfaf9');
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readStoredTheme);

  // Apply on mount and whenever the choice changes.
  useEffect(() => { applyTheme(theme); }, [theme]);

  const setTheme = useCallback(next => {
    setThemeState(prev => {
      if (prev === next) return prev;
      try { localStorage.setItem(THEME_KEY, next); } catch { /* not fatal */ }

      // Cross-fade the surfaces for the length of the switch only, so we are
      // not paying for a transition on every element for the whole session.
      const { body } = document;
      body.classList.add('theme-switching');
      window.setTimeout(() => body.classList.remove('theme-switching'), 320);

      return next;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(readStoredThemeFrom(document) === 'dark' ? 'light' : 'dark');
  }, [setTheme]);

  const value = useMemo(
    () => ({ theme, isDark: theme === 'dark', setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Current theme straight off the DOM — avoids a stale closure in the toggle. */
function readStoredThemeFrom(doc) {
  return doc.documentElement.classList.contains('theme-dark') ? 'dark' : 'light';
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
