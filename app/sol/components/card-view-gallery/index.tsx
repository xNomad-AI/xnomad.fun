"use client";

import { CardViewSkeleton } from "@/components/card/skeleton";
import { Empty } from "@/components/empty";
import clsx from "clsx";
import { PropsWithChildren, useMemo } from "react";

type Props = {
  loading: boolean;
  loadingMore: boolean;
  count: number;
  className?: string;
  lines?: number;
};

export function CardViewGallery(props: PropsWithChildren<Props>) {
  const { loading, loadingMore, count, className, lines } = props;

  const skeletons = useMemo(() => {
    const skeletons = Array.from({ length: 20 }).map((_, index) => index);
    return skeletons.map((cursor) => (
      <CardViewSkeleton key={`${cursor}`} lines={lines} />
    ));
  }, [lines]);

  const complement = useMemo(() => {
    const length = 20 - count;
    if (length > 0) {
      return Array.from({ length })
        .map((_, index) => index)
        .map((cursor) => <div key={`${cursor}`} />);
    }
    return null;
  }, [count]);

  if (count === 0 && !loading) {
    return <Empty className='h-fit m-auto' />;
  }

  return (
    <div
      className={clsx(
        "grid gap-24 mobile:gap-16 justify-items-stretch w-full mobile:grid-cols-2",
        "grid-cols-[repeat(auto-fit,_minmax(12.5rem,_1fr))]",
        className
      )}
    >
      {loading ? (
        skeletons
      ) : (
        <>
          {props.children}
          {complement}
          {loadingMore ? skeletons : null}
        </>
      )}
    </div>
  );
}
