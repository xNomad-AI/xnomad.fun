import clsx from "clsx";
import { HTMLAttributeAnchorTarget, PropsWithChildren } from "react";

import { TextCommonProps } from ".";
import { PropsWithClassName } from "@/primitive/components";
import Link from "next/link";

export function TextLink({
  className,
  children,
  disabled,
  withDecoration,
  bold,
  medium,
  target,
  ...rest
}: PropsWithClassName<
  PropsWithChildren<
    Parameters<typeof Link>[0] &
      TextCommonProps & { target?: HTMLAttributeAnchorTarget }
  >
>) {
  return (
    <Link
      {...rest}
      target={target}
      className={clsx(
        "border-0 p-0 flex bg-none whitespace-pre cursor-pointer ",
        className,
        {
          "!cursor-not-allowed": disabled,
          "font-medium": medium,
          "font-bold": bold,
          underline: withDecoration,
          "!text-text-secondary": disabled,
          "hover:underline": withDecoration,
        }
      )}
    >
      {children}
    </Link>
  );
}
