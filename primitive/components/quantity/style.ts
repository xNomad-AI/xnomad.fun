import clsx from "clsx";

import { QuantityVariant } from "./type";

export const containerStyle: Record<QuantityVariant, string> = {
  plain: clsx("bg-surface h-40 gap-4 px-16 rounded-full"),
  ghost: clsx("gap-4"),
  solid: clsx("border-1 px-4 rounded-full py-2"),
};

export const iconStyle: Record<QuantityVariant, string> = {
  plain: clsx("aria-disabled:text-text2"),
  ghost: clsx(
    "bg-white-10 text-white overflow-hidden rounded-full p-4 flex items-center justify-center box-content font-bold"
  ),
  solid: clsx("aria-disabled:text-text2"),
};

export const inputStyle: Record<QuantityVariant, string> = {
  plain: clsx("w-40 text-text1"),
  ghost: clsx("w-40 light:text-white"),
  solid: clsx("w-[2em]"),
};
