export type Timestamp = number | null;

export type CalendarDateChangedField = 'year' | 'month' | 'none' | 'both';

export type CalendarValue = [Timestamp, Timestamp];

export type CalendarSelectHandle = (value: CalendarValue) => void;
