import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  appendInstruction,
  makeOkxSwapParams,
  prioritizationFee,
  serializeTransaction,
} from "./utils";
import { useProvider } from "./provider";
import { BuySellSuccessfulToast, SuccessfulToast } from "./successful-toast";
import { OKXSwap } from "./okx";
import { isNumber } from "@/lib/utils/number/is-number";
import { useMemoizedFn } from "ahooks";
import { message } from "@/primitive/components";
import { onError } from "@/lib/utils/error";
import { useConnectModalStore } from "@/components/connect-modal/store";
import { api } from "@/primitive/api";
import { PublicKey } from "@solana/web3.js";
import { SystemProgram } from "@solana/web3.js";
import BigNumber from "bignumber.js";
const FEE = 0.01;
const FEE_FOR_AGENT = 0.005;
const FEE_FOR_XNOMAD = FEE - FEE_FOR_AGENT;
export interface OKXCallDataRequestParams {
  amount?: string;
  chainId?: string;
  fromTokenAddress?: string;
  slippage?: string;
  toTokenAddress?: string;
  userWalletAddress?: string;
  computeUnitPrice?: string;
  computeUnitLimit?: string;
  feePercent?: string;
  fromTokenReferrerWalletAddress?: string;
  toTokenReferrerWalletAddress?: string;
}
const TOAST_ID = "quick-buy-toast";

export type SwapMode = "FAST" | "ANTI-MEV";

export type SwapOption = {
  type: "sell" | "buy";
  tokenAddress: string;
  /**
   * value * decimal
   */
  amount: number;
  // transform into string
  slippage: number | string;
  /**
   * Lamports unit
   */
  priorityFee: number;
  /**
   * lamports unit
   */
  tip: number;
  mode: SwapMode;
  agentWalletAddress: string;
  solAmount: number;
};
function getOKXCallData(params: OKXCallDataRequestParams) {
  return api.ts.get("/okx_forward/swap", params);
}
export function useSwap() {
  const wallet = useWallet();
  const { setVisible } = useConnectModalStore();
  const [okx, setOkx] = useState<OKXSwap | null>(null);
  const { fastModeProvider, mevModeProvider } = useProvider();

  const createCalldata = async (
    params: OKXCallDataRequestParams,
    okx: OKXSwap,
    fee: number
  ) => {
    const res = await getOKXCallData(params);
    const tx = await okx.createTxFromSwapData(res);
    const estimate = await okx.simulateTx(tx);
    const uc = estimate.value.unitsConsumed || 0;
    if (isNumber(uc) && uc > 250_000) {
      const computeUnitLimit = Math.floor(uc * 1.5);
      const { computeUnitPrice } = prioritizationFee(fee, computeUnitLimit);
      params.computeUnitLimit = `${computeUnitLimit}`;
      params.computeUnitPrice = `${computeUnitPrice}`;
      const res = await getOKXCallData(params);
      return okx.createTxFromSwapData(res);
    }
    return tx;
  };

  const swap = useMemoizedFn(async (option: SwapOption) => {
    const {
      amount,
      slippage,
      tokenAddress,
      priorityFee,
      type,
      tip = 0.001 * LAMPORTS_PER_SOL,
      mode = "FAST",
      agentWalletAddress,
      solAmount,
    } = option;
    if (!wallet.connected || !wallet.publicKey) {
      setVisible(true);
      return;
    }

    if (amount <= 0) {
      message("Amount must be greater than 0", { type: "error" });
      return;
    }

    if (!okx) return;

    const userWalletAddress = wallet.publicKey.toBase58();
    const computeUnitLimit = 300_000;
    const { computeUnitPrice } = prioritizationFee(
      priorityFee,
      computeUnitLimit
    );
    const baseParams: OKXCallDataRequestParams = {
      amount:
        type === "buy"
          ? (amount * (1 - FEE_FOR_AGENT)).toString()
          : amount.toString(),
      slippage: slippage.toString(),
      chainId: "501",
      userWalletAddress,
      feePercent: (FEE_FOR_XNOMAD * 100).toString(),
      computeUnitPrice: `${computeUnitPrice}`,
      computeUnitLimit: `${computeUnitLimit}`,
    };

    const swapParams = makeOkxSwapParams(type, tokenAddress);

    const okxParams = {
      ...baseParams,
      ...swapParams,
    };

    const provider = mode === "FAST" ? fastModeProvider : mevModeProvider;

    try {
      const insForAgent = SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: new PublicKey(agentWalletAddress),
        lamports: +BigNumber(solAmount * FEE_FOR_AGENT).toFixed(
          0,
          BigNumber.ROUND_DOWN
        ),
      });
      const [tx, insForTip] = await Promise.all([
        createCalldata(okxParams, okx, priorityFee),
        provider.makeTransferInstruction(wallet.publicKey, tip),
      ]);
      await appendInstruction(tx, okx.connections, ...insForTip, insForAgent);
      const signedTx = await wallet.signTransaction?.(tx);

      if (!signedTx) {
        throw new Error("Not Found Transaction");
      }

      const content = serializeTransaction(signedTx);

      const txid = await provider.postSubmit(content);

      const { close } = message(<SuccessfulToast />, {
        duration: 10000,
      });
      const status = await okx.waitSwapStatus(txid);
      close();
      message(
        <BuySellSuccessfulToast
          isBuy={type === "buy"}
          status={status ? "success" : "failed"}
          txid={txid}
        />,
        {
          duration: 5000,
        }
      );
    } catch (error: unknown) {
      const text = type === "sell" ? "Failed to sell" : "Failed to buy";
      onError(error, text);
    }
  });

  useEffect(() => {
    setOkx(new OKXSwap(wallet));
  }, [wallet]);

  return {
    swap,
  };
}
