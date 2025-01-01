/**
 * calendar的每个单元格
 */
import clsx from "clsx";
import { PropsWithChildren, useMemo } from "react";

export type CalendarCellContentRangePosition =
  | "start"
  | "end"
  | "center"
  | "none"
  | "start-end";

export interface CalendarCellContentProps {
  titled?: boolean;
  disabled?: boolean;
  selected?: boolean;
  today?: boolean;
  rangePosition?: CalendarCellContentRangePosition;
  deep?: boolean;
}

export function CalendarCellContent(
  props: PropsWithChildren<CalendarCellContentProps>
) {
  const {
    titled,
    selected,
    today,
    rangePosition = "none",
    disabled,
    deep = false,
  } = props;
  const isRangeEnd = rangePosition === "end";
  const isRangeStart = rangePosition === "start";
  const isRangeCenter = rangePosition === "center";
  const notInRange = rangePosition === "none";

  const radius = useMemo(() => {
    if (isRangeEnd) {
      return clsx("rounded-e-4");
    }

    if (isRangeStart) {
      return clsx("rounded-s-4");
    }

    if (isRangeCenter) {
      return clsx("rounded-none");
    }

    return clsx("rounded-4");
  }, [isRangeCenter, isRangeEnd, isRangeStart]);

  const color = useMemo(() => {
    if (disabled) {
      return clsx("text-text2-80");
    }
    if (titled) {
      return clsx("text-text2");
    }
    if (selected) {
      return clsx("text-background");
    }

    return clsx("text-text1");
  }, [disabled, selected, titled]);

  const bg = useMemo(() => {
    if (selected) {
      return clsx("bg-brand");
    }
    if (notInRange || disabled) {
      return clsx("bg-transparent");
    }

    if (deep) {
      return clsx("bg-brand-20");
    }
    return clsx("bg-brand-10");
  }, [deep, disabled, notInRange, selected]);

  return (
    <div
      className={clsx(
        "w-24 h-24 select-none relative flex items-center justify-center",
        radius,
        color,
        bg,
        disabled || titled ? "cursor-default" : "cursor-pointer",
        !disabled && !selected && notInRange && !titled && "hover:bg-brand-10"
      )}
    >
      {props.children}
      {today ? (
        <div className='absolute w-4 h-4 rounded-full left-0 right-0 mx-auto -bottom-4 bg-brand'></div>
      ) : null}
    </div>
  );
}
