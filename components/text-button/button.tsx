import clsx from "clsx";
import { PropsWithChildren } from "react";

import { TextCommonProps } from ".";
import { PropsWithClassName } from "@/primitive/components";

export function TextButton({
  className,
  children,
  disabled,
  withDecoration,
  bold,
  medium,
  ...rest
}: PropsWithClassName<
  PropsWithChildren<
    TextCommonProps &
      React.DetailedHTMLProps<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        HTMLButtonElement
      >
  >
>) {
  return (
    <button
      {...rest}
      className={clsx(
        "border-0 p-0 flex items-center bg-none whitespace-pre cursor-pointer shadow-default",
        className,
        {
          "!cursor-not-allowed": disabled,
          "font-medium": medium,
          "font-bold": bold,
          underline: withDecoration,
          "!text-secondary": disabled,
          "hover:underline": withDecoration,
        }
      )}
    >
      {children}
    </button>
  );
}
