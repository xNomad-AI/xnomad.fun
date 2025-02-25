import { NFT } from "@/types";
import {
  ChatBubble,
  ChatBubbleMessage,
  ChatBubbleTimestamp,
} from "../components/chat/chat-bubble";
import { ContentWithUser } from "../types";
import { PropsWithChildren } from "react";
import { moment } from "../lib/utils";
import clsx from "clsx";
import CopyButton from "../components/copy-button";

function getMessageVariant(role: string) {
  return role !== "user" ? "received" : "sent";
}
export function ChatContentContainer({
  message,
  children,
  showCopyButton,
  showTimestamp,
  suffixNode,
}: PropsWithChildren<{
  message: ContentWithUser;
  showTimestamp?: boolean;
  showCopyButton?: boolean;
  suffixNode?: React.ReactNode;
}>) {
  const variant = getMessageVariant(message?.user ?? "");
  return (
    <div className='flex flex-col flex-1 gap-8'>
      <ChatBubble
        variant={variant}
        className={clsx("flex flex-row items-center gap-2", {
          "!w-full": Boolean(message.webAction),
        })}
      >
        <div className='flex flex-col gap-8 w-full'>
          <ChatBubbleMessage variant={variant} isLoading={message?.isLoading}>
            {children}
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
            {showCopyButton &&
            message?.text &&
            !message?.isLoading &&
            !message.isAirdrop ? (
              <div className='flex items-center gap-12'>
                <CopyButton text={message?.text} />
              </div>
            ) : null}
            <div
              className={clsx([
                message?.isLoading ? "mt-2" : "",
                "flex items-center justify-between gap-12 select-none",
              ])}
            >
              {showTimestamp && message?.createdAt ? (
                <ChatBubbleTimestamp
                  timestamp={moment(message?.createdAt).format("LT")}
                />
              ) : null}
            </div>
          </div>
        </div>
      </ChatBubble>
      {suffixNode}
    </div>
  );
}
