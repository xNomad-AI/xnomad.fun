import clsx from 'clsx';
import { DetailedHTMLProps, HTMLAttributes, PropsWithChildren } from 'react';

import { PropsWithClassName } from '../helper';

type Props = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
export function IconButton(props: PropsWithChildren<PropsWithClassName<Props>>) {
  const { children, className, ...others } = props;

  return (
    <div
      className={clsx(
        'w-40 h-40 flex items-center justify-center text-size-20 bg-surface rounded-4 cursor-pointer mobile:h-32 mobile:w-32',
        className
      )}
      {...others}
    >
      {children}
    </div>
  );
}
