import { api } from "@/primitive/api";
import { useMemoizedFn } from "ahooks";
import { useEffect, useState } from "react";
import { useChatContext } from "../store";
import { NFT } from "@/types";
import { useChainStore } from "@/app/layout/chain-provider";
import { getCurrencySymbol } from "@/app/layout/chain-provider/utils";

export function useChatGreeting({
  nft,
  initializingMemory,
}: {
  nft: NFT;
  initializingMemory: boolean;
}) {
  const { chain } = useChainStore();
  const [isGreeting, setIsGreeting] = useState(true);
  const { scrollToBottom, setMessages, messages } = useChatContext();
  // greeting
  const getGreeting = useMemoizedFn(async () => {
    setIsGreeting(true);
    try {
      const promptSuggestion = `Here are some example prompts if you want to trade: 
- Buy: 
  *Buy [$symbol(CA)] with [amount] ${getCurrencySymbol(chain)}
- Sell: 
  *Sell [amount] [$symbol(CA)] for ${getCurrencySymbol(chain)}
- Swap: 
  *swap [amount] ${getCurrencySymbol(chain)} for [$symbol(CA)]
  *Swap [amount][$symbol(CA)] for [$symbol(CA)]
_ Transfer:
  *Transfer [amount] [$symbol(CA)] to [wallet address]
- Limit Order: 
  *Create an automatic task to buy [$symbol(CA)] with [amount] ${getCurrencySymbol(
    chain
  )} when the token price is under $xx
  *Create an automatic task to sell [amount][$symbol(CA)] for ${getCurrencySymbol(
    chain
  )} when the token price is above $xx`;
      const greet = await api.v1.get<{ prologue: string }>("/agent/prologue", {
        nftId: nft.id,
        chain: chain,
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
    } finally {
      setIsGreeting(false);
    }
  });
  useEffect(() => {
    scrollToBottom();
    if (initializingMemory) return;
    if (!((messages?.length ?? 0) > 0)) {
      getGreeting();
    } else {
      setIsGreeting(false);
    }
  }, [initializingMemory, messages]);
  return {
    isGreeting,
  };
}
