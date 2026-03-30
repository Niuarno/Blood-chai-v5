import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Hind Siliguri", "sans-serif"],
      },
      colors: {
        primary: {
          50:  "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
          950: "#450a0a",
        },
        blood: {
          dark:    "#7f0000",
          DEFAULT: "#c62828",
          light:   "#ff5f52",
        },
        surface: {
          DEFAULT: "#0f0a0a",
          card:    "#1a0f0f",
          border:  "#2d1515",
        },
      },
      backgroundImage: {
        "gradient-hero": "linear-gradient(135deg, #0f0a0a 0%, #1a0000 50%, #0f0a0a 100%)",
        "gradient-card": "linear-gradient(145deg, #1a0f0f, #0f0a0a)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "slide-up": "slideUp 0.5s ease-out",
        "fade-in": "fadeIn 0.6s ease-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px #c62828, 0 0 10px #c62828" },
          "100%": { boxShadow: "0 0 20px #c62828, 0 0 40px #c62828, 0 0 60px #7f0000" },
        },
        slideUp: {
          "0%": { transform: "translateY(30px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
