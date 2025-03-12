import { useState } from "react";
import { getCopyTradeTasks, CopyTrade } from "./network";
import { NFT } from "@/types";
import { useMemoizedFn, useRequest } from "ahooks";
import { Skeleton } from "../../wallet/activity/components";
import { TaskCard } from "./card";
import { use100vh } from "react-div-100vh";

export function CopyTradeTask({ nft }: { nft: NFT }) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [tasks, setTasks] = useState<CopyTrade[]>([]);
  const getTasks = useMemoizedFn(async () => {
    getCopyTradeTasks(nft.agentId)
      .then(setTasks)
      .finally(() => {
        setIsInitializing(false);
      });
  });
  useRequest(getTasks, {
    pollingInterval: 5000,
    ready: !!nft.agentId,
  });
  return tasks?.length > 0 ? (
    <div className='w-full grid grid-cols-3 landscape-tablet:grid-cols-2 portrait-tablet:grid-cols-1'>
      {tasks.map((task) => {
        return (
          <TaskCard
            agentId={nft.agentId}
            onChangeStatus={() => getTasks()}
            onDelete={() => getTasks()}
            key={task.id}
            task={task}
          />
        );
      })}
    </div>
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
  );
}
