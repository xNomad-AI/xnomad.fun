import { useEffect, useMemo, useState } from "react";

import { BaseCalendarProps } from "./base-calendar-props";
import { CalendarController } from "./controller";
import { DoublePanelCalendar } from "./double-panel-calendar";
import { CalendarSelectHandle, CalendarValue, Timestamp } from "./interface";
import { SinglePanelCalendar } from "./single-panel-calendar";

export interface CalendarProps
  extends Partial<
    Pick<
      BaseCalendarProps,
      | "disabledRanges"
      | "increased"
      | "decreased"
      | "titleRender"
      | "maskContent"
    >
  > {
  //  点击以后是单选还是范围选择
  type: "point" | "range";
  // 严格范围选择 开启后 校验开始日期和结束日期存在先后顺序和大小比较
  // 需要使用者自己去更改mode
  // e.g. 如果先选择一个日期作为结束日期那么props传入 end
  // 随后如果需要选择的日期为开始日期，那么需要设置mode state 为start
  // start 代表第一个选中的为开始日期， end相反
  strictRangeMode?: "none" | "start" | "end" | "disabled" | "reset";
  controller: CalendarController;
  panel?: "double" | "single";
  value?: CalendarValue;
  onChange?: CalendarSelectHandle;
  withTimeSelect?: boolean;
}

export function Calendar(props: CalendarProps) {
  const {
    type = "point",
    disabledRanges: externalDisabledRanges = [],
    controller,
    strictRangeMode = "none",
    increased = "both",
    decreased = "both",
    panel = "single",
    titleRender,
    value: _value,
    onChange,
    maskContent = null,
    withTimeSelect,
  } = props;

  if (_value) {
    controller.value = _value;
  }

  if (onChange) {
    controller.changeValue = onChange;
  }

  const {
    year,
    month,
    value,
    locale,
    increaseMonth,
    increaseYear,
    decreaseMonth,
    decreaseYear,
    changeValue,
  } = controller;

  const isPointType = type === "point";

  const [start, end] = value;

  const internalDisabledRanges = useMemo<number[][]>(() => {
    switch (strictRangeMode) {
      case "none":
      case "reset":
        return [];
      case "start":
        return [end ? [end + 1, Infinity] : []];
      case "end":
        return [start ? [0, start - 1] : []];
      case "disabled":
      default:
        return [start ? [0, start - 1] : [], end ? [end + 1, Infinity] : []];
    }
  }, [strictRangeMode, start, end]);

  const disabledRanges = externalDisabledRanges.concat(internalDisabledRanges);

  const [hoverDate, setHoverDate] = useState<Timestamp>(null);

  const handleSelect = (ts: number) => {
    if (isPointType) {
      if (start === end && start === ts) {
        changeValue(value);
      } else {
        changeValue([ts, ts]);
      }
    } else if (strictRangeMode === "reset") {
      if (start && !end) {
        changeValue([start, ts]);
      } else {
        changeValue([ts, null]);
      }
    } else if (strictRangeMode === "none") {
      if (!start && !end) {
        changeValue([ts, null]);
      } else if (start && !end) {
        changeValue([start, ts]);
      } else if (end && !start) {
        changeValue([ts, end]);
      } else if (ts === start && ts === end) {
        changeValue([null, null]);
      } else if (ts === start && end) {
        changeValue([null, end]);
      } else if (ts === end && start) {
        changeValue([start, null]);
      } else if (start && end) {
        if (ts < end) {
          changeValue([ts, end]);
        } else {
          changeValue([start, ts]);
        }
      }
    } else if (strictRangeMode === "start") {
      changeValue([ts, end]);
    } else if (strictRangeMode === "end") {
      changeValue([start, ts]);
    }
  };

  const handleRangeCovered = (ts: Timestamp) =>
    isPointType ? null : setHoverDate(ts);

  const coveredRanges = useMemo(() => {
    const array = [value, hoverDate];

    const num = array
      .flatMap((item) => item)
      .filter((item) => Boolean(item) && item !== null) as number[];

    const start: Timestamp = num.length === 0 ? null : Math.min(...num);

    const end: Timestamp = num.length === 0 ? null : Math.max(...num);

    return [start, end];
  }, [value, hoverDate]);

  const baseCalendarProps: BaseCalendarProps = {
    year,
    month,
    onMonthDecreased: decreaseMonth,
    onMonthIncreased: increaseMonth,
    onRangeCovered: handleRangeCovered,
    onYearDecreased: decreaseYear,
    onYearIncreased: increaseYear,
    coveredRanges,
    disabledRanges,
    decreased,
    increased,
    selected: value,
    titleRender,
    onClick: handleSelect,
    locale,
    maskContent,
    withTimeSelect,
  };

  useEffect(() => {
    if (isPointType) {
      setHoverDate(null);
    }
  }, [isPointType]);

  return panel === "double" ? (
    <DoublePanelCalendar {...baseCalendarProps} />
  ) : (
    <SinglePanelCalendar {...baseCalendarProps} />
  );
}
