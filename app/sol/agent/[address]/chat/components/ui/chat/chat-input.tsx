import * as React from "react";
import clsx from "clsx";
import { TextField } from "@/primitive/components";

type ChatInputProps = React.TextareaHTMLAttributes<HTMLInputElement>;

const ChatInput = React.forwardRef<HTMLInputElement, ChatInputProps>(
  ({ className, ...props }, ref) => (
    <TextField
      autoComplete='off'
      ref={ref}
      name='message'
      className={clsx(
        "max-h-12 px-16 bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 w-full rounded-md flex items-center h-16 resize-none",
        className
      )}
      {...props}
    />
  )
);
ChatInput.displayName = "ChatInput";

export { ChatInput };
