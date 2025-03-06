import { useAgentStore } from "../../store";
import { TokenDetail } from "./token-detail";
import { TokenPageSocketProvider } from "./token-detail/store/socket";
import { TokenList } from "./token-list";

export function AgentToken() {
  const { nft } = useAgentStore();
  return (
    <>
      <TokenList show={!Boolean(nft.primaryCoin)} />
      <TokenDetail show={Boolean(nft.primaryCoin)} nft={nft} />
    </>
  );
}
