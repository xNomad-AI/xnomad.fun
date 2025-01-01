import { createContext, PropsWithChildren, useContext, useRef } from 'react';
import { StoreApi, useStore } from 'zustand';
import { useStoreWithEqualityFn } from 'zustand/traditional';

export function createZustandStore<InitProps, Store>(creator: (args: InitProps) => StoreApi<Store>) {
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
      throw new Error('Missing Context.Provider in the tree');
    }
    return useStore(store);
  }
  /**
   * 这里只默认对对象做了潜比较（第一层级属性）
   *
   * 按照需求解构对象，或者未来在这里添加配置比较多个层级的属性
   * @param selector
   * @returns
   */
  function _useStoreSelector<T>(selector: (state: Store) => T): T {
    const store = useContext(context);
    if (!store) {
      throw new Error('Missing Context.Provider in the tree');
    }
    const result = useStoreWithEqualityFn(store, selector);
    return result;
  }

  return [_Provider, _useStore, _useStoreSelector] as const;
}
