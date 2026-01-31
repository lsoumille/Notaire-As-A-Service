/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0A2540',
          accent: '#00D9FF',
          accentLight: 'rgba(0, 217, 255, 0.08)',
          light: '#F8F9FA',
          gold: '#b19470'
        }
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      }
    }
  },
  plugins: [],
}
