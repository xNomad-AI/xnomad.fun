import { api } from "@/primitive/api";
import { Character } from "@elizaos/core";
import { useMemoizedFn } from "ahooks";
import { useState, useRef, useEffect } from "react";
import { NFT } from "@/types";

export function useAgentSetup({ nft, agentId }: { nft: NFT; agentId: string }) {
  const [isAgentSetup, setIsAgentSetup] = useState(false);
  const hasTriggered = useRef(false);
  const triggerAgentSetup = useMemoizedFn(async () => {
    try {
      await api.v1.post(`/agent`, {
        nftId: nft.id,
        chain: "solana",
      });
      hasTriggered.current = true;
    } catch (error) {
      console.error(error);
    }
  });
  // check if agent is setup
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    const checkAgentSetup = () => {
      api.agent
        .get<{
          id: string;
          character: Character;
        }>(`/agents/${agentId}`)
        .then(() => {
          setIsAgentSetup(true);
          interval && clearInterval(interval);
        })
        .catch(() => {
          setIsAgentSetup(false);
          if (!hasTriggered.current) {
            triggerAgentSetup();
          }
        });
    };
    checkAgentSetup();
    interval = setInterval(() => {
      checkAgentSetup();
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  return {
    isAgentSetup,
    triggerAgentSetup,
  };
}
