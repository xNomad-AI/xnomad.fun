import { ReactNode } from "react";

import { TableColumn } from "../type";

export function columnValue(
  data: Record<string, any>,
  column: TableColumn<Record<string, any>, string | undefined>,
  rowIndex: number,
  rowKey: string
) {
  const keys = column.dataIndex.split(".");
  // const value = isPlaceholder ? null : data[key];

  const value = nestValue(data, keys);
  if (typeof column.render === "function") {
    return column.render(value, data, rowIndex, rowKey);
  }
  return (typeof value === "object" ? null : value) as ReactNode;
}

function nestValue(data: object, keys: string[]) {
  let value: unknown = data;
  for (const key of keys) {
    if (typeof value === "object" && value !== null) {
      value = (value as Record<string, unknown>)[key];
    }
  }
  return value;
}
