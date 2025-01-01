import { useTableProps } from "../context";
import { columnValue } from "./column-value";

export function NormalTableBody() {
  const {
    dataSource = [],
    tableBodyMaskSlot = null,
    columns,
    rowRender: RowRender,
    columnRender: ColumnRender,
    getRowKey,
    rowClassName,
  } = useTableProps();

  return (
    <div className='relative min-w-full inline-block'>
      {dataSource.map((data, index) => {
        const rowKey: string =
          getRowKey?.(data, index, dataSource) ?? `${index}`;
        return (
          <RowRender
            key={`${rowKey}-${index}`}
            rowKey={rowKey}
            index={index}
            className={rowClassName?.(data, index)}
          >
            {columns.map((column, columnIndex) => (
              <ColumnRender
                key={column.dataIndex}
                index={columnIndex}
                className={column.className}
              >
                {columnValue(data, column, index, rowKey)}
              </ColumnRender>
            ))}
          </RowRender>
        );
      })}
      {tableBodyMaskSlot}
    </div>
  );
}
