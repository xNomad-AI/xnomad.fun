import { Card } from "@/primitive/components";
import { NFT } from "@/types";
import { DepositContainer } from "../container";
import { useEffect, useState } from "react";
import { Activity, getActivities, getTransferActivity } from "./network";
import { beautifyTimeV2 } from "@/lib/utils/beautify-time";
import { InfiniteScrollList } from "@/components/infinit-scroll";
import { useMemoizedFn, useRequest } from "ahooks";
import { useTimeStore } from "@/primitive/hooks/time";
import { ActionContent, ActionTag, Skeleton } from "./components";
import { getActionType } from "./utils";
export function Analytics({ nft }: { nft: NFT }) {
  const [activity, setActivity] = useState<Activity[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const { loading, run } = useRequest(
    async () => {
      getActivities({
        address: nft.agentAccount.solana,
        offset: activity.length,
        limit: 20,
      }).then((res) => {
        setActivity([...activity, ...res.items]);
        setHasNextPage(res.has_next);
      });
    },
    {
      manual: true,
      ready: isInitialized,
    }
  );
  const initData = useMemoizedFn(async () => {
    setIsInitializing(true);
    try {
      const swapActivity = await getActivities({
        address: nft.agentAccount.solana,
        offset: 0,
        limit: 20,
      });
      setHasNextPage(swapActivity.has_next);
      setActivity(swapActivity.items);
      setIsInitializing(false);
      setIsInitialized(true);
      const transferActivity = await getTransferActivity({
        address: nft.agentAccount.solana,
        limit: 20,
      });
      setActivity((old) => {
        return [...transferActivity, ...old].sort(
          (a, b) => b.block_unix_time - a.block_unix_time
        );
      });
    } catch (error) {
      setIsInitializing(false);
    }
  });
  useEffect(() => {
    if (nft.agentAccount.solana && !isInitialized) {
      initData();
    }
  }, [nft.agentAccount.solana]);
  useRequest(
    async () => {
      const swapActivity = await getActivities({
        address: nft.agentAccount.solana,
        offset: activity.length,
        afterTime: activity[0].block_unix_time,
        limit: 5,
      });
      const transferActivity = await getTransferActivity({
        address: nft.agentAccount.solana,
        limit: 5,
      });
      const newActivities = swapActivity.items
        .concat(transferActivity)
        .filter((item) => !activity.find((a) => a.tx_hash === item.tx_hash));
      setActivity(
        [...newActivities, ...activity].sort(
          (a, b) => b.block_unix_time - a.block_unix_time
        )
      );
    },
    {
      pollingInterval: 10000,
      ready: !!nft.agentAccount.solana && isInitialized,
    }
  );
  // use time tick to update time every second
  useTimeStore();
  return (
    <DepositContainer nft={nft}>
      <div className='flex mt-16 flex-col w-full'>
        {activity?.length > 0 ? (
          <InfiniteScrollList
            items={activity}
            renderItem={(item) => {
              const actionType = getActionType({
                data: item,
                agentAccount: nft.agentAccount.solana,
              });
              return (
                <Card
                  key={item.tx_hash}
                  className='p-16 flex items-center gap-8'
                >
                  <ActionTag type={actionType} />
                  <ActionContent data={item} type={actionType} />
                  <div className='flex-1'></div>
                  <a
                    href={`https://explorer.solana.com/tx/${item.tx_hash}`}
                    target='_blank'
                    rel='noreferrer'
                    className='underline'
                  >
                    {beautifyTimeV2(item.block_unix_time * 1000)}
                  </a>
                </Card>
              );
            }}
            hasNextPage={hasNextPage}
            isNextPageLoading={loading}
            loadNextPage={run}
          />
        ) : isInitializing ? (
          <div className='w-full flex flex-col gap-16'>
            {new Array(10).fill(0).map((_, index) => {
              return <Skeleton key={index} />;
            })}
          </div>
        ) : (
          <div className='flex justify-center w-full p-16 h-[200px] items-center text-text2'>
            No Activities
          </div>
        )}
      </div>
    </DepositContainer>
  );
}
