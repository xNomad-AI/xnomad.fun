"use client";
import { createContext, PropsWithChildren, useContext, useRef } from "react";
import { StoreApi, useStore } from "zustand";

export function createZustandStore<InitProps, Store>(
  creator: (args: InitProps) => StoreApi<Store>
) {
  const context = createContext<StoreApi<Store>>({} as any);

  const { Provider } = context;

  function _Provider(props: PropsWithChildren<InitProps>) {
    const { children, ...initStoreProps } = props;
    const storeRef = useRef<StoreApi<Store>>();

    if (!storeRef.current) {
      storeRef.current = creator(initStoreProps as InitProps);
    }

    const value = storeRef.current!;

    return <Provider value={value}>{children}</Provider>;
  }

  function _useStore() {
    const store = useContext(context);
    if (!store) {
      throw new Error("Missing Context.Provider in the tree");
    }
    try {
      return useStore(store);
    } catch (error) {
      return {} as ReturnType<typeof useStore<typeof store>>;
    }
  }
  /**
   * @param selector
   * @returns
   */
  function _useStoreSelector<T>(selector: (state: Store) => T): T {
    const store = useContext(context);
    if (!store) {
      throw new Error("Missing Context.Provider in the tree");
    }
    const result = useStore(store, selector);
    return result;
  }

  return [_Provider, _useStore, _useStoreSelector] as const;
}
