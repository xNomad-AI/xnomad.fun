import { toThousandNum } from './deal-token-price';
import { deleteLastZero } from './delete-last-zero';
import { isValidNumber } from './isValidNumber';

export const dealSmallNum = (num: number, precision = 2): string => {
  const targetNum = parseFloat(`0.${new Array(precision - 1).fill(0).join('')}1`);

  if (!isValidNumber(num)) {
    return '--';
  }
  if (num === 0) {
    return '0';
  }
  if (num > 0 && num < targetNum) {
    return `< ${targetNum?.toFixed(precision)}`;
  }
  return deleteLastZero(toThousandNum(num, precision).split(''));
};
