import clsx from 'clsx';
import React, { forwardRef, ReactNode } from 'react';

import { Tooltip } from '../tooltip';

type Props = {
  disabled?: boolean;
  tooltip?: ReactNode;
  verbose?: boolean;
} & React.JSX.IntrinsicElements['div'];

export const Block = forwardRef<HTMLDivElement, Props>(function Block(props, ref) {
  const { disabled, tooltip, verbose, className, children, ...attributes } = props;

  return (
    <div
      draggable="false"
      ref={ref}
      className={clsx(
        'rounded-full bg-white absolute top-0 bottom-0 my-auto mx-0 border shadow-base cursor-grab',
        disabled
          ? 'cursor-not-allowed bg-secondary active:cursor-not-allowed'
          : 'active:bg-primary active:cursor-grabbing active:z-2 hover:border-primary',
        className
      )}
      {...attributes}
    >
      <Tooltip content={tooltip} disabled={!verbose}>
        <div className="w-full h-full"></div>
      </Tooltip>
      {children}
    </div>
  );
});
