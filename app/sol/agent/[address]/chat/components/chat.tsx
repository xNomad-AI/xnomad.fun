"use client";
import { useTransition, animated } from "@react-spring/web";
import { Paperclip, Send } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Character, Content } from "@elizaos/core";
import CopyButton from "./copy-button";
import AIWriter from "react-aiwriter";
import { AudioRecorder } from "./audio-recorder";
import { IAttachment } from "../types";
import { useMutation } from "@tanstack/react-query";

import {
  Button,
  Card,
  IconClose,
  IconDiscordFilled,
  IconTelegramFilled,
  IconTwitterX,
  IconWebsiteFilled,
  Spin,
  Tooltip,
} from "@/primitive/components";
import { apiClient } from "../lib/api";
import { ChatMessageList } from "./ui/chat/chat-message-list";
import {
  ChatBubble,
  ChatBubbleMessage,
  ChatBubbleTimestamp,
} from "./ui/chat/chat-bubble";
import clsx from "clsx";
import { moment } from "../lib/utils";
import { ChatInput } from "./ui/chat/chat-input";
import { NFT } from "@/types";
import { useAirdrops } from "@/network/use-airdrops";
import {
  useLocalStorageState,
  useMemoizedFn,
  useMount,
  useUnmount,
} from "ahooks";
import { useWallet } from "@solana/wallet-adapter-react";
import { isOwner } from "@/lib/user/ownership";
import { api } from "@/primitive/api";
import { onError } from "@/lib/utils/error";
import { stringToUuid } from "../lib/uuid";
import { useConnectModalStore } from "@/components/connect-modal/store";
import { use100vh } from "react-div-100vh";
import { useBreakpoint } from "@/primitive/hooks/use-screen";
interface ExtraContentFields {
  user: string;
  createdAt: number;
  isLoading?: boolean;
  isAirdrop?: boolean;
}

type ContentWithUser = Content & ExtraContentFields;

