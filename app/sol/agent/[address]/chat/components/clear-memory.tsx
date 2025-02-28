import { api } from "@/primitive/api";
import { useMemoizedFn } from "ahooks";
import { useState } from "react";
import { useChatContext } from "../store";
import { onError } from "@/lib/utils/error";
import { Button } from "@/primitive/components";
import clsx from "clsx";

export function ClearMemoryButton({ className }: { className?: string }) {
  const { userId, agentId, setMessages } = useChatContext();
  const [isClearingMemory, setIsClearingMemory] = useState(false);
  const clearMemory = useMemoizedFn(async () => {
    try {
      setIsClearingMemory(true);
      await api.v1.delete(`/agent/memory/`, {
        agentId,
        roomId: userId,
        userId,
      });
      setMessages([]);
    } catch (error) {
      onError(error);
    } finally {
      setIsClearingMemory(false);
    }
  });
  return (
    <Button
      variant='secondary'
      loading={isClearingMemory}
      size='s'
      className={clsx("!text-red", className)}
      onClick={clearMemory}
    >
      Clear Memory
    </Button>
  );
}
