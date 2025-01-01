import clsx from 'clsx';
import { DetailedHTMLProps, LiHTMLAttributes, PropsWithChildren } from 'react';

import { role } from './roles';
import { style } from './style';
import { useTabs } from './tabs';

type Props = DetailedHTMLProps<LiHTMLAttributes<HTMLLIElement>, HTMLLIElement> & {
  disabled?: boolean;
  tabKey: string;
};

export function Tab(props: PropsWithChildren<Props>) {
  const { disabled = false, children, className, tabKey, ...attributes } = props;
  const { activeTabKey, onChange, variant = 'text' } = useTabs();
  const selected = activeTabKey === tabKey;
  const handleClick = () => {
    if (!disabled) {
      onChange?.(tabKey);
    }
  };

  return (
    <li
      className={clsx(
        'list-none h-[2.5rem] flex items-center justify-center cursor-pointer shrink-0',
        style.variant[variant],
        className
      )}
      aria-selected={selected}
      aria-disabled={disabled}
      aria-roledescription={role.tab}
      aria-label={tabKey}
      role={role.tab}
      onClick={handleClick}
      {...attributes}
    >
      {children}
    </li>
  );
}
