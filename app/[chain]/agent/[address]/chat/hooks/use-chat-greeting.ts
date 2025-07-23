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
