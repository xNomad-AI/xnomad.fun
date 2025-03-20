import { Address } from "@/components/address";
import {
  Card,
  IconReset,
  IconWallet,
  Spin,
  Tooltip,
} from "@/primitive/components";
import { useAgentStore } from "../../store";
import { TokenNumber } from "@/components/token-number";
import { useSolBalance } from "@/lib/hooks/use-solana";
import { useMemo, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { Tab } from "..";
import clsx from "clsx";
import { InfiniteScrollList } from "@/components/infinit-scroll";
import { Analytics } from "./activity";
import { DepositModal } from "../deposit-container";

export function SideWallet() {
  const { portfolio, triggerRefresh, isRefreshing, nft } = useAgentStore();
  const account = useMemo(
    () => (portfolio?.wallet ? new PublicKey(portfolio.wallet) : null),
    [portfolio]
  );
  const { balance } = useSolBalance(account);
  const [tab, setTab] = useState<"holder" | "activity">("holder");
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className='flex flex-col gap-16 w-full flex-shrink-0'>
        <Card className='p-12 flex flex-col gap-4'>
          <span className='text-size-12'>Agent Wallet</span>
          <div className='flex items-center gap-4'>
            <div className='flex flex-col gap-4 flex-1'>
              <Address
                address={portfolio?.wallet ?? ""}
                enableCopy
                className='font-bold'
              />
              <TokenNumber number={balance.toNumber()} suffix={"SOL"} />
            </div>

            <Tooltip content='Deposit'>
              <button
                onClick={() => {
                  setOpen(true);
                }}
              >
                <IconWallet className='text-size-20 text-text1' />
              </button>
            </Tooltip>
          </div>
        </Card>

        <div className='flex items-center gap-16 mt-16'>
          <button
            className={`font-bold ${
              tab === "holder" ? "text-text1" : "text-white-60"
            }`}
            onClick={() => setTab("holder")}
          >
            Holding
          </button>
          <button
            className={`font-bold ${
              tab === "activity" ? "text-text1" : "text-white-60"
            }`}
            onClick={() => setTab("activity")}
          >
            Activity
          </button>
          {tab === "holder" && (
            <div className='flex-1 flex items-center justify-end'>
              <button
                onClick={() => {
                  triggerRefresh();
                }}
              >
                <IconReset
                  className={clsx("text-size-16", {
                    "animate-spin": isRefreshing,
                  })}
                />
              </button>
            </div>
          )}
        </div>
        {tab === "holder" && (
          <Card className='flex flex-col gap-12 p-12 w-full'>
            <div className='flex items-center gap-12 justify-between text-size-12 border-b pb-12 border-white-20'>
              <span>Asset</span>
              <span>Value</span>
            </div>
            {isRefreshing ? (
              <div className='w-full h-[100px] flex items-center justify-center'>
                <Spin />
              </div>
            ) : (portfolio?.items.length ?? 0) > 0 ? (
              <InfiniteScrollList
                items={portfolio?.items ?? []}
                itemSize={56}
                height={360}
                renderItem={(item) => {
                  return (
                    <div
                      key={item.address}
                      className='flex items-center w-full gap-12 h-56 justify-between'
                    >
                      <div className='flex items-center gap-4'>
                        <img
                          src={item.logoURI}
                          alt={item.symbol}
                          className='w-32 h-32 rounded-full object-contain'
                        />
                        <div className='flex flex-col'>
                          <span>{item.symbol}</span>
                          <Address
                            address={item.address}
                            enableCopy
                            className='text-text2'
                          />
                        </div>
                      </div>
                      <div className='flex flex-col items-end'>
                        <TokenNumber number={item.valueUsd} prefix={"$"} />
                        <TokenNumber
                          number={item.uiAmount}
                          className='text-text2'
                        />
                      </div>
                    </div>
                  );
                }}
                hasNextPage={false}
                isNextPageLoading={false}
                loadNextPage={() => {}}
              />
            ) : (
              <div className='flex justify-center w-full p-16 h-[200px] items-center text-text2'>
                No Assets
              </div>
            )}
          </Card>
        )}

        <Analytics
          skeletonNumber={5}
          nft={nft}
          itemHeight={68}
          variant='widget'
          show={tab === "activity"}
        />
      </div>
      <DepositModal
        address={nft.agentAccount.solana}
        onClose={() => {
          setOpen(false);
        }}
        open={open}
        onSuccess={() => {
          triggerRefresh();
        }}
      />
    </>
  );
}
