import { useEffect } from "react";

import { useRefState } from "./use-ref-state";

export function getVisibilityState() {
  const prefixes = ["webkit", "moz", "ms", "o"];
  if ("visibilityState" in document) {
    return "visibilityState";
  }
  for (let i = 0; i < prefixes.length; i++) {
    if (`${prefixes[i]}VisibilityState` in document) {
      return `${prefixes[i]}VisibilityState`;
    }
  }
  // otherwise it's not supported
  return "";
}
type DocumentVisibilityState = "hidden" | "visible";

export function usePageVisibilityOnlyCb({
  cbOnHide,
  cbOnVisible,
}: {
  visibility?: boolean;
  cbOnVisible?: () => void;
  cbOnHide?: () => void;
}) {
  useEffect(() => {
    const onPageVisibleChange = () => {
      const _pageVisibility: DocumentVisibilityState = (document as any)[
        getVisibilityState()
      ];
      if (_pageVisibility === "visible") {
        cbOnVisible?.();
      } else {
        cbOnHide?.();
      }
    };
    document.addEventListener("visibilitychange", onPageVisibleChange);
    return () => {
      document.removeEventListener("visibilitychange", onPageVisibleChange);
    };
  }, []);
}

export function usePageVisibilityWithState({
  visibility = true,
  cbOnHide,
  cbOnVisible,
}: {
  visibility?: boolean;
  cbOnVisible?: () => void;
  cbOnHide?: () => void;
}) {
  const [pageVisible, setPageVisible, pageVisibleRef] =
    useRefState<boolean>(visibility);
  useEffect(() => {
    const onPageVisibleChange = () => {
      const _pageVisibility: DocumentVisibilityState = (document as any)[
        getVisibilityState()
      ];
      if (_pageVisibility === "visible") {
        cbOnVisible?.();
      } else {
        cbOnHide?.();
      }
      setPageVisible(_pageVisibility === "visible");
    };
    document.addEventListener("visibilitychange", onPageVisibleChange);
    return () => {
      document.removeEventListener("visibilitychange", onPageVisibleChange);
    };
  }, [cbOnVisible, cbOnHide, setPageVisible]);
  return {
    pageVisible,
    pageVisibleRef,
  };
}
