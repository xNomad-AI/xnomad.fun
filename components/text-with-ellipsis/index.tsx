'use client';

import { useDebounceFn, useMemoizedFn, useUpdateEffect } from 'ahooks';
import clsx from 'clsx';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';

import { Tooltip, TooltipController } from '@/primitive/components';

import { checkOverflow } from './utilts';

interface TextWithEllipsisProps {
  width?: number;
  className?: string;
  children?: React.ReactNode;
  ignoreResize?: boolean;
  disableTooltip?: boolean;
  tooltipContent?: ReactNode;
  tooltipContnetClassName?: string;
  rows?: 1 | 2 | 3;
}

const TextWithEllipsis = ({
  width,
  className,
  children,
  ignoreResize,
  disableTooltip,
  tooltipContent,
  tooltipContnetClassName: tooltipContentClassName,
  rows = 1,
}: TextWithEllipsisProps) => {
  const text = (children || '') as string;
  const textRef = useRef<TooltipController>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const compareSize = useMemoizedFn(() => {
    const node = textRef.current?.element;
    if (!node) {
      return;
    }
    setIsOverflowing(checkOverflow(node));
  });

  const { run: onResize } = useDebounceFn(compareSize, { wait: 16 });
  useEffect(() => {
    onResize();
    if (ignoreResize || disableTooltip) {
      return () => {
        //
      };
    }
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [onResize, ignoreResize, disableTooltip]);

  useUpdateEffect(() => {
    if (disableTooltip) {
      return;
    }
    onResize();
  }, [text, className, width]);
  const isMultiWords = useMemo(() => text && text?.split?.(' ').length > 1, [text]);
  return (
    <Tooltip
      ref={textRef}
      className={clsx(className, 'min-w-0 max-w-full cursor-[inherit]', {
        truncate: rows === 1,
        'line-clamp-2 text-ellipsis': rows === 2,
        'line-clamp-3 text-ellipsis': rows === 3,
        'break-words': isMultiWords,
        'break-all': !isMultiWords,
      })}
      style={{
        width,
      }}
      disabled={!isOverflowing || disableTooltip}
      content={tooltipContent ?? text}
      contentClassName={clsx('!break-all', tooltipContentClassName)}
    >
      {text}
    </Tooltip>
  );
};

export { TextWithEllipsis };
