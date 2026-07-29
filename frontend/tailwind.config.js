/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#070809",   // ultra-dark canvas
        paper: "#F8F9FA",    // bright accent surface
        charcoal: "#202528", // deep card tone
        white: "#F8F9FA",    // text and highlights
        zing: "#E7E7E7",     // softer white
        accent: "#FFFFFF",   // active CTA
        muted: "#A3A7AD",    // softer grey text
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
