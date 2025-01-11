import clsx from "clsx";
import { PropsWithChildren } from "react";

export function Container({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <section className={clsx("px-64 py-32 mobile:p-16", className)}>
      {children}
    </section>
  );
}
