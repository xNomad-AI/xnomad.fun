import * as React from "react";
import { ArrowDown } from "lucide-react";
import { useChatContext } from "../../store";

interface ChatMessageListProps extends React.HTMLAttributes<HTMLDivElement> {
  smooth?: boolean;
}

export function ChatMessageList({
  className,
  children,
  ...props
}: ChatMessageListProps) {
  const { scrollRef, disableAutoScroll, isAtBottom, scrollToBottom } =
    useChatContext();
  return (
    <div className='relative w-full h-full'>
      <div
        className={`flex flex-col w-full h-full p-4 overflow-y-auto ${className}`}
        ref={scrollRef}
        style={{
          mask: `linear-gradient(
                to bottom,
                transparent,
                black 32px,
                black calc(100% - 32px),
                transparent
              )`,
          WebkitMask: `linear-gradient(
                to bottom,
                transparent,
                black 32px,
                black calc(100% - 32px),
                transparent
              )`,
        }}
        onWheel={disableAutoScroll}
        onTouchMove={disableAutoScroll}
        {...props}
      >
        <div className='flex flex-col gap-24 my-32'>{children}</div>
      </div>

      {!isAtBottom && (
        <button
          onClick={() => {
            scrollToBottom();
          }}
          className='absolute bottom-8 left-1/2 transform -translate-x-1/2 inline-flex rounded-full shadow-md'
        >
          <ArrowDown className='h-16 w-16' />
        </button>
      )}
    </div>
  );
}
