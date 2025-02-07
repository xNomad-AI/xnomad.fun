import { isValidNumber } from "./number";
import { format } from "date-fns";

export const beautifyTime = (timestamp: number, simpleTime = false) => {
  if (!isValidNumber(timestamp) || timestamp === 0) {
    return "--";
  }
  const SPLITTER = " ";
  let diff = (Math.round(new Date().getTime()) - timestamp) / 1000;
  const postfix = diff > 0 ? "ago" : "after";
  diff = Math.abs(diff);

  const timeWords = simpleTime
    ? [
        ["day", "days"],
        ["hr", "hrs"],
        ["min", "mins"],
        ["sec", "secs"],
      ]
    : [
        ["day", "days"],
        ["hour", "hours"],
        ["minute", "minutes"],
        ["second", "seconds"],
      ];
  if (diff < 1) {
    return 1 + SPLITTER + timeWords[3][0] + SPLITTER + postfix;
  }
  const timestamps = [86400, 3600, 60, 1];

  for (let i = 0; i < 4; i++) {
    const inm = Math.floor(diff / timestamps[i]);
    if (inm !== 0) {
      // diff > 1 day
      if (i === 0) {
        return format(timestamp, "MMM dd, yyyy");
      } else {
        const index = inm > 1 ? 1 : 0;
        return inm + SPLITTER + timeWords[i][index] + SPLITTER + postfix;
      }
    }
  }
  return "--";
};

export function beautifyTimeV2(
  timestamp?: unknown,
  simpleTime = false,
  withSuffix = true
) {
  if (!isValidNumber(timestamp) || timestamp === 0) {
    return "--";
  }
  const SPLITER = " ";
  let diff = (Date.now() - timestamp) / 1000;
  // eslint-disable-next-line no-nested-ternary
  const postfix = withSuffix ? (diff > 0 ? "ago" : "after") : "";
  diff = Math.abs(diff);

  // 最多显示23 hours
  const arrr = simpleTime
    ? [
        ["day", "days"],
        ["hr", "hrs"],
        ["min", "mins"],
        ["sec", "secs"],
      ]
    : [
        ["day", "days"],
        ["hour", "hours"],
        ["minute", "minutes"],
        ["second", "seconds"],
      ];
  const arrn = [86400, 3600, 60, 1];
  if (diff < 1) {
    return 1 + SPLITER + arrr[3][0] + SPLITER + postfix;
  }
  for (let i = 0; i < 4; i++) {
    const inm = Math.floor(diff / arrn[i]);
    // eslint-disable-next-line eqeqeq
    if (inm != 0) {
      // NOTE: 主站这里的逻辑本身就是被注释掉的
      // diff > 1 day
      // if (i === 0) {
      //   return format(timestamp, 'MMM dd, yyyy');
      // }
      const index = inm > 1 ? 1 : 0;
      return inm + SPLITER + arrr[i][index] + SPLITER + postfix;
    }
  }

  return "--";
}

export const simpleTime = (timeStamp: unknown) => {
  if (!isValidNumber(timeStamp)) {
    return "--";
  }
  const seconds = timeStamp / 1000;
  if (seconds >= 60) {
    const mins = Math.floor(seconds / 60);
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      if (hours >= 24) {
        const days = Math.floor(hours / 24);
        return days > 1 ? `${days} D` : "1D";
      }
      return hours > 1 ? `${hours} h` : "1h";
    }
    return mins > 1 ? `${mins} m` : "1m";
  }
  return "<1m";
};
