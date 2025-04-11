"use client";

import { useEffect, useMemo, useState } from "react";
import { ChatPage } from "../chat";
import { message, RadioButton, RadioButtonGroup } from "@/primitive/components";

import { Features } from "./features";
import { useMemoizedFn, useMount, useRequest } from "ahooks";
import { useBreakpoint } from "@/primitive/hooks/use-screen";
import { InfoSection } from "../info";
import { Tasks } from "./tasks";
import { ChatProvider } from "../chat/store";
import { useAgentStore } from "../store";
import { getPortfolio } from "./deposit-container/network";
import clsx from "clsx";
import { AgentToken } from "./agent-token";
import { useSearchParams } from "next/navigation";
import {
  getPrimaryToken,
  getTokenDetail,
} from "./agent-token/token-detail/network";
import { getAgentConfig } from "./features/network";
import { SideWalletButton } from "../info/side-wallet-button";
import { useChainStore } from "@/app/layout/chain-provider";
import { isOwner } from "@/lib/user/ownership";
import { useUserStore } from "@/app/layout/chain-provider/hook";
import { use100vh } from "react-div-100vh";
const tabs = ["chat", "agent-token", "tasks", "features"] as const;
const tabMap = {
  chat: "Chat",
  "agent-token": "Agent Token",
  tasks: "Tasks",
  features: "Features",
  asset: "Asset",
};
const mobileTabs = ["chat", "tasks", "asset"] as const;
export type Tab = (typeof tabs)[number];
type MobileTab = (typeof mobileTabs)[number];
export function Content() {
  const { chain } = useChainStore();
  const { userAddress } = useUserStore();
  const {
    setPortfolio,
    refreshCount,
    setIsRefreshing,
    nft,
    setPrimaryToken,
    setAgentConfig,
    sideWalletVisible,
  } = useAgentStore();

  const [tab, _setTab] = useState<Tab | null>("chat");
  const setTab = useMemoizedFn((tab: Tab | null) => {
    if (tab === "tasks" && !isOwner(userAddress, nft.owner)) {
      message("You must be the owner to access this feature", {
        type: "error",
      });
      return;
    }
    _setTab(tab);
    window.history.pushState(null, "", `?tab=${tab}`);
  });
  const searchParams = useSearchParams();
  useEffect(() => {
    const tab = searchParams.get("tab") as Tab;
    if (tabs.includes(tab)) {
      _setTab(tab);
    }
  }, [searchParams]);
  const [mobileTab, setMobileTab] = useState<MobileTab | null>(null);
  const { breakpoint } = useBreakpoint();
  const getPortfolioData = useMemoizedFn(async (address: string) => {
    setIsRefreshing(true);
    getPortfolio({
      address,
      chain,
    })
      .then((data) => {
        setPortfolio(data);
      })
      .finally(() => {
        setIsRefreshing(false);
      });
  });
  const agentAccount = useMemo(
    () =>
      (chain === "solana" ? nft?.agentAccount.solana : nft?.agentAccount.evm) ??
      "",
    [nft?.agentAccount, chain]
  );
  useMount(() => {
    getAgentConfig(nft.id, chain).then((res) => {
      setAgentConfig(res);
    });
  });
  const height = use100vh();
  useRequest(
    async () => {
      if (nft.id) {
        const [res, tokenDetail] = await Promise.all([
          getPrimaryToken(nft.id, nft.chain),
          getTokenDetail(nft.chain, nft.primaryCoin?.address),
        ]);
        setPrimaryToken({
          ...res,
          price: parseFloat(tokenDetail.price),
          priceChange24h: parseFloat(tokenDetail.price24h),
          volume24h: parseFloat(tokenDetail.volume24h),
          holdersCount: tokenDetail.holderCount,
        });
      }
    },
    {
      refreshDeps: [nft.id, nft.primaryCoin?.address, nft.chain],
      pollingInterval: 1000 * 5,
    }
  );
  useRequest(
    async () => {
      getPortfolioData(agentAccount);
    },
    {
      refreshDeps: [agentAccount, refreshCount],
      ready: !!agentAccount,
    }
  );

  return (
    <div className='w-full flex flex-col items-center portrait-tablet:gap-16 transition-all duration-300 ease-in-out'>
      <div className='w-full flex flex-col gap-16 items-center relative z-2'>
        <SideWalletButton
          className={clsx("absolute left-0 top-1/2 -translate-y-1/2", {
            "opacity-0 pointer-events-none": sideWalletVisible,
          })}
        />

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
          className='bg-black-10 backdrop-blur-[10px]'
          value={
            mobileTab === "chat" || mobileTab === "tasks" ? mobileTab : tab
          }
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
      </div>
      <div
        style={{
          height:
            breakpoint === "mobile" && height
              ? height - 80 - 64 - 72
              : undefined,
        }}
        className='w-full h-[calc(100vh-32px-64px-72px+40px)] -mt-40 mobile:mt-0 mobile:h-[calc(100vh-64px-64px-80px)] overflow-y-scroll'
      >
        {nft.agentId && (
          <ChatProvider agentId={nft.agentId}>
            <div
              className={clsx(
                "flex mobile:flex-col mobile:gap-16 w-full h-full justify-center",
                {
                  hidden: !(tab === "chat" || mobileTab === "chat"),
                }
              )}
            >
              <ChatPage nft={nft} />
            </div>
          </ChatProvider>
        )}
        {mobileTab === "asset" && <InfoSection isMobile />}
        <AgentToken show={tab === "agent-token"} />
        {(tab === "tasks" || mobileTab === "tasks") && <Tasks nft={nft} />}
        {tab === "features" && <Features nft={nft} />}
      </div>
    </div>
  );
}
