import clsx from "clsx";

import { TabVariant } from "./type";

type Style = {
  variant: Record<TabVariant, string>;
};

export const style: Style = {
  variant: {
    text: clsx(
      "text-text2 hover:text-text1",
      "aria-selected:text-brand aria-selected:text-underlined"
    ),
    button: clsx(
      "text-size-14 font-bold text-text2 px-24 rounded-6 hover:text-text1",
      "aria-selected:text-brand aria-selected:bg-surface",
      "aria-disabled:cursor-not-allowed"
    ),
    slider: clsx("text-text2 hover:text-brand", "aria-selected:text-brand"),
  },
};
