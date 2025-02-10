"use client";

import { useMemo, useState } from "react";
import { ChatPage } from "../chat/components/chat";
import { NFT } from "@/types";
import { message, RadioButton, RadioButtonGroup } from "@/primitive/components";
import { upperFirstLetter } from "@/lib/utils/string";
import { Portfolio } from "./portfolio";
import { Analytics } from "./analytics";
import { Features } from "./features";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMemoizedFn } from "ahooks";
import { useBreakpoint } from "@/primitive/hooks/use-screen";
import { InfoSection } from "../info";
const tabs = ["chat", "portfolio", "activity", "features"] as const;
const mobileTabs = ["chat", "asset"] as const;
type Tab = (typeof tabs)[number];
type MobileTab = (typeof mobileTabs)[number];
export function Content({ nft }: { nft: NFT }) {
  const { publicKey } = useWallet();
  const [tab, _setTab] = useState<Tab | null>("chat");
  const setTab = useMemoizedFn((tab: Tab | null) => {
    if (
      tab === "features" &&
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
  const [mobileTab, setMobileTab] = useState<MobileTab | null>(null);
  const { breakpoint } = useBreakpoint();
  return (
    <div className='w-full flex flex-col items-center gap-32 portrait-tablet:gap-16'>
      <RadioButtonGroup
        disableAnimation
        onChange={(value) => {
          setMobileTab(value);
          setTab(null);
        }}
        value={tab === "chat" ? "chat" : mobileTab}
        className='portrait-tablet:flex hidden'
      >
        {mobileTabs.map((t) => (
          <RadioButton key={t} value={t}>
            {upperFirstLetter(t)}
          </RadioButton>
        ))}
      </RadioButtonGroup>
      <RadioButtonGroup
        disableAnimation
        onChange={(value) => {
          setTab(value);
          setMobileTab(null);
        }}
        value={mobileTab === "chat" ? "chat" : tab}
      >
        {tabs.map((t) => {
          if (
            (breakpoint === "portrait-tablet" || breakpoint === "mobile") &&
            t === "chat"
          ) {
            return null;
          }
          return (
            <RadioButton key={t} value={t}>
              {upperFirstLetter(t)}
            </RadioButton>
          );
        })}
      </RadioButtonGroup>

      <ChatPage
        agentId={nft.agentId}
        nft={nft}
        show={nft.agentId && (tab === "chat" || mobileTab === "chat")}
      />

      {(breakpoint === "portrait-tablet" || breakpoint === "mobile") &&
        mobileTab === "asset" && <InfoSection nft={nft} />}
      {tab === "portfolio" && <Portfolio nft={nft} />}
      {tab === "activity" && <Analytics nft={nft} />}
      {tab === "features" && <Features nft={nft} />}
    </div>
  );
}
