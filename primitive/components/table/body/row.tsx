import { CSSProperties, memo } from 'react';

import { useTableProps } from '../context';
import { columnValue } from './column-value';

export type VirtualRowRenderData = Pick<
  ReturnType<typeof useTableProps>,
  'columns' | 'dataSource' | 'getRowKey' | 'rowRender' | 'columnRender'
>;

export type VirtualRowRenderProps = {
  index: number;
  style?: CSSProperties;
};

export const VirtualRowRender = memo<VirtualRowRenderProps>(function VirtualRow(props) {
  const { index, style = {} } = props;

  const { columns, dataSource, getRowKey, rowRender: RowRender, columnRender: ColumnRender } = useTableProps();

  const data = dataSource[index];

  const rowKey = getRowKey?.(data, index, dataSource) ?? `${index}`;

  return (
    <div style={style} className="w-fit min-w-full">
      <RowRender key={rowKey} rowKey={rowKey} index={index}>
        {columns.map((column, columnIndex) => (
          <ColumnRender key={column.dataIndex} index={columnIndex}>
            {columnValue(data, column, index, rowKey)}
          </ColumnRender>
        ))}
      </RowRender>
    </div>
  );
});
