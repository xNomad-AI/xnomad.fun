import { Content } from "@elizaos/core";
import { Action, TradeAction } from "../content/types";

export interface IAttachment {
  url: string;
  contentType: string;
  title: string;
}
export type ActionStep = "input" | "finish";
export interface ExtraContentFields {
  user: string;
  createdAt: number;
  isLoading?: boolean;
  webAction?: Action;
  tradeAction?: TradeAction;
  step?: ActionStep;
  id: string;
}

export type ContentWithUser = Content & ExtraContentFields;
