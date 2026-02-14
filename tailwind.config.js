/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7', // Bright Mint
          400: '#34d399', 
          500: '#10b981', // Standard Green
          600: '#059669', // Emerald
          700: '#047857', // Deep Emerald
          800: '#065f46',
          900: '#064e3b', // Very Dark Emerald
          950: '#022c22',
        },
        sand: {
          50: '#fdfbf7', // Warm Cream Background
          100: '#f7f3e8',
          200: '#efe6d0',
          300: '#e3d2aa', // Light Gold
          400: '#d4af37', // Metallic Gold
          500: '#b4942b',
          600: '#947621',
          700: '#755b1b', // Bronze
          800: '#604a1b',
          900: '#513d1b',
        }
      },
      fontFamily: {
        serif: ['Amiri', 'serif'], // Use Amiri for headings too for elegance
        sans: ['Inter', 'sans-serif'], // Clean modern sans for UI
      }
    },
  },
  plugins: [],
};
