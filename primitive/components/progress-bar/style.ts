import clsx from "clsx";
import { ProgressColor } from "./type";

export const colors: Record<
  "filler" | "background",
  Record<ProgressColor, string>
> = {
  filler: {
    primary: clsx("bg-brand"),
    success: clsx("bg-green"),
    error: "",
    warning: "",
    colorful: clsx(
      "bg-[linear-gradient(127deg,#FCD116_21.25%,#EAC112_84.35%)]"
    ),
  },
  background: {
    primary: clsx("bg-white-20"),
    success: clsx("bg-white-20"),
    error: "",
    warning: "",
    colorful: clsx("bg-white-20"),
  },
};
