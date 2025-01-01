import { useTableProps } from "./context";

export function TableHeader() {
  const {
    headRender: HeadRender,
    titleRender: TitleRender,
    columns,
    headerClassName,
  } = useTableProps();

  return (
    <HeadRender className={headerClassName}>
      {columns.map((column, index) => (
        <TitleRender
          key={column.dataIndex}
          index={index}
          className={column.titleClassName}
        >
          {column.title}
        </TitleRender>
      ))}
    </HeadRender>
  );
}
