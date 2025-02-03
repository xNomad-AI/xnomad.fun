/* eslint-disable @typescript-eslint/no-explicit-any */
import { Spin } from "@/primitive/components";
import React, { useEffect, useState } from "react";
import { FixedSizeList } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";

const itemSize = 60;
const gutterSize = 16;
export function InfiniteScrollList({
  // Are there more items to load?
  // (This information comes from the most recent API request.)
  hasNextPage,

  // Are we currently loading a page of items?
  // (This may be an in-flight flag in your Redux store for example.)
  isNextPageLoading,

  // Array of items loaded so far.
  items,

  // Callback function responsible for loading the next page of items.
  loadNextPage,
  props,
  renderItem,
}: {
  hasNextPage: boolean;
  isNextPageLoading: boolean;
  items: any[];
  loadNextPage: () => void;
  props?: any;
  renderItem: (item: any) => React.ReactNode;
}) {
  // If there are more items to be loaded then add an extra row to hold a loading indicator.
  const itemCount = hasNextPage ? items.length + 1 : items.length;

  // Only load 1 page of items at a time.
  // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
  const loadMoreItems = isNextPageLoading ? () => {} : loadNextPage;

  // Every row is loaded except for our loading indicator row.
  const isItemLoaded = (index: number) => !hasNextPage || index < items.length;
  const [height, setHeight] = useState(396);
  useEffect(() => {
    const bodyHeight = document.body.clientHeight;
    const headerHeight = 64;
    const liveBarHeight = 40;
    const overviewHeight = 100;
    setHeight(
      bodyHeight - (headerHeight ?? 0) - overviewHeight - liveBarHeight - 32 * 3
    );
  }, []);
  return (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      itemCount={itemCount}
      loadMoreItems={loadMoreItems}
    >
      {({ onItemsRendered, ref }) => (
        <FixedSizeList
          className='hide-scrollbar'
          itemCount={itemCount}
          onItemsRendered={onItemsRendered}
          ref={ref}
          height={height}
          itemSize={itemSize + gutterSize}
          {...props}
        >
          {({ index, style }) => {
            let content;
            if (!isItemLoaded(index)) {
              content = (
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Spin />
                </div>
              );
            } else {
              content = renderItem(items[index]);
            }

            return (
              <div
                key={items[index]?.hash}
                style={{
                  ...style,
                  top: style.top ?? 0 + gutterSize,
                  height: style.height ?? itemSize - gutterSize,
                }}
              >
                {content}
              </div>
            );
          }}
        </FixedSizeList>
      )}
    </InfiniteLoader>
  );
}
