"use client";
import { bungee } from "@/app/layout/font";
import { Address } from "@/components/address";
import clsx from "clsx";
import Image from "next/image";
import { Content } from "./content";
import { useEffect, useState } from "react";
import { Container } from "@/app/layout/contianer";
import { TokenPage } from "./content/token";
import { useSearchParams } from "next/navigation";
import { useMemoizedFn } from "ahooks";

// Define tabs
const tabs = ["ai-nfts", "agent-tokens"] as const;
type Tab = (typeof tabs)[number];
const tabMap = {
  "ai-nfts": "AI-NFTs",
  "agent-tokens": "Holdings",
  activity: "Activity",
  "my-swarms": "My Swarms",
} as const;

interface Props {
  params: {
    address: string;
    chain: string;
  };
}

export default function Profile({ params }: Props) {
  const { address, chain } = params;
  const [activeTab, _setTab] = useState<Tab | null>("ai-nfts");
  const setActiveTab = useMemoizedFn((tab: Tab | null) => {
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

  return (
    <Container className='flex flex-col gap-32 w-full'>
      {/* Profile Header */}
      <div className='flex items-center mt-32 gap-16'>
        <Image
          src={`/${chain === "bsc" ? "bscscan-light" : "solscan"}.png`}
          className='mobile:h-24 mobile:w-24'
          height={40}
          width={40}
          alt=''
        />
        <Address
          address={address}
          enableCopy
          className={clsx(bungee.className, "text-[40px] mobile:text-size-24")}
        />
      </div>
      <div></div>

      {/* Tab Navigation */}
      <div className='flex items-center gap-32'>
        {tabs.map((tab) => (
          <button
            key={tab}
            className={clsx(
              "pb-12 text-size-20 font-bold",
              activeTab === tab
                ? "text-text1 border-b-2 border-white"
                : "text-text2"
            )}
            onClick={() => setActiveTab(tab)}
          >
            {tabMap[tab]}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className='w-full'>
        {activeTab === "ai-nfts" && <Content address={address} />}
        {activeTab === "agent-tokens" && <TokenPage />}
      </div>
    </Container>
  );
}
