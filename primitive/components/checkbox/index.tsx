import clsx from "clsx";
import { DetailedHTMLProps, HTMLAttributes } from "react";

import { PropsWithClassName } from "../helper";
import { IconCheck, IconRemove } from "../icon";
import { Icon } from "../icon/helper";

type Props = {
  value?: boolean;
  disabled?: boolean;
  variant?: "full" | "intermediate";
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export function Checkbox(props: PropsWithClassName<Props>) {
  const {
    value = false,
    disabled = false,
    variant = "full",
    className,
    ...attributes
  } = props;

  const CheckedIcon: Icon = variant === "full" ? IconCheck : IconRemove;

  return (
    <div
      className={clsx(
        "w-[1em] h-[1em] rounded-[0.125em] flex items-center justify-center relative border-1 cursor-pointer overflow-hidden hover:brightness-125",
        value ? "bg-brand border-0" : "bg-background border-text2",
        "aria-disabled:cursor-not-allowed aria-disabled:opacity-40 aria-disabled:hover:brightness-100",
        className
      )}
      aria-roledescription='checkbox'
      aria-disabled={disabled}
      aria-selected={value}
      {...attributes}
    >
      {value ? (
        <CheckedIcon className='text-[1em] absolute text-background' />
      ) : null}
    </div>
  );
}
