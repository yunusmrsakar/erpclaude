import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        shell: {
          DEFAULT: "#354A5F",
          hover: "#2C3E50",
          dark: "#1A2B42",
        },
        fiori: {
          blue: "#0A6ED1",
          "blue-hover": "#0854A0",
          green: "#107E3E",
          orange: "#E9730C",
          red: "#BB0000",
          neutral: "#6A6D70",
          light: "#F5F6F7",
          card: "#FFFFFF",
          border: "#E5E5E5",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ['"72"', "Arial", "Helvetica", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
