/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./**/*.tsx",
    "./**/*.ts",
    "!node_modules/**/*",
    "!dist/**/*"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0A2540',
          accent: '#00D9FF',
          accentLight: 'rgba(0, 217, 255, 0.08)',
          light: '#F8F9FA',
          gold: '#b19470',
          goldLight: '#d4b896',
          cream: '#faf8f5'
        }
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      }
    }
  },
  plugins: []
}
