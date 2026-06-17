/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: '#121212',       // Background
        surface: '#1A1A1A',    // Cards/Panels
        paper: '#F4F0EA',      // Text Primary
        muted: '#888888',      // Text Secondary
        rust: '#C85A40',       // Accent / CTA
        divider: '#2A2A2A',    // Borders
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}