import { createTraderAPIMemoInstruction } from "@bloxroute/solana-trader-client-ts";
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { useMemo } from "react";
import { submitBlox, submitJito } from "./network";

type JitoResponse<T> = {
  result: T;
};

type Provider = {
  makeTransferInstruction: (
    fromPubkey: PublicKey,
    lamports: number
  ) => Promise<TransactionInstruction[]>;

  postSubmit: (content: string) => Promise<string>;
};

export function useProvider() {
  const fastModeProvider = useMemo<Provider>(() => {
    return {
      async makeTransferInstruction(fromPubkey, lamports) {
        const TRADER_API_TIP_WALLET =
          "HWEoBxYs7ssKuudEjzjmpfJVX7Dvi7wescFsVx2L5yoY";
        const toPubkey = new PublicKey(TRADER_API_TIP_WALLET);
        const ins = SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports,
        });

        return [ins, createTraderAPIMemoInstruction("")];
      },

      async postSubmit(content) {
        const res = await submitBlox({ content });
        return res!.message;
      },
    };
  }, [submitBlox]);

  const mevModeProvider = useMemo<Provider>(() => {
    return {
      async makeTransferInstruction(fromPubkey, lamports) {
        const body = {
          jsonrpc: "2.0",
          id: 1,
          method: "getTipAccounts",
          params: [],
        };
        const data = await fetch(
          "https://mainnet.block-engine.jito.wtf/api/v1/bundles",
          {
            body: JSON.stringify(body),
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
          }
        ).then<JitoResponse<string[]>>((res) => res.json());
        const TRADER_API_TIP_WALLET = data.result[0];
        if (!TRADER_API_TIP_WALLET) {
          throw new Error("Can Not Get Tip Account From Jito");
        }
        const toPubkey = new PublicKey(TRADER_API_TIP_WALLET);
        const ins = SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports,
        });

        return [ins];
      },
      async postSubmit(content) {
        const res = await submitJito({ content });
        return res!.message;
      },
    };
  }, [submitJito]);

  return {
    fastModeProvider,
    mevModeProvider,
  };
}
