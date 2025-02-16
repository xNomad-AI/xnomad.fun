import { sleep } from "@/primitive/utils/sleep";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { useMemoizedFn } from "ahooks";
import { useMemo } from "react";

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
      // 检查是否有状态信息
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
  const getBalance = useMemoizedFn(async (publicKey: PublicKey) => {
    const balance = await connection.getBalance(publicKey);
    return balance;
  });
  return {
    connection,
    inspectTransaction,
    getBalance,
  };
}
