import { Fragment } from 'react';

import { CalendarCellContent } from './cell/content';
import { CalendarSpace } from './cell/space';

export type CalendarWeekRenderer = readonly [string, string, string, string, string, string, string];

const defaultENWeeks: CalendarWeekRenderer = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export interface CalendarHeaderProps {
  weeks?: CalendarWeekRenderer;
}

export function CalendarHeader(props: CalendarHeaderProps) {
  const { weeks = defaultENWeeks } = props;
  return (
    <>
      {weeks.map((week, index) => (
        <Fragment key={week}>
          <div className="py-5">
            <CalendarCellContent titled>{week}</CalendarCellContent>
          </div>
          {index < weeks.length - 1 && (
            <div className="py-5">
              <CalendarSpace />
            </div>
          )}
        </Fragment>
      ))}
    </>
  );
}
