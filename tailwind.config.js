/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,json}"],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#edf5ef",
          100: "#d5e5d8",
          300: "#8ab192",
          500: "#3e7555",
          700: "#1f4a3a",
          900: "#10281f"
        },
        stonework: "#7c8176",
        clay: "#b77d55",
        wheat: "#d9c6a3",
        paper: "#f7f4ee",
        charcoal: "#202421"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Arial", "sans-serif"],
        display: ["Manrope", "Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        premium: "0 24px 70px rgba(16, 40, 31, 0.14)",
        lift: "0 18px 45px rgba(32, 36, 33, 0.16)"
      },
      backgroundImage: {
        "surface-grid": "linear-gradient(rgba(16, 40, 31, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 40, 31, 0.04) 1px, transparent 1px)"
      }
    },
  },
  plugins: [],
};
