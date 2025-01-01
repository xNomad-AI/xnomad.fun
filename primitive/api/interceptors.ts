import {
  ApiCancelError,
  ApiHTTPError,
  ApiInvalidResponseError,
  ApiResponseError,
  ApiTimeoutError,
} from "./error";
import {
  ApiResponse,
  ApiServiceRequestInterceptor,
  ApiServiceResponseInterceptor,
} from "./type";

function dealGetUrl(path: string, data: any = {}) {
  let actualPath = path;
  const params: string[] = [];
  for (const key in data) {
    if (data[key] instanceof Array) {
      for (const value of data[key]) {
        value !== null && value !== undefined && params.push(`${key}=${value}`);
      }
    } else {
      data[key] !== null &&
        data[key] !== undefined &&
        params.push(`${key}=${data[key]}`);
    }
  }
  if (params.length !== 0) {
    actualPath = `${path}?${params.join("&")}`;
  }
  return actualPath;
}
export const request: ApiServiceRequestInterceptor = (config) => {
  const hasPayload =
    typeof config.payload === "object" && config.payload !== null;
  config.headers.set("Accept", "application/json");

  let token: string | undefined | null = config.payload?.Authorization;
  if (config.payload?.Authorization) {
    config.payload.Authorization = undefined;
  }

  // if (isBrowser()) {
  //   token = userStorage.getCurrentToken()?.jwt;
  // }

  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  switch (config.method) {
    case "GET":
      if (hasPayload) {
        config.url = dealGetUrl(config.url, config.payload);
      }
      break;
    case "POST":
      if (hasPayload) {
        config.body = JSON.stringify(config.payload);
        config.headers.set("Content-Type", "application/json");
      }
      break;
    default:
  }
  return config;
};

export const apiEndpoint: (version: number) => ApiServiceRequestInterceptor = (
  version
) => {
  return (config) => {
    config.baseURL = `${process.env.API_DATA_ENDPOINT}/api/v${version}`;
    return config;
  };
};

export const serverApiEndpoint: ApiServiceRequestInterceptor = (config) => {
  config.baseURL = `/api`;
  return config;
};

export const response: ApiServiceResponseInterceptor = async (
  request,
  config
) => {
  try {
    const res = await request;

    const body = await (res as Response).json();
    if (isApiResponse(body)) {
      if (body.code === "SUCCESS") {
        return body.data;
      }
      throw new ApiResponseError(body, config);
    } else {
      throw new ApiInvalidResponseError();
    }
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      //
      throw new ApiCancelError(config);
    } else {
      console.log(e);
      throw e;
    }
  }
};

function isApiResponse(body: unknown): body is ApiResponse<unknown> {
  return typeof body === "object" && body !== null && Reflect.has(body, "code");
}
