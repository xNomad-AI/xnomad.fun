import { api } from "@/primitive/api";

export interface Task {
  id: string;
  userId: string;
  inputTokenSymbol: string;
  outputTokenSymbol: string;
  inputTokenCA: string;
  outputTokenCA: string;
  inputTokenAmount?: number;
  outputTokenAmount?: number;
  delay: number | null;
  startAt: string;
  expireAt: string;
  priceCondition: "under" | "up";
  priceTarget: string;
  tokenTarget: string;
}

export function getAutoTasks(agentId: string) {
  return api.v1.get<Task[]>("/agent/autotasks", {
    agentId,
  });
}

export function deleteAutoTask(taskId: string, agentId: string) {
  return api.v1.delete(`/agent/autotask/`, {
    taskId,
    agentId,
  });
}
