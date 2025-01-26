import clsx from "clsx";
import { PropsWithChildren } from "react";

import { TextCommonProps } from ".";
import { PropsWithClassName } from "@/primitive/components";

export function TextAnchor({
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
        React.AnchorHTMLAttributes<HTMLAnchorElement>,
        HTMLAnchorElement
      >
  >
>) {
  return (
    <a
      {...rest}
      target='_blank'
      className={clsx(
        "border-0 p-0 flex bg-none whitespace-pre cursor-pointer ",
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
    </a>
  );
}
