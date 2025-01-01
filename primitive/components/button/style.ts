import clsx from "clsx";

import { ButtonSize, ButtonVariant } from "./type";

type Style = {
  size: Record<ButtonSize, string>;
  rounded: Record<ButtonSize, string>;
  variant: Record<ButtonVariant, string>;
};

export const style: Style = {
  size: {
    l: clsx("h-48 px-36 text-size-16"),
    m: clsx("h-40 px-24 text-size-14"),
    s: clsx("h-32 px-16 text-size-12"),
    xs: clsx("h-24 px-8 text-size-12 overflow-visible"),
  },
  rounded: {
    l: clsx("rounded-8"),
    m: clsx("rounded-6"),
    s: clsx("rounded-4"),
    xs: clsx("rounded-2"),
  },
  variant: {
    primary: clsx("text-background bg-default-gradient"),
    secondary: clsx("text-text1 bg-surface"),
    warning: clsx("text-red bg-red-10"),
    plain: clsx("text-text1 bg-surface"),
    ghost: clsx("backdrop-blur"),
    danger: clsx("bg-red text-white"),
    text: clsx("bg-transparent text-text1"),
    default: clsx("bg-surface box-border border-1"),
    solid: clsx(
      "bg-background text-text1 border-1 box-border border-brand hover:bg-brand hover:text-background"
    ),
  },
};
