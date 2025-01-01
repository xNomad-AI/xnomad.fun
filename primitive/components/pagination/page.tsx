import clsx from 'clsx';

import { PaginationCell } from './cell';

type Props = {
  onClick?: (page: number) => void;
  page: number;
  selected?: boolean;
};
export function PaginationPage(props: Props) {
  const { selected = false, page, onClick } = props;
  const handleClick = () => {
    if (!selected) {
      onClick?.(page);
    }
  };
  return (
    <PaginationCell
      className={clsx('rounded-8', selected ? 'bg-surface text-text1' : 'bg-transparent text-text2 hover:text-text1')}
      onClick={handleClick}
    >
      {page < 0 ? '...' : page}
    </PaginationCell>
  );
}
