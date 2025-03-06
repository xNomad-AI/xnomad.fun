import { api } from "@/primitive/api";

type MutationBody = {
  content: string;
};

type SubmitResponse = {
  message: string;
};
export function submitBlox(params: MutationBody) {
  return api.ts.post<SubmitResponse>("/forward_submit/blox", params);
}
export function submitJito(params: MutationBody) {
  return api.ts.post<SubmitResponse>("/forward_submit/jiot", params);
}
