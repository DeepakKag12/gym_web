import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/theme.css';   // public palette + light-mode compat
import './styles/panel.css';  // admin panel palette
import App from './App';
import { Toaster } from 'react-hot-toast';

/**
 * Toasts read their colours from the panel tokens, so they follow the light /
 * dark switch like everything else instead of staying dark on a light page.
 * Outside the panel (the dark marketing pages) the tokens resolve to their
 * light defaults, which still sits correctly on those screens.
 */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Toaster
      position="top-right"
      gutter={8}
      containerStyle={{ top: 20, right: 16 }}
      toastOptions={{
        duration: 3500,
        style: {
          background: 'var(--p-text)',
          color: 'var(--p-surface)',
          border: 'none',
          borderRadius: '10px',
          fontSize: '14px',
          padding: '12px 16px',
          maxWidth: '380px',
          boxShadow: 'var(--p-shadow-lg)',
        },
        success: {
          iconTheme: { primary: 'var(--p-ok)', secondary: 'var(--p-surface)' },
        },
        error: {
          duration: 5000,
          iconTheme: { primary: 'var(--p-danger)', secondary: 'var(--p-surface)' },
        },
      }}
    />
    <App />
  </React.StrictMode>
);
