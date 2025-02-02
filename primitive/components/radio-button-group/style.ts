import clsx from "clsx";
import { RadioButtonVariant } from "./context";

const container: Record<RadioButtonVariant, string> = {
  normal: clsx("bg-transparent"),
  reverse: clsx("bg-transparent"),
};

const item: Record<RadioButtonVariant, string> = {
  normal: clsx("bg-white shadow-base"),
  reverse: clsx("bg-white shadow-base"),
};

export const style = {
  container,
  item,
};
