import clsx from "clsx";

export type TextFieldVariant = "normal" | "error" | "warning";

export const style: Record<TextFieldVariant, string> = {
  normal: clsx("border-surface focus-within:border-white-40"),
  error: clsx("border-red"),
  warning: clsx("border-yellow"),
};
