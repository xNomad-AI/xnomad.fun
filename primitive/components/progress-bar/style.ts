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
      "bg-[linear-gradient(167deg,#00EF8B_23.63%,#BFFA52_85.18%)]"
    ),
  },
  background: {
    primary: clsx("bg-dividing"),
    success: clsx("bg-green-20"),
    error: "",
    warning: "",
    colorful: clsx("bg-[#F8FBF8]"),
  },
};
