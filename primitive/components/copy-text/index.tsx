import { IconCheck, IconFileCopy } from '@/primitive/components';
import { useTimerRef } from '@/primitive/hooks/use-timer-ref';
import { copy } from '@/primitive/utils/copy';
import clsx from 'clsx';
import { PropsWithChildren, useState } from 'react';

type Props = {
  className?: string;
  contentClassName?: string;
  text: string;
};
export function CopyText(props: PropsWithChildren<Props>) {
  const [copied, setCopied] = useState(false);
  const timer = useTimerRef();
  const handleClick = () => {
    copy(props.text);
    setCopied(true);
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className={clsx('flex items-center cursor-pointer', props.className)} onClick={handleClick}>
      <div className={props.contentClassName}>{props.children}</div>
      {copied ? <IconCheck className="text-green shrink-0" /> : <IconFileCopy />}
    </div>
  );
}
