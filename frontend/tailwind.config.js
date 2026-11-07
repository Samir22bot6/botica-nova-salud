/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#059669',
          hover: '#047857',
          light: '#ecfdf5',
        },
      },
    },
  },
  plugins: [],
}
