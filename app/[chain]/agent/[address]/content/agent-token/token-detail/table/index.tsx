import { useState } from "react";
import { useActivities } from "./use-activities";
import { Activity } from "./activty";
import { Holders } from "./holders";
import { TokenInfo } from "../../token-list/network";
import { toThousandNum } from "@/lib/utils/number";

export function Table({ tokenInfo }: { tokenInfo: TokenInfo }) {
  const [tab, setTab] = useState<"activity" | "holder">("activity");
  return (
    <>
      <div className='flex gap-24 items-center'>
        <button
          className={`text-size-16 font-bold ${
            tab === "activity" ? "text-text1" : "text-white-60"
          }`}
          onClick={() => setTab("activity")}
        >
          Activity
        </button>
        <button
          className={`text-size-16 font-bold ${
            tab === "holder" ? "text-text1" : "text-white-60"
          }`}
          onClick={() => setTab("holder")}
        >
          Holders({toThousandNum(tokenInfo.holdersCount)})
        </button>
      </div>
      <Activity show={tab === "activity"} />
      <Holders show={tab === "holder"} />
    </>
  );
}
