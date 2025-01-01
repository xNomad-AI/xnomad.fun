import clsx from "clsx";

import {
  IconArrowLeft,
  IconArrowRight,
  IconDoubleArrowLeft,
  IconDoubleArrowRight,
} from "../icon";
import { CalendarDateChangedField } from "./interface";

export type CalendarDateSwitchTitleRenderer = (
  month: number,
  year: number,
  current: string
) => string;

export interface CalendarDateSwitchProps {
  year: number;
  month: number;
  increased: CalendarDateChangedField;
  decreased: CalendarDateChangedField;
  onMonthIncreased?: () => void;
  onMonthDecreased?: () => void;
  onYearIncreased?: () => void;
  onYearDecreased?: () => void;
  titleRender?: CalendarDateSwitchTitleRenderer;
}

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "June",
  "July",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];

const CalendarDateArrowIconClassName = clsx(
  "text-text2 cursor-pointer hover:text-text1"
);

export function CalendarDateSwitch(props: CalendarDateSwitchProps) {
  const {
    increased = "none",
    decreased = "none",
    onMonthIncreased,
    onMonthDecreased,
    onYearDecreased,
    onYearIncreased,
    year,
    month,
    titleRender,
  } = props;

  const current = `${months[month]} ${year}`;

  const title = titleRender?.(month, year, current) ?? current;

  return (
    <div className='flex items-center gap-8 w-[14.25rem]'>
      {decreased === "both" || decreased === "year" ? (
        <IconDoubleArrowLeft
          className={CalendarDateArrowIconClassName}
          onClick={onYearDecreased}
        />
      ) : null}
      {decreased === "both" || decreased === "month" ? (
        <IconArrowLeft
          className={CalendarDateArrowIconClassName}
          onClick={onMonthDecreased}
        />
      ) : null}
      <div className='text-size-14 text-center font-bold flex-1'>{title}</div>
      {increased === "both" || increased === "month" ? (
        <IconArrowRight
          className={CalendarDateArrowIconClassName}
          onClick={onMonthIncreased}
        />
      ) : null}
      {increased === "both" || increased === "year" ? (
        <IconDoubleArrowRight
          className={CalendarDateArrowIconClassName}
          onClick={onYearIncreased}
        />
      ) : null}
    </div>
  );
}
