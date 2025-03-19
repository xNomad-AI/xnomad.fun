import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  appendInstruction,
  getTokenProgramId,
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
import {
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { VersionedTransaction } from "@solana/web3.js";
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

const SOL_ADDRESS = "So11111111111111111111111111111111111111112";
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
    const connection = new Connection(
      process.env.SOLANA_RPC ?? clusterApiUrl("mainnet-beta")
    );

    const [inputTokenCA, outputTokenCA] =
      type === "buy"
        ? [SOL_ADDRESS, tokenAddress]
        : [tokenAddress, SOL_ADDRESS];

    const outProgramId = await getTokenProgramId(outputTokenCA, connection);

    const inputProgramId = await getTokenProgramId(inputTokenCA, connection);

    // get or create fee token account after check to prevent invalid token account creation
    // only add fee account if the token is not a 2022 token
    // https://station.jup.ag/docs/swap-api/add-fees-to-swap#important-notes

    let url = `https://api.jup.ag/swap/v1/quote?inputMint=${inputTokenCA}&outputMint=${outputTokenCA}&amount=${Math.floor(
      +amount
    ).toString()}&dynamicSlippage=true&autoSlippage=true&maxAccounts=64&onlyDirectRoutes=false&asLegacyTransaction=false&restrictIntermediateTokens=true`;
    let needCreateFeeTokenAccount = false;
    const owner = new PublicKey(process.env.JUP_SWAP_FEE_ACCOUNT!);
    const mint = new PublicKey(inputTokenCA);
    const programId = inputProgramId;
    const allowOwnerOffCurve = true;
    const commitment = undefined;
    const tokenFeeAccount = getAssociatedTokenAddressSync(
      mint,
      owner,
      allowOwnerOffCurve,
      programId
    );
    const needFee =
      !inputProgramId.equals(TOKEN_2022_PROGRAM_ID) &&
      !outProgramId.equals(TOKEN_2022_PROGRAM_ID);
    if (needFee) {
      try {
        await getAccount(connection, tokenFeeAccount, commitment, programId);
      } catch (e) {
        needCreateFeeTokenAccount = true;
      }
    }
    url += `&platformFeeBps=${50}`;

    const quoteResponse = await fetch(url);
    const quoteData = await quoteResponse.json();

    if (!quoteData || quoteData.error) {
      throw new Error(
        `Failed to get quote: ${quoteData?.error || "Unknown error"}`
      );
    }

    const swapRequestBody: any = {
      quoteResponse: quoteData,
      userPublicKey: userWalletAddress,
      feeAccount: needFee ? tokenFeeAccount?.toBase58() : undefined,
    };

    if (mode === "ANTI-MEV") {
      swapRequestBody.prioritizationFeeLamports = {
        jitoTipLamports: priorityFee * LAMPORTS_PER_SOL,
      };
    } else {
      swapRequestBody.prioritizationFeeLamports = {
        priorityLevelWithMaxLamports: {
          global: false,
          maxLamports: (priorityFee || 0) * LAMPORTS_PER_SOL,
          priorityLevel: "veryHigh",
        },
      };
    }

    if (slippage) {
      swapRequestBody.slippageBps = Math.round(+slippage * 10000);
    } else {
      swapRequestBody.dynamicComputeUnitLimit = true;
      swapRequestBody.dynamicSlippage = true;
    }

    const swapResponse = await fetch("https://api.jup.ag/swap/v1/swap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(swapRequestBody),
    });

    const swapData = await swapResponse.json();

    if (!swapData || !swapData.swapTransaction) {
      throw new Error(
        `Failed to get swap transaction: ${
          swapData?.error || "No swap transaction returned"
        }`
      );
    }

    const buffer = Buffer.from(swapData.swapTransaction, "base64");
    const tx = VersionedTransaction.deserialize(buffer);

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
      const insForTip = await provider.makeTransferInstruction(
        wallet.publicKey,
        tip
      );

      const ins = [...insForTip, insForAgent];
      if (needCreateFeeTokenAccount && needFee) {
        ins.unshift(
          createAssociatedTokenAccountInstruction(
            wallet.publicKey,
            tokenFeeAccount!,
            owner,
            mint,
            programId
          )
        );
      }

      await appendInstruction(tx, okx.connections, ...ins);
      try {
        const estimate = await connection.simulateTransaction(tx);
      } catch (e) {}
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
