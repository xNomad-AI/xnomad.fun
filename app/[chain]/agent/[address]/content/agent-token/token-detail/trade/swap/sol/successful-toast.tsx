import { TextAnchor } from "@/components/text-button";
import { SupportedChain } from "@/types/preference";
import clsx from "clsx";
import React, { useEffect, useMemo, useState } from "react";

export function SuccessfulToast() {
  const [time, setTime] = useState(10);
  useEffect(() => {
    const interval = setInterval(() => {
      if (time <= 0) {
        clearInterval(interval);
        setTime(0);
        return;
      }
      setTime((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span>
      Transaction submitted, please wait for the confirmation (
      {time >= 0 ? time : "0"}s)
    </span>
  );
}

export function BuySellSuccessfulToast({
  txid,
  isBuy,
  status,
  chain,
}: {
  txid: string;
  isBuy: boolean;
  status: "success" | "failed";
  chain: SupportedChain;
}) {
  let errorMsg = "";
  if (isBuy) {
    if (status === "success") {
      errorMsg = "Successfully Bought";
    } else {
      errorMsg = "Purchase Failed";
    }
  } else {
    if (status === "success") {
      errorMsg = "Successfully Sold";
    } else {
      errorMsg = "Sale Failed";
    }
  }
  const exportUrl = useMemo(() => {
    switch (chain) {
      case "solana":
        return `https://solscan.io/tx/${txid}`;
      case "bsc":
        return `https://bscscan.com/tx/${txid}`;
      default:
        return "";
    }
  }, [chain, txid]);
  return (
    <span>
      <span
        className={clsx({
          "text-green": status === "success",
          "text-red": status === "failed",
        })}
      >
        {errorMsg}
      </span>
      <br />
      <TextAnchor target='_blank' href={exportUrl}>
        View transaction
      </TextAnchor>
    </span>
  );
}
