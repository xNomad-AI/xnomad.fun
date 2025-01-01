import { createContext, useContext } from 'react';

import { NullableField, NullableProps } from './default-props';
import { TableColumn, TableProps } from './type';

export const tablePropsContext = createContext<TableProps>({
  columns: [],
  dataSource: [],
});

export function useTableProps<Supply = unknown, Column = TableColumn<Record<string, any>>>() {
  // Omit<TableProps<Record<string, any>, T>, NullableField> & NullableProps
  return useContext(tablePropsContext) as Omit<TableProps<Record<string, any>, Supply>, NullableField> & {
    columns: Column[];
  } & NullableProps;
}

export const TableProvider = tablePropsContext.Provider;
