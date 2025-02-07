"use client";
import { useMemoizedFn, useThrottleFn } from "ahooks";
import { useEffect, useState } from "react";

export const PAGE_VIEW_ID = "PAGE_VIEW_ID";

export function getPageViewElement() {
  if (typeof globalThis?.window === "undefined") {
    return null;
  }
  return document?.getElementById(PAGE_VIEW_ID) || null;
}

export function usePageViewScroll(
  fn: (event?: Event) => unknown,
  disabled = false,
  executeFnOnFirstLoad = true
) {
  useEffect(() => {
    if (disabled) {
      return;
    }
    if (executeFnOnFirstLoad) {
      // 默认页面刚加载时，执行一次，防止用户在js加载完毕前已经滚动到了底部
      fn();
    }
    const pageView = getPageViewElement();

    pageView?.addEventListener("scroll", fn, false);

    // eslint-disable-next-line consistent-return
    return () => {
      pageView?.removeEventListener("scroll", fn, false);
    };
  }, [fn, disabled, executeFnOnFirstLoad]);
}

export function useBackTop(thresholdValue = 200) {
  const [visible, setVisible] = useState(false);

  const backToTop = useMemoizedFn(() => {
    getPageViewElement()?.scrollTo({ top: 0, behavior: "smooth" });
  });

  const { run: handleScroll } = useThrottleFn(
    () => {
      const pageView = getPageViewElement();
      const scrollTop = pageView?.scrollTop ?? 0;
      if (scrollTop < thresholdValue) {
        setVisible(false);
      } else if (scrollTop > thresholdValue) {
        setVisible(true);
      }
    },
    { wait: 50 }
  );

  usePageViewScroll(handleScroll, false, true);

  return { visible, backToTop };
}
