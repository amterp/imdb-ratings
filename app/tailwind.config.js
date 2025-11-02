/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern dark theme colors
        'dark-bg': '#0f172a', // slate-900
        'dark-bg-secondary': '#1e293b', // slate-800
        'dark-surface': '#334155', // slate-700
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
