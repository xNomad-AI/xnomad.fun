import { api } from "@/primitive/api";

export interface CopyTrade {
  address: string;
  agentId: string;
  callbackUrl: string;
  clientId: string;
  copySell: boolean;
  createdAt: string;
  description?: string;
  expiredAt?: string;
  fixedAmount?: number;
  id: number;
  mode: "percentage" | "amount";
  name: string;
  percentage?: number;
  status: CopyTradeStatus;
  targetAddress: string;
  updatedAt: string;
  walletAddress: string;
  _id: string;
}

export function getCopyTradeTasks(agentId: string) {
  return api.v1.get<CopyTrade[]>("/agent/copy-trades", {
    agentId,
  });
}

export function deleteCopyTradeTask(id: number, agentId: string) {
  return api.v1.delete(`/agent/copy-trade`, {
    id,
    agentId,
  });
}
export type CopyTradeStatus = "paused" | "running";
export function setCopyTradeStatus(
  agentId: string,
  id: number,
  status: CopyTradeStatus
) {
  return api.v1.post<CopyTrade>(
    `/agent/copy-trade/status?agentId=${agentId}&id=${id}&status=${status}`
  );
}

export function editCopyTrade(agentId: string, id: number, task: CopyTrade) {
  return api.v1.post<CopyTrade>(
    `/agent/copy-trade?agentId=${agentId}&id=${id}`,
    task
  );
}

export interface TwitterKOL {
  _id: string;
  twitterHandle: string;
  name: string;
  userName: string;
  profilePicture: string;
  followers: number;
  solanaAddress: string;
  description?: string;
  pnl30d: number;
  pnl30dAmount: number;
}

export interface TwitterKOLsResponse {
  items: TwitterKOL[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function searchTwitterKOLs(search?: string, page = 1, limit = 5) {
  return api.v1.get<TwitterKOLsResponse>("/alpha/twitter-kols", {
    page,
    limit,
    search,
  });
}
