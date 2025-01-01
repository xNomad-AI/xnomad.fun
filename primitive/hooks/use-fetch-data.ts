import { useDeepCompareEffect, useMemoizedFn } from "ahooks";
import { useCallback, useEffect, useRef, useState } from "react";

import { useRefState } from "./use-ref-state";
import { usePageVisibilityWithState } from "./use-page-visibility";
import { api, ApiCancelError } from "@/lib/http";

const REQUEST_INTERVAL = 5 * 1000;
/**
 * 通过配置的方式调用api.nftgo.io的接口，内置轮询、abort signal功能
 */
export function useFetchData<T, P extends Record<string, any> | null>({
  interval,
  loop = true,
  reloadDeps,
  params = {} as P,
  config = {
    url: "",
    method: "GET",
    version: "v1",
  },
  onBefore,
  onSuccess,
  onError,
  onDependencyChange,
  noDependency,
  fetchOnUpdate,
  ready = true,
}: {
  interval?: number; // 轮询间隔
  reloadDeps?: any[]; // 强制fetch的依赖,若不填，则默认以params为依赖
  params?: P;
  config: {
    url: string;
    method?: "GET" | "POST";
    version: keyof typeof api;
    initConfig?: RequestInit;
  };
  onSuccess?: (res: T, params: P) => void;
  onBefore?: (params: P) => void | boolean; // 返回false就会打断请求；无返回或者返回true，则正常请求
  onError?: (error: Error, params: P) => void;
  onDependencyChange?: (params: P, extraDeps?: any[]) => void;
  noDependency?: boolean;
  loop?: boolean;
  fetchOnUpdate?: boolean;
  ready?: boolean;
}) {
  const [pause, setPause, pauseRef] = useRefState(false);
  const [data, setData] = useRefState<T | null>(null);
  const [isFetching, setIsFetching, isFetchingRef] = useRefState(!noDependency);
  const [isParamsChangeFetching, setIsParamsChangeFetching] = useState(false);
  const [innerInterval, setInnerInterval] = useState(interval);
  const { pageVisibleRef } = usePageVisibilityWithState({});
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const loopShouldWaitForResRef = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController>();
  const mountEffectRef = useRef<boolean>(true);
  const getData = useCallback(
    ({
      loopShouldWait,
      _params,
    }: {
      loopShouldWait?: boolean;
      _params?: P;
      from?: string;
    }) => {
      loopShouldWaitForResRef.current = Boolean(loopShouldWait);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setIsFetching(true);
      const finalParams = { ...(_params || params) } as P;
      const canContinue = onBefore?.({ ...finalParams });

      return new Promise<T>((resolve, reject) => {
        if (typeof canContinue === "boolean" && !canContinue) {
          reject(new Error("Break by onBefore"));
          return;
        }
        const apiClient = api[config.version];
        (config.method === "POST" ? apiClient.post : apiClient.get)<T>(
          config.url,
          finalParams ?? {},
          {
            ...(config?.initConfig ?? {}),
            signal: abortControllerRef.current?.signal,
          }
        )
          .then((res) => {
            setData(res);
            onSuccess?.(res, finalParams);
            setIsFetching(false);
            setIsParamsChangeFetching(false);
            loopShouldWaitForResRef.current = false;
            resolve(res);
          })
          .catch((error: Error) => {
            if (!(error instanceof ApiCancelError)) {
              setIsFetching(false);
              setIsParamsChangeFetching(false);
              loopShouldWaitForResRef.current = false;
            }
            onError?.(error, finalParams);
          });
      });
    },
    [
      config?.initConfig,
      config.method,
      config.url,
      config.version,
      onError,
      onSuccess,
      params,
      setData,
      setIsFetching,
      onBefore,
    ]
  );

  // 保证轮询中的参数是最新的
  const getDataRef = useRef(getData);

  useEffect(() => {
    getDataRef.current = getData;
  }, [getData]);

  useDeepCompareEffect(() => {
    if (noDependency || (mountEffectRef.current && fetchOnUpdate) || !ready) {
      return;
    }
    if (!mountEffectRef.current) {
      onDependencyChange?.({ ...params } as P, reloadDeps);
      setIsParamsChangeFetching(true);
    }
    getDataRef.current({
      loopShouldWait: true,
      _params: { ...params } as P,
      from: "dep",
    });
  }, [...(reloadDeps ?? []), params]);

  useEffect(() => {
    mountEffectRef.current = false;
    return () => {
      mountEffectRef.current = true;
    };
  }, []);

  useDeepCompareEffect(() => {
    if (loop && ready) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timerRef.current = setInterval(() => {
        if (
          pauseRef.current ||
          !pageVisibleRef.current ||
          (loopShouldWaitForResRef.current && isFetchingRef.current)
        ) {
          return;
        }
        getDataRef.current({ loopShouldWait: false, from: "loop" });
      }, innerInterval || REQUEST_INTERVAL);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [innerInterval, loop]);
  const run = useMemoizedFn(async (params?: P) => {
    if (!ready) {
      return;
    }
    getData({ loopShouldWait: true, _params: { ...params } as P, from: "run" });
  });
  const cancel = useMemoizedFn(() => abortControllerRef.current?.abort?.());
  const waitUntilNextRequestSuccess = useMemoizedFn(
    () => (loopShouldWaitForResRef.current = true)
  );
  return {
    pause,
    setPause,
    isFetching,
    isFetchingRef,
    setInnerInterval,
    res: data,
    run,
    cancel,
    waitUntilNextRequestSuccess,
    isParamsChangeFetching,
  };
}
