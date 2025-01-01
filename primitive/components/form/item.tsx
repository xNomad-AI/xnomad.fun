import clsx from 'clsx';
import { PropsWithChildren, ReactNode } from 'react';

type Props = {
  label: ReactNode;
  horizontal?: boolean;
  className?: string;
};

export function FormItem(props: PropsWithChildren<Props>) {
  return (
    <div className={clsx('flex gap-8', props.horizontal ? 'justify-between items-center' : ' flex-col', props.className)}>
      <label>{props.label}</label>
      <div className="text-text1">{props.children}</div>
    </div>
  );
}
