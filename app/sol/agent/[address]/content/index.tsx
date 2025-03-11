"use client";

import { useEffect, useMemo, useState } from "react";
import { ChatPage } from "../chat";
import { message, RadioButton, RadioButtonGroup } from "@/primitive/components";
import { Portfolio } from "./wallet";
import { Features } from "./features";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMemoizedFn, useRequest } from "ahooks";
import { useBreakpoint } from "@/primitive/hooks/use-screen";
import { InfoSection } from "../info";
import { Tasks } from "./tasks";
import { ChatProvider } from "../chat/store";
import { useAgentStore } from "../store";
import { getPortfolio } from "./deposit-container/network";
import { SideWallet } from "./wallet/side-wallet";
import clsx from "clsx";
import { AgentToken } from "./agent-token";
import { useSearchParams } from "next/navigation";
import { isOwner } from "@/lib/user/ownership";
import { getPrimaryToken } from "./agent-token/token-detail/network";
const tabs = ["chat", "wallet", "agent-token", "tasks", "features"] as const;
const tabMap = {
  chat: "Chat",
  wallet: "Wallet",
  "agent-token": "Agent Token",
  tasks: "Tasks",
  features: "Features",
  asset: "Asset",
};
const mobileTabs = ["chat", "tasks", "asset"] as const;
export type Tab = (typeof tabs)[number];
type MobileTab = (typeof mobileTabs)[number];
export function Content() {
  const { publicKey } = useWallet();
  const { setPortfolio, refreshCount, setIsRefreshing, nft, setPrimaryToken } =
    useAgentStore();

  const [tab, _setTab] = useState<Tab | null>("chat");
  const setTab = useMemoizedFn((tab: Tab | null) => {
    if (
      (tab === "features" || tab === "tasks") &&
      (!publicKey ||
        publicKey.toBase58().toLowerCase() !== nft.owner?.toLowerCase())
    ) {
      message("You must be the owner to access this feature", {
        type: "error",
      });
      return;
    }
    _setTab(tab);
  });
  const searchParams = useSearchParams();
  useEffect(() => {
    const tab = searchParams.get("tab") as Tab;
    if (tabs.includes(tab)) {
      setTab(tab);
    }
  }, [searchParams]);
  const [mobileTab, setMobileTab] = useState<MobileTab | null>(null);
  const { breakpoint } = useBreakpoint();
  const getPortfolioData = useMemoizedFn(async (address: string) => {
    setIsRefreshing(true);
    getPortfolio({
      address,
    })
      .then((data) => {
        setPortfolio(data);
      })
      .finally(() => {
        setIsRefreshing(false);
      });
  });
  const agentAccountSol = useMemo(
    () => nft?.agentAccount.solana ?? "",
    [nft?.agentAccount.solana]
  );
  useRequest(
    async () => {
      if (nft.id) {
        const res = await getPrimaryToken(nft.id);
        setPrimaryToken(res);
      }
    },
    {
      refreshDeps: [nft.id],
    }
  );
  useRequest(
    async () => {
      getPortfolioData(agentAccountSol);
    },
    {
      refreshDeps: [agentAccountSol, refreshCount],
      ready: !!agentAccountSol,
    }
  );
  return (
    <div className='w-full flex flex-col items-center gap-32 portrait-tablet:gap-16'>
      <RadioButtonGroup
        disableAnimation
        onChange={(value) => {
          setMobileTab(value);
          setTab(null);
        }}
        value={tab === "chat" || tab === "tasks" ? tab : mobileTab}
        className='portrait-tablet:flex hidden'
      >
        {mobileTabs.map((t) => (
          <RadioButton key={t} value={t}>
            {tabMap[t]}
          </RadioButton>
        ))}
      </RadioButtonGroup>
      <RadioButtonGroup
        disableAnimation
        onChange={(value) => {
          setTab(value);
          setMobileTab(null);
        }}
        value={mobileTab === "chat" || mobileTab === "tasks" ? mobileTab : tab}
      >
        {tabs.map((t) => {
          if (
            (breakpoint === "portrait-tablet" || breakpoint === "mobile") &&
            (t === "chat" || t === "tasks")
          ) {
            return null;
          }
          return (
            <RadioButton key={t} value={t}>
              {tabMap[t]}
            </RadioButton>
          );
        })}
      </RadioButtonGroup>

      {nft.agentId && (
        <ChatProvider agentId={nft.agentId}>
          <div
            className={clsx(
              "flex gap-32 mobile:flex-col mobile:gap-16 w-full justify-center",
              {
                hidden: !(tab === "chat" || mobileTab === "chat"),
              }
            )}
          >
            <ChatPage nft={nft} />
          </div>
        </ChatProvider>
      )}
      {(breakpoint === "portrait-tablet" || breakpoint === "mobile") &&
        mobileTab === "asset" && <InfoSection />}
      <Portfolio show={tab === "wallet"} />
      <AgentToken show={tab === "agent-token"} />
      {(tab === "tasks" || mobileTab === "tasks") && <Tasks nft={nft} />}
      {tab === "features" && <Features nft={nft} />}
    </div>
  );
}
