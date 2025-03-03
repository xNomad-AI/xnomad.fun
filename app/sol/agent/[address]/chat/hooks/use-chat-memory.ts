import { api } from "@/primitive/api";
import { stringToUuid } from "@elizaos/core";
import { useState, useRef, useEffect } from "react";
import { useChatContext } from "../store";
import { Action } from "../content/types";
function convertMessageActionToWebAction(action: string): Action {
  switch (action) {
    case "ANALYZE_TOKEN":
      return "analyze";

    default:
      return action as unknown as Action;
  }
}
export function useChatMemory(isAgentSetup: boolean) {
  const { userId, agentId, setMessages } = useChatContext();
  const [initializingMemory, setInitializingMemory] = useState(true);
  const abortController = useRef<AbortController | null>(null);
  useEffect(() => {
    if (!isAgentSetup) return;
    // TODO: backend error, encoded room id twice, need to fix
    const roomId = stringToUuid(userId);
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();
    api.agent
      .get<{
        agentId: string;
        memories: {
          id: string;
          userId: string;
          agentId: string;
          createdAt: number; // in ms
          content: {
            text: string;
            action: string;
            webAction?: Action;
          };
          roomId: string;
          unique: boolean;
        }[];
        roomId: string;
      }>(`/agents/${agentId}/${roomId}/memories`, undefined, {
        signal: abortController.current?.signal,
      })
      .then((res) => {
        setInitializingMemory(false);
        setMessages(
          res.memories
            .sort((a, b) => a.createdAt - b.createdAt)
            .map((msg) => ({
              text: msg.content.text,
              user: msg.userId === agentId ? "system" : "user",
              createdAt: msg.createdAt,
              id: msg.id,
              webAction:
                msg.content.webAction ||
                convertMessageActionToWebAction(msg.content.action),
            }))
        );
      })
      .catch(() => {
        setInitializingMemory(false);
      });
  }, [agentId, userId, isAgentSetup]);
  return {
    initializingMemory,
  };
}
