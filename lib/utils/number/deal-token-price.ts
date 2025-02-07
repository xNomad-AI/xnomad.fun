import { isValidNumber } from "./isValidNumber";
/* 数据展示规则，目前为：
x＜0.0001，展示“＜0.0001”
0.0001≤ x＜1，最多保留四位有效数字
x≥1， 最多保留2位小数，若x≥1k则使用千位分隔符
https://byterum.feishu.cn/wiki/wikcniGwBXtGcnICuvFtCipmsed */
const BILLION = 1_000_000_000;

export const toThousand = (num?: number, precision = 2, padZero = true) => {
  return isValidNumber(num) ? toThousandNum(num, precision, padZero) : "N/A";
};

export const toSimpleNum = (num: number, precision = 2) => {
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  let numFixed = absNum;
  let suffix = "";
  if (absNum >= 1000_000_000_000) {
    numFixed = absNum / 1000_000_000_000;
    suffix = "T";
  } else if (absNum >= 1000_000_000) {
    numFixed = absNum / 1000_000_000;
    suffix = "B";
  } else if (absNum >= 1000_000) {
    numFixed = absNum / 1000_000;
    suffix = "M";
  } else if (absNum >= 1000) {
    numFixed = absNum / 1000;
    suffix = "K";
  } else {
    numFixed = absNum;
    suffix = "";
  }
  const actualNum =
    Math.round(numFixed * Math.pow(10, precision)) / Math.pow(10, precision);
  return (isNegative ? "-" : "") + actualNum + suffix;
};

// padZero: 是否需要在末尾补零
export const toThousandNum = (num: unknown, precision = 2, padZero = false) => {
  if (!isValidNumber(num)) {
    return "N/A";
  }
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const numFixed =
    Math.round(absNum * Math.pow(10, precision)) / Math.pow(10, precision);
  const intNum = Math.floor(numFixed);
  const intNumStr = (intNum || 0)
    .toString()
    .replace(/(\d)(?=(?:\d{3})+$)/g, "$1,");
  const restStr = padZero
    ? (numFixed || 0).toFixed(precision).match(/\.(.*)$/g)
    : (numFixed || 0).toString().match(/\.(.*)$/g);
  return `${isNegative ? "-" : ""}${intNumStr}${
    restStr && precision !== 0 ? restStr[0] : ""
  }`;
};

export const toCardNum = (
  _num: unknown,
  money = "",
  base = 1000,
  precision = 2,
  withNegative = false
) => {
  const num = typeof _num === "string" ? parseFloat(_num) : _num;
  let symbol = "";
  if (isValidNumber(num)) {
    if (num < 0) {
      symbol = "-";
    } else if (withNegative) {
      symbol = "+";
    }
  }
  let result = "";
  if (isValidNumber(num)) {
    const absNum = Math.abs(num);
    if (absNum >= base) {
      result = `${toSimpleNum(absNum, precision)}`;
    } else {
      result = `${toThousandNum(absNum, precision)}`;
    }
  } else {
    result = "N/A";
  }
  return `${symbol}${money}${result}`;
};

const deleteLastZero = (numArr: string[], makeZero = false): string => {
  const len = numArr.length;
  if (numArr.length === 1 && numArr[0] === "0" && makeZero) {
    return numArr[0];
  } else if (numArr[len - 1] === "0") {
    numArr.pop();
    return deleteLastZero(numArr);
  } else if (numArr[len - 1] === ".") {
    numArr.pop();
  }
  return numArr.join("");
};
export const BASE_SMALL_NUM_PRECISION = 6;
export function isMinimumTokenNumber(num: number) {
  const targetNum = parseFloat(
    `0.${new Array(BASE_SMALL_NUM_PRECISION - 1).fill(0).join("")}1`
  );
  return Math.abs(num) < targetNum;
}
export const dealCardTokenPrice = (
  num: unknown,
  base = 1000,
  smallNumPrecision = BASE_SMALL_NUM_PRECISION,
  bigNumPrecision = 2,
  precisionBase = 1
) => {
  if (typeof num === "string") {
    // eslint-disable-next-line no-param-reassign
    num = parseFloat(num);
  }
  const targetNum = parseFloat(
    `0.${new Array(smallNumPrecision - 1).fill(0).join("")}1`
  );
  let tokenString;
  if (!isValidNumber(num)) {
    tokenString = "N/A";
  } else if (num === 0) {
    tokenString = 0;
  } else if (Math.abs(num) < targetNum) {
    tokenString = `< ${targetNum}`;
  } else if (Math.abs(num) > 1) {
    tokenString = toCardNum(num, "", base, bigNumPrecision);
  } else {
    tokenString = deleteLastZero(
      toCardNum(
        num,
        "",
        base,
        Math.abs(num) >= precisionBase ? bigNumPrecision : smallNumPrecision
      ).split("")
    );
  }

  return `${tokenString}`;
};

// tooltip的默认值不一样
export const dealToolTipTokenPrice = (
  num: number,
  base = BILLION,
  smallNumPrecision = 8,
  bigNumPrecision = 8,
  precisionBase = 1
) => {
  return dealCardTokenPrice(
    num,
    base,
    smallNumPrecision,
    bigNumPrecision,
    precisionBase
  );
};
