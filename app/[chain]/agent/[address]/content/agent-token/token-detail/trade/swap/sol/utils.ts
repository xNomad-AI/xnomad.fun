import {
  AddressLookupTableAccount,
  Connection,
  PublicKey,
  TransactionMessage,
} from "@solana/web3.js";
import { TransactionInstruction } from "@solana/web3.js";
import { Transaction, VersionedTransaction } from "@solana/web3.js";
import { OKXCallDataRequestParams } from "./swap";
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";

export type SwapTransaction = VersionedTransaction | Transaction;

export function serializeTransaction(tx: SwapTransaction) {
  if (tx instanceof VersionedTransaction) {
    return base64.decode(tx.serialize());
  } else {
    return base64.decode(tx.serialize({}));
  }
}

export function prioritizationFee(
  microLamports: number,
  computeUnitLimit: number
) {
  const computeUnitPrice =
    Math.floor((microLamports * 100) / computeUnitLimit) * 10 ** 4;

  return {
    computeUnitPrice,
  };
}

export function makeOkxSwapParams(type: "buy" | "sell", tokenAddress: string) {
  const solAddress = "11111111111111111111111111111111";
  const referrerAddress = "F1CGn2oVVx1wCuDv3oZu62GfhpmQhLiUcYhmqAgcUk4E";

  const swapParams: OKXCallDataRequestParams =
    type === "buy"
      ? {
          fromTokenAddress: solAddress,
          toTokenAddress: tokenAddress,
          fromTokenReferrerWalletAddress: referrerAddress,
        }
      : {
          toTokenReferrerWalletAddress: referrerAddress,
          fromTokenAddress: tokenAddress,
          toTokenAddress: solAddress,
        };

  return swapParams;
}

export async function appendInstruction(
  tx: SwapTransaction,
  connection: Connection,
  ...instructions: TransactionInstruction[]
) {
  if (tx instanceof VersionedTransaction) {
    const addressLookupTableAccounts = await Promise.all(
      tx.message.addressTableLookups.map(async (lookup) => {
        return new AddressLookupTableAccount({
          key: lookup.accountKey,
          state: AddressLookupTableAccount.deserialize(
            await connection
              .getAccountInfo(lookup.accountKey)
              .then((res) => res!.data)
          ),
        });
      })
    );
    const message = TransactionMessage.decompile(tx.message, {
      addressLookupTableAccounts,
    });
    message.instructions.unshift(...instructions);
    tx.message = message.compileToV0Message(addressLookupTableAccounts);
  } else {
    tx.add(...instructions);
  }
}

export const base64 = {
  decode(buffer: Uint8Array): string {
    // 创建一个ArrayBuffer
    const view = new Uint8Array(buffer);
    for (let i = 0; i < view.length; i++) {
      view[i] = i;
    }

    // 将ArrayBuffer转换为base64
    const bytes = new Uint8Array(buffer);
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    const base64Data = btoa(binary);

    return base64Data;
  },
};

export async function getTokenProgramId(
  mintTokenAddress: string,
  connection: Connection
) {
  const address = new PublicKey(mintTokenAddress);
  const accountInfo = await connection.getParsedAccountInfo(address);
  if (accountInfo.value?.owner.equals(TOKEN_2022_PROGRAM_ID))
    return TOKEN_2022_PROGRAM_ID;
  if (accountInfo.value?.owner.equals(TOKEN_PROGRAM_ID))
    return TOKEN_PROGRAM_ID;
  throw new Error(
    `Invalid token program ID, mint=${mintTokenAddress}, owner=${accountInfo.value?.owner.toBase58()}`
  );
}
