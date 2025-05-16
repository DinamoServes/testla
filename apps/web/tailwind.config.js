module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#60a5fa',
          DEFAULT: '#2563eb',
          dark: '#1e40af',
        },
        background: {
          light: '#f3f4f6',
          DEFAULT: '#1e293b',
          dark: '#0f172a',
        },
      },
    },
  },
  plugins: [],
} 