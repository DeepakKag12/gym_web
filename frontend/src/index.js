import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Toaster } from 'react-hot-toast';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Toaster
      position="top-right"
      toastOptions={{
        style: { background: '#1a1a2e', color: '#fff', border: '1px solid rgba(249,115,22,0.3)' },
        success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
        error: { iconTheme: { primary: '#e94560', secondary: '#fff' } },
      }}
    />
    <App />
  </React.StrictMode>
);
