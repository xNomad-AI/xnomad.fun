import { PropsWithChildren } from 'react';

import { useTableProps } from './context';

export function TablePlaceholder(props: PropsWithChildren<unknown>) {
  const { loadingHeight, loadingSlot = 'loading..', emptySlot = 'Empty', isLoading, dataSource } = useTableProps();
  const isEmpty = !isLoading && dataSource?.length === 0;

  return isLoading || isEmpty ? (
    <div className="flex items-center justify-center" style={{ height: loadingHeight }}>
      {isLoading ? loadingSlot : null}
      {isEmpty ? emptySlot : null}
    </div>
  ) : (
    props.children
  );
}
