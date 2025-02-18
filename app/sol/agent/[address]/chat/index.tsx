"use client";
import { useTransition, animated } from "@react-spring/web";
import { useEffect, useRef, useState } from "react";
import { Character } from "@elizaos/core";

import { ContentWithUser } from "./types";

import { Button, Spin } from "@/primitive/components";

import clsx from "clsx";
import { moment } from "./lib/utils";
import { NFT } from "@/types";
import { useMemoizedFn, useMount, useUnmount } from "ahooks";
import { useWallet } from "@solana/wallet-adapter-react";
import { isOwner } from "@/lib/user/ownership";
import { api } from "@/primitive/api";
import { use100vh } from "react-div-100vh";
import { useBreakpoint } from "@/primitive/hooks/use-screen";
import {
  ChatBubble,
  ChatBubbleMessage,
  ChatBubbleTimestamp,
} from "./components/chat/chat-bubble";
import { ChatMessageList } from "./components/chat/chat-message-list";
import CopyButton from "./components/copy-button";
import { AiResponse } from "./response";
import { useChatContext } from "./store";
import { ClearMemoryButton } from "./components/clear-memory";
import { InputForm } from "./components/input-form";

export function ChatPage({ nft, show }: { nft: NFT; show: boolean }) {
  const agentId = nft.agentId;

  const { publicKey } = useWallet();
  const [isAgentSetup, setIsAgentSetup] = useState(false);
  const hasTriggered = useRef(false);
  const {
    messages,
    setMessage,
    scrollToBottom,
    messagesContainerRef,
    setMessages,
  } = useChatContext();
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

  const getMessageVariant = useMemoizedFn((role: string) =>
    role !== "user" ? "received" : "sent"
  );

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
        createdAt: Date.now(),
      },
      {
        text: promptSuggestion,
        user: nft.name,
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
      return messages?.filter((msg) => msg.isLoading !== true) ?? [];
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
                const variant = getMessageVariant(message?.user ?? "");
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
                    <div className='flex flex-col flex-1'>
                      <ChatBubble
                        variant={variant}
                        className='flex flex-row items-center gap-2'
                      >
                        <div className='flex flex-col gap-8 w-full'>
                          <ChatBubbleMessage
                            variant={variant}
                            isLoading={message?.isLoading}
                          >
                            {message?.user !== "user" ? (
                              message ? (
                                <AiResponse message={message} nft={nft} />
                              ) : null
                            ) : (
                              message?.text
                            )}
                            {/* Attachments */}
                            <div>
                              {message?.attachments?.map((attachment, idx) => (
                                <div
                                  className='flex flex-col gap-1 mt-2'
                                  key={idx}
                                >
                                  <img
                                    src={attachment.url}
                                    width='100%'
                                    height='100%'
                                    className='w-64 rounded-md'
                                  />
                                  <div className='flex items-center justify-between gap-4'>
                                    <span></span>
                                    <span></span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ChatBubbleMessage>
                          <div className='flex items-center gap-12 justify-between text-text2'>
                            {message?.text &&
                            !message?.isLoading &&
                            !message.isAirdrop ? (
                              <div className='flex items-center gap-12'>
                                <CopyButton text={message?.text} />
                                {/* {message?.user !== "user" && (
                                  <ChatTtsButton
                                    agentId={agentId}
                                    text={message?.text}
                                  />
                                )} */}
                              </div>
                            ) : null}
                            <div
                              className={clsx([
                                message?.isLoading ? "mt-2" : "",
                                "flex items-center justify-between gap-12 select-none",
                              ])}
                            >
                              {message?.createdAt ? (
                                <ChatBubbleTimestamp
                                  timestamp={moment(message?.createdAt).format(
                                    "LT"
                                  )}
                                />
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </ChatBubble>
                    </div>
                  </Comp>
                );
              })}
            </ChatMessageList>
          </div>
          <div className='w-full flex flex-col gap-8'>
            <div className='flex items-center justify-between gap-16'>
              {isOwner(publicKey?.toBase58() ?? "", nft.owner ?? "") ? (
                <Button
                  onClick={() => {
                    const newMessages: ContentWithUser[] = [
                      {
                        text: "Claim Airdrop",
                        user: "user",
                        createdAt: Date.now(),
                      },
                      {
                        text: "Claim Airdrop",
                        action: "airdrop",
                        user: nft.name,
                        createdAt: Date.now(),
                      },
                    ];

                    setMessage(newMessages);
                  }}
                  variant='secondary'
                >
                  Claim Airdrop
                </Button>
              ) : (
                <div></div>
              )}
              <ClearMemoryButton />
            </div>
            <InputForm />
          </div>
        </>
      )}
    </div>
  );
}
