import { sleep } from "@/primitive/utils/sleep";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  TokenAmount,
} from "@solana/web3.js";
import { useMemoizedFn, useRequest, useWhyDidYouUpdate } from "ahooks";
import { useMemo, useState } from "react";
import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import BigNumber from "bignumber.js";
const solMintAddress = ["So11111111111111111111111111111111111111111"];
export function useSolana() {
  const connection = useMemo(
    () =>
      new Connection(process.env.SOLANA_RPC ?? clusterApiUrl("mainnet-beta")),
    []
  );
  async function inspectTransaction(signature: string) {
    try {
      const status = await connection.getSignatureStatus(signature, {
        searchTransactionHistory: true,
      });
      // check if the transaction is finalized
      if (status.value) {
        if (status.value.confirmationStatus === "finalized") {
          return true;
        } else if (status.value.err) {
          throw status.value.err;
        } else {
          // has no status: retry after 1s
          await sleep(1000);
          throw new Error("pending");
        }
      } else {
        // has no status: retry after 1s
        await sleep(1000);
        throw new Error("pending");
      }
    } catch (e) {
      if ((e as Error).message === "pending") {
        return inspectTransaction(signature);
      } else {
        throw e;
      }
    }
  }
  const getSolBalance = useMemoizedFn(async (publicKey: PublicKey) => {
    const balance = await connection.getBalance(publicKey);
    return BigNumber(balance).dividedBy(10 ** 9);
  });
  const getTokenProgramId = useMemoizedFn(async (mintTokenAddress: string) => {
    const address = new PublicKey(mintTokenAddress);
    const accountInfo = await connection.getParsedAccountInfo(address);
    if (accountInfo?.value?.owner.equals(TOKEN_2022_PROGRAM_ID))
      return TOKEN_2022_PROGRAM_ID;
    if (accountInfo?.value?.owner.equals(TOKEN_PROGRAM_ID))
      return TOKEN_PROGRAM_ID;
    throw new Error(
      `Invalid token program ID, mint=${mintTokenAddress}, owner=${accountInfo.value?.owner.toBase58()}`
    );
  });
  const getSPLBalance = useMemoizedFn(
    async (mintTokenAddress: string, publicKey: PublicKey) => {
      if (solMintAddress.includes(mintTokenAddress)) {
        const uiAmount = await getSolBalance(publicKey);
        return {
          amount: uiAmount.multipliedBy(10 ** 9).toString(),
          decimals: 9,
          uiAmount: uiAmount.toNumber(),
          uiAmountString: uiAmount.toString(),
        } satisfies TokenAmount;
      }
      const programId = await getTokenProgramId(mintTokenAddress);
      const associatedAccount = getAssociatedTokenAddressSync(
        new PublicKey(mintTokenAddress),
        publicKey,
        false,
        programId
      );

      const balance = await connection.getTokenAccountBalance(
        associatedAccount
      );
      return balance.value;
    }
  );
  return {
    connection,
    inspectTransaction,
    getSolBalance,
    getSPLBalance,
  };
}
interface BalanceConfig {
  disablePooling: boolean;
  pollingInterval?: number;
}
export function useSolBalance(
  account?: PublicKey | null,
  config?: BalanceConfig
) {
  const { getSolBalance } = useSolana();
  const { refreshAsync, data: balance } = useRequest(
    async () => {
      if (!account) return BigNumber(0);
      const res = await getSolBalance(account);
      return res;
    },
    {
      refreshDeps: [account, config?.disablePooling],
      pollingInterval: config?.pollingInterval ?? 5000,
      ready: Boolean(account) && !config?.disablePooling,
    }
  );
  return { balance: balance ?? BigNumber(0), refreshAsync };
}

export function useSPLBalance(
  address: string,
  account?: PublicKey | null,
  config?: BalanceConfig
) {
  const { getSPLBalance } = useSolana();
  const { refreshAsync, data: balance } = useRequest(
    async () => {
      if (!account) return undefined;
      const res = await getSPLBalance(address, account);
      return res;
    },
    {
      refreshDeps: [address, account, config?.disablePooling],
      pollingInterval: config?.pollingInterval ?? 5000,
      ready: Boolean(address) && Boolean(account) && !config?.disablePooling,
    }
  );
  return { balance: balance ?? undefined, refreshAsync };
}
