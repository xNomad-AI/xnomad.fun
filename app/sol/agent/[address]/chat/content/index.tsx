import { NFT } from "@/types";
import { ContentWithUser } from "../types";
import { Airdrop } from "./airdrop";
import AIWriter from "react-aiwriter";
import { ChatContentContainer } from "./container";
import { Buy } from "./trade.tsx/buy";
import { Sell } from "./trade.tsx/sell";
import { Transfer } from "./trade.tsx/transfer";
import { Swap } from "./trade.tsx/swap";
import { LimitOrder } from "./trade.tsx/limit-order";
import { IssueToken } from "./issue-token";
import { AnalyzeInput, AnalyzeResponse } from "./analyze";

export function ChatContent({
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
          return <Sell message={message} nft={nft} />;
        case "swap":
          return <Swap message={message} nft={nft} />;
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
      if (message.user === "user") {
        return <AnalyzeInput message={message} />;
      } else {
        return <AnalyzeResponse message={message} nft={nft} />;
      }
    case "issue-token":
      return <IssueToken message={message} nft={nft} />;
    default:
      return (
        <ChatContentContainer showCopyButton showTimestamp message={message}>
          <AIWriter>{message?.text}</AIWriter>
        </ChatContentContainer>
      );
  }
}
