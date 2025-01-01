import { useMemo } from "react";
import { useTableProps } from "../context";
import { VirtualRowRender } from "./row";
import { FixedSizeList } from "react-window";

export function FixedVirtualTableBody() {
  const {
    virtualHeight,
    dataSource,
    itemSize,
    overScanCount,
    outerElementType,
  } = useTableProps();

  const getItemSize = useMemo(
    () => (typeof itemSize === "function" ? itemSize(0) : itemSize),
    [itemSize]
  );

  return (
    <FixedSizeList
      width={"100%"}
      height={virtualHeight}
      itemSize={getItemSize}
      itemCount={dataSource.length}
      outerElementType={outerElementType}
      overscanCount={overScanCount}
    >
      {VirtualRowRender}
    </FixedSizeList>
  );
}
