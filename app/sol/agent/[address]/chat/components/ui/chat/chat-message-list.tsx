import * as React from "react";
import { ArrowDown } from "lucide-react";
import { useAutoScroll } from "./hooks/useAutoScroll";

interface ChatMessageListProps extends React.HTMLAttributes<HTMLDivElement> {
  smooth?: boolean;
}

const ChatMessageList = React.forwardRef<HTMLDivElement, ChatMessageListProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ className, children, smooth = false, ...props }, _ref) => {
    const { scrollRef, isAtBottom, scrollToBottom, disableAutoScroll } =
      useAutoScroll({
        smooth,
        content: children,
      });

    return (
      <div className='relative w-full h-full'>
        <div
          className={`flex flex-col w-full h-full p-4 overflow-y-auto ${className}`}
          ref={scrollRef}
          onWheel={disableAutoScroll}
          onTouchMove={disableAutoScroll}
          {...props}
        >
          <div className='flex flex-col gap-24'>{children}</div>
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
);

ChatMessageList.displayName = "ChatMessageList";

export { ChatMessageList };
