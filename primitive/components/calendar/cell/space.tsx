import clsx from "clsx";
import { PropsWithChildren, useMemo } from "react";

export interface CalendarSpaceProps {
  covered?: boolean;
  deep?: boolean;
}
export function CalendarSpace(props: PropsWithChildren<CalendarSpaceProps>) {
  const { covered = false, deep = false } = props;
  const bg = useMemo(() => {
    if (covered) {
      if (deep) {
        return clsx("bg-brand-20");
      }
      return clsx("bg-brand-10");
    }
    return "bg-transparent";
  }, [covered, deep]);
  return <div className={clsx("w-10 h-24", bg)}>{props.children}</div>;
}
