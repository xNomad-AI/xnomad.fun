import { useEventListener, useMemoizedFn } from "ahooks";
import { useState } from "react";

export function usePageTabSwitch<T extends string, S extends string>({
  initTab,
  pathBase,
  initSubTab,
}: {
  initTab: T;
  initSubTab?: S;
  pathBase: string;
}) {
  const [currentTab, setCurrentTab] = useState<T>(initTab);
  const [currentSubTab, setCurrentSubTab] = useState<S | undefined>(initSubTab);
  const handleTabChange = useMemoizedFn((tab: T) => {
    if (tab === currentTab) {
      return;
    }
    window.history.pushState(
      { tab: currentTab },
      "",
      `/${pathBase}/${tab}`.replaceAll("//", "/")
    );
    setCurrentTab(tab);
    setCurrentSubTab(undefined);
  });
  useEventListener("popstate", () => {
    const { pathname } = window.location;
    if (pathname.includes(pathBase)) {
      const tabs = pathname.replace(pathBase, "");
      const safeTabs = (tabs.startsWith("/") ? tabs.slice(1) : tabs).split("/");
      const tab = safeTabs[0] as T;
      const subTab = safeTabs[1] as S;
      if (tab !== currentTab) {
        setCurrentTab(tab);
      }
      if (subTab !== currentSubTab) {
        setCurrentSubTab(subTab);
      }
    }
  });
  return {
    current: currentTab,
    currentSubTab,
    handleTabChange,
  };
}
