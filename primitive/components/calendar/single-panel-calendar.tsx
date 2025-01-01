import { Divider } from "../divider";
import { BaseCalendarProps } from "./base-calendar-props";
import { CalendarDateSwitch } from "./date-switch";
import { MaskContainer } from "./mask";
import { CalendarPenal } from "./panel";
import { Hour, Minute, TimeSelectPanel } from "./time-select-panel";

export function SinglePanelCalendar(props: BaseCalendarProps) {
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
  } = props;

  return (
    <div className='flex flex-col max-w-[14.25rem] gap-16'>
      <CalendarDateSwitch
        year={year}
        month={month}
        onMonthDecreased={onMonthDecreased}
        onMonthIncreased={onMonthIncreased}
        onYearDecreased={onYearDecreased}
        onYearIncreased={onYearIncreased}
        increased={increased}
        decreased={decreased}
        titleRender={titleRender}
      />
      <Divider />
      <MaskContainer mask={maskContent}>
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
      </MaskContainer>
    </div>
  );
}
