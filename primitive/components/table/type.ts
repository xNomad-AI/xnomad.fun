import { PropsWithChildren, ReactNode } from "react";

export type NestedKeys<T> = {
  [K in keyof T]: K extends string
    ? T[K] extends object
      ? K | `${K}.${NestedKeys<T[K]>}`
      : K
    : unknown;
}[keyof T] &
  string;

type NestedValue<T, K> = T extends object
  ? K extends string
    ? K extends `${infer First}.${infer Rest}`
      ? First extends keyof T & string
        ? NestedValue<T[First], Rest>
        : unknown
      : K extends keyof T
      ? T[K]
      : unknown
    : unknown
  : unknown;

export type TableVirtualScrollType = "variable" | "fixed" | "none";

type TableRenderColumnField<T, S, K extends string> = S extends NestedKeys<T>
  ? {
      dataIndex: S;
      activeString?: K;

      render?: (
        value: NestedValue<T, S>,
        row: T,
        index: number,
        rowKey: string
      ) => ReactNode;
    }
  : {
      dataIndex: unknown;
      render?: (
        value: unknown,
        row: T,
        index: number,
        rowKey: string
      ) => ReactNode;
    };

export type TableColumn<T = unknown, K = unknown> = {
  fixed?: boolean;
  title?: ReactNode;
  className?: string;
  titleClassName?: string;
  width: number;
  justify?: "start" | "end" | "center" | "between";
} & TableRenderColumnField<T, NestedKeys<T>, K extends string ? K : never>;

export type HeadRenderProps = PropsWithChildren<{ className?: string }>;

export type ColumnRenderProps = PropsWithChildren<{
  index: number;
  className?: string;
}>;

export type RowRenderProps = PropsWithChildren<{
  rowKey: string;
  index: number;
  className?: string;
}>;

export type TitleRenderProps = ColumnRenderProps;

export type TableProps<T = unknown, S = unknown> = {
  dataSource: T[];
  columns: TableColumn<T, string>[];
  getRowKey?: (value: T, index: number, data: T[]) => string;
  // loading相关
  isLoading?: boolean;
  loadingHeight?: number; // loading&empty态高度，默认是行高56*10
  columnGap?: number;

  className?: string;
  tableClassName?: string;
  headerClassName?: string;
  rowClassName?: (row: T, index: number) => string;
  paddingLeftRight?: number; // rename paddingX
  tableBodyMaskSlot?: ReactNode;
  loadingSlot?: ReactNode;
  emptySlot?: ReactNode;

  // none is not virtual scroll
  virtualScrollType?: TableVirtualScrollType;
  // for virtual scroll
  itemSize?: number | ((index: number) => number);
  overScanCount?: number;
  virtualHeight?: number;
  outerElementType?: any;

  headStickyType?: "none" | "container" | "page";
  scrollContainer?: HTMLElement | null;
  id?: string;

  headRender?: (props: HeadRenderProps) => ReactNode;
  titleRender?: (props: TitleRenderProps) => ReactNode;
  rowRender?: (props: RowRenderProps) => ReactNode;
  columnRender?: (props: ColumnRenderProps) => ReactNode;

  supply?: S;
};
