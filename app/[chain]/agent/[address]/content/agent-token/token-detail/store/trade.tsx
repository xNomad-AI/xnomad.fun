import constate from "constate";
import { useState } from "react";
import { useTradeConfigStore } from "./trade-config";
import { useBalanceOnChain, useTokenBalanceOnChain } from "@/lib/hooks/balance";
import { useMemoizedFn, useRequest } from "ahooks";
import { useSolSwap } from "../trade/swap/sol/swap";
import { useAgentStore } from "../../../../store";
import { getGasPrice } from "../network/gas-price";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useChainStore } from "@/app/layout/chain-provider";
import { useUserStore } from "@/app/layout/chain-provider/hook";
import {
  tryBuyWithExactBnB,
  getTokenInfo,
  buyTokenAMAP,
  trySellWithExactToken,
  sellToken,
} from "../trade/swap/bsc/four-meme/actions";
import { useClient, useWriteContract } from "wagmi";
import {
  getSecureSwapAmountOut,
  swapExactTokensForMainToken,
  swapMainTokenForExactTokens,
} from "../trade/swap/bsc/pancake/actions";
import BigNumber from "bignumber.js";
import { WrappedTokenContract } from "../trade/swap/bsc/pancake/constants";
import { waitForTransactionReceipt } from "viem/actions";
import { message } from "@/primitive/components";
import { BuySellSuccessfulToast } from "../trade/swap/sol/successful-toast";
import { getAmountOutMin } from "../trade/swap/bsc/four-meme/utils";
import { onError } from "@/lib/utils/error";
const txDeadline = "1"; // minutes

function useStore() {
  const { chain } = useChainStore();
  const { userAddress } = useUserStore();
  const { swap } = useSolSwap();
  const { nft } = useAgentStore();
  const address = nft.primaryCoin?.address ?? "";
  const { balance: userBalance, refreshAsync: updateUserBalance } =
    useBalanceOnChain(userAddress);
  const { balance: tokenBalance, refreshAsync: updateToken } =
    useTokenBalanceOnChain(address, userAddress);
  const updateBalance = useMemoizedFn(() => {
    updateUserBalance();
    updateToken();
  });
  const { data: gasData } = useRequest(
    async () => {
      return await getGasPrice(chain);
    },
    {
      pollingInterval: 3000,
      refreshDeps: [chain],
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
  const client = useClient();
  const { writeContractAsync } = useWriteContract();
  const handleBuy = useMemoizedFn(async (amount: number) => {
    setBuyLoading(true);
    try {
      if (chain === "solana") {
        await swap({
          amount: amount * LAMPORTS_PER_SOL,
          type: "buy",
          priorityFee: priorityFee * LAMPORTS_PER_SOL,
          tokenAddress: nft.primaryCoin?.address ?? "",
          slippage,
          mode: tradeMode,
          tip: +tip * LAMPORTS_PER_SOL,
          agentWalletAddress: nft.agentAccount.solana,
          solAmount: amount * LAMPORTS_PER_SOL,
        });
      } else {
        const tokenInfo = await getTokenInfo({
          token: address,
          client: client!,
        });
        let tx;
        if (tokenInfo.liquidityAdded) {
          const [, amountOut] = await getSecureSwapAmountOut({
            amountIn: BigNumber(amount),
            path: [WrappedTokenContract, address as `0x${string}`],
            client: client!,
          });
          const deadline =
            Date.now() + parseInt(txDeadline ?? "1", 10) * 60 * 1000;

          tx = await swapMainTokenForExactTokens({
            amountOut: amountOut.multipliedBy(1 - slippage),
            wrappedAmount: BigNumber(amount),
            writeContractAsync,
            client: client!,
            to: userAddress as `0x${string}`,
            pathOut: address as `0x${string}`,
            deadline: Math.ceil(deadline / 1000),
          });
        } else {
          const tryBuy = await tryBuyWithExactBnB({
            bnbFund: BigNumber(amount),
            token: address as `0x${string}`,
            client: client!,
          });

          const amountOutMin = getAmountOutMin(
            tryBuy.estimatedAmount,
            slippage
          );

          const txRes = await buyTokenAMAP({
            wrappedAmount: BigNumber(tryBuy.amountFunds),
            amountOut: amountOutMin,
            pathOut: address as `0x${string}`,
            writeContractAsync,
            account: userAddress as `0x${string}`,
            client: client!,
          });
          tx = txRes;
        }
        const res = await waitForTransactionReceipt(client!, {
          hash: tx,
        });
        message(
          <BuySellSuccessfulToast
            isBuy
            status={res.status === "success" ? "success" : "failed"}
            txid={tx}
            chain={chain}
          />,
          {
            duration: 5000,
          }
        );
      }
    } catch (e) {
      onError(e);
    } finally {
      setBuyLoading(false);
    }
  });

  const handleSell = useMemoizedFn(
    async (amount: number, receive: string, tokenDecimal: number) => {
      setSellLoading(true);
      try {
        if (chain === "solana") {
          await swap({
            amount: amount * 10 ** tokenDecimal,
            type: "sell",
            priorityFee: priorityFee * LAMPORTS_PER_SOL,
            tokenAddress: address,
            slippage,
            mode: tradeMode,
            tip: +tip * LAMPORTS_PER_SOL,
            agentWalletAddress: nft.agentAccount.solana,
            solAmount: +receive * LAMPORTS_PER_SOL,
          });
        } else {
          const tokenInfo = await getTokenInfo({
            token: address,
            client: client!,
          });
          let tx;
          if (tokenInfo.liquidityAdded) {
            const [, amountOut] = await getSecureSwapAmountOut({
              amountIn: BigNumber(amount),
              path: [address as `0x${string}`, WrappedTokenContract],
              client: client!,
            });
            const deadline =
              Date.now() + parseInt(txDeadline ?? "1", 10) * 60 * 1000;
            const res = await swapExactTokensForMainToken({
              amountIn: BigNumber(amount),
              amountOut: amountOut.multipliedBy(1 - slippage),
              pathIn: address as `0x${string}`,
              to: userAddress as `0x${string}`,
              deadline: Math.ceil(deadline / 1000),
              writeContractAsync,
              client: client!,
            });
            tx = res;
          } else {
            const trySell = await trySellWithExactToken({
              amount: BigNumber(amount),
              token: address as `0x${string}`,
              client: client!,
            });

            const amountOutMin = getAmountOutMin(
              trySell.funds.toString(),
              slippage
            );
            const txRes = await sellToken({
              amount: BigNumber(amount),
              amountOut: amountOutMin,
              pathOut: address as `0x${string}`,
              writeContractAsync,
              client: client!,
              account: userAddress as `0x${string}`,
            });
            tx = txRes;
          }
          const res = await waitForTransactionReceipt(client!, {
            hash: tx,
          });
          message(
            <BuySellSuccessfulToast
              isBuy={false}
              status={res.status === "success" ? "success" : "failed"}
              txid={tx}
              chain={chain}
            />,
            {
              duration: 5000,
            }
          );
        }
      } catch (e) {
        onError(e);
      } finally {
        setSellLoading(false);
      }
    }
  );

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
    userBalance,
    gasData,
    ensureLargeAmountMEV,
    updateBalance,
  };
}

export const [TradeStoreProvider, useTradeStore] = constate(useStore);
