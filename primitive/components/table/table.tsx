import { PropsWithChildren } from "react";

import { TableBody } from "./body";
import { TableProvider } from "./context";
import { defaultProps } from "./default-props";
import { TableHeader } from "./header";
import { TablePlaceholder } from "./placeholder";
import { StickyContainer } from "./sticky-container";
import { TableProps } from "./type";

export function Table<T, V>(props: PropsWithChildren<TableProps<T, V>>) {
  const value = { ...defaultProps, ...props } as TableProps<T, V>;

  return (
    <TableProvider value={value as any}>
      <StickyContainer stickyNode={<TableHeader />}>
        <TablePlaceholder>
          <TableBody />
        </TablePlaceholder>
        {props.children}
      </StickyContainer>
    </TableProvider>
  );
}
