import { useMemo } from "react";

import { CalendarUtils } from "./calendar-utils";
import { CalendarCell } from "./cell";
import { CalendarHeader } from "./header";
import { Timestamp } from "./interface";
import { TimeSelectPanel } from "./time-select-panel";

export interface CalendarPanelProps {
  year: number;
  month: number;
  today?: boolean;
  locale?: boolean;
  selected?: Timestamp[];
  onClick?: (timestamp: number) => void;
  onRangeCovered?: (timestamp: Timestamp) => void;
  coveredRanges?: Timestamp[];
  disabledRanges?: Array<number[] | number>;
}

export function CalendarPenal(props: CalendarPanelProps) {
  const {
    year,
    month,
    today = false,
    selected = [],
    onClick,
    onRangeCovered,
    coveredRanges = [],
    disabledRanges = [],
    locale = false,
  } = props;

  const [start = null, end = null] = coveredRanges;

  // 通过year 和 month 计算出面板的展示数组
  const dateArray = useMemo(
    () => CalendarUtils.generatePanelMetadata(year, month, locale),
    [year, month, locale]
  );

  const thisDay = useMemo(() => CalendarUtils.thisDay(locale), [locale]);

  const ranges = useMemo(() => {
    if (
      disabledRanges.length === 2 &&
      disabledRanges.every((item) => typeof item === "number")
    ) {
      return [disabledRanges] as number[][];
    }
    return disabledRanges.filter(
      (item) => typeof item !== "number"
    ) as number[][];
  }, [disabledRanges]);

  const inDisabledRange = (ts: number) =>
    ranges.some(([start, end]) => ts >= start && ts <= end);

  return (
    <div className='text-size-14'>
      <div
        className='w-[14.25rem] flex flex-wrap -my-5'
        onMouseLeave={() => onRangeCovered?.(null)}
      >
        <CalendarHeader />
        {dateArray.map((meta, index) => (
          <CalendarCell
            key={meta.timestamp}
            meta={meta}
            position={index}
            today={today && meta.active && meta.timestamp === thisDay}
            disabled={!meta.active || inDisabledRange(meta.timestamp)}
            selected={meta.active && selected.includes(meta.timestamp)}
            onClick={onClick}
            onHover={onRangeCovered}
            start={start}
            end={end}
          />
        ))}
      </div>
    </div>
  );
}
