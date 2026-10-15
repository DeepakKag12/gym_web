/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        gym:  ['"Bebas Neue"', 'cursive'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      colors: {
        primary: {
          DEFAULT: 'var(--primary, #16a34a)',
          hover: 'var(--primary-hover, #15803d)',
          active: 'var(--primary-active, #166534)',
          light: 'var(--primary-soft, rgba(22, 163, 74, 0.12))',
          dark: '#14532d',
        },
        secondary: {
          DEFAULT: 'var(--secondary, #1f242e)',
          hover: 'var(--secondary-hover, #28303d)',
          soft: 'var(--secondary-soft, #171b24)',
        },
        accent: {
          DEFAULT: 'var(--accent, #16a34a)',
          hover: 'var(--accent-hover, #15803d)',
          soft: 'var(--accent-soft, rgba(22, 163, 74, 0.14))',
        },
        surface: {
          DEFAULT: 'var(--surface, #12151c)',
          card: 'var(--surface-card, #171b24)',
          hover: 'var(--surface-hover, #1d222e)',
        },

        // ── semantic tokens ──────────────────────────────────────────────
        background: 'var(--bg)',
        foreground: 'var(--text)',
        'muted-foreground': 'var(--muted2)',
        input: 'var(--border)',
        ring: 'var(--primary, #16a34a)',
        destructive: '#ef4444',
        success: '#22c55e',
        warning: '#f59e0b',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.25)',
        md: '0 4px 12px rgba(0, 0, 0, 0.35)',
        flat: '0 0 0 1px var(--border)',
      },
      backgroundOpacity: {
        '4':  '0.04',
        '7':  '0.07',
        '8':  '0.08',
      },
      aspectRatio: {
        '16/10': '16 / 10',
        '16/11': '16 / 11',
      },
    },
  },
  plugins: [],
};
