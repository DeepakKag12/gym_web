/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: ['class', '.dark'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Merriweather', 'serif'],
        mono: ['var(--font-mono)', '"JetBrains Mono"', 'monospace'],
        gym:  ['"Bebas Neue"', 'cursive'],
        display: ['var(--font-serif)', 'Merriweather', 'serif'],
      },
      colors: {
        primary: {
          DEFAULT: 'var(--primary, #6366f1)',
          foreground: 'var(--primary-foreground, #ffffff)',
          hover: 'var(--primary-hover, #4f46e5)',
          active: 'var(--primary-active, #4338ca)',
          light: 'var(--primary-soft, rgba(99, 102, 241, 0.12))',
          dark: 'var(--chart-4, #3730a3)',
        },
        secondary: {
          DEFAULT: 'var(--secondary, #e5e7eb)',
          foreground: 'var(--secondary-foreground, #374151)',
          hover: 'var(--secondary-hover, #d1d5db)',
          soft: 'var(--secondary-soft, #f3f4f6)',
        },
        accent: {
          DEFAULT: 'var(--accent, #e0e7ff)',
          foreground: 'var(--accent-foreground, #374151)',
          hover: 'var(--primary-hover, #4f46e5)',
          soft: 'var(--primary-soft, rgba(99, 102, 241, 0.14))',
        },
        surface: {
          DEFAULT: 'var(--surface, #ffffff)',
          card: 'var(--surface-card, #ffffff)',
          hover: 'var(--surface-hover, #f1f5f9)',
        },

        // ── semantic tokens ──────────────────────────────────────────────
        background: 'var(--background, var(--bg, #f8fafc))',
        foreground: 'var(--foreground, var(--text, #1e293b))',
        card: {
          DEFAULT: 'var(--card, #ffffff)',
          foreground: 'var(--card-foreground, #1e293b)',
        },
        popover: {
          DEFAULT: 'var(--popover, #ffffff)',
          foreground: 'var(--popover-foreground, #1e293b)',
        },
        muted: {
          DEFAULT: 'var(--muted, #f3f4f6)',
          foreground: 'var(--muted-foreground, #6b7280)',
        },
        'muted-foreground': 'var(--muted-foreground, #6b7280)',
        sidebar: {
          DEFAULT: 'var(--sidebar, #f3f4f6)',
          foreground: 'var(--sidebar-foreground, #1e293b)',
          primary: 'var(--sidebar-primary, #6366f1)',
          'primary-foreground': 'var(--sidebar-primary-foreground, #ffffff)',
          accent: 'var(--sidebar-accent, #e0e7ff)',
          'accent-foreground': 'var(--sidebar-accent-foreground, #374151)',
          border: 'var(--sidebar-border, #d1d5db)',
          ring: 'var(--sidebar-ring, #6366f1)',
        },
        chart: {
          1: 'var(--chart-1, #6366f1)',
          2: 'var(--chart-2, #4f46e5)',
          3: 'var(--chart-3, #4338ca)',
          4: 'var(--chart-4, #3730a3)',
          5: 'var(--chart-5, #312e81)',
        },
        input: 'var(--input, var(--border, #d1d5db))',
        border: 'var(--border, #d1d5db)',
        ring: 'var(--ring, #6366f1)',
        destructive: {
          DEFAULT: 'var(--destructive, #ef4444)',
          foreground: 'var(--destructive-foreground, #ffffff)',
        },
        success: '#22c55e',
        warning: '#f59e0b',
      },
      borderRadius: {
        DEFAULT: 'var(--radius, 0.5rem)',
        sm: 'calc(var(--radius, 0.5rem) - 4px)',
        md: 'calc(var(--radius, 0.5rem) - 2px)',
        lg: 'var(--radius, 0.5rem)',
        xl: 'calc(var(--radius, 0.5rem) + 4px)',
        '2xl': 'calc(var(--radius, 0.5rem) + 8px)',
      },
      boxShadow: {
        theme: 'var(--shadow-offset-x, 0px) var(--shadow-offset-y, 4px) var(--shadow-blur, 8px) var(--shadow-spread, -1px) rgba(0, 0, 0, var(--shadow-opacity, 0.1))',
        sm: '0 1px 2px rgba(0, 0, 0, 0.08)',
        md: '0 4px 12px rgba(99, 102, 241, 0.12)',
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
