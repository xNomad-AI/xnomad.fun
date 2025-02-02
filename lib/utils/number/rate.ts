// 格式化变化率类似的数据

import { TEN_THOUSAND } from './const';
import { toCardNum } from './deal-token-price';
import { deleteDecimalZero } from './delete-decimal-zero';
import { isValidNumber } from './isValidNumber';

export function formatRateNum(num: number): string {
  const _num = Math.round(num * 10000) / 100;
  return isValidNumber(num) ? `${deleteDecimalZero(toCardNum(_num, '', TEN_THOUSAND))}%` : '--';
}
