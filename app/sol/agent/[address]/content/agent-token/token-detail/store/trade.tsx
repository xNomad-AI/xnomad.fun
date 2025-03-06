import constate from "constate";
import { useState } from "react";
import { useTradeConfigStore } from "./trade-config";
import { useSolana } from "@/lib/hooks/use-solana";
import { useInterval, useMemoizedFn, useRequest } from "ahooks";
import { useSwap } from "../swap/swap";
import { useAgentStore } from "../../../../store";
import { useWallet } from "@solana/wallet-adapter-react";
import { getGasPrice } from "../network/gas-price";

function useStore() {
  const { swap } = useSwap();
  const { nft } = useAgentStore();
  const address = nft.primaryCoin?.address ?? "";
  const { publicKey } = useWallet();
  const { getSolBalance, getSPLBalance } = useSolana();

  const { data: solBalance, refresh: updateSolBalance } = useRequest(
    async () => {
      if (publicKey) {
        const balance = await getSolBalance(publicKey);
        return balance;
      }
    }
  );
  const { data: tokenBalance, refresh: updateTokenBalance } = useRequest(
    async () => {
      if (publicKey) {
        const balance = await getSPLBalance(address, publicKey);
        return balance;
      }
    }
  );

  const { data: solGasData } = useRequest(
    async () => {
      return await getGasPrice();
    },
    {
      pollingInterval: 3000,
    }
  );
  const {
    slippage,
    priorityFee,
    tradeMode,
    tip,
    setTradeMode,
    setPriorityFeeType,
  } = useTradeConfigStore();
  const [buyLoading, setBuyLoading] = useState(false);
  const [sellLoading, setSellLoading] = useState(false);

  const handleBuy = useMemoizedFn(async (amount: number) => {
    setBuyLoading(true);
    try {
      await swap({
        amount: amount * 10 ** 9,
        type: "buy",
        priorityFee: priorityFee * 10 ** 9,
        tokenAddress: nft.primaryCoin?.address ?? "",
        slippage,
        mode: tradeMode,
        tip: +tip * 10 ** 9,
      });
    } finally {
      setBuyLoading(false);
    }
  });

  const handleSell = useMemoizedFn(async (amount: number) => {
    setSellLoading(true);
    try {
      await swap({
        amount,
        type: "sell",
        priorityFee: priorityFee * 10 ** 9,
        tokenAddress: address,
        slippage,
        mode: tradeMode,
        tip: +tip * 10 ** 9,
      });
    } finally {
      setSellLoading(false);
    }
  });

  const updateBalance = useMemoizedFn(() => {
    updateSolBalance();
    updateTokenBalance();
  });

  const ensureLargeAmountMEV = useMemoizedFn((value: number) => {
    if (value >= 2 && tradeMode !== "ANTI-MEV") {
      setTradeMode("ANTI-MEV");
      setPriorityFeeType("veryHigh");
    }
  });

  useInterval(() => {
    updateBalance();
  }, 1500);

  return {
    handleBuy,
    buyLoading,
    tokenBalance: tokenBalance?.uiAmount ?? 0,
    sellLoading,
    handleSell,
    tokenDecimal: tokenBalance?.decimals,
    updateBalance,
    solBalance,
    solGasData,
    ensureLargeAmountMEV,
  };
}

export const [TradeStoreProvider, useTradeStore] = constate(useStore);
