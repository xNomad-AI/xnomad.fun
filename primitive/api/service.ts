import { ApiServiceRequestInterceptor, ApiServiceResponseInterceptor, FetchInit, Payload, RequestConfig } from './type';

type ApiInterceptors = {
  requests: ApiServiceRequestInterceptor[];
  responses: ApiServiceResponseInterceptor | null;
};
/**
 * TODO: delete & put method implement
 */
export class ApiService {
  // 传入拦截器构建合适的请求服务
  private interceptors: ApiInterceptors = {
    requests: [],
    responses: null,
  };

  constructor(requests: ApiServiceRequestInterceptor[] = [], responses: ApiServiceResponseInterceptor | null = null) {
    this.interceptors.requests = requests;
    this.interceptors.responses = responses;
  }

  get = async <R>(source: string, payload?: Payload, init: FetchInit = {}) => {
    const pathname = this.parsePathname(source);
    init.method = 'GET';
    return this.fetch(pathname, payload, init) as R;
  };

  post = async <R>(source: string, payload?: Payload, init: FetchInit = {}) => {
    this.ensureValidPathname(source);
    init.method = 'POST';
    return this.fetch(source, payload, init) as R;
  };

  delete = async <R>(source: string, payload?: Payload, init: FetchInit = {}) => {
    this.ensureValidPathname(source);
    init.method = 'delete';
    return this.fetch(source, payload, init) as R;
  };

  private async fetch(url: string, payload?: Payload, init: FetchInit = {}) {
    const rc: RequestConfig = {
      ...init,
      payload,
      url,
      baseURL: '',
      indices: init.indices ?? true,
      headers: new Headers(init.headers),
    };
    const config = this.interceptors.requests.reduce((config, fn) => fn(config), rc);
    const promise = fetch(...this.parseRequestConfig(config));
    if (this.interceptors.responses) {
      return this.interceptors.responses(promise, config);
    }
    return promise;
  }

  private ensureValidPathname(source: string) {
    if (!source.startsWith('/')) {
      throw new Error('Request Pathname should startsWith slash');
    }
    return true;
  }

  private parseRequestConfig(rc: RequestConfig) {
    const { baseURL, url, payload, ...init } = rc;
    return [`${baseURL}${url}`, init] as [string, FetchInit];
  }

  private parsePathname(source: string) {
    this.ensureValidPathname(source);
    const url = new URL(`https://parse.com${source}`);
    return url.pathname;
  }
}
