import { Content } from "@elizaos/core";
import { Action, TradeAction } from "../response/types";

export interface IAttachment {
  url: string;
  contentType: string;
  title: string;
}

export interface ExtraContentFields {
  user: string;
  createdAt: number;
  isLoading?: boolean;
  action?: Action;
  tradeAction?: TradeAction;
}

export type ContentWithUser = Content & ExtraContentFields;
