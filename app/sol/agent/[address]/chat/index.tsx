"use client";
import { useTransition, animated } from "@react-spring/web";
import { Spin } from "@/primitive/components";
import clsx from "clsx";
import { NFT } from "@/types";
import { useUnmount } from "ahooks";
import { use100vh } from "react-div-100vh";
import { useBreakpoint } from "@/primitive/hooks/use-screen";
import { ChatMessageList } from "./components/chat/chat-message-list";
import { ChatContent } from "./content";
import { useChatContext } from "./store";
import { InputForm } from "./components/input-form";
import { Actions } from "./actions";
import { useAgentSetup } from "./hooks/use-agent-setup";
import { useChatMemory } from "./hooks/use-chat-memory";
import { useChatGreeting } from "./hooks/use-chat-greeting";

export function ChatPage({ nft, show }: { nft: NFT; show: boolean }) {
  const agentId = nft.agentId;

  const { messages, setMessages } = useChatContext();
  // check if agent is setup
  const { isAgentSetup } = useAgentSetup({
    nft,
    agentId,
  });
  // after agent is setup, fetch memory
  const { initializingMemory } = useChatMemory(isAgentSetup);

  // if memory is empty, show greeting
  useChatGreeting({
    nft,
    initializingMemory,
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
    from: { opacity: 0, transform: "translateY(32px)" },
    enter: { opacity: 1, transform: "translateY(0px)" },
    leave: { opacity: 0, transform: "translateY(8px)" },
    config: {
      duration: 200,
    },
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
            <ChatMessageList>
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
            <Actions nft={nft} />

            <InputForm />
          </div>
        </>
      )}
    </div>
  );
}
