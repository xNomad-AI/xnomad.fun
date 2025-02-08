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
const tabs = ["chat", "portfolio", "activity", "features"] as const;
type Tab = (typeof tabs)[number];
export function Content({ nft }: { nft: NFT }) {
  const { publicKey } = useWallet();
  const [tab, _setTab] = useState<Tab>("chat");
  const setTab = useMemoizedFn((tab: Tab) => {
    if (
      tab === "features" &&
      (!publicKey ||
        publicKey.toBase58().toLowerCase() !== nft.owner.toLowerCase())
    ) {
      message("You must be the owner to access this feature", {
        type: "error",
      });
      return;
    }
    _setTab(tab);
  });
  return (
    <div className='w-full flex flex-col items-center gap-32'>
      <RadioButtonGroup disableAnimation onChange={setTab} value={tab}>
        {tabs.map((t) => (
          <RadioButton key={t} value={t}>
            {upperFirstLetter(t)}
          </RadioButton>
        ))}
      </RadioButtonGroup>
      {nft.agentId && tab === "chat" && (
        <ChatPage agentId={nft.agentId} nft={nft} />
      )}
      {tab === "portfolio" && <Portfolio nft={nft} />}
      {tab === "activity" && <Analytics nft={nft} />}
      {tab === "features" && <Features nft={nft} />}
    </div>
  );
}
