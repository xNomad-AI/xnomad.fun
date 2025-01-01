import { useTableProps } from '../context';
import { NormalTableBody } from './normal';
import { VirtualTableBody } from './virtual';

export function TableBody() {
  const { virtualScrollType = 'none' } = useTableProps();

  if (virtualScrollType === 'none') {
    return <NormalTableBody />;
  }

  return <VirtualTableBody />;
}
