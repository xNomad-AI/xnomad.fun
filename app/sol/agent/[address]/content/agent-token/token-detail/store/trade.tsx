import constate from "constate";
import { useState } from "react";
import { useTradeConfigStore } from "./trade-config";
import { useSolBalance, useSPLBalance } from "@/lib/hooks/use-solana";
import { useMemoizedFn, useRequest } from "ahooks";
import { useSwap } from "../trade/swap/swap";
import { useAgentStore } from "../../../../store";
import { useWallet } from "@solana/wallet-adapter-react";
import { getGasPrice } from "../network/gas-price";

function useStore() {
  const { swap } = useSwap();
  const { nft } = useAgentStore();
  const address = nft.primaryCoin?.address ?? "";
  const { publicKey } = useWallet();
  const { balance: solBalance, refreshAsync: updateSol } =
    useSolBalance(publicKey);
  const { balance: tokenBalance, refreshAsync: updateToken } = useSPLBalance(
    address,
    publicKey
  );
  const updateBalance = useMemoizedFn(() => {
    updateSol();
    updateToken();
  });
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
        agentWalletAddress: nft.agentAccount.solana,
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
        agentWalletAddress: nft.agentAccount.solana,
      });
    } finally {
      setSellLoading(false);
    }
  });

  const ensureLargeAmountMEV = useMemoizedFn((value: number) => {
    if (value >= 2 && tradeMode !== "ANTI-MEV") {
      setTradeMode("ANTI-MEV");
      setPriorityFeeType("veryHigh");
    }
  });

  return {
    handleBuy,
    buyLoading,
    tokenBalance: tokenBalance?.uiAmount ?? 0,
    sellLoading,
    handleSell,
    tokenDecimal: tokenBalance?.decimals,
    solBalance,
    solGasData,
    ensureLargeAmountMEV,
    updateBalance,
  };
}

export const [TradeStoreProvider, useTradeStore] = constate(useStore);
