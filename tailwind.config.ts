import {
  fontSize,
  lineHeight,
  palette as colors,
  spacing,
  borderRadius,
  borderColor,
  borderWidth,
  screens,
  dark,
  light,
  fontFamily,
  zIndex,
  scrollbarPlugin,
  borderPlugin,
} from "./theme";
import type { Config } from "tailwindcss";
import { createThemes } from "tw-colors";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./primitive/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    colors: {
      ...colors,
      "color-1": "hsl(var(--color-1))",
      "color-2": "hsl(var(--color-2))",
      "color-3": "hsl(var(--color-3))",
      "color-4": "hsl(var(--color-4))",
      "color-5": "hsl(var(--color-5))",
    },
    spacing,
    fontSize,
    lineHeight,
    borderRadius,
    borderColor,
    borderWidth,
    screens,
    fontFamily,
    zIndex,
    boxShadow: {
      default: "2px 12px 64px 0px #0000000A",
    },
    extend: {
      backgroundImage: {
        "default-gradient":
          "linear-gradient(167deg,#00EF8B 23.63%,#BFFA52 85.18%)", // 自定义渐变
      },
      animation: {
        rainbow: "rainbow var(--speed, 2s) infinite linear",
        marquee: "marquee var(--duration) linear infinite",
        "marquee-vertical": "marquee-vertical var(--duration) linear infinite",
      },
      keyframes: {
        rainbow: {
          "0%": { "background-position": "0%" },
          "100%": { "background-position": "200%" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap)))" },
        },
        "marquee-vertical": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(calc(-100% - var(--gap)))" },
        },
      },
    },
  },
  prefix: "",
  plugins: [
    createThemes({
      dark,
      light,
    }),
    scrollbarPlugin,
    borderPlugin,
  ],
};
export default config;
