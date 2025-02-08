export type Payload = {
  Authorization?: string;
  [key: string]: any;
};

export type FetchInit = RequestInit & {
  /**
   * for query string array format, true: a[]=1&a[]=2, false: a=1&a=2
   *
   * default is true
   */
  indices?: boolean;
};

export type RequestConfig = {
  baseURL: string;
  url: string;
  payload?: Payload;
  headers: Headers;
} & FetchInit;

export type ApiServiceRequestInterceptor = (
  config: RequestConfig
) => RequestConfig;

export type ApiServiceResponseInterceptor = (
  response: Promise<Response>,
  config: RequestConfig
) => Promise<unknown>;

export type ApiServiceConfig = {
  data?: unknown;
} & FetchInit;

export interface ApiResponse<T = unknown> {
  code: "SUCCESS" | string;
  msg: string; // 报错主要呈现这一部分信息
  data: T;
  success: boolean;
  statusCode?: number;
}

export interface ApiListData<T> {
  list: T[];
  total: number;
}

export interface ApiCursorData<T> {
  list: T[];
  cursor?: string | null;
}
