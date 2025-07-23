import { useMemo, useState } from "react";
import { getAgentTokenList, TokenInfo } from "./network";
import { useRequest } from "ahooks";
import { useAgentStore } from "../../../store";
import { Button, Card, message, Spin } from "@/primitive/components";
import { TokenNumber } from "@/components/token-number";
import { RateNum } from "@/components/rate-number";
import clsx from "clsx";
import { TokenCell } from "./token-cell";
import { AgeCell } from "./age-cell";
import { BindModal } from "./bind-modal";
import { isOwner } from "@/lib/user/ownership";
import Link from "next/link";
import { useChainStore } from "@/app/layout/chain-provider";
import { useUserStore } from "@/app/layout/chain-provider/hook";

export function TokenList({ show }: { show: boolean }) {
  const { chain } = useChainStore();
  const { nft, refreshNFT } = useAgentStore();
  const { userAddress } = useUserStore();
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const { loading } = useRequest(
    async () => {
      const res = await getAgentTokenList({
        creatorAddress:
          chain === "solana" ? nft.agentAccount.solana : nft.agentAccount.evm,
        onlyBound: 0,
        chain,
      });
      setTokens(res.list);
    },
    {
      refreshDeps: [nft.agentAccount, chain],
    }
  );
  const [showModal, setShowModal] = useState(false);
  const [initToken, setInitToken] = useState<TokenInfo>();
  const ownerShip = useMemo(
    () => isOwner(nft.owner, userAddress),
    [nft.owner, userAddress]
  );
  return (
    <div
      className={clsx("flex flex-col gap-16 w-full", {
        hidden: !show,
      })}
    >
      {ownerShip && (
        <Card className='flex items-center justify-between p-16 relative'>
          <img
            alt='NFT Image'
            className='w-full h-full object-cover -z-2 absolute left-0 top-0'
            src={nft.image}
          />
          <div className='w-full h-full -z-1 absolute left-0 top-0 bg-black-60'></div>
          <div className='text-size-16 font-bold'>Agent Token Not Bound</div>
          <Button
            onClick={() => {
              if (tokens.length > 0) {
                setInitToken(undefined);
                setShowModal(true);
              } else {
                message("Please issue the tokens with the agent first.", {
                  type: "error",
                });
              }
            }}
          >
            Bind Agent Token
          </Button>
        </Card>
      )}
      <p className='mt-16 text-text2'>
        The following shows the tokens issued by the AI agent. DYOR.
      </p>
      <div className='flex flex-col w-full'>
        <div className='flex items-center justify-between w-full border-b border-white-20 gap-8 h-40 text-white-40 text-size-12'>
          <div className='flex w-[200px]'>Issued Token</div>
          <div className='flex w-[120px] justify-end'>Price</div>
          <div className='flex w-[120px] justify-end'>Marketcap</div>
          <div className='flex w-[120px] justify-end'>24h Volume</div>
          <div className='flex w-[120px] justify-end'>Liquidity</div>
          <div className='flex w-[120px] justify-end'>Age</div>
        </div>
        {loading ? (
          <div className='h-[100px] w-full flex items-center justify-center'>
            <Spin />
          </div>
        ) : (tokens?.length ?? 0) > 0 ? (
          tokens?.map((item) => (
            <div
              key={item.symbol}
              className='h-64 group flex items-center justify-between w-full border-b border-white-20 gap-8'
            >
              <div className='flex w-[200px] gap-4 items-center'>
                <TokenCell item={item} />
              </div>
              <div className='flex w-[120px] flex-col items-end'>
                <TokenNumber prefix={"$"} number={item.price} />
                <RateNum num={item.priceChange24h} />
              </div>
              <div className='flex w-[120px] justify-end'>
                <TokenNumber number={item.marketCap} prefix={"$"} />
              </div>
              <div className='flex w-[120px] justify-end'>
                <TokenNumber prefix={"$"} number={item.volume24h} />
              </div>
              <div className='flex w-[120px] justify-end'>
                <TokenNumber prefix={"$"} number={item.liquidity} />
              </div>
              <div
                className={clsx("flex w-[120px] justify-end", {
                  "group-hover:hidden": ownerShip,
                })}
              >
                <AgeCell time={item.deployedTime} />
              </div>
              <div
                className={clsx("w-[120px] justify-end hidden", {
                  "group-hover:flex": ownerShip,
                })}
              >
                <Button
                  onClick={() => {
                    setInitToken(item);
                    setShowModal(true);
                  }}
                >
                  Bind
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className='flex justify-center w-full p-16 h-[200px] items-center text-text2'>
            No Tokens
          </div>
        )}
      </div>
      {ownerShip && !loading && !tokens?.length && (
        <Link
          className='w-fit self-center'
          href={`/${chain}/agent/${nft.id}?tab=chat&action=issue-token`}
        >
          <Button variant='secondary' className='!w-[200px]'>
            Issue Token
          </Button>
        </Link>
      )}
      <BindModal
        onClose={() => {
          setShowModal(false);
        }}
        onSuccess={() => {
          refreshNFT(chain);
        }}
        open={showModal}
        nft={nft}
        tokens={tokens}
        initToken={initToken}
      />
    </div>
  );
}
