import clsx from "clsx";
import React from "react";

import { PropsWithClassName } from "../helper";
import { useTableProps } from "./context";
import { ColumnRenderProps, HeadRenderProps, RowRenderProps } from "./type";

export function DefaultTableColumnRender(
  props: PropsWithClassName<ColumnRenderProps>
) {
  const { index, children, className } = props;
  const { columns, columnGap, paddingLeftRight } = useTableProps();
  const column = columns[index];
  const head = index === 0;
  const tail = index === columns.length - 1;
  const { fixed = false, width, justify } = column;
  const justifyContent = justify ?? (fixed ? "start" : "end");
  const left = fixed
    ? columns
        .slice(0, index)
        .reduce(
          (total, column) => total + column.width,
          head ? 0 : paddingLeftRight ?? 0
        )
    : "unset";
  const style = {
    width: head || tail ? width + (paddingLeftRight ?? columnGap ?? 0) : width,
    paddingLeft: head ? paddingLeftRight : "unset",
    paddingRight: tail ? paddingLeftRight ?? columnGap : columnGap,
    left,
    justifyContent,
  };

  return (
    <div
      className={clsx(
        "h-full flex items-center shrink-0 bg-inherit",
        fixed ? "z-3 justify-start sticky" : "justify-end",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}

export function DefaultTableHeadRender(
  props: PropsWithClassName<HeadRenderProps>
) {
  return (
    <div
      className={clsx(
        "w-fit min-w-full whitespace-pre flex items-center justify-between relative h-[3.5rem] bg-[#090909]",
        props.className
      )}
    >
      {props.children}
    </div>
  );
}

export const DefaultTableTitleRender = DefaultTableColumnRender;

export function DefaultTableRowRender(
  props: RowRenderProps & React.JSX.IntrinsicElements["div"]
) {
  const { children, className, ...attributes } = props;

  return (
    <div
      className={clsx(
        "bg-background hover:bg-surface flex items-center justify-between h-[3.5rem] relative",
        className
      )}
      {...attributes}
    >
      {children}
    </div>
  );
}
