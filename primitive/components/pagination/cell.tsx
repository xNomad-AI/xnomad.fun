import clsx from 'clsx';
import { PropsWithChildren } from 'react';

import { PropsWithClassName } from '../helper';

type Props = {
  onClick?: () => void;
  disabled?: boolean;
};

export function PaginationCell(props: PropsWithChildren<PropsWithClassName<Props>>) {
  const handleClick = () => {
    if (!props.disabled) {
      props.onClick?.();
    }
  };

  return (
    <div
      className={clsx(
        'h-32 w-32 flex items-center justify-center text-size-14 select-none',
        props.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
        props.className
      )}
      onClick={handleClick}
    >
      {props.children}
    </div>
  );
}
