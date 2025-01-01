import { Timestamp } from '../interface';

export const CalendarUtilsDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;
export const WEEK_DAY = 7;
export const CALENDAR_DISPLAY_COUNT = WEEK_DAY * 6;
export const EMPTY_TIMESTAMP: Timestamp = null;
export const MONTHS = 12;

export class CalendarUtils {
  static isEmptyTimestamp(timestamp: Timestamp): timestamp is null {
    return timestamp === null || timestamp === undefined;
  }

  static generatePanelMetadata(year: number, month: number, locale: boolean) {
    const monthDays = this.generateMonthMeta(year, month, locale, true);
    const lastMonthDays = this.generateMonthMeta(year, month - 1, locale, false);
    const nextMonthDays = this.generateMonthMeta(year, month + 1, locale, false);
    const dayOfWeek = this.firstDayOfWeekInThisMonth(year, month, locale);
    const rest = CALENDAR_DISPLAY_COUNT - monthDays.length - dayOfWeek;
    const lastMonthDayRest = dayOfWeek === 0 ? [] : lastMonthDays.slice(0 - dayOfWeek);
    const nextMonthDayRest = nextMonthDays.slice(0, rest);
    return [...lastMonthDayRest, ...monthDays, ...nextMonthDayRest];
  }

  static firstDayOfWeekInThisMonth(year: number, month: number, locale: boolean) {
    if (locale) {
      return new Date(year, month, 1).getDay();
    }

    return new Date(Date.UTC(year, month, 1)).getUTCDay();
  }

  static thisDay(locale: boolean) {
    const date = new Date();

    if (locale) {
      const year = date.getFullYear();

      const month = date.getMonth();

      const day = date.getDate();

      const today = new Date(year, month, day).getTime();

      return today;
    }

    const year = date.getUTCFullYear();

    const month = date.getUTCMonth();

    const day = date.getUTCDate();

    const today = Date.UTC(year, month, day);

    return today;
  }

  static generateMonthMeta(_year: number, _month: number, locale: boolean, active: boolean) {
    const month = (_month + MONTHS) % MONTHS;
    // eslint-disable-next-line no-nested-ternary
    const year = _month < 0 ? _year - 1 : _month > 11 ? _year + 1 : _year;
    const daysCount = month === 1 && year % 4 === 0 && (year % 100 === 0 || year % 400 === 0) ? 29 : CalendarUtilsDays[month];

    const days = Array.from<DayMeta>({ length: daysCount });

    for (let index = 0; index < daysCount; index++) {
      const day = index + 1;
      const timestamp = locale ? new Date(year, month, day).getTime() : Date.UTC(year, month, day);
      // eslint-disable-next-line no-nested-ternary
      const dayType = index === 0 ? 'first' : day === daysCount ? 'last' : 'mid';
      days[index] = {
        day,
        timestamp,
        active,
        month,
        year,
        dayType,
      };
    }

    return days;
  }

  static isFirstDay(dayType: DayType): dayType is 'first' {
    return dayType === 'first';
  }

  static isLastDay(dayType: DayType): dayType is 'last' {
    return dayType === 'last';
  }

  static isMidDay(dayType: DayType): dayType is 'mid' {
    return dayType === 'mid';
  }
}

export type DayType = 'first' | 'mid' | 'last';

export interface DayMeta {
  day: number;
  timestamp: number;
  // 代表是否是当前面板应该展示的日期， 比如11的日历里面也会出现12月的头几天，那么12月的信息都会被标注!active
  active: boolean;
  month: number;
  year: number;
  dayType: DayType;
}
