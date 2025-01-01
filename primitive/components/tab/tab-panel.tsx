import cx from 'clsx';
import { DetailedHTMLProps, HTMLAttributes } from 'react';

import { role } from './roles';
import { useTabs } from './tabs';

type Props = {
  tabKey: string;
} & DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;

export function TabPanel(props: Props) {
  const { className, children, tabKey, ...attributes } = props;
  const { activeTabKey } = useTabs();
  const selected = activeTabKey === tabKey;

  return (
    <section
      {...attributes}
      className={cx(className, selected ? '' : '!hidden')}
      role={role.tabPanel}
      aria-roledescription={role.tabPanel}
    >
      {selected ? children : null}
    </section>
  );
}
