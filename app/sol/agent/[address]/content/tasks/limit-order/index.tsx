import { useState } from "react";
import { getAutoTasks, Task } from "./network";
import { NFT } from "@/types";
import { useMemoizedFn, useRequest } from "ahooks";
import { InfiniteScrollList } from "@/components/infinit-scroll";
import { Skeleton } from "../../analytics/components";
import { TaskCard } from "./card";

export function LimitOrderTask({ nft }: { nft: NFT }) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const getTasks = useMemoizedFn(async () => {
    getAutoTasks(nft.agentId)
      .then(setTasks)
      .finally(() => {
        setIsInitializing(false);
      });
  });
  useRequest(getTasks, {
    pollingInterval: 5000,
    ready: !!nft.agentId,
  });
  return (
    <div className='flex flex-col w-full'>
      {tasks?.length > 0 ? (
        <InfiniteScrollList
          items={tasks}
          itemSize={85}
          renderItem={(item: Task) => {
            if (!item) return null;
            return (
              <TaskCard
                task={item}
                key={item.id}
                agentId={nft.agentId}
                onDelete={() => {
                  getTasks();
                }}
              />
            );
          }}
          hasNextPage={false}
          isNextPageLoading={false}
          loadNextPage={() => {}}
        />
      ) : isInitializing ? (
        <div className='w-full flex flex-col gap-16'>
          {new Array(10).fill(0).map((_, index) => {
            return <Skeleton key={index} />;
          })}
        </div>
      ) : (
        <div className='flex justify-center w-full p-16 h-[200px] items-center text-text2'>
          No Tasks
        </div>
      )}
    </div>
  );
}
