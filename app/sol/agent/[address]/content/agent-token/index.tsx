import { Fragment } from "react";
import { useAgentStore } from "../../store";
import { Detail } from "./token-detail";
import { TokenList } from "./token-list";
import clsx from "clsx";

export function AgentToken({ show }: { show: boolean }) {
  const { nft } = useAgentStore();
  return (
    <div className={clsx("w-full flex", { hidden: !show })}>
      <TokenList show={!Boolean(nft.primaryCoin)} />
      <Detail show={Boolean(nft.primaryCoin)} nft={nft} />
    </div>
  );
}
