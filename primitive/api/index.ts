import {
  apiAgentEndpoint,
  apiAirdropEndpoint,
  apiEndpoint,
  apiTSEndpoint,
  apiTSForwardEndpoint,
  request,
  response,
  serverApiEndpoint,
} from "./interceptors";
import { ApiService } from "./service";

export const api = {
  v1: new ApiService([apiEndpoint(1), request], response),
  ts: new ApiService([apiTSEndpoint(1), request], response),
  tsForward: new ApiService([apiTSForwardEndpoint(1), request], response),
  server: new ApiService([serverApiEndpoint, request], response),
  agent: new ApiService([apiAgentEndpoint(1), request], response),
  airdrop: new ApiService([apiAirdropEndpoint(1), request], response),
};
export * from "./error";
export type { ApiCursorData, ApiListData, ApiResponse } from "./type";
