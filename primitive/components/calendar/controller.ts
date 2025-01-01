import { useCallback, useMemo, useState } from 'react';

import { CalendarSelectHandle, CalendarValue } from './interface';

export interface CalendarControllerOptions {
  year: number;
  month: number;
  locale: boolean;
}

export function useCalendarController(options?: Partial<CalendarControllerOptions>) {
  const now = useMemo(() => new Date(), []);

  const { year: _year, month: _month, locale = false } = options ?? {};

  const [year, changeYear] = useState(() => (_year ?? locale ? now.getFullYear() : now.getUTCFullYear()));

  const [month, changeMonth] = useState(() => (_month ?? locale ? now.getMonth() : now.getUTCMonth()));

  const [value, setValue] = useState<CalendarValue>([null, null]);

  const changeValue = useCallback<CalendarSelectHandle>(setValue, [setValue]);

  const increaseYear = useCallback(() => changeYear((year) => year + 1), []);

  const decreaseYear = useCallback(() => changeYear((year) => year - 1), []);

  const increaseMonth = useCallback(() => {
    if (month === 11) {
      changeMonth(0);
      increaseYear();
    } else {
      changeMonth((month) => month + 1);
    }
  }, [increaseYear, month]);

  const decreaseMonth = useCallback(() => {
    if (month === 0) {
      changeMonth(11);
      decreaseYear();
    } else {
      changeMonth((month) => month - 1);
    }
  }, [decreaseYear, month]);

  return {
    year,
    month,
    value,
    locale,
    changeYear,
    changeMonth,
    changeValue,
    increaseMonth,
    decreaseYear,
    increaseYear,
    decreaseMonth,
  };
}

export type CalendarController = ReturnType<typeof useCalendarController>;
