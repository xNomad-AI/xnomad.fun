import { ApiResponse, RequestConfig } from "./type";

export enum ErrorCode {}

export class ApiTimeoutError extends Error {
  constructor(config: RequestConfig) {
    super(`Api Request Error: Timeout -- ${config?.method} -- ${config?.url}`);
  }
}

export class ApiHTTPError extends Error {
  constructor() {
    super("Api Response Error: Http Error");
  }
}

export class ApiInvalidResponseError extends Error {
  constructor() {
    super("Api Response Error: invalid response");
  }
}

export class ApiUnauthorizeError extends Error {
  constructor() {
    super("Api Response Error: Unauthorized");
  }
}

export class ApiResponseError extends Error {
  constructor(public data: ApiResponse<unknown>, public config: RequestConfig) {
    super(
      `Request: -- ${config?.method} -- ${config?.url} -- Api Response Error: [ERROR_CODE]: ${data?.code}, [ERROR_MESSAGE]: ${data?.msg}`
    );
  }
}

export class ApiCancelError extends Error {
  constructor(config: RequestConfig) {
    super(
      `AbortError: -- ${config.method} -- ${config.url} -- Api Request Aborted`
    );
  }
}
