import { Card } from "@/primitive/components";
import { NFT } from "@/types";
import { useEffect, useState } from "react";
import { Activity, getActivities, getTransferActivity } from "./network";
import { beautifyTimeV2 } from "@/lib/utils/beautify-time";
import { InfiniteScrollList } from "@/components/infinit-scroll";
import { useMemoizedFn, useRequest } from "ahooks";
import { useTimeStore } from "@/primitive/hooks/time";
import { ActionContent, ActionTag, Skeleton } from "./components";
import { getActionType } from "./utils";
import { useBreakpoint } from "@/primitive/hooks/use-screen";
import clsx from "clsx";
export function Analytics({
  nft,
  itemHeight,
  skeletonNumber = 10,
  variant,
  show,
  height,
}: {
  nft: NFT;
  itemHeight?: number;
  skeletonNumber?: number;
  variant?: "normal" | "widget";
  show: boolean;
  height?: number;
}) {
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
      const [swapActivity, transferActivity] = await Promise.all([
        getActivities({
          address: nft.agentAccount.solana,
          offset: 0,
          limit: 20,
        }),
        getTransferActivity({
          address: nft.agentAccount.solana,
          limit: 10,
        }),
      ]);
      setHasNextPage(swapActivity.has_next);
      setActivity((old) => {
        const newActivities = swapActivity.items
          .concat(transferActivity)
          .filter((item) => !old.find((a) => a.tx_hash === item.tx_hash));
        return [...newActivities, ...old].sort(
          (a, b) => b.block_unix_time - a.block_unix_time
        );
      });
      setIsInitializing(false);
      setIsInitialized(true);
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

      setActivity((old) => {
        const newActivities = swapActivity.items
          .concat(transferActivity)
          .filter((item) => !old.find((a) => a.tx_hash === item.tx_hash));
        return [...newActivities, ...old].sort(
          (a, b) => b.block_unix_time - a.block_unix_time
        );
      });
    },
    {
      pollingInterval: 5000,
      ready: !!nft.agentAccount.solana && isInitialized && show,
    }
  );
  // use time tick to update time every second
  useTimeStore();
  const { breakpoint } = useBreakpoint();
  return (
    <div
      className={clsx("flex flex-col w-full", {
        hidden: !show,
        "border rounded-12 p-12 border-white-20 h-full": variant === "widget",
      })}
    >
      {activity?.length > 0 ? (
        <InfiniteScrollList
          height={height ?? 360}
          items={activity}
          gutterSize={variant === "widget" ? 0 : undefined}
          itemSize={itemHeight ?? (breakpoint === "mobile" ? 89 : 60)}
          renderItem={(item) => {
            const actionType = getActionType({
              data: item,
              agentAccount: nft.agentAccount.solana,
            });
            const content = (
              <>
                <ActionTag type={actionType} />
                <ActionContent
                  simple={variant === "widget"}
                  data={item}
                  type={actionType}
                />
                <div className={clsx("flex-1 min-w-16")}></div>
              </>
            );
            return (
              <Card
                key={item.tx_hash}
                style={{
                  height: variant === "widget" ? "fit-content" : undefined,
                  fontSize: variant === "widget" ? "12px" : "14px",
                  border: variant === "widget" ? "none" : undefined,
                  padding: variant === "widget" ? "0px" : undefined,
                  borderRadius: variant === "widget" ? "0px" : undefined,
                }}
                className='p-16 flex items-center gap-8 flex-wrap'
              >
                {variant === "widget" ? (
                  <>
                    <div className='flex-1 flex flex-wrap gap-8 items-center'>
                      {content}
                    </div>
                    <div className='min-w-[80px]'></div>
                  </>
                ) : (
                  content
                )}
                <a
                  href={`https://explorer.solana.com/tx/${item.tx_hash}`}
                  target='_blank'
                  rel='noreferrer'
                  className={clsx("underline", {
                    "self-end": variant === "widget",
                  })}
                >
                  {beautifyTimeV2(
                    item.block_unix_time * 1000,
                    variant === "widget",
                    false,
                    variant === "widget" ? "" : undefined
                  )}
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
          {new Array(skeletonNumber).fill(0).map((_, index) => {
            return <Skeleton key={index} />;
          })}
        </div>
      ) : (
        <div className='flex justify-center w-full p-16 h-[200px] items-center text-text2'>
          No Activities
        </div>
      )}
    </div>
  );
}
