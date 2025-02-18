import { useState } from "react";
import { deleteAutoTask, getAutoTasks, Task } from "./network";
import { NFT } from "@/types";
import { useMemoizedFn, useRequest } from "ahooks";
import { InfiniteScrollList } from "@/components/infinit-scroll";
import { Button, Card, message } from "@/primitive/components";
import { Skeleton } from "../../analytics/components";
import { upperFirstLetter } from "@/lib/utils/string";
import clsx from "clsx";
import { TokenNumber } from "@/components/token-number";
import { beautifyTime, beautifyTimeV2 } from "@/lib/utils/beautify-time";
import { onError } from "@/lib/utils/error";
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
