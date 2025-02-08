import clsx from "clsx";
import React, { createElement, ReactNode } from "react";

type Props<T extends keyof React.JSX.IntrinsicElements> = {
  as?: T;
  disabled?: boolean;
  static?: boolean;
  /**
   * @deprecated
   */
  maskType?: "white" | "black";
  /**
   * @deprecated
   */
  maskClassName?: string;
  /**
   * @deprecated
   */
  active?: boolean;
} & React.JSX.IntrinsicElements[T];

// 只管理hover和disabled的状态
export function InteractiveBox<T extends keyof React.JSX.IntrinsicElements>(
  props: Props<T>
) {
  const {
    as = "div",
    children,
    disabled,
    static: isStatic = false,
    className,
    maskClassName,
    active,
    ...raw
  } = props;

  return createElement(
    as,
    {
      ...raw,
      className: clsx(
        "cursor-pointer",
        disabled && !isStatic
          ? "aria-disabled:cursor-not-allowed aria-disabled:opacity-40"
          : "",
        isStatic ? "" : "hover:brightness-[0.94] transition-[filter]",
        className
      ),
    },
    children as ReactNode
  );
}
