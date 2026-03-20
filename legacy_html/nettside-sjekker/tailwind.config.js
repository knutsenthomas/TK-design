/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#1B4965', // Mørkeblå fra global_rules
          light: '#62B6CB',
          accent: '#FF9E00',
        }
      }
    },
  },
  plugins: [],
}
