"use client";
import { useTimeStore } from "@/primitive/hooks/time";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEventListener } from "ahooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUserInfoStore } from "../../src/user/user-store";
import { useLogin } from "@/src/user/use-login";
const SPA_PAGES = ["/admin", "/profile", "/collections"];

export function InitStore() {
  const { publicKey } = useWallet();
  const { initUserInfo } = useUserInfoStore();
  const { startTick } = useTimeStore();
  const login = useLogin();
  const router = useRouter();
  useEffect(() => {
    startTick();
  }, [startTick]);
  useEffect(() => {
    if (publicKey) {
      const hasToken = initUserInfo(publicKey.toBase58());
      if (!hasToken) {
        login();
      }
    }
  }, [publicKey]);
  useEventListener("popstate", () => {
    const { pathname } = window.location;
    if (!SPA_PAGES.some((p) => pathname.includes(p))) {
      router.replace(window.location.href);
    }
  });
  return <></>;
}
