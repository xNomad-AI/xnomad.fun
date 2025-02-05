"use client";
import { useTransition, animated } from "@react-spring/web";
import { Paperclip, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Content, UUID } from "@elizaos/core";
import CopyButton from "./copy-button";
import ChatTtsButton from "./ui/chat/chat-tts-button";
import AIWriter from "react-aiwriter";
import { AudioRecorder } from "./audio-recorder";
// import { Badge } from "./ui/badge";
import { IAttachment } from "../types";
import { useQueryClient, useMutation } from "@tanstack/react-query";

import { Button, message, Tooltip } from "@/primitive/components";
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

interface ExtraContentFields {
  user: string;
  createdAt: number;
  isLoading?: boolean;
}

type ContentWithUser = Content & ExtraContentFields;

export function ChatPage({ agentId, nft }: { agentId: UUID; nft: NFT }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [input, setInput] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const getMessageVariant = (role: string) =>
    role !== "user" ? "received" : "sent";

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };
  const queryClient = useQueryClient();
  useEffect(() => {
    scrollToBottom();
  }, [queryClient.getQueryData(["messages", agentId])]);

  useEffect(() => {
    scrollToBottom();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSendMessage(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input) return;

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

    queryClient.setQueryData(
      ["messages", agentId],
      (old: ContentWithUser[] = []) => [...old, ...newMessages]
    );

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
    }) => apiClient.sendMessage(agentId, message, selectedFile),
    onSuccess: (newMessages: ContentWithUser[]) => {
      queryClient.setQueryData(
        ["messages", agentId],
        (old: ContentWithUser[] = []) => [
          ...old.filter((msg) => !msg.isLoading),
          ...newMessages.map((msg) => ({
            ...msg,
            createdAt: Date.now(),
          })),
        ]
      );
    },
    onError: (e) => {
      message(e.message, {
        type: "error",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
    }
  };

  const messages =
    queryClient.getQueryData<ContentWithUser[]>(["messages", agentId]) || [];

  const transitions = useTransition(messages, {
    keys: (message) => `${message.createdAt}-${message.user}-${message.text}`,
    from: { opacity: 0, transform: "translateY(50px)" },
    enter: { opacity: 1, transform: "translateY(0px)" },
    leave: { opacity: 0, transform: "translateY(10px)" },
  });

  return (
    <div className='flex flex-col w-[720px] h-[calc(100vh-64px-64px-72px)] gap-32'>
      <div className='flex-1 overflow-y-auto'>
        <ChatMessageList ref={messagesContainerRef}>
          {transitions((styles, message) => {
            const variant = getMessageVariant(message?.user);
            return (
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-expect-error
              <animated.div style={styles} className='flex gap-16'>
                {message?.user !== "user" ? (
                  <img
                    className='h-32 w-32 flex-shrink-0 p-1 border rounded-full select-none'
                    height={32}
                    width={32}
                    alt=''
                    src={nft.image}
                  />
                ) : null}
                <div className='flex flex-col w-full'>
                  <ChatBubble
                    variant={variant}
                    className='flex flex-row items-center gap-2'
                  >
                    <div className='flex flex-col gap-8'>
                      <ChatBubbleMessage
                        variant={variant}
                        isLoading={message?.isLoading}
                      >
                        {message?.user !== "user" ? (
                          <AIWriter>{message?.text}</AIWriter>
                        ) : (
                          message?.text
                        )}
                        {/* Attachments */}
                        <div>
                          {message?.attachments?.map((attachment, idx) => (
                            <div className='flex flex-col gap-1 mt-2' key={idx}>
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
                        {message?.text && !message?.isLoading ? (
                          <div className='flex items-center gap-12'>
                            <CopyButton text={message?.text} />
                            {message?.user !== "user" && (
                              <ChatTtsButton
                                agentId={agentId}
                                text={message?.text}
                              />
                            )}
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
              </animated.div>
            );
          })}
        </ChatMessageList>
      </div>

      <form
        ref={formRef}
        onSubmit={handleSendMessage}
        className='rounded-12 p-16 bg-surface flex items-center gap-8 border border-white-20'
      >
        <Tooltip content={<p>Attach file</p>} className='flex items-center'>
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
          className='min-h-12 resize-none border-0 shadow-none focus-visible:ring-0'
        />
        {selectedFile ? (
          <div className='p-3 flex'>
            <div className='relative rounded-md border p-2'>
              <Button
                onClick={() => setSelectedFile(null)}
                className='absolute -right-2 -top-2 size-[22px] ring-2 ring-background'
                variant='solid'
              >
                <X />
              </Button>
              <img
                src={URL.createObjectURL(selectedFile)}
                height='100%'
                width='100%'
                className='aspect-square object-contain w-16'
              />
            </div>
          </div>
        ) : null}
        <button
          disabled={!input || sendMessageMutation?.isPending}
          type='submit'
          className={clsx("flex items-center", {
            "cursor-not-allowed": !input || sendMessageMutation?.isPending,
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
  );
}
