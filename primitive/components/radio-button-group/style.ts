import clsx from "clsx";
import { RadioButtonVariant } from "./context";

const container: Record<RadioButtonVariant, string> = {
  normal: clsx("bg-transparent"),
  reverse: clsx("bg-transparent"),
};

const item: Record<RadioButtonVariant, string> = {
  normal: clsx("bg-background shadow-base"),
  reverse: clsx("bg-background shadow-base"),
};

export const style = {
  container,
  item,
};
