"use client";

import { upperFirstLetter } from "@/lib/utils/string";
import { message } from "@/primitive/components";
import { useState } from "react";
import { getAutoTasks, Task } from "./limit-order/network";
import { useRequest } from "ahooks";
import { TaskCard } from "./limit-order/card";
import { NFT } from "@/types";
import { LimitOrderTask } from "./limit-order";

const tabs = ["limit-order", "copy-trade"] as const;
type Tab = (typeof tabs)[number];
const comingSoon = ["copy-trade"] as Tab[];
export function Tasks({ nft }: { nft: NFT }) {
  const [tab, setTab] = useState<Tab | null>("limit-order");

  return (
    <div className='w-full flex flex-col gap-24'>
      <div className='flex items-center gap-24'>
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => {
              if (comingSoon.includes(t)) {
                message("Coming soon", { type: "error" });
                return;
              }
              setTab(t);
            }}
            className={`text-size-20 font-bold ${
              tab === t ? "text-text1" : "text-text2"
            }`}
          >
            {t
              .split("-")
              .map((word) => upperFirstLetter(word))
              .join(" ")}
          </button>
        ))}
      </div>
      {tab === "limit-order" && <LimitOrderTask nft={nft} />}
    </div>
  );
}
