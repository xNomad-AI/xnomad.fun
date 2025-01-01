import { useCallback, useMemo } from 'react';

import { CalendarUtils, DayMeta, EMPTY_TIMESTAMP } from '../calendar-utils';
import { Timestamp } from '../interface';
import { CalendarCellContent, CalendarCellContentProps, CalendarCellContentRangePosition } from './content';
import { CalendarSpace } from './space';

export interface CalendarCellProps extends Pick<CalendarCellContentProps, 'selected' | 'today' | 'disabled'> {
  // 星期1-7
  position: number;
  // 每个cell包含的所有相关信息， 用于外部回调， 也包括了ui信息
  meta: DayMeta;
  // 被选中的日期
  start?: Timestamp;
  end?: Timestamp;
  onClick?: (ts: number) => void;
  onHover?: (ts: number) => void;
}

export function CalendarCell(props: CalendarCellProps) {
  const {
    position,
    selected,
    today,
    start = EMPTY_TIMESTAMP,
    end = EMPTY_TIMESTAMP,
    disabled = false,
    onClick,
    meta,
  } = props;
  const SOL = useMemo(() => position % 7 === 0, [position]);
  const EOL = useMemo(() => (position + 1) % 7 === 0, [position]);

  const { timestamp, active, dayType } = meta;

  const rangePosition = useMemo<CalendarCellContentRangePosition>(() => {
    if (disabled || !active || CalendarUtils.isEmptyTimestamp(start) || CalendarUtils.isEmptyTimestamp(end)) {
      return 'none';
    }

    if (timestamp >= start! && timestamp <= end!) {
      // 第一个选择的日期，如果是当行的最后一个那么是全圆角

      if (timestamp === start) {
        if (EOL || timestamp === end) {
          return 'start-end';
        }
        return 'start';
      }

      if (timestamp === end) {
        if (SOL) {
          return 'start-end';
        }
        return 'end';
      }

      if (dayType === 'first') {
        if (EOL) {
          return 'start-end';
        }
        return 'start';
      }

      if (dayType === 'last') {
        if (SOL) {
          return 'start-end';
        }
        return 'end';
      }

      if (EOL) {
        return 'end';
      }

      if (SOL) {
        return 'start';
      }

      return 'center';
    }

    return 'none';
  }, [start, end, SOL, EOL, disabled, active, dayType, timestamp]);

  const spaceCovered = useMemo(() => {
    return rangePosition !== 'none' && dayType !== 'first' && timestamp !== start;
  }, [rangePosition, dayType, start, timestamp]);

  const handleClick = useCallback(() => {
    if (!disabled && typeof onClick === 'function') {
      onClick(timestamp);
    }
  }, [onClick, disabled, timestamp]);

  const handleHover = useCallback(() => {
    !disabled && props.onHover?.(meta.timestamp);
  }, [disabled, props, meta.timestamp]);

  return (
    <>
      {!SOL && (
        <div className="py-5">
          <CalendarSpace covered={spaceCovered} deep={false} />
        </div>
      )}
      <div className="py-5" onClick={handleClick} onMouseEnter={handleHover}>
        <CalendarCellContent
          selected={selected}
          today={today}
          rangePosition={rangePosition}
          disabled={disabled}
          deep={false}
        >
          {meta.day}
        </CalendarCellContent>
      </div>
    </>
  );
}
