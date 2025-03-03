import { api } from "@/primitive/api";
import { useMemoizedFn } from "ahooks";
import { useEffect } from "react";
import { useChatContext } from "../store";
import { NFT } from "@/types";

export function useChatGreeting({
  nft,
  initializingMemory,
}: {
  nft: NFT;
  initializingMemory: boolean;
}) {
  const { scrollToBottom, setMessages, messages } = useChatContext();
  // greeting
  const getGreeting = useMemoizedFn(async () => {
    const promptSuggestion = `Here are some example prompts if you want to trade: 
- Buy: 
  *Buy [$symbol(CA)] with [amount] SOL
- Sell: 
  *Sell [amount] [$symbol(CA)] for SOL
- Swap: 
  *swap [amount] SOL for [$symbol(CA)]
  *Swap [amount][$symbol(CA)] for [$symbol(CA)]
_ Transfer:
  *Transfer [amount] [$symbol(CA)] to [wallet address]
- Limit Order: 
  *Create an automatic task to buy [$symbol(CA)] with [amount] SOL when the token price is under $xx
  *Create an automatic task to sell [amount][$symbol(CA)] for SOL when the token price is above $xx`;
    const greet = await api.v1.get<{ prologue: string }>("/agent/prologue", {
      nftId: nft.id,
      chain: "solana",
    });
    const newMessages = [
      {
        text: greet.prologue,
        user: nft.name,
        id: "greeting",
        createdAt: Date.now(),
      },
      {
        text: promptSuggestion,
        user: nft.name,
        id: "prompt",
        createdAt: Date.now(),
      },
    ];
    setMessages((old) => {
      if (!old || old?.length === 0) {
        return newMessages;
      } else {
        return old ?? [];
      }
    });
  });
  useEffect(() => {
    scrollToBottom();
    if (initializingMemory) return;
    if (!((messages?.length ?? 0) > 0)) {
      getGreeting();
    }
  }, [initializingMemory, messages]);
}
