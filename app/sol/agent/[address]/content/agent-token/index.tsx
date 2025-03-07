import { useAgentStore } from "../../store";
import { Detail } from "./token-detail";
import { TokenList } from "./token-list";

export function AgentToken() {
  const { nft } = useAgentStore();
  return (
    <>
      <TokenList show={!Boolean(nft.primaryCoin)} />
      <Detail show={Boolean(nft.primaryCoin)} nft={nft} />
    </>
  );
}
