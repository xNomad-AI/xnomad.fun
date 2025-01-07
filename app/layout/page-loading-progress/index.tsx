"use client";
import { useEventListener, useUpdateEffect } from "ahooks";
import { motion } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";

import { usePageProgressStore } from "./store";

export function PageLoadingProgressBar() {
  const pathname = usePathname();
  const search = useSearchParams();
  const { progress, triggerProgress, endProgress } = usePageProgressStore();
  useEventListener("click", (e) => {
    const href = getLinkHref(e.target as Node);
    if (href && !e.metaKey) {
      triggerProgress(href);
    }
  });
  useUpdateEffect(() => {
    endProgress();
  }, [pathname, search]);

  return (
    progress > 0 && (
      <motion.div
        animate={{ width: `${progress}%` }}
        className={"bg-brand h-2 rounded-full top-0 left-0 fixed z-[10001]"}
      ></motion.div>
    )
  );
}

function getLinkHref(node: Node | null) {
  if (node instanceof Element) {
    if (
      node.nodeName === "A" &&
      node.getAttribute("href") &&
      node.getAttribute("target") !== "_blank"
    ) {
      return node.getAttribute("href");
    }
    return getLinkHref(node.parentNode);
  }
  return null;
}
