import { WalletContextState } from "@solana/wallet-adapter-react";
import {
  clusterApiUrl,
  Connection,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import CryptoJS from "crypto-js";
import bs58 from "bs58";
// https://www.okx.com/zh-hans/web3/build/docs/waas/walletapi-resources-supported-networks
const SOL_CHAIN_ID = 501;

// https://www.okx.com/zh-hans/web3/build/docs/waas/dex-swap
export class OKXSwap {
  private wallet: WalletContextState;
  private secretKey = process.env.OKX_SECRET_KEY ?? "";
  private accessKey = process.env.OKX_ACCESS_KEY ?? "";
  private passphrase = process.env.OKX_PASS_PHRASE ?? "";
  private project = process.env.OKX_PROJECT_ID ?? "";

  get connections() {
    return new Connection(
      process.env.SOLANA_RPC ?? clusterApiUrl("mainnet-beta")
    );
  }

  constructor(wallet: WalletContextState) {
    this.wallet = wallet;
  }

  public request = async (method: string = "GET", path: string) => {
    const timestamp = new Date().toISOString();
    const url = `https://www.okx.com${path}`;
    const headers = {
      "OK-ACCESS-KEY": this.accessKey,
      "OK-ACCESS-SIGN": CryptoJS.enc.Base64.stringify(
        CryptoJS.HmacSHA256(timestamp + method + path, this.secretKey)
      ),
      "OK-ACCESS-TIMESTAMP": timestamp,
      "OK-ACCESS-PASSPHRASE": this.passphrase,
      "OK-ACCESS-PROJECT": this.project,
    };
    const response = await fetch(url, { headers });
    const data = await response.json();
    return data;
  };
  public getSwapQuote = async (
    amount: string,
    fromTokenAddress: string,
    toTokenAddress: string,
    slippage: string = "0.5",
    userWalletAddress: string
  ) => {
    try {
      const apiPath = `/api/v5/dex/aggregator/swap?chainId=${SOL_CHAIN_ID}&amount=${amount}&fromTokenAddress=${fromTokenAddress}&toTokenAddress=${toTokenAddress}&slippage=${slippage}&userWalletAddress=${userWalletAddress}&referrerAddress=F1CGn2oVVx1wCuDv3oZu62GfhpmQhLiUcYhmqAgcUk4E&feePercent=1`;
      const data = await this.request("GET", apiPath);
      if (data.code === "82000") {
        throw Error(data.msg);
      }
      return data;
    } catch (error) {
      console.error("Failed to get swap quote:", error);
      // @ts-ignore
      throw Error(error?.message || "Failed to get swap quote");
    }
  };

  public signTransaction = async (swapTransaction: string) => {
    if (!this.wallet.publicKey || !this.wallet?.signTransaction) {
      throw new Error("Wallet not connected");
    }
    const swapTransactionBuf = bs58.decode(swapTransaction);
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
    const txid = await this.wallet.sendTransaction(
      transaction,
      this.connections,
      {
        skipPreflight: true,
        maxRetries: 2,
      }
    );
    return txid;
  };
  public executeSwap = async (swapData: any) => {
    if (!this.wallet.publicKey || !this.wallet.signTransaction) {
      throw new Error("Wallet not connected");
    }
    const swapTransaction = swapData?.data?.[0]?.tx?.data;

    if (!swapTransaction) {
      throw new Error(swapData?.msg || "No swap transaction found");
    }

    const swapTransactionBuf = bs58.decode(swapTransaction);

    let transaction;
    try {
      transaction = Transaction.from(swapTransactionBuf);
    } catch (error) {
      transaction = VersionedTransaction.deserialize(swapTransactionBuf);
    }

    const recentBlockHash = await this.connections.getLatestBlockhash();

    if (transaction instanceof VersionedTransaction) {
      transaction.message.recentBlockhash = recentBlockHash.blockhash;
    } else {
      transaction.recentBlockhash = recentBlockHash.blockhash;
    }

    const txid = await this.wallet.sendTransaction(
      transaction,
      this.connections,
      {
        skipPreflight: true,
        maxRetries: 6,
      }
    );

    return txid;
  };

  public createTxFromSwapData = async (swapData: any) => {
    if (!this.wallet.publicKey || !this.wallet.signTransaction) {
      throw new Error("Wallet not connected");
    }
    const swapTransaction = swapData?.[0]?.tx?.data;

    if (!swapTransaction) {
      throw new Error(swapData?.msg || "No swap transaction found");
    }

    const swapTransactionBuf = bs58.decode(swapTransaction);

    let transaction;
    try {
      transaction = Transaction.from(swapTransactionBuf);
    } catch (error) {
      transaction = VersionedTransaction.deserialize(swapTransactionBuf);
    }

    const recentBlockHash = await this.connections.getLatestBlockhash();

    if (transaction instanceof VersionedTransaction) {
      transaction.message.recentBlockhash = recentBlockHash.blockhash;
    } else {
      transaction.recentBlockhash = recentBlockHash.blockhash;
    }

    return transaction;
  };

  public simulateTx = async (
    transaction: VersionedTransaction | Transaction
  ) => {
    if (transaction instanceof VersionedTransaction) {
      return this.connections.simulateTransaction(transaction);
    } else {
      return this.connections.simulateTransaction(transaction);
    }
  };

  public estimateTx = async (swapData: any) => {
    if (!this.wallet.publicKey || !this.wallet.signTransaction) {
      throw new Error("Wallet not connected");
    }
    const swapTransaction = swapData?.data?.[0]?.tx?.data;

    if (!swapTransaction) {
      throw new Error(swapData?.msg || "No swap transaction found");
    }

    const swapTransactionBuf = bs58.decode(swapTransaction);

    let transaction;
    try {
      transaction = Transaction.from(swapTransactionBuf);
    } catch (error) {
      transaction = VersionedTransaction.deserialize(swapTransactionBuf);
    }

    const recentBlockHash = await this.connections.getLatestBlockhash();

    if (transaction instanceof VersionedTransaction) {
      transaction.message.recentBlockhash = recentBlockHash.blockhash;
      return this.connections.simulateTransaction(transaction);
    } else {
      transaction.recentBlockhash = recentBlockHash.blockhash;
      return this.connections.simulateTransaction(transaction);
    }
  };

  private MAX_WAIT_TIME = 60000;
  public waitSwapStatus = async (txid: string) => {
    return new Promise((resolve, reject) => {
      let index = 0;
      const interval = setInterval(async () => {
        const data = await this.getSwapStatus(txid);
        if (data.isOk) {
          clearInterval(interval);
          resolve(true);
        }
        index++;
        if (index > this.MAX_WAIT_TIME / 1000) {
          clearInterval(interval);
          resolve(false);
        }
      }, 1000);
    });
  };

  public getSwapStatus = async (txid: string) => {
    const data = await this.connections.getParsedTransaction(txid, {
      maxSupportedTransactionVersion: 0,
      commitment: "confirmed",
    });

    // 如果交易不存在，则认为交易失败
    if (!data) {
      return {
        isOk: false,
        hasErr: true,
        data: null,
      };
    }

    const keys = Object.keys((data?.meta as any)?.status ?? {});
    const isOk = keys.includes("Ok");
    const hasErr = keys.includes("Err");

    return {
      isOk,
      hasErr,
      data,
    };
  };
}
