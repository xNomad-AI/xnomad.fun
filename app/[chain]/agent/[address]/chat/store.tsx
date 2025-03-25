import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ContentWithUser, IAttachment } from "./types";
import { onError } from "@/lib/utils/error";
import { UUID } from "@elizaos/core";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { useMemoizedFn } from "ahooks";
import { apiClient } from "./lib/api";
import { stringToUuid } from "./lib/uuid";
import { useAutoScroll } from "./hooks/use-auto-scroll";
import { useUserStore } from "@/app/layout/chain-provider/hook";
const MessageUpdateSequence = new Map<string, ContentWithUser[]>();
const ChatContext = createContext<
  | ({
      handleSubmitForm: () => void;
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
        | ContentWithUser[]
        | ReadableStreamDefaultReader<Uint8Array<ArrayBufferLike>>,
        Error,
        {
          message: string;
          selectedFile?: File | null;
        },
        unknown
      >;
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
  const { userAddress } = useUserStore();

  const userId = useMemo(() => {
    if (userAddress) {
      return stringToUuid(userAddress);
    } else {
      return stringToUuid(`web-${Date.now()}-${agentId}-${Math.random()}`);
    }
  }, [userAddress, agentId]);
  const [messages, setMessages] = useState<ContentWithUser[]>([]);
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
  const updateMessage = useMemoizedFn((_message: ContentWithUser) => {
    setTimeout(() => {
      let message = _message;
      let sequence = MessageUpdateSequence.get(message.id) ?? [];
      const isInSequence = sequence.some((msg) => msg.id === message.id);
      if (!isInSequence) {
        sequence = [...sequence, message];
      }
      const firstMessage = sequence.shift() as ContentWithUser;
      MessageUpdateSequence.set(message.id, sequence);
      setMessages((old) => {
        return (
          old?.map((msg) => {
            if (msg.id === firstMessage.id) {
              return firstMessage;
            }
            return msg;
          }) ?? []
        );
      });
      if (sequence.length > 0) {
        updateMessage(sequence[0]);
      }
    }, 0);
  });
  const getMessageById = useMemoizedFn((id: string) => {
    return messages.find((msg) => msg.id === id);
  });
  const generateMessageId = useMemoizedFn((id?: string) => {
    return stringToUuid(`web-${Date.now()}-${agentId}-${Math.random()}-${id}`);
  });
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
    }) => apiClient.sendMessage(userId, agentId, message, selectedFile, true),
    onSuccess: async (
      newMessages:
        | ContentWithUser[]
        | ReadableStreamDefaultReader<Uint8Array<ArrayBufferLike>>
    ) => {
      const messageId = generateMessageId();
      const messageCreateTime = Date.now();
      if (newMessages instanceof ReadableStreamDefaultReader) {
        const decoder = new TextDecoder();
        while (true) {
          const { value, done } = await newMessages.read();
          if (value) {
            const chunks = decoder
              .decode(value, { stream: true })
              .split("\n")
              .filter(Boolean);
            const messages = chunks.map(
              (chunk) => JSON.parse(chunk) as ContentWithUser
            );
            const oldMessage = getMessageById(messageId);
            if (oldMessage) {
              messages.forEach((message) => {
                updateMessage({
                  ...oldMessage,
                  ...message,
                  text: `${oldMessage.text}
                ${message.text ? `\n${message.text}` : ""}`,
                });
              });
            } else {
              let message = messages.shift() as ContentWithUser;
              messages.forEach((_message) => {
                if (!_message.text) return;
                message = {
                  ...message,
                  ..._message,
                  text: `${message.text}
                  ${_message.text ? `\n${_message.text}` : ""}`,
                };
              });
              setMessages((old: ContentWithUser[] = []) => [
                ...old.filter((msg) => !msg.isLoading),
                {
                  ...message,
                  id: messageId,
                  createdAt: messageCreateTime,
                },
              ]);
            }
          }
          if (done) break;
        }
        return;
      }
      setMessages((old: ContentWithUser[] = []) => [
        ...old.filter((msg) => !msg.isLoading),
        ...newMessages.map((msg) => ({
          ...msg,
          id: messageId,
          createdAt: messageCreateTime,
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
  const handleSubmitForm = useMemoizedFn(() => {
    if (!input && !selectedFile) return;

    addAndSendMessage(input, selectedFile);

    setSelectedFile(null);
    setInput("");
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
