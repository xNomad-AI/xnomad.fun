import { isValidNumber } from "@/lib/utils/number";
import {
  Button,
  Calendar,
  DateRangePicker,
  Dropdown,
  DropdownController,
  IconCalendarAdd,
  Timestamp,
  useCalendarController,
  useDateRangePickerController,
} from "@/primitive/components";
import { useMemoizedFn } from "ahooks";
import clsx from "clsx";
import React, { useEffect, useMemo, useRef } from "react";
const UTC_TIMEZONE_OFFSET = new Date().getTimezoneOffset() * 60 * 1000;

interface RangePickerProps {
  defaultValue?: [number, number] | null; // 需要根据输入时间变更时间段
  className?: string;
  onCancel?: () => void;
  onConfirm?: (startTime: number, endTime: number) => void;
  onVisibilityChange?: (visible: boolean) => void;
  disabledDate?: [number, number][]; // 自定义disable时间段
  onClose?: () => void;
  notUTC?: boolean;
  premiumSource?: string;
  panel?: React.ComponentProps<typeof Calendar>["panel"];
}

export const RangePicker: React.FC<RangePickerProps> = ({
  defaultValue,
  className,
  onCancel,
  onConfirm,
  onVisibilityChange,
  disabledDate,
  onClose,
  notUTC = false,
  premiumSource,
  panel = "double",
}) => {
  const calendarController = useCalendarController();
  const dropdownController = useRef<DropdownController | null>(null);
  const active = useMemo(
    () => calendarController.value[1] && calendarController.value[0],
    [calendarController.value]
  );
  useEffect(() => {
    if (
      calendarController.value[1] &&
      calendarController.value[0] &&
      calendarController.value[1] < calendarController.value[0]
    ) {
      calendarController.changeValue([
        calendarController.value[1],
        calendarController.value[0],
      ]);
    }
  }, [calendarController.value]);

  // 组件库calendar只处理utc时间，本地时间需要特殊处理
  useEffect(() => {
    if (defaultValue) {
      const from = !notUTC
        ? defaultValue[0]
        : defaultValue[0] - UTC_TIMEZONE_OFFSET;
      const to = !notUTC
        ? defaultValue[1]
        : defaultValue[1] - UTC_TIMEZONE_OFFSET;
      calendarController.changeValue([from, to - (24 * 60 * 60 * 1000 - 1)]);
    }
  }, [defaultValue, notUTC]);

  const notReady = useMemo(
    () =>
      !calendarController?.value ||
      !calendarController.value[0] ||
      !calendarController.value[1],
    [calendarController.value]
  );

  const handleCancel = useMemoizedFn(() => {
    onCancel?.();
    dropdownController.current?.close();
  });

  const handleConfirm = useMemoizedFn(() => {
    if (notReady) {
      return;
    }
    const from = !notUTC
      ? calendarController.value[0] ?? 0
      : (calendarController.value?.[0] ?? 0) + UTC_TIMEZONE_OFFSET;
    const to = !notUTC
      ? calendarController.value[1] ?? 0
      : (calendarController.value[1] ?? 0) + UTC_TIMEZONE_OFFSET;
    onConfirm?.(from, to + 24 * 60 * 60 * 1000 - 1);
    dropdownController.current?.close();
  });
  return (
    <Dropdown
      ref={dropdownController}
      onClose={onClose}
      trigger={["click"]}
      onVisibleChange={(value) => {
        onVisibilityChange?.(value);
      }}
      content={
        <div className='flex flex-col gap-16 p-16'>
          <Calendar
            titleRender={(_m, _y, current) =>
              `${current}${notUTC ? "" : "(UTC)"}`
            }
            controller={calendarController}
            type='range'
            panel={panel}
            disabledRanges={disabledDate}
            strictRangeMode='reset'
          />
          <div className='flex gap-16 justify-center w-full'>
            <Button
              stretch
              variant='secondary'
              size='s'
              className='w-96'
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              stretch
              size='s'
              className='w-96'
              disabled={notReady}
              onClick={handleConfirm}
            >
              Filter
            </Button>
          </div>
        </div>
      }
    >
      <div
        className={clsx(className, "cursor-pointer", { "text-brand": active })}
      >
        <IconCalendarAdd className='text-size-20' />
      </div>
    </Dropdown>
  );
};

export function RangePickerWithoutConfirm({
  initDateRange,
  onChange,
  panel = "double",
  className,
  withTimeSelect,
  disabledRanges = [
    [
      -Infinity,
      new Date(Date.now()).setDate(new Date(Date.now()).getDate() - 1),
    ],
  ],
  allowEndEmpty,
  placeholder = ["Start", "End"],
}: {
  initDateRange?: [Timestamp, Timestamp];
  onChange: (range: [Timestamp, Timestamp]) => void;
  panel?: React.ComponentProps<typeof DateRangePicker>["panel"];
  className?: string;
  disabledRanges?: React.ComponentProps<
    typeof DateRangePicker
  >["disabledRanges"];
  withTimeSelect?: boolean;
  allowEndEmpty?: boolean;
  placeholder?: React.ComponentProps<typeof DateRangePicker>["placeholder"];
}) {
  const controller = useDateRangePickerController();
  const shouldTriggerChange = useRef<boolean>(false);
  useEffect(() => {
    if (!shouldTriggerChange.current) {
      shouldTriggerChange.current = true;
      return;
    }
    const { value } = controller.calendar;
    const from = isValidNumber(value[0]) ? value[0] : value[0];
    const to = isValidNumber(value[1]) ? value[1] : value[1];
    const isSame = from === initDateRange?.[0] && to === initDateRange?.[1];
    if (typeof from === typeof to && !isSame) {
      onChange([from, to]);
    } else if (allowEndEmpty && typeof from === "number" && !to && !isSame) {
      onChange([from, to]);
    }
  }, [controller?.calendar?.value]);

  useEffect(() => {
    if (initDateRange) {
      const from = isValidNumber(initDateRange[0])
        ? initDateRange[0]
        : initDateRange[0];
      const to = isValidNumber(initDateRange[1])
        ? initDateRange[1]
        : initDateRange[1];
      controller.changeValue(from, to);
      shouldTriggerChange.current = false;
    }
  }, [initDateRange]);

  return (
    <DateRangePicker
      className={className}
      withTimeSelect={withTimeSelect}
      disabledRanges={disabledRanges}
      controller={controller}
      panel={panel}
      placeholder={placeholder}
    />
  );
}
