import clsx from 'clsx';
import { DetailedHTMLProps, forwardRef, HTMLAttributes } from 'react';

type Props = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;

export const CollapsePanel = forwardRef<HTMLDivElement, Props>(function CollapsePanel(props, ref) {
  const { className, children, ...raw } = props;

  return (
    <section className={clsx('bg-transparent', className)} ref={ref} {...raw}>
      {children}
    </section>
  );
});
