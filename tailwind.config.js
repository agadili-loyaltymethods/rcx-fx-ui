/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/src/**/*.{js,jsx,ts,tsx}",
    "./index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a237e',
        secondary: '#0d1757',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}