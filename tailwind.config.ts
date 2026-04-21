import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/context/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FDFBF7",
        spark: {
          50: "#EFF7FF",
          100: "#DCEBFF",
          200: "#B5D3FF",
          300: "#7FB2FF",
          400: "#3D8BFF",
          500: "#1F6FEB", // electric blue accent
          600: "#1656C4",
          700: "#12469F",
        },
        sun: {
          100: "#FFF6C2",
          200: "#FFEC8A",
          300: "#FFDF4F",
          400: "#FFCF1A", // bright yellow accent
          500: "#EAB500",
        },
      },
      fontFamily: {
        sans: [
          "ui-rounded",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(31, 111, 235, 0.25)",
        glass:
          "0 1px 0 rgba(255,255,255,0.6) inset, 0 8px 24px -12px rgba(31,111,235,0.18)",
      },
      backdropBlur: {
        xs: "3px",
      },
      keyframes: {
        pop: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "60%": { transform: "scale(1.05)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        sparkle: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-4px) rotate(6deg)" },
        },
      },
      animation: {
        pop: "pop 220ms ease-out",
        sparkle: "sparkle 2.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
