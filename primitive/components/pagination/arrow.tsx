import clsx from 'clsx';

import { IconArrowDown } from '../icon';
import { PaginationCell } from './cell';

type Props = {
  onClick?: () => void;
  type: 'increase' | 'decrease';
  visible: boolean;
  disabled?: boolean;
};
export function Arrow(props: Props) {
  const { onClick, type, visible, disabled = false } = props;
  const decrease = type === 'decrease';

  return visible ? (
    <PaginationCell
      onClick={onClick}
      disabled={disabled}
      className={clsx('text-size-16', decrease ? '-rotate-90' : 'rotate-90')}
    >
      <IconArrowDown />
    </PaginationCell>
  ) : null;
}
