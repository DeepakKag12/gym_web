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
      gutter={8}
      containerStyle={{ top: 20, right: 16 }}
      toastOptions={{
        duration: 3500,
        style: {
          background: '#111318',
          color: '#f1f5f9',
          border: '1px solid rgba(34,211,238,0.18)',
          borderRadius: '12px',
          fontSize: '14px',
          padding: '12px 16px',
          maxWidth: '380px',
        },
        success: {
          iconTheme: { primary: '#22d3ee', secondary: '#000' },
        },
        error: {
          iconTheme: { primary: '#f43f5e', secondary: '#fff' },
          style: {
            background: '#111318',
            color: '#f1f5f9',
            border: '1px solid rgba(244,63,94,0.25)',
            borderRadius: '12px',
          },
        },
      }}
    />
    <App />
  </React.StrictMode>
);
