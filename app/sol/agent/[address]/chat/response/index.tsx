import { NFT } from "@/types";
import { ContentWithUser } from "../types";
import { Airdrop } from "./airdrop";
import { Buy } from "./trade.tsx/buy";
import AIWriter from "react-aiwriter";

export function AiResponse({
  message,
  nft,
}: {
  message: ContentWithUser;
  nft: NFT;
}) {
  switch (message.action) {
    case "airdrop":
      return <Airdrop nft={nft} />;
    case "trade":
      switch (message.tradeAction) {
        case "buy":
          return <Buy />;
        // case 'sell':
        //   return <Sell />
        // case 'swap':
        //   return <Swap />
        // case 'transfer':
        //   return <Transfer />
        // case 'Limit-order':
        //   return <LimitOrder />
        // case 'copy-trade':
        //   return <CopyTrade />
        default:
          return "Trade action not found";
      }
    case "analyze":
    // return <Analyze />
    case "issue-token":
    // return <IssueToken />
    default:
      return <AIWriter>{message?.text}</AIWriter>;
  }
}
