/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        fa: ["'Vazirmatn'", "'Plus Jakarta Sans'", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#0b0f1a",
        panel: "#141b2d",
        panel2: "#1c2540",
        accent: "#6366f1",
        accent2: "#22d3ee",
      },
    },
  },
  plugins: [],
};
