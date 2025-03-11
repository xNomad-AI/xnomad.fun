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
  mode: string;
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
