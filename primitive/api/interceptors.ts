import { userStorage } from "@/lib/user/storage";
import { isBrowser } from "../utils/is-browser";
import {
  ApiCancelError,
  ApiInvalidResponseError,
  ApiUnauthorizeError,
} from "./error";
import {
  ApiResponse,
  ApiServiceRequestInterceptor,
  ApiServiceResponseInterceptor,
} from "./type";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dealGetUrl(path: string, data: any = {}) {
  let actualPath = path;
  const params: string[] = [];
  for (const key in data) {
    if (data[key] instanceof Array) {
      for (const value of data[key]) {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        value !== null && value !== undefined && params.push(`${key}=${value}`);
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
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

  if (isBrowser()) {
    token = userStorage.getCurrentToken()?.jwt;
  }

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

export const apiEndpoint: (
  version: number
) => ApiServiceRequestInterceptor = () => {
  return (config) => {
    config.baseURL = `${process.env.NEXT_CLIENT_API_HOST}`;
    return config;
  };
};
export const apiAgentEndpoint: (
  version: number
) => ApiServiceRequestInterceptor = () => {
  return (config) => {
    config.baseURL = `${process.env.NEXT_AGENT_API_HOST}`;
    return config;
  };
};
export const apiAirdropEndpoint: (
  version: number
) => ApiServiceRequestInterceptor = () => {
  return (config) => {
    config.baseURL = `${process.env.NEXT_AIRDROP_API_HOST}`;
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
    if (res.status < 200 || res.status >= 300) {
      throw new Error(res.statusText);
    }
    try {
      const body = await (res as Response).json();
      if (body.data) {
        return body.data;
      } else {
        return body;
      }
    } catch (e) {
      return {};
    }
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new ApiCancelError(config);
    }
    throw e;
  }
};

function isApiResponse(body: unknown): body is ApiResponse<unknown> {
  return typeof body === "object" && body !== null;
}
