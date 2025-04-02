import BigNumber from "bignumber.js";
import {
  Client,
  erc20Abi,
  parseEther,
  WaitForTransactionReceiptParameters,
} from "viem";
import { readContract } from "viem/actions";
import { HelperAbi } from "./abi/helper";
import { HelperContract, SwapContract } from "./constants";

import { ManagerAbiV2 } from "./abi/manager-v2";
import { noExponents } from "@/lib/utils/number/bignumber";
import { approveAssurance } from "../../common/actions";

type TokenInfoInFourMeme = [
  string,
  string,
  string, // quote
  bigint,
  string,
  bigint,
  string,
  string,
  string,
  string,
  bigint,
  bigint,
  boolean
];
export async function getTokenInfo({
  token,
  client,
}: {
  token: string;
  client: Client;
}) {
  const tokenInfo = await readContract(client, {
    abi: HelperAbi,
    address: HelperContract,
    functionName: "getTokenInfo",
    args: [token],
  });
  const [
    version,
    tokenManager,
    quote,
    lastPrice,
    tradingFeeRate,
    minTradingFee,
    launchTime,
    offers,
    maxOffers,
    funds,
    maxFunds,
    liquidityAdded,
  ] = tokenInfo as TokenInfoInFourMeme;
  return {
    version,
    tokenManager,
    quote,
    lastPrice,
    tradingFeeRate,
    minTradingFee,
    launchTime,
    offers,
    maxOffers,
    funds,
    maxFunds,
    liquidityAdded,
  };
}
type TryBuyRes = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string
];
export async function tryBuyWithExactBnB({
  bnbFund,
  token,
  client,
}: {
  bnbFund: BigNumber;
  token: `0x${string}`;
  client: Client;
}) {
  const tryBuyRes = await readContract(client, {
    address: HelperContract,
    abi: HelperAbi,
    functionName: "tryBuy",
    args: [token, 0, parseEther(bnbFund.toString())],
  });
  const [
    tokenManager,
    quote,
    estimatedAmount,
    estimatedCost,
    estimatedFee,
    amountMsgValue,
    amountApproval,
    amountFunds,
  ] = tryBuyRes as TryBuyRes;
  return {
    tokenManager,
    quote,
    estimatedAmount,
    estimatedCost,
    estimatedFee,
    amountMsgValue,
    amountApproval,
    amountFunds,
  };
}

type TrySellRes = [string, string, bigint, bigint];
export async function trySellWithExactToken({
  amount,
  token,
  client,
}: {
  amount: BigNumber;
  token: `0x${string}`;
  client: Client;
}) {
  const trySellRes = await readContract(client, {
    address: HelperContract,
    abi: HelperAbi,
    functionName: "trySell",
    args: [token, parseEther(amount.toString())],
  });
  const [tokenManager, quote, funds, fee] = trySellRes as TrySellRes;
  return {
    tokenManager,
    quote,
    funds,
    fee,
  };
}

export const buyTokenAMAP = async ({
  wrappedAmount,
  amountOut,
  pathOut,
  writeContractAsync,
  account,
}: {
  wrappedAmount: BigNumber;
  amountOut: BigNumber;
  pathOut: `0x${string}`;
  writeContractAsync: any;
  account: `0x${string}`;
  client: Client;
}) => {
  return writeContractAsync({
    address: SwapContract,
    abi: ManagerAbiV2,
    functionName: "buyTokenAMAP",
    args: [
      0,
      pathOut,
      account,
      noExponents(wrappedAmount.toFixed(0, BigNumber.ROUND_DOWN)),
      noExponents(amountOut.toFixed(0, BigNumber.ROUND_DOWN)),
    ],
    value: noExponents(wrappedAmount.toFixed(0, BigNumber.ROUND_DOWN)),
  });
};

export async function sellToken({
  amount,
  amountOut,
  pathOut,
  writeContractAsync,
  client,
  account,
}: {
  amount: BigNumber;
  amountOut: BigNumber;
  pathOut: `0x${string}`;
  writeContractAsync: any;
  client: Client;
  account: `0x${string}`;
}) {
  const decimals = await readContract(client, {
    address: pathOut,
    abi: erc20Abi,
    functionName: "decimals",
  });
  await approveAssurance({
    token: pathOut,
    spender: SwapContract,
    wallet: account,
    client,
    writeContractAsync,
    tokenAmount: amount,
    decimals,
  });
  return writeContractAsync({
    address: SwapContract,
    abi: ManagerAbiV2,
    functionName: "sellToken",
    args: [
      0,
      pathOut,
      noExponents(
        BigNumber(
          amount
            .multipliedBy(10 ** (decimals / 2))
            .toFixed(0, BigNumber.ROUND_DOWN)
        ).multipliedBy(10 ** (decimals / 2))
      ),
      noExponents(amountOut.toFixed(0, BigNumber.ROUND_DOWN)),
      100,
      process.env.EVM_FEE_RECIPIENT,
    ],
  });
}
