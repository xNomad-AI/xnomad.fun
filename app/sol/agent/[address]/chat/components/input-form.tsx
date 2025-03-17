import { useEffect, useMemo, useRef } from "react";
import { useChatContext } from "../store";
import { useConnectModalStore } from "@/components/connect-modal/store";
import { useWallet } from "@solana/wallet-adapter-react";
import { IconClose, Tooltip } from "@/primitive/components";
import { Paperclip, Send } from "lucide-react";
import { AudioRecorder } from "./audio-recorder";
import { ChatInput } from "./chat/chat-input";
import clsx from "clsx";
import { useMemoizedFn } from "ahooks";

export function InputForm() {
  const { publicKey } = useWallet();

  const { setVisible } = useConnectModalStore();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
    }
  };
  const {
    input,
    setInput,
    formRef,
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
    [input, selectedFile, sendMessageMutation]
  );
  const handleKeyDown = useMemoizedFn(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !sendMessageDisabled) {
        handleSubmitForm(e as unknown as React.FormEvent<HTMLFormElement>);
      }
    }
  );
  return (
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
      onSubmit={handleSubmitForm}
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
        disabled={sendMessageDisabled}
        type='submit'
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
    </form>
  );
}
