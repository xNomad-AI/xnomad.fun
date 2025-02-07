import { isValidNumber, toThousandNum } from '.';

export const tooltipTokenPrice = (
  num: number,
  symbol = 'BTC',
  smallNumPrecision = 8,
  bigNumPrecision = 2,
  targetNum = 1
) => {
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  let tokenString;

  if (!isValidNumber(num)) {
    tokenString = '--';
  } else if (num === 0) {
    tokenString = 0;
  } else if (Math.abs(absNum) < targetNum) {
    tokenString = toThousandNum(absNum, smallNumPrecision, false);
  } else {
    tokenString = toThousandNum(absNum, bigNumPrecision, false);
  }

  return `${isNegative ? '-' : ''}${tokenString}${symbol ? ` ${symbol}` : ''}`;
};

export const getPrecision = (number: number): number => {
  let precision = 2;
  if (Math.abs(number) < 0.0001) {
    precision = 8;
  } else if (Math.abs(number) < 1) {
    precision = 4;
  }
  return precision;
};
