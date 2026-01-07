/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#137fec",
        "background-light": "#f6f7f8",
        "background-dark": "#101922",
        // Verification badge colors
        badge: {
          bronze: "#CD7F32",
          silver: "#A0AEC0",
          gold: "#F6AD55",
          platinum: "#4299E1",
        },
        // Status colors
        status: {
          success: "#48BB78",
          warning: "#ECC94B",
          error: "#F56565",
          info: "#4299E1",
        },
      },
      fontFamily: {
        display: ["Manrope", "Noto Sans", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
}
