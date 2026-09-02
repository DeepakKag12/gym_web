/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        gym:  ['"Bebas Neue"', 'cursive'],
        // Used by shadcn-style components. No webfont is loaded for this —
        // it falls back to the platform serif, which is enough for the one
        // component that asks for it.
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
      colors: {
        primary: '#22d3ee',
        secondary: '#0b0c0e',
        accent:  '#818cf8',

        // ── shadcn-style semantic tokens ──────────────────────────────────
        // Pointed at the CSS variables this project already defines in
        // index.css. src/styles/panel.css re-points those same variables for
        // the admin panel, so a component written against `bg-background`
        // follows the light/dark switch with no extra work.
        background: 'var(--bg)',
        foreground: 'var(--text)',
        'muted-foreground': 'var(--muted2)',
        input: 'var(--border)',
        ring: 'var(--cyan)',
        destructive: '#ef4444',
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
