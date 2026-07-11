/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        gym:  ['"Bebas Neue"', 'cursive'],
      },
      colors: {
        primary: '#22d3ee',
        secondary: '#0b0c0e',
        accent:  '#818cf8',
      },
      backgroundOpacity: {
        '4':  '0.04',
        '7':  '0.07',
        '8':  '0.08',
      },
    },
  },
  plugins: [],
};
