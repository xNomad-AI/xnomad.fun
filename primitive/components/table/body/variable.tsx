import { useMemo } from 'react';
import { VariableSizeList } from 'react-window';

import { useTableProps } from '../context';
import { VirtualRowRender } from './row';

export function VariableVirtualTableBody() {
  const { itemSize, virtualHeight, dataSource, outerElementType, overScanCount } = useTableProps();

  const getItemSize = useMemo(() => (typeof itemSize === 'function' ? itemSize : () => itemSize), [itemSize]);

  return (
    <div className="relative">
      <VariableSizeList
        width={'100%'}
        height={virtualHeight}
        itemSize={getItemSize}
        itemCount={dataSource.length}
        outerElementType={outerElementType}
        overscanCount={overScanCount}
      >
        {VirtualRowRender}
      </VariableSizeList>
    </div>
  );
}
