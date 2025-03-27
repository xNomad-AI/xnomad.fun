/**
 Baseed on viem and wagmi
**/

import BigNumber from "bignumber.js";
import { Client } from "viem";
import { readContract } from "viem/actions";
import {
  SwapFactoryContract,
  SwapRouteContract,
  WrappedTokenContract,
} from "./constants";
import { SwapRouteAbi } from "../../abi/swap-route";
import { WrappedTokenAbi } from "../../abi/wrapped-token";
import { SwapFactoryAbi } from "../../abi/swap-factory";
import { PairAbi } from "../../abi/pair";
import { approveAssurance, getDecimals } from "../../common/actions";

/**
 * Retrieves the pool information for a pair of tokens.
 *
 * @param {Object} params - The parameters.
 * @param {`0x${string}`} params.tokenA - The address of token A.
 * @param {`0x${string}`} params.tokenB - The address of token B.
 * @param {Client} params.client - The client instance.
 * @returns {Promise<`0x${string}`>} The pool address.
 */
export async function getPool({
  tokenA,
  tokenB,
  client,
}: {
  tokenA: `0x${string}`;
  tokenB: `0x${string}`;
  client: Client;
}) {
  return await readContract(client, {
    address: SwapFactoryContract,
    abi: SwapFactoryAbi,
    functionName: "getPair",
    args: [tokenA, tokenB],
  });
}

/**
 * Retrieves the output amount for a given input amount and swap path.
 *
 * @param {Object} params - The parameters.
 * @param {BigNumber} params.amountIn - The input amount.
 * @param {[`0x${string}`, `0x${string}`]} params.path - The swap path.
 * @param {Client} params.client - The client instance.
 * @returns {Promise<[BigNumber, BigNumber]>} The output amounts.
 */
export async function getSecureSwapAmountOut({
  amountIn,
  path,
  client,
}: {
  amountIn: BigNumber;
  path: [`0x${string}`, `0x${string}`];
  client: Client;
}) {
  const decimal0 = await getDecimals({ contract: path[0], client });
  const decimal1 = await getDecimals({ contract: path[1], client });
  const [out0, out1] = (await readContract(client, {
    address: SwapRouteContract,
    abi: SwapRouteAbi,
    functionName: "getAmountsOut",
    args: [
      BigInt(
        BigNumber(amountIn)
          .multipliedBy(10 ** decimal0)
          .toFixed(0, BigNumber.ROUND_DOWN)
      ),
      path,
    ],
  })) as bigint[];
  return [
    BigNumber(out0.toString()).div(10 ** decimal0),
    BigNumber(out1.toString()).div(10 ** decimal1),
  ];
}

/**
 * Retrieves the input amount for a given output amount and swap path.
 *
 * @param {Object} params - The parameters.
 * @param {BigNumber} params.amountOut - The output amount.
 * @param {[`0x${string}`, `0x${string}`]} params.path - The swap path.
 * @param {Client} params.client - The client instance.
 * @returns {Promise<[BigNumber, BigNumber]>} The input amounts.
 */
export async function getSecureSwapAmountIn({
  amountOut,
  path,
  client,
}: {
  amountOut: BigNumber;
  path: [`0x${string}`, `0x${string}`];
  client: Client;
}) {
  const decimal0 = await getDecimals({ contract: path[0], client });
  const decimal1 = await getDecimals({ contract: path[1], client });
  const [out0, out1] = (await readContract(client, {
    address: SwapRouteContract,
    abi: SwapRouteAbi,
    functionName: "getAmountsIn",
    args: [
      BigInt(
        BigNumber(amountOut)
          .multipliedBy(10 ** decimal1)
          .toFixed(0, BigNumber.ROUND_DOWN)
      ),
      path,
    ],
  })) as bigint[];
  return [
    BigNumber(out0.toString()).div(10 ** decimal0),
    BigNumber(out1.toString()).div(10 ** decimal1),
  ];
}

/**
 * Swaps ETH for a specified amount of tokens.
 *
 * @param {Object} params - The parameters.
 * @param {BigNumber} params.wrappedAmount - The amount of wrapped main token.
 * @param {BigNumber} params.amountOut - The output amount.
 * @param {`0x${string}`} params.pathOut - The output path.
 * @param {`0x${string}`} params.to - The recipient address.
 * @param {number} params.deadline - The transaction deadline.
 * @param {any} params.writeContractAsync - The function to write the contract.
 * @param {Client} params.client - The client instance.
 * @returns {Promise<any>} The transaction result.
 */
export const swapMainTokenForExactTokens = async ({
  wrappedAmount,
  amountOut,
  pathOut,
  to,
  deadline,
  writeContractAsync,
  client,
}: {
  wrappedAmount: BigNumber;
  amountOut: BigNumber;
  pathOut: `0x${string}`;
  to: `0x${string}`;
  deadline: number;
  writeContractAsync: any;
  client: Client;
}) => {
  const outDecimals = await getDecimals({ contract: pathOut, client });
  const wrappedTokenDecimals = await getDecimals({
    contract: WrappedTokenContract,
    client,
  });
  return writeContractAsync({
    address: SwapRouteContract,
    abi: SwapRouteAbi,
    functionName: "swapExactETHForTokens",
    args: [
      BigNumber(amountOut)
        .multipliedBy(10 ** outDecimals)
        .toFixed(0, BigNumber.ROUND_DOWN),
      [WrappedTokenContract, pathOut],
      to,
      deadline,
    ],
    value: BigNumber(wrappedAmount)
      .multipliedBy(10 ** wrappedTokenDecimals)
      .toFixed(0),
  });
};

/**
 * Swaps a specified amount of tokens for main token.
 *
 * @param {Object} params - The parameters.
 * @param {BigNumber} params.amountIn - The input amount.
 * @param {BigNumber} params.amountOut - The output amount.
 * @param {`0x${string}`} params.pathIn - The input path.
 * @param {`0x${string}`} params.to - The recipient address.
 * @param {number} params.deadline - The transaction deadline.
 * @param {Client} params.client - The client instance.
 * @param {any} params.writeContractAsync - The function to write the contract.
 * @returns {Promise<any>} The transaction result.
 */
export const swapExactTokensForMainToken = async ({
  amountIn,
  amountOut,
  pathIn,
  to,
  deadline,
  client,
  writeContractAsync,
}: {
  amountIn: BigNumber;
  amountOut: BigNumber;
  pathIn: `0x${string}`;
  to: `0x${string}`;
  deadline: number;
  client: Client;
  writeContractAsync: any;
}) => {
  await approveAssurance({
    token: pathIn,
    wallet: to,
    client,
    writeContractAsync,
    tokenAmount: amountIn,
    spender: SwapRouteContract,
  });
  const inDecimals = await getDecimals({ contract: pathIn, client });
  const outDecimals = await getDecimals({
    contract: WrappedTokenContract,
    client,
  });
  const params = {
    address: SwapRouteContract,
    abi: SwapRouteAbi,
    functionName: "swapExactTokensForETHSupportingFeeOnTransferTokens",
    args: [
      BigNumber(amountIn)
        .multipliedBy(10 ** inDecimals)
        .toFixed(0, BigNumber.ROUND_DOWN),
      BigNumber(amountOut)
        .multipliedBy(10 ** outDecimals)
        .toFixed(0, BigNumber.ROUND_DOWN),
      [pathIn, WrappedTokenContract],
      to,
      deadline,
    ],
  } as any;

  return await writeContractAsync({
    ...params,
  });
};
