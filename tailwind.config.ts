import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: "#2DD4A7",
          dark: "#1BA882",
          bg: "#EAF8F3",
        },
        // archive-ink system, CSS variables so light/dark swap everywhere
        ink: {
          DEFAULT: "rgb(var(--c-ink) / <alpha-value>)",
          deep: "rgb(var(--c-ink-deep) / <alpha-value>)",
          wash: "rgb(var(--c-ink-wash) / <alpha-value>)",
          black: "rgb(var(--c-ink-black) / <alpha-value>)",
          charcoal: "rgb(var(--c-ink-charcoal) / <alpha-value>)",
        },
        gray: {
          DEFAULT: "rgb(var(--c-gray) / <alpha-value>)",
          light: "rgb(var(--c-gray-light) / <alpha-value>)",
        },
        rule: "rgb(var(--c-rule) / <alpha-value>)",
        paper: "rgb(var(--c-paper) / <alpha-value>)",
        // confidence label palette
        confidence: {
          high: "#2DD4A7",
          medium: "#F59E0B",
          low: "#F97316",
          unverified: "#EF4444",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      maxWidth: {
        prose: "68ch",
        editorial: "1240px",
      },
      letterSpacing: {
        label: "0.14em",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 1.1s ease both",
      },
    },
  },
  plugins: [typography],
};

export default config;
