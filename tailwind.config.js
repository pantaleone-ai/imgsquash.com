/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        }
      },
      animation: {
        'slide-in': 'slide-in 0.25s ease-out',
      }
    },
  },
  darkMode: 'media', // Enables dark mode based on system preference
  plugins: [],
};