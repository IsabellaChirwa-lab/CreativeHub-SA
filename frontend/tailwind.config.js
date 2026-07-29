/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#14121F",   // gallery-wall background
        paper: "#F7F3E9",    // card / light surface
        marigold: "#F2A93B", // primary accent
        teal: "#1F6F6B",     // secondary accent
        coral: "#E4572E",    // CTA
        muted: "#8B87A0",    // secondary text on dark
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
