import clsx from 'clsx';
import { useMemo } from 'react';

import { Arrow } from './arrow';
import { PaginationPage } from './page';
import { range } from './range';

interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  onChange?: (page: number) => void;
  /**
   * 一次展示多少个单元格
   */
  size?: number;
  /**
   * 超过单元格每次跳转几个
   */
  step?: number;
}
const pre = -1;
const next = -2;

export function Pagination(props: PaginationProps) {
  const { page: current, total, onChange, size = 7, step: _step, limit } = props;
  const totalPage = Math.ceil(total / limit);

  const step = useMemo(() => {
    if (_step) {
      return _step;
    }
    const base = 2;
    const max = 5;
    const step = Math.ceil(totalPage / 7) - 1 + base;
    if (step > max) {
      return max;
    }
    return step;
  }, [_step, totalPage]);
  // 连续出现的页码个数，便于计算取奇数

  const pages = useMemo(() => {
    const half = size % 2 === 0 ? size / 2 : (size - 1) / 2;
    if (totalPage <= size) {
      return range.start(1, totalPage);
    } else if (current <= half) {
      return [...range.start(1, half), next, ...range.end(totalPage, half)];
    } else if (totalPage - current < half) {
      return [...range.start(1, half), pre, ...range.end(totalPage, half)];
    } else {
      return [
        1,
        pre,
        ...range.end(current - 1, half - 2),
        current,
        ...range.end(current + 1, half - 2),
        next,
        totalPage,
      ];
    }
  }, [current, size, totalPage]);

  const handleChange = (page: number) => {
    if (page === current) {
      return;
    }
    let target = page;
    if (page === -1) {
      target = current - step;
    } else if (page === -2) {
      target = current + step;
    }
    if (target < 1) {
      target = 1;
    } else if (target > totalPage) {
      target = totalPage;
    }
    onChange?.(target);
  };

  const handleIncrease = () => {
    handleChange(current + 1);
  };

  const handleDecrease = () => {
    handleChange(current - 1);
  };

  return (
    <div className={clsx('flex items-center gap-4')}>
      <Arrow visible={pages.length > 1} type="increase" onClick={handleDecrease} disabled={current === 1} />
      {pages.map((page) => (
        <PaginationPage page={page} onClick={handleChange} key={page} selected={page === current} />
      ))}
      <Arrow visible={pages.length > 1} onClick={handleIncrease} type="decrease" disabled={current === totalPage} />
    </div>
  );
}
