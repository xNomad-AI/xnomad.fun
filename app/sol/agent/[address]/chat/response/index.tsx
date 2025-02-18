import { NFT } from "@/types";
import { ContentWithUser } from "../types";
import { Airdrop } from "./airdrop";

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

    default:
      break;
  }
}
