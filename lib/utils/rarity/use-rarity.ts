import clsx from "clsx";
import { useMemo } from "react";

import { RarityDisplay, RarityItemProps } from "./type";

export function useRarity(option: RarityItemProps) {
  const { rank, total } = option;

  const styled = useMemo<Omit<RarityDisplay, "name" | "icon">>(() => {
    if (total === Infinity) {
      return {
        className: clsx("text-text1"),
        percent: "50%",
        isBottom: false,
        original: false,
      };
    }
    const isTop = (top: number) => rank <= Math.ceil(total * top);
    if (isTop(0.01)) {
      return {
        className: clsx("text-yellow"),
        percent: "1%",
        isBottom: false,
        original: true,
      };
    } else if (isTop(0.05)) {
      return {
        className: clsx("text-purple"),
        percent: "5%",
        isBottom: false,
        original: true,
      };
    } else if (isTop(0.1)) {
      return {
        className: clsx("text-blue"),
        percent: "10%",
        isBottom: false,
        original: true,
      };
    } else if (isTop(0.2)) {
      return {
        className: clsx("text-text1"),
        percent: "20%",
        isBottom: false,
        original: false,
      };
    } else if (isTop(0.3)) {
      return {
        percent: "30%",
        isBottom: false,
        className: clsx("text-text1"),
        original: false,
      };
    } else if (isTop(0.4)) {
      return {
        percent: "40%",
        isBottom: false,
        className: clsx("text-text1"),
        original: false,
      };
    } else if (isTop(0.5)) {
      return {
        className: clsx("text-text1"),
        percent: "50%",
        isBottom: false,
        original: false,
      };
    } else {
      return {
        className: clsx("text-text2"),
        isBottom: true,
        percent: "50%",
        original: false,
      };
    }
  }, [rank, total]);

  return useMemo(() => ({ ...styled }), [styled]);

  /**
   * original = false 的时候，表示在tooltip中用白色替代
   */
}
