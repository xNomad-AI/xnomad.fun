"use client";

import { useState } from "react";
import { ChatPage } from "../chat/components/chat";
import { NFT } from "@/types";
import { RadioButton, RadioButtonGroup } from "@/primitive/components";
import { upperFirstLetter } from "@/lib/utils/string";
const tabs = ["chat", "portfolio", "analytics", "features"] as const;
type Tab = (typeof tabs)[number];
export function Content({ nft }: { nft: NFT }) {
  const [tab, setTab] = useState<Tab>("chat");
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
    </div>
  );
}
