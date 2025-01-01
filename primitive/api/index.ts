import {
  apiEndpoint,
  request,
  response,
  serverApiEndpoint,
} from "./interceptors";
import { ApiService } from "./service";

export const api = {
  // 请求api/v1的数据
  v1: new ApiService([apiEndpoint(1), request], response),
  // 请求app/api的数据
  server: new ApiService([serverApiEndpoint, request], response),
};
export * from "./error";
export type { ApiCursorData, ApiListData, ApiResponse } from "./type";
