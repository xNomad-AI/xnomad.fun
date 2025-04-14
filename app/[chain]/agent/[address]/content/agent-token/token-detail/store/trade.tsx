import constate from "constate";
import { useMemo, useState } from "react";
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
  trySellWithExactToken,
  sellToken,
} from "../trade/swap/bsc/four-meme/actions";
import {
  useAccount,
  useClient,
  useSendTransaction,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import BigNumber from "bignumber.js";
import { BNBContract } from "../trade/swap/bsc/pancake/constants";
import { waitForTransactionReceipt } from "viem/actions";
import { message } from "@/primitive/components";
import { BuySellSuccessfulToast } from "../trade/swap/sol/successful-toast";
import { getAmountOutMin } from "../trade/swap/bsc/four-meme/utils";
import { SWAPX_ABI } from "../trade/swap/bsc/swapx/abi";
import { SWAPX_CONTRACT } from "../trade/swap/bsc/swapx/constant";
import { parseEther } from "viem";
import { noExponents } from "@/lib/utils/number/bignumber";
import { getSwapXCallData } from "../trade/swap/bsc/swapx/network";
import { approveAssurance } from "../trade/swap/common/actions";
import { bsc } from "viem/chains";
const txDeadline = "1"; // minutes

function useStore() {
  const { chain } = useChainStore();
  const { userAddress } = useUserStore();
  const { swap } = useSolSwap();
  const { nft } = useAgentStore();
  const { isConnected, chain: walletChain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const address = useMemo(
    () => nft.primaryCoin?.address ?? "",
    [nft.primaryCoin?.address]
  );
  const nftEVMAddress = useMemo(
    () => nft.agentAccount.evm,
    [nft.agentAccount.evm]
  );
  const nftSolanaAddress = useMemo(
    () => nft.agentAccount.solana,
    [nft.agentAccount.solana]
  );
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
  const { sendTransactionAsync } = useSendTransaction();
  const handleBuy = useMemoizedFn(async (amount: number) => {
    setBuyLoading(true);
    try {
      if (chain === "solana") {
        await swap({
          amount: amount * LAMPORTS_PER_SOL,
          type: "buy",
          priorityFee: priorityFee * LAMPORTS_PER_SOL,
          tokenAddress: address ?? "",
          slippage,
          mode: tradeMode,
          tip: +tip * LAMPORTS_PER_SOL,
          agentWalletAddress: nftSolanaAddress,
          solAmount: amount * LAMPORTS_PER_SOL,
        });
      } else {
        if (!isConnected) {
          throw new Error("Please wait for the wallet to connect");
        }
        await switchChainAsync({
          chainId: bsc.id,
          addEthereumChainParameter: {
            rpcUrls: [
              tradeMode === "ANTI-MEV"
                ? process.env.BSC_SAFE_RPC ?? ""
                : process.env.BSC_RPC ?? "",
            ],
          },
        });
        const tokenInfo = await getTokenInfo({
          token: address,
          client: client!,
        });
        let tx;
        if (tokenInfo.liquidityAdded) {
          const callData = await getSwapXCallData({
            inputTokenCA: BNBContract,
            outputTokenCA: address,
            amount: parseEther(amount.toString()).toString(),
            slippage: slippage,
            userWalletAddress: userAddress as string,
            exactFees: [
              {
                feeCollector: nftEVMAddress,
                feeRate: "50", // bps
              },
              {
                feeCollector: process.env.EVM_FEE_RECIPIENT as string,
                feeRate: "50",
              },
            ],
          });
          tx = await sendTransactionAsync({
            data: callData.data,
            to: callData.to,
            value: callData.value as any,
            maxPriorityFeePerGas: parseEther(priorityFee.toString()),
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
          tx = await writeContractAsync({
            abi: SWAPX_ABI,
            address: SWAPX_CONTRACT,
            functionName: "buyMemeToken",
            args: [
              tryBuy.tokenManager,
              address,
              userAddress,
              parseEther(BigNumber(amount).toString()),
              noExponents(amountOutMin),
              [
                { feeCollector: nftEVMAddress, feeRate: "50" },
                { feeCollector: process.env.EVM_FEE_RECIPIENT, feeRate: "50" },
              ],
            ],
            value: parseEther(BigNumber(amount).toString()),
          });
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
      setBuyLoading(false);
      throw e;
    } finally {
      setBuyLoading(false);
    }
  });

  const handleSell = useMemoizedFn(
    async (amount: BigNumber, receive: string, tokenDecimal: number) => {
      setSellLoading(true);
      try {
        if (chain === "solana") {
          await swap({
            amount: amount.multipliedBy(10 ** tokenDecimal).toNumber(),
            type: "sell",
            priorityFee: priorityFee * LAMPORTS_PER_SOL,
            tokenAddress: address,
            slippage,
            mode: tradeMode,
            tip: +tip * LAMPORTS_PER_SOL,
            agentWalletAddress: nftSolanaAddress,
            solAmount: +receive * LAMPORTS_PER_SOL,
          });
        } else {
          if (!isConnected) {
            throw new Error("Please wait for the wallet to connect");
          }
          if (walletChain?.id !== bsc.id) {
            await switchChainAsync({
              chainId: bsc.id,
            });
          }
          const tokenInfo = await getTokenInfo({
            token: address,
            client: client!,
          });
          let tx;
          if (tokenInfo.liquidityAdded) {
            await approveAssurance({
              token: address as `0x${string}`,
              spender: SWAPX_CONTRACT,
              writeContractAsync,
              tokenAmount: amount,
              client: client!,
              wallet: userAddress as `0x${string}`,
            });
            const callData = await getSwapXCallData({
              inputTokenCA: address,
              outputTokenCA: BNBContract,
              amount: parseEther(amount.toString()).toString(),
              slippage: slippage,
              userWalletAddress: userAddress as string,
              exactFees: [
                {
                  feeCollector: nftEVMAddress,
                  feeRate: "50", // bps
                },
                {
                  feeCollector: process.env.EVM_FEE_RECIPIENT as string,
                  feeRate: "50",
                },
              ],
            });
            tx = await sendTransactionAsync({
              data: callData.data,
              to: callData.to,
              value: callData.value as any,
            });
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
        setSellLoading(false);
        throw e;
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
    tokenBalance: BigNumber(tokenBalance?.uiAmountString ?? "0"),
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
