import { ReactNode } from "react";

export type MessageType = "success" | "error" | "warning" | "plain" | "loading";

export type MessageConfig = {
  type: MessageType;
  duration: number;
  tag: string;
  closable: boolean;
  content: ReactNode;
  container: string;
  suffix?: ReactNode;
  action?: ReactNode;
};

export type MessageUpdateOption = Partial<
  Omit<MessageConfig, "container" | "tag">
>;

export type MessageOption = Partial<Omit<MessageConfig, "content">>;

export const globalContainerName = "global-message-container";

const messagePrefix = `message`;
let messageCursor = 1;

export function createMessageConfig(
  option: Partial<MessageConfig>
): MessageConfig {
  return {
    type: "plain",
    duration: 4000,
    container: globalContainerName,
    tag: `${messagePrefix}${messageCursor++}`,
    closable: true,
    content: null,
    suffix: null,
    action: null,
    ...option,
  };
}