export function ChatPage({ nft, show }: { nft: NFT; show: boolean }) {
  const agentId = nft.agentId;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [input, setInput] = useState("");
  const { publicKey } = useWallet();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isAgentSetup, setIsAgentSetup] = useState(false);
  const hasTriggered = useRef(false);
  const { setVisible } = useConnectModalStore();
  const userId = useMemo(() => {
    if (publicKey) {
      return stringToUuid(publicKey.toBase58());
    } else {
      return stringToUuid(`web-${Date.now()}-${agentId}-${Math.random()}`);
    }
  }, [publicKey, agentId]);
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
        .then((res) => {
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
  const [claimedAirdrops, setClaimedAirdrops] = useState<string[]>([]);
  const { airdrops } = useAirdrops({
    agentAddress: nft.agentAccount.solana,
  });
  const getMessageVariant = (role: string) =>
    role !== "user" ? "received" : "sent";

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };
  const [messages, setMessages] = useLocalStorageState<ContentWithUser[]>(
    `messages-${agentId}`,
    {
      defaultValue: [],
    }
  );
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setMessage = useMemoizedFn((newMessages: ContentWithUser[]) => {
    setMessages((old = []) => [...old, ...newMessages]);
  });
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSendMessage(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input && !selectedFile) return;

    const attachments: IAttachment[] | undefined = selectedFile
      ? [
          {
            url: URL.createObjectURL(selectedFile),
            contentType: selectedFile.type,
            title: selectedFile.name,
          },
        ]
      : undefined;

    const newMessages = [
      {
        text: input,
        user: "user",
        createdAt: Date.now(),
        attachments,
      },
      {
        text: input,
        user: "system",
        isLoading: true,
        createdAt: Date.now(),
      },
    ];
    setMessage(newMessages as unknown as ContentWithUser[]);

    sendMessageMutation.mutate({
      message: input,
      selectedFile: selectedFile ? selectedFile : null,
    });

    setSelectedFile(null);
    setInput("");
    formRef.current?.reset();
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const sendMessageMutation = useMutation({
    mutationKey: ["send_message", agentId],
    mutationFn: ({
      message,
      selectedFile,
    }: {
      message: string;
      selectedFile?: File | null;
    }) => apiClient.sendMessage(userId, agentId, message, selectedFile),
    onSuccess: (newMessages: ContentWithUser[]) => {
      setMessages((old: ContentWithUser[] = []) => [
        ...old.filter((msg) => !msg.isLoading),
        ...newMessages.map((msg) => ({
          ...msg,
          createdAt: Date.now(),
        })),
      ]);
    },
    onError: (e) => {
      onError(e);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
    }
  };

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
                              message?.isAirdrop ? (
                                <div className='flex flex-col gap-8 w-full'>
                                  <span>
                                    Here are the airdrops you can claim:
                                  </span>
                                  {airdrops?.length > 0
                                    ? airdrops.map((airdrop) => (
                                        <Card
                                          key={airdrop?.id}
                                          className='py-14 px-8 flex font-bold items-center gap-8 justify-between flex-wrap'
                                        >
                                          <div className='flex items-center gap-8'>
                                            <img
                                              src={airdrop?.issuer?.image}
                                              height={20}
                                              width={20}
                                              className='rounded-full w-20 aspect-square'
                                            />
                                            <span>{airdrop?.name}</span>
                                          </div>
                                          <div className='flex items-center gap-8'>
                                            {airdrop?.issuer
                                              .officialWebsite && (
                                              <a
                                                href={
                                                  airdrop?.issuer
                                                    .officialWebsite
                                                }
                                                target='_blank'
                                              >
                                                <IconWebsiteFilled className='text-size-16' />
                                              </a>
                                            )}
                                            {airdrop?.issuer.twitter && (
                                              <a
                                                href={airdrop?.issuer.twitter}
                                                target='_blank'
                                              >
                                                <IconTwitterX className='text-size-16' />
                                              </a>
                                            )}
                                            {airdrop?.issuer.telegram && (
                                              <a
                                                href={airdrop?.issuer.telegram}
                                                target='_blank'
                                              >
                                                <IconTelegramFilled className='text-size-16' />
                                              </a>
                                            )}
                                            {airdrop?.issuer.discord && (
                                              <a
                                                href={airdrop?.issuer.discord}
                                                target='_blank'
                                              >
                                                <IconDiscordFilled className='text-size-16' />
                                              </a>
                                            )}
                                            <Button
                                              disabled={
                                                !airdrop.claimable ||
                                                airdrop.claimed ||
                                                claimedAirdrops.includes(
                                                  airdrop.id
                                                )
                                              }
                                              onClick={() => {
                                                const input = `Claim Airdrop of [${airdrop?.name}]`;
                                                const newMessages = [
                                                  {
                                                    text: input,
                                                    user: "user",
                                                    createdAt: Date.now(),
                                                  },
                                                  {
                                                    text: input,
                                                    user: "system",
                                                    isLoading: true,
                                                    createdAt: Date.now(),
                                                  },
                                                ];
                                                setClaimedAirdrops((old) => {
                                                  return [...old, airdrop.id];
                                                });
                                                setMessage(newMessages);
                                                sendMessageMutation.mutate({
                                                  message: input,
                                                });
                                              }}
                                            >
                                              {airdrop.claimable
                                                ? airdrop.claimed ||
                                                  claimedAirdrops.includes(
                                                    airdrop.id
                                                  )
                                                  ? "Claimed"
                                                  : "Claim"
                                                : "Not Eligible"}
                                            </Button>
                                          </div>
                                        </Card>
                                      ))
                                    : "No airdrops available"}
                                </div>
                              ) : (
                                <AIWriter>{message?.text}</AIWriter>
                              )
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
                              {/* {message?.source ? (
                            <Badge variant='outline'>{message.source}</Badge>
                          ) : null}
                          {message?.action ? (
                            <Badge variant='outline'>{message.action}</Badge>
                          ) : null} */}
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
                    const newMessages = [
                      {
                        text: "Claim Airdrop",
                        user: "user",
                        createdAt: Date.now(),
                      },
                      {
                        text: "Claim Airdrop",
                        isAirdrop: true,
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

              <Button
                variant='danger'
                loading={isClearingMemory}
                size='s'
                onClick={clearMemory}
              >
                Clear Memory
              </Button>
            </div>

            <form
              onClick={(e) => {
                if (!publicKey) {
                  inputRef.current?.blur();
                  e.preventDefault();
                  e.stopPropagation();
                  setVisible(true);
                }
              }}
              ref={formRef}
              onSubmit={handleSendMessage}
              className='rounded-12 p-16 bg-surface flex items-center gap-8 border border-white-20'
            >
              <Tooltip
                content={<p>Attach file(Images only)</p>}
                className='flex items-center'
              >
                <button
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.click();
                    }
                  }}
                >
                  <Paperclip className='size-16' />
                  <span className='sr-only'>Attach file</span>
                </button>
                <input
                  type='file'
                  key={`attach-file-${selectedFile?.name}`}
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept='image/*'
                  className='hidden'
                />
              </Tooltip>
              <AudioRecorder
                agentId={agentId}
                onChange={(newInput: string) => setInput(newInput)}
              />

              <ChatInput
                ref={inputRef}
                onKeyDown={handleKeyDown}
                value={input}
                onChange={({ target }) => setInput(target.value)}
                placeholder='Type message'
                className='min-h-12 resize-none !border-0 shadow-none focus-visible:ring-0'
              />
              {selectedFile ? (
                <div className='relative rounded-8 overflow-hidden border p-4 flex items-center justify-center'>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className='absolute w-full h-full bg-black-80 flex items-center justify-center'
                  >
                    <IconClose className='text-size-20' />
                  </button>
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    height='100%'
                    width='100%'
                    className='aspect-square object-contain w-32'
                  />
                </div>
              ) : null}
              <button
                disabled={
                  (!input && !selectedFile) || sendMessageMutation?.isPending
                }
                type='submit'
                className={clsx("flex items-center", {
                  "cursor-not-allowed":
                    (!input && !selectedFile) || sendMessageMutation?.isPending,
                })}
              >
                {sendMessageMutation?.isPending ? (
                  "..."
                ) : (
                  <Send className='size-20 rotate-45' />
                )}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
