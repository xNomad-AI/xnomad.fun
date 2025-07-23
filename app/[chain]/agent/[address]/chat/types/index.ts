import { Content } from "@elizaos/core";
import { Action, TradeAction } from "../content/types";

export interface IAttachment {
  url: string;
  contentType: string;
  title: string;
}
export type ActionStep = "input" | "finish";
export enum DisplayType {
  AGENT_STATUS = "AGENT_STATUS", // Agent status
  AGENT_ACTION = "AGENT_ACTION", // Agent action
  AGENT_RESPONSE = "AGENT_RESPONSE", // Agent response
}
export interface ExtraContentFields {
  user: string;
  createdAt: number;
  isLoading?: boolean;
  webAction?: Action;
  tradeAction?: TradeAction;
  step?: ActionStep;
  id: string;
  displayType?: DisplayType;
  extraText?: {
    displayType: DisplayType;
    text: string;
    status: "success" | "error" | "loading";
  }[];
}

export type ContentWithUser = Content & ExtraContentFields;
