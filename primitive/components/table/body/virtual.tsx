import { useTableProps } from '../context';
import { FixedVirtualTableBody } from './fixed';
import { VariableVirtualTableBody } from './variable';

export function VirtualTableBody() {
  const { virtualScrollType } = useTableProps();

  if (virtualScrollType === 'fixed') {
    return <FixedVirtualTableBody />;
  }

  if (virtualScrollType === 'variable') {
    return <VariableVirtualTableBody />;
  }

  return null;
}
