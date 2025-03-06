import { TokenInfo } from "@/app/sol/agent/[address]/content/agent-token/token-list/network";
import { Character, UUID } from "@elizaos/core";

export interface NFT {
  _id: string;
  id: UUID;
  agentId: UUID;
  owner?: string;
  aiAgent: {
    engine: string;
    character: Character;
  };
  chain: string;
  collectionId: string;
  collectionName: string;
  contractAddress: string;
  createdAt: string;
  image: string;
  name: string;
  nftId: string;
  rarity: {
    score: number;
    rank: number;
  };
  tokenId: string;
  tokenURI: string;
  traits: {
    type: string;
    value: string;
  }[];
  updatedAt: string;
  agentAccount: {
    solana: string;
    evm: string;
  };
  primaryCoin?: {
    symbol: string;
    image: string;
    address: string;
  };
}
