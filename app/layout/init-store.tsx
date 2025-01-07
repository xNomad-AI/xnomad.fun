"use client";
import { useTimeStore } from "@/primitive/hooks/time";
import { useEventListener } from "ahooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
const SPA_PAGES = ["/admin", "/profile", "/collections"];

export function InitStore() {
  const { startTick } = useTimeStore();
  const router = useRouter();
  useEffect(() => {
    startTick();
  }, [startTick]);
  useEventListener("popstate", () => {
    const { pathname } = window.location;
    if (!SPA_PAGES.some((p) => pathname.includes(p))) {
      router.replace(window.location.href);
    }
  });
  return <></>;
}
