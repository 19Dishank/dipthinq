/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0E0E0F',
        'dark-bg-alt': '#111113',
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(to right, #6366F1, #8B5CF6, #EC4899)',
        'gradient-accent-alt': 'linear-gradient(to right, #06B6D4, #3B82F6)',
      },
      dropShadow: {
        'glow': '0 0 8px rgba(99, 102, 241, 0.5)',
        'glow-lg': '0 0 16px rgba(99, 102, 241, 0.6)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

