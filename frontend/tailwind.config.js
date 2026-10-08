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
          DEFAULT: 'var(--primary, #176b45)',
          hover: 'var(--primary-hover, #125638)',
          active: 'var(--primary-active, #0e442c)',
          light: 'var(--primary-soft, rgba(23, 107, 69, 0.12))',
          dark: '#0e442c',
        },
        secondary: 'var(--secondary, #2c2523)',
        accent:  'var(--accent, #10b981)',

        // ── shadcn-style semantic tokens ──────────────────────────────────
        // Pointed at the CSS variables this project already defines in
        // index.css and theme.css. src/styles/panel.css re-points those same
        // variables for the admin panel.
        background: 'var(--bg)',
        foreground: 'var(--text)',
        'muted-foreground': 'var(--muted2)',
        input: 'var(--border)',
        ring: 'var(--primary, #16a34a)',
        destructive: '#dc2626',
      },
      backgroundOpacity: {
        '4':  '0.04',
        '7':  '0.07',
        '8':  '0.08',
      },
      aspectRatio: {
        // Tailwind v4 writes these as `aspect-16/10`; on v3 they have to be
        // declared. Named here so the ported component reads the same as the
        // original instead of being littered with arbitrary values.
        '16/10': '16 / 10',
        '16/11': '16 / 11',
      },
    },
  },
  plugins: [],
};
