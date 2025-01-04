import { Config } from "tailwindcss";
import { ResolvableTo } from "tailwindcss/types/config";

export const borderColor: ResolvableTo<Config> = ({ theme }) => ({
  DEFAULT: theme("colors.dividing", "currentColor"),
  ...theme("colors"),
});

export const borderWidth: ResolvableTo<Config> = ({ theme }) => ({
  DEFAULT: theme("spacing.1"),
  ...theme("spacing"),
});

export const borderRadius = {
  none: "0px",
  px: "1px",
  2: "0.125rem",
  4: "0.25rem",
  6: "0.375rem",
  8: "0.5rem",
  10: "0.625rem",
  12: "0.75rem",
  14: "0.875rem",
  16: "1rem",
  18: "1.125rem",
  20: "1.25rem",
  22: "1.375rem",
  24: "1.5rem",
  full: "9999px",
};
