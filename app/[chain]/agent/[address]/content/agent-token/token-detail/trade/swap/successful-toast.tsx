import { TextAnchor } from "@/components/text-button";
import clsx from "clsx";
import React, { useEffect, useState } from "react";

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
}: {
  txid: string;
  isBuy: boolean;
  status: "success" | "failed";
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
      <TextAnchor target='_blank' href={`https://solscan.io/tx/${txid}`}>
        View transaction
      </TextAnchor>
    </span>
  );
}
