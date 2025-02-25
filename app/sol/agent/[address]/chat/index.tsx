"use client";
import { useTransition, animated } from "@react-spring/web";
import { useEffect, useRef, useState } from "react";
import { Character } from "@elizaos/core";
import { Spin } from "@/primitive/components";
import clsx from "clsx";
import { NFT } from "@/types";
import { useMemoizedFn, useMount, useUnmount } from "ahooks";
import { api } from "@/primitive/api";
import { use100vh } from "react-div-100vh";
import { useBreakpoint } from "@/primitive/hooks/use-screen";
import { ChatMessageList } from "./components/chat/chat-message-list";
import { ChatContent } from "./content";
import { useChatContext } from "./store";
import { ClearMemoryButton } from "./components/clear-memory";
import { InputForm } from "./components/input-form";
import { Actions } from "./actions";

export function ChatPage({ nft, show }: { nft: NFT; show: boolean }) {
  const agentId = nft.agentId;

  const [isAgentSetup, setIsAgentSetup] = useState(false);
  const hasTriggered = useRef(false);
  const { messages, scrollToBottom, messagesContainerRef, setMessages } =
    useChatContext();
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

  // greeting
  const getGreeting = useMemoizedFn(async () => {
    const promptSuggestion = `Here are some example prompts if you want to trade: 
- Buy: 
  *Buy [symbol] [ca] with [amount] SOL
- Sell: 
  *Sell [amount] [symbol] [ca] for SOL
- Swap: 
  *swap [amount] SOL for [symbol] [ca]
  *swap [amount][symbol] [ca] for [symbol] [ca]
- Limit Order: 
  *Create an automatic task to buy [symbol] [ca] with [amount] SOL when the token price is under $xx
  *Create an automatic task to sell [amount][symbol] [ca] for SOL when the token price is above $xx`;
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
  useMount(() => {
    scrollToBottom();
    if (!((messages?.length ?? 0) > 0)) {
      getGreeting();
    }
  });
  useUnmount(() => {
    setMessages((messages) => {
      return (
        messages?.filter(
          (msg) =>
            msg.isLoading !== true && // remove loading messages
            !msg.webAction // remove web actions
        ) ?? []
      );
    });
  });

  const transitions = useTransition(messages, {
    keys: (message) =>
      `${message?.createdAt}-${message?.user}-${message?.text}`,
    from: { opacity: 0, transform: "translateY(50px)" },
    enter: { opacity: 1, transform: "translateY(0px)" },
    leave: { opacity: 0, transform: "translateY(10px)" },
  });
  const height = use100vh();
  const { breakpoint } = useBreakpoint();
  return (
    <div
      style={{
        height:
          breakpoint === "mobile" && height ? height - 80 - 64 - 72 : undefined,
      }}
      className={clsx(
        "relative flex flex-col w-full max-w-[720px] h-[calc(100vh-64px-64px-72px)] mobile:h-[calc(100vh-80px-64px-72px)] gap-32",
        {
          hidden: !show,
        }
      )}
    >
      {!isAgentSetup ? (
        <div className='w-full h-full flex items-center justify-center flex-col gap-32'>
          <Spin className='!text-size-32' />
          <span className='text-size-16 font-bold'>
            Waiting for AI-Agent to Connect
          </span>
        </div>
      ) : (
        <>
          <div className='flex-1 overflow-y-auto'>
            <ChatMessageList ref={messagesContainerRef}>
              {transitions((styles, message) => {
                // FIXME: Fix this any
                const Comp = animated.div as any;
                return (
                  <Comp style={styles} className='flex gap-16'>
                    {message?.user !== "user" ? (
                      <img
                        className='h-32 w-32 flex-shrink-0 p-1 object-contain border rounded-full select-none'
                        height={32}
                        width={32}
                        alt=''
                        src={nft.image}
                      />
                    ) : null}

                    {message ? (
                      <ChatContent message={message} nft={nft} />
                    ) : null}
                  </Comp>
                );
              })}
            </ChatMessageList>
          </div>
          <div className='w-full flex flex-col gap-8'>
            <div className='flex justify-between gap-16'>
              <Actions nft={nft} />
              <ClearMemoryButton />
            </div>
            <InputForm />
          </div>
        </>
      )}
    </div>
  );
}
