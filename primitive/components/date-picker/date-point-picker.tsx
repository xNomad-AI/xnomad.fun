import clsx from "clsx";
import { PropsWithChildren, useRef, useState } from "react";

import {
  Calendar,
  CalendarControllerOptions,
  CalendarProps,
  useCalendarController,
} from "../calendar";
import { Dropdown, DropdownController } from "../dropdown";
import { IconDateRange } from "../icon";

export type DatePointPickerProps = Pick<
  CalendarProps,
  "titleRender" | "disabledRanges" | "value" | "onChange"
> & {
  controller: ReturnType<typeof useDatePointPickerController>;
};

export function DatePointPicker(
  props: PropsWithChildren<DatePointPickerProps>
) {
  const { children, titleRender, disabledRanges, controller, value, onChange } =
    props;
  const [visible, onVisibleChange] = useState(false);
  const { __dropdown, calendar } = controller;

  return (
    <Dropdown
      trigger={["click"]}
      ref={__dropdown}
      onVisibleChange={onVisibleChange}
      content={
        <div className='px-16 py-24'>
          <Calendar
            controller={calendar}
            type='point'
            panel='single'
            titleRender={titleRender}
            disabledRanges={disabledRanges}
            value={value}
            onChange={onChange}
          />
        </div>
      }
    >
      {children ? (
        children
      ) : (
        <div
          className={clsx(
            "w-40 h-40 rounded-8 flex items-center justify-center cursor-pointer border",
            visible ? "border-primary" : ""
          )}
        >
          <IconDateRange
            className={clsx(
              "cursor-pointer text-size-20",
              visible ? "text-text1" : "text-text2"
            )}
          />
        </div>
      )}
    </Dropdown>
  );
}

export function useDatePointPickerController(
  options?: Partial<CalendarControllerOptions>
) {
  const calendar = useCalendarController(options);
  const __dropdown = useRef<DropdownController | null>(null);

  return {
    calendar,
    __dropdown,
  };
}
