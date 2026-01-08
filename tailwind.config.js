/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kai: {
          blue: '#005DAA',     // Biru Utama KAI
          orange: '#F26522',   // Oranye
          gray: '#F5F5F5',     // Background
        },
        status: {
          green: '#D1FAE5',    // Badge Selesai (Bg)
          greenText: '#065F46',// Badge Selesai (Text)
          red: '#FEE2E2',      // Badge Belum (Bg)
          redText: '#991B1B',  // Badge Belum (Text)
        }
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      }
    },
  },
  plugins: [],
}