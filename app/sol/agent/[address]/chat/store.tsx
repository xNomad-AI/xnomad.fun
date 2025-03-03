import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ContentWithUser, IAttachment } from "./types";
import { onError } from "@/lib/utils/error";
import { UUID } from "@elizaos/core";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { useMemoizedFn } from "ahooks";
import { apiClient } from "./lib/api";
import { useWallet } from "@solana/wallet-adapter-react";
import { stringToUuid } from "./lib/uuid";
import { useAutoScroll } from "./hooks/use-auto-scroll";

const ChatContext = createContext<
  | ({
      handleSubmitForm: (e: React.FormEvent<HTMLFormElement>) => void;
      addMessage: (
        newMessages: ContentWithUser[],
        removeInvalidAction?: boolean
      ) => void;
      input: string;
      setInput: (value: string) => void;
      selectedFile: File | null;
      setSelectedFile: (file: File | null) => void;
      messages?: ContentWithUser[];
      setMessages: Dispatch<SetStateAction<ContentWithUser[]>>;
      userId: string;
      sendMessageMutation: UseMutationResult<
        ContentWithUser[],
        Error,
        {
          message: string;
          selectedFile?: File | null;
        },
        unknown
      >;
      formRef: React.RefObject<HTMLFormElement>;
      agentId: UUID;
      deleteLastMessageByLength: (length?: number) => void;
      deleteMessageByIndex: (index: number) => void;
      addAndSendMessage: (input: string, file?: File | null) => void;
      deleteMessageById: (id: string) => void;
      updateMessage: (message: ContentWithUser) => void;
      generateMessageId: (id?: string) => string;
    } & ReturnType<typeof useAutoScroll>)
  | null
>(null);
ChatContext.displayName = "ChatContext";
const { Provider } = ChatContext;
export function ChatProvider({
  children,
  agentId,
}: PropsWithChildren<{
  agentId: UUID;
}>) {
  const { publicKey } = useWallet();

  const formRef = useRef<HTMLFormElement>(null);
  const userId = useMemo(() => {
    if (publicKey) {
      return stringToUuid(publicKey.toBase58());
    } else {
      return stringToUuid(`web-${Date.now()}-${agentId}-${Math.random()}`);
    }
  }, [publicKey, agentId]);
  const [messages, setMessages] = useState<ContentWithUser[]>([]);

  const {
    scrollRef,
    isAtBottom,
    scrollToBottom,
    disableAutoScroll,
    autoScrollEnabled,
  } = useAutoScroll({
    smooth: true,
    refreshDependency: messages,
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
          id: generateMessageId(),
          createdAt: Date.now(),
        })),
      ]);
    },
    onError: (e) => {
      onError(e);
    },
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [input, setInput] = useState("");
  const addMessage = useMemoizedFn(
    (newMessages: ContentWithUser[], removeInvalidAction?: boolean) => {
      setMessages((old = []) => [
        ...old.filter(
          (msg) =>
            !removeInvalidAction ||
            !msg.webAction ||
            (msg.webAction && !msg.step)
        ),
        ...newMessages,
      ]);
    }
  );
  // add message then send message
  const addAndSendMessage = useMemoizedFn(
    (input: string, file?: File | null) => {
      const attachments: IAttachment[] | undefined = file
        ? [
            {
              url: URL.createObjectURL(file),
              contentType: file.type,
              title: file.name,
            },
          ]
        : undefined;
      const newMessages: ContentWithUser[] = [
        {
          text: input,
          user: "user",
          createdAt: Date.now(),
          attachments: attachments as unknown as ContentWithUser["attachments"],
          id: generateMessageId("user"),
        },
        {
          text: input,
          user: "system",
          isLoading: true,
          createdAt: Date.now(),
          id: generateMessageId("system"),
        },
      ];
      addMessage(newMessages);

      sendMessageMutation.mutate({
        message: input,
        selectedFile: file || (selectedFile ? selectedFile : null),
      });
    }
  );
  const handleSubmitForm = useMemoizedFn(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input && !selectedFile) return;

      addAndSendMessage(input, selectedFile);

      setSelectedFile(null);
      setInput("");
      formRef.current?.reset();
    }
  );
  const deleteLastMessageByLength = useMemoizedFn((length: number = 2) => {
    setMessages((old) => {
      return old?.slice(0, -length) ?? [];
    });
  });
  const deleteMessageByIndex = useMemoizedFn((index: number) => {
    setMessages((old) => {
      return old?.filter((_, i) => i !== index) ?? [];
    });
  });
  const deleteMessageById = useMemoizedFn((id: string) => {
    setMessages((old) => {
      return old?.filter((msg) => msg.id !== id) ?? [];
    });
  });
  const updateMessage = useMemoizedFn((message: ContentWithUser) => {
    setTimeout(() => {
      setMessages((old) => {
        return (
          old?.map((msg) => {
            if (msg.id === message.id) {
              return message;
            }
            return msg;
          }) ?? []
        );
      });
    }, 0);
  });
  const generateMessageId = useMemoizedFn((id?: string) => {
    return stringToUuid(`web-${Date.now()}-${agentId}-${Math.random()}-${id}`);
  });

  return (
    <Provider
      value={{
        handleSubmitForm,
        addMessage,
        input,
        setInput,
        selectedFile,
        setSelectedFile,
        messages,
        userId,
        sendMessageMutation,
        scrollToBottom,
        formRef,
        setMessages,
        agentId,
        deleteLastMessageByLength,
        deleteMessageByIndex,
        addAndSendMessage,
        deleteMessageById,
        updateMessage,
        generateMessageId,
        scrollRef,
        isAtBottom,
        disableAutoScroll,
        autoScrollEnabled,
      }}
    >
      {children}
    </Provider>
  );
}
export function useChatContext() {
  return useContext(ChatContext)!;
}
