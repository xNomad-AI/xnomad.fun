import clsx from "clsx";
import { PropsWithChildren } from "react";
import { Step } from "./content";

export function Container({
  value,
  current,
  children,
  className,
}: PropsWithChildren<{ value: Step; current: Step; className?: string }>) {
  return (
    <div
      className={clsx(className, "w-full max-w-[640px] flex flex-col gap-32", {
        hidden: value !== current,
      })}
    >
      {children}
    </div>
  );
}
