import { NFT } from "@/types";
import { ContentWithUser } from "../types";
import { Airdrop } from "./airdrop";
import AIWriter from "react-aiwriter";
import { ResponseContainer } from "./container";
import { Buy } from "./trade.tsx/buy";
import { Sell } from "./trade.tsx/sell";
import { Transfer } from "./trade.tsx/transfer";
import { Swap } from "./trade.tsx/swap";
import { LimitOrder } from "./trade.tsx/limit-order";

export function AiResponse({
  message,
  nft,
}: {
  message: ContentWithUser;
  nft: NFT;
}) {
  switch (message.webAction) {
    case "airdrop":
      return <Airdrop nft={nft} message={message} />;
    case "trade":
      switch (message.tradeAction) {
        case "buy":
          return <Buy message={message} nft={nft} />;
        case "sell":
          return <Sell message={message} />;
        case "swap":
          return <Swap message={message} />;
        case "transfer":
          return <Transfer message={message} nft={nft} />;
        case "limit-order":
          return <LimitOrder message={message} nft={nft} />;
        // case 'copy-trade':
        //   return <CopyTrade />
        default:
          return "Trade action not found";
      }
    case "analyze":
    // return <Analyze />
    case "issue-token":
    // return <IssueToken />;
    default:
      return (
        <ResponseContainer showCopyButton showTimestamp message={message}>
          <AIWriter>{message?.text}</AIWriter>
        </ResponseContainer>
      );
  }
}
