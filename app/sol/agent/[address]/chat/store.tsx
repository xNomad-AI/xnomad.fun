import {
  createContext,
  PropsWithChildren,
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
import { useLocalStorageState, useMemoizedFn } from "ahooks";
import { apiClient } from "./lib/api";
import { useWallet } from "@solana/wallet-adapter-react";
import { SetState } from "ahooks/lib/createUseStorageState";
import { stringToUuid } from "./lib/uuid";
const ChatContext = createContext<{
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
  setMessages: (value?: SetState<ContentWithUser[]> | undefined) => void;
  userId: string;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  sendMessageMutation: UseMutationResult<
    ContentWithUser[],
    Error,
    {
      message: string;
      selectedFile?: File | null;
    },
    unknown
  >;
  scrollToBottom: () => void;
  formRef: React.RefObject<HTMLFormElement>;
  agentId: UUID;
  deleteLastMessageByLength: (length?: number) => void;
  deleteMessageByIndex: (index: number) => void;
  addAndSendMessage: (input: string, attachments?: IAttachment[]) => void;
  deleteMessageById: (id: string) => void;
  updateMessage: (message: ContentWithUser) => void;
  generateMessageId: (id?: string) => string;
} | null>(null);
ChatContext.displayName = "ChatContext";
const { Provider } = ChatContext;
export function ChatProvider({
  children,
  agentId,
}: PropsWithChildren<{
  agentId: UUID;
}>) {
  const { publicKey } = useWallet();

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [messages, setMessages] = useLocalStorageState<ContentWithUser[]>(
    `messages-${agentId}`,
    {
      defaultValue: [],
    }
  );
  const scrollToBottom = useMemoizedFn(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const userId = useMemo(() => {
    if (publicKey) {
      return stringToUuid(publicKey.toBase58());
    } else {
      return stringToUuid(`web-${Date.now()}-${agentId}-${Math.random()}`);
    }
  }, [publicKey, agentId]);

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
            (msg.webAction && msg.step === "finish")
        ),
        ...newMessages,
      ]);
    }
  );
  // add message then send message
  const addAndSendMessage = useMemoizedFn(
    (input: string, attachments?: IAttachment[]) => {
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
        selectedFile: selectedFile ? selectedFile : null,
      });
    }
  );
  const handleSubmitForm = useMemoizedFn(
    (e: React.FormEvent<HTMLFormElement>) => {
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

      addAndSendMessage(input, attachments);

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
        messagesContainerRef,
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
      }}
    >
      {children}
    </Provider>
  );
}
export function useChatContext() {
  return useContext(ChatContext)!;
}
