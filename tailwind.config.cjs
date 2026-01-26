/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0F2A44',
          primaryHover: '#123A5F',
          secondary: '#C9A24D',
          secondaryHover: '#B28E3F',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F7F9FC',
        },
        text: {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#64748B',
          inverse: '#FFFFFF',
        },
      },
    },
  },
  plugins: [],
};
