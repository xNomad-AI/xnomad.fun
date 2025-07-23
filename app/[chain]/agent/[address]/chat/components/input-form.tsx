import { useEffect, useMemo, useRef } from "react";
import { useChatContext } from "../store";
import { IconClose, Tooltip } from "@/primitive/components";
import { Paperclip, Send } from "lucide-react";
import { AudioRecorder } from "./audio-recorder";
import { ChatInput } from "./chat/chat-input";
import clsx from "clsx";
import { useMemoizedFn } from "ahooks";
import { useUserStore } from "@/app/layout/chain-provider/hook";
export function InputForm() {
  const { userAddress, openConnectModal } = useUserStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
    }
  };
  const {
    input,
    setInput,
    handleSubmitForm,
    sendMessageMutation,
    selectedFile,
    setSelectedFile,
    agentId,
  } = useChatContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  const sendMessageDisabled = useMemo(
    () => (!input && !selectedFile) || sendMessageMutation?.isPending,
    [input, selectedFile, sendMessageMutation?.isPending]
  );
  const handleKeyDown = useMemoizedFn(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !sendMessageDisabled) {
        handleSubmitForm();
      }
    }
  );
  return (
    <div
      onClick={(e) => {
        if (!userAddress) {
          inputRef.current?.blur();
          e.preventDefault();
          e.stopPropagation();
          openConnectModal();
        }
      }}
      className='rounded-12 p-16 bg-surface flex items-center gap-8 border border-white-20'
    >
      <Tooltip
        content={<p>Attach file(Images only)</p>}
        className='flex items-center'
      >
        <button
          title='Attach file'
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
          title='Attach file'
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
            title='Remove'
            onClick={() => setSelectedFile(null)}
            className='absolute w-full h-full bg-black-80 flex items-center justify-center'
          >
            <IconClose className='text-size-20' />
          </button>
          <img
            alt=''
            src={URL.createObjectURL(selectedFile)}
            height='100%'
            width='100%'
            className='aspect-square object-contain w-32'
          />
        </div>
      ) : null}
      <button
        title='Send'
        disabled={sendMessageDisabled}
        onClick={() => {
          if (!sendMessageDisabled) {
            handleSubmitForm();
          }
        }}
        className={clsx("flex items-center", {
          "cursor-not-allowed": sendMessageDisabled,
        })}
      >
        {sendMessageMutation?.isPending ? (
          "..."
        ) : (
          <Send className='size-20 rotate-45' />
        )}
      </button>
    </div>
  );
}
