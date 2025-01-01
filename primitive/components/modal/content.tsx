import clsx from 'clsx';
import { DetailedHTMLProps, PropsWithChildren } from 'react';

export function ModalContent(
  props: PropsWithChildren<DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>>
) {
  const { className, children, ...rest } = props;
  return (
    <div className={clsx('flex p-24 gap-24 flex-col w-full', className)} {...rest}>
      {children}
    </div>
  );
}
