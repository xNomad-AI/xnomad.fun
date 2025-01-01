import clsx from 'clsx';
import { DetailedHTMLProps, forwardRef, HTMLAttributes } from 'react';

type Props = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export const List = forwardRef<HTMLDivElement, Props>(function List(props, ref) {
  const { children, className, ...raw } = props;

  return (
    <div className={clsx('flex flex-col', className)} {...raw} ref={ref}>
      {children}
    </div>
  );
});
