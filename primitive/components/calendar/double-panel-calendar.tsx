import { useMemo } from "react";

import { Divider } from "../divider";
import { BaseCalendarProps } from "./base-calendar-props";
import { CalendarDateSwitch } from "./date-switch";
import { MaskContainer } from "./mask";
import { CalendarPenal } from "./panel";
import { CalendarCellContent } from "./cell/content";
import { Hour, Minute, TimeSelectPanel } from "./time-select-panel";

export function DoublePanelCalendar(props: BaseCalendarProps) {
  const {
    year,
    month,
    onMonthDecreased,
    onMonthIncreased,
    onRangeCovered,
    onYearDecreased,
    onYearIncreased,
    coveredRanges,
    disabledRanges,
    decreased,
    increased,
    selected,
    titleRender,
    onClick,
    locale,
    maskContent,
    withTimeSelect,
  } = props;

  const nextYear = useMemo(
    () => (month === 11 ? year + 1 : year),
    [year, month]
  );

  const nextMonth = useMemo(() => (month === 11 ? 0 : month + 1), [month]);
  const sortedSelected = [...(selected ?? [])]?.sort(
    (a, b) => (a ?? 0) - (b ?? 0)
  );
  return (
    <div className='max-w-[36rem] flex flex-col gap-16'>
      <div className='flex justify-between items-center gap-16'>
        <CalendarDateSwitch
          year={year}
          month={month}
          decreased={decreased}
          increased='none'
          onMonthDecreased={onMonthDecreased}
          onYearDecreased={onYearDecreased}
          titleRender={titleRender}
        />
        <CalendarDateSwitch
          year={nextYear}
          month={nextMonth}
          decreased='none'
          increased={increased}
          onMonthIncreased={onMonthIncreased}
          onYearIncreased={onYearIncreased}
          titleRender={titleRender}
        />
      </div>
      <Divider />
      <MaskContainer mask={maskContent}>
        <div className='flex items-center justify-between gap-16'>
          <div className='flex flex-col gap-16'>
            <CalendarPenal
              year={year}
              month={month}
              selected={selected}
              today
              locale={locale}
              disabledRanges={disabledRanges}
              coveredRanges={coveredRanges}
              onRangeCovered={onRangeCovered}
              onClick={onClick}
            />
          </div>
          <div className='flex flex-col gap-16'>
            <CalendarPenal
              year={nextYear}
              month={nextMonth}
              selected={selected}
              today
              locale={locale}
              disabledRanges={disabledRanges}
              coveredRanges={coveredRanges}
              onRangeCovered={onRangeCovered}
              onClick={onClick}
            />
          </div>
        </div>
      </MaskContainer>
    </div>
  );
}
