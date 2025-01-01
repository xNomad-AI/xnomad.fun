import clsx from 'clsx';
import { DetailedHTMLProps, HTMLAttributes, forwardRef } from 'react';

type CenterProps = {
  vertical?: boolean;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export const Center = forwardRef<HTMLDivElement, CenterProps>(function Center(props, ref) {
  const { vertical = false, children, className, ...rawProps } = props;

  return (
    <div className={clsx('flex items-center justify-center', vertical && 'flex-col', className)} ref={ref} {...rawProps}>
      {children}
    </div>
  );
});
