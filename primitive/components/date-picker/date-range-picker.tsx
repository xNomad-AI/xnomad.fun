import clsx from "clsx";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  Calendar,
  CalendarProps,
  Timestamp,
  useCalendarController,
} from "../calendar";
import { Dropdown, DropdownController } from "../dropdown";
import { IconArrowForwardright, IconClose, IconDateRange } from "../icon";
import { formatDate } from "./utils";
import { Hour, Minute, TimeSelectPanel } from "../calendar/time-select-panel";

export type DateRangePickerProps = Pick<
  CalendarProps,
  "disabledRanges" | "panel" | "titleRender" | "withTimeSelect"
> & {
  placeholder?: [string, string];
  controller: DateRangePickerController;
  className?: string;
};

export function DateRangePicker(props: DateRangePickerProps) {
  const {
    controller,
    placeholder = ["min", "max"],
    disabledRanges,
    panel,
    titleRender,
    className,
    withTimeSelect,
  } = props;
  const { changeValue, calendar, __dropdown, setMode, mode } = controller;
  const [visible, onVisibleChange] = useState(false);
  const [min, max] = placeholder;
  const { value } = calendar;
  const isStartEmpty = value[0] === null;
  const isEndEmpty = value[1] === null;
  const start = isStartEmpty ? min : formatDate(value[0]!);
  const end = isEndEmpty ? max : formatDate(value[1]!);
  const clearable = !isStartEmpty || !isEndEmpty;
  const clear = useCallback(() => changeValue(null, null), [changeValue]);
  const startColor = useMemo(() => {
    if (mode === "start") {
      return clsx("text-text1");
    }
    if (isStartEmpty) {
      return clsx("text-text2");
    }
    return clsx("text-text1");
  }, [isStartEmpty, mode]);
  const endColor = useMemo(() => {
    if (mode === "end") {
      return clsx("text-text1");
    }
    if (isEndEmpty) {
      return clsx("text-text2");
    }
    return clsx("text-text1");
  }, [isEndEmpty, mode]);

  useEffect(() => {
    if (!visible) {
      setMode("disabled");
    } else if (mode === "disabled") {
      setMode("start");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    if (visible) {
      const [start, end] = calendar.value;
      if (mode === "start") {
        if (!end) {
          setMode("end");
        } else {
          setMode("disabled");
          __dropdown.current?.close();
        }
      } else if (!start) {
        setMode("start");
      } else {
        setMode("disabled");
        __dropdown.current?.close();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendar.value]);

  return (
    <div className='flex flex-col gap-16 min-w-0'>
      <Dropdown
        onVisibleChange={onVisibleChange}
        nest
        className={clsx(
          "gap-8 rounded-8 h-40 cursor-pointer w-auto relative px-16 bg-surface",
          className,
          { "border-primary": visible }
        )}
        content={
          <div className='px-16 py-24'>
            <Calendar
              withTimeSelect={withTimeSelect}
              controller={calendar}
              panel={panel}
              type='range'
              disabledRanges={disabledRanges}
              strictRangeMode={mode}
              titleRender={titleRender}
            />
          </div>
        }
        trigger={[]}
        ref={__dropdown}
      >
        <div
          className='flex items-center w-full h-full gap-8'
          onClick={__dropdown.current?.open}
        >
          <IconDateRange
            className={clsx("shrink-0", visible ? "text-text1" : "text-text2")}
          />
          <div
            className={clsx(
              "text-size-14 flex-1 flex h-full items-center truncate",
              startColor
            )}
            onClick={() => {
              setMode("start");
              __dropdown.current?.open();
            }}
          >
            {start}
          </div>

          <IconArrowForwardright
            className={clsx("shrink-0", visible ? "text-text1" : "text-text2")}
          />
          <div
            className={clsx(
              "text-size-14 flex-1 flex h-full items-center truncate",
              endColor
            )}
            onClick={() => {
              setMode("end");
              __dropdown.current?.open();
            }}
          >
            {end}
          </div>
          {clearable && (
            <IconClose onClick={clear} className='text-text2 shrink-0' />
          )}
        </div>
      </Dropdown>
      {withTimeSelect && (
        <div className='flex items-center gap-16 min-w-0'>
          <div className='flex-1'>
            <TimeSelectPanel
              key={`letf-${visible}`}
              disable={!value[0]}
              selectedTime={[
                new Date(value[0] ?? 0).getUTCHours() as Hour,
                new Date(value[0] ?? 0).getUTCMinutes() as Minute,
                // new Date(sortedSelected?.[0] ?? 0).getHours() > 12
                //   ? "PM"
                //   : "AM",
              ]}
              onSelect={(time) => {
                const newTime = new Date(value[0] ?? 0);
                newTime.setUTCHours(time[0], time[1]);
                calendar.changeValue([newTime.getTime(), value[1]]);
              }}
            />
          </div>

          <div className='flex-1'>
            <TimeSelectPanel
              key={`right-${visible}`}
              disable={!value[1]}
              selectedTime={[
                new Date(value[1] ?? 0).getUTCHours() as Hour,
                new Date(value[1] ?? 0).getUTCMinutes() as Minute,
                // new Date(sortedSelected?.[0] ?? 0).getHours() > 12
                //   ? "PM"
                //   : "AM",
              ]}
              onSelect={(time) => {
                const newTime = new Date(value[1] ?? 0);
                newTime.setUTCHours(time[0], time[1]);
                calendar.changeValue([value[0], newTime.getTime()]);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function useDateRangePickerController() {
  const calendar = useCalendarController();
  const [mode, setMode] =
    useState<CalendarProps["strictRangeMode"]>("disabled");
  const __dropdown = useRef<DropdownController | null>(null);

  const changeValue = useCallback(
    (start: Timestamp, end: Timestamp) => {
      calendar.changeValue([start, end]);
      setMode("disabled");
    },
    [calendar]
  );

  return {
    calendar,
    changeValue,
    __dropdown,
    mode,
    setMode,
  };
}

export type DateRangePickerController = ReturnType<
  typeof useDateRangePickerController
>;
