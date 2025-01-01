import { createContext, PropsWithChildren, useContext } from 'react';

import { TabVariant } from './type';

type TabContext = {
  activeTabKey?: string;
  onChange?: (tabKey: string) => void;
  variant?: TabVariant;
};

const tabsContext = createContext<TabContext>({});

const { Provider } = tabsContext;

export function Tabs(props: PropsWithChildren<TabContext>) {
  const { children, ...value } = props;
  return <Provider value={value}>{children}</Provider>;
}

export function useTabs() {
  return useContext(tabsContext);
}
