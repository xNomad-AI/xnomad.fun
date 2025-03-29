import BigNumber from "bignumber.js";
import { Client } from "viem";
import { readContract, waitForTransactionReceipt } from "viem/actions";
import { PairAbi } from "../abi/pair";
import { WrappedTokenAbi } from "../abi/wrapped-token";

/**
 * Approves a specified amount of ERC20 tokens for a spender.
 *
 * @param {Object} params - The parameters.
 * @param {`0x${string}`} params.contract - The contract address.
 * @param {`0x${string}`} params.spender - The spender address.
 * @param {bigint} params.amount - The amount to approve.
 * @param {Client} params.client - The client instance.
 * @param {any} params.writeContractAsync - The function to write the contract.
 * @param {`0x${string}`} params.wallet - The wallet address.
 * @returns {Promise<any>} The transaction result.
 */
export async function approveERC20Token({
  contract,
  spender,
  amount,
  writeContractAsync,
}: {
  contract: `0x${string}`;
  spender: `0x${string}`;
  amount: bigint;
  client: Client;
  writeContractAsync: any;
  wallet: `0x${string}`;
}) {
  return await writeContractAsync({
    address: contract,
    abi: WrappedTokenAbi,
    functionName: "approve",
    args: [spender, amount],
  });
}

/**
 * Retrieves the allowance of ERC20 tokens for a spender.
 *
 * @param {Object} params - The parameters.
 * @param {`0x${string}`} params.contract - The contract address.
 * @param {`0x${string}`} params.wallet - The wallet address.
 * @param {`0x${string}`} params.spender - The spender address.
 * @param {Client} params.client - The client instance.
 * @returns {Promise<bigint>} The allowance amount.
 */
export async function getERC20TokenAllowance({
  contract,
  spender,
  wallet,
  client,
}: {
  contract: `0x${string}`;
  wallet: `0x${string}`;
  spender: `0x${string}`;
  client: Client;
}) {
  return await readContract(client, {
    address: contract,
    abi: WrappedTokenAbi,
    functionName: "allowance",
    args: [wallet, spender],
  });
}

/**
 * Retrieves the balance of an account for a specified contract.
 *
 * @param {Object} params - The parameters.
 * @param {`0x${string}`} params.contract - The contract address.
 * @param {`0x${string}`} params.account - The account address.
 * @param {Client} params.client - The client instance.
 * @returns {Promise<bigint>} The balance amount.
 */
export async function getBalance({
  contract,
  account,
  client,
}: {
  contract: `0x${string}`;
  account: `0x${string}`;
  client: Client;
}) {
  return await readContract(client, {
    address: contract,
    abi: WrappedTokenAbi,
    functionName: "balanceOf",
    args: [account],
  });
}

/**
 * Retrieves the decimals of a specified contract.
 *
 * @param {Object} params - The parameters.
 * @param {`0x${string}`} params.contract - The contract address.
 * @param {Client} params.client - The client instance.
 * @returns {Promise<number>} The decimals.
 */
export async function getDecimals({
  contract,
  client,
}: {
  contract: `0x${string}`;
  client: Client;
}) {
  return await readContract(client, {
    address: contract,
    abi: WrappedTokenAbi,
    functionName: "decimals",
  });
}

/**
 * Retrieves the reserves of a pair contract.
 *
 * @param {Object} params - The parameters.
 * @param {`0x${string}`} params.contract - The contract address.
 * @param {Client} params.client - The client instance.
 * @returns {Promise<[bigint, bigint, bigint]>} The reserves.
 */
export const pairGetReserve = async ({
  contract,
  client,
}: {
  contract: `0x${string}`;
  client: Client;
}) => {
  return (await readContract(client, {
    address: contract,
    abi: PairAbi,
    functionName: "getReserves",
  })) as [bigint, bigint, bigint];
};

/**
 * Retrieves the total liquidity of a pair contract.
 *
 * @param {Object} params - The parameters.
 * @param {`0x${string}`} params.contract - The contract address.
 * @param {Client} params.client - The client instance.
 * @returns {Promise<bigint>} The total liquidity.
 */
export const pairGetTotalLiquidity = async ({
  contract,
  client,
}: {
  contract: `0x${string}`;
  client: Client;
}) => {
  return (await readContract(client, {
    address: contract,
    abi: PairAbi,
    functionName: "totalSupply",
  })) as bigint;
};

/**
 * Retrieves the token0 address of a pair contract.
 *
 * @param {Object} params - The parameters.
 * @param {`0x${string}`} params.contract - The contract address.
 * @param {Client} params.client - The client instance.
 * @returns {Promise<`0x${string}`>} The token0 address.
 */
export const pairToken0 = async ({
  contract,
  client,
}: {
  contract: `0x${string}`;
  client: Client;
}) => {
  return (await readContract(client, {
    address: contract,
    abi: PairAbi,
    functionName: "token0",
  })) as `0x${string}`;
};

/**
 * Retrieves the token1 address of a pair contract.
 *
 * @param {Object} params - The parameters.
 * @param {`0x${string}`} params.contract - The contract address.
 * @param {Client} params.client - The client instance.
 * @returns {Promise<`0x${string}`>} The token1 address.
 */
export const pairToken1 = async ({
  contract,
  client,
}: {
  contract: `0x${string}`;
  client: Client;
}) => {
  return (await readContract(client, {
    address: contract,
    abi: PairAbi,
    functionName: "token1",
  })) as `0x${string}`;
};

/**
 * Ensures that a specified amount of tokens is approved for a spender.
 *
 * @param {Object} params - The parameters.
 * @param {`0x${string}`} params.token - The token address.
 * @param {`0x${string}`} params.wallet - The wallet address.
 * @param {Client} params.client - The client instance.
 * @param {any} params.writeContractAsync - The function to write the contract.
 * @param {BigNumber} params.tokenAmount - The token amount.
 * @returns {Promise<boolean>} True if approved, otherwise false.
 */
export async function approveAssurance({
  token,
  wallet,
  client,
  writeContractAsync,
  tokenAmount: _tokenAmount,
  spender,
  decimals = 18,
}: {
  token: `0x${string}`;
  spender: `0x${string}`;
  wallet: `0x${string}`;
  client: Client;
  writeContractAsync: any;
  tokenAmount: BigNumber;
  decimals?: number;
}) {
  const tokenAmount = BigNumber(_tokenAmount).multipliedBy(10 ** decimals);
  const [approved] = (await Promise.all([
    getERC20TokenAllowance({
      contract: token,
      spender,
      wallet,
      client,
    }),
  ])) as [bigint];
  if (tokenAmount.lte(approved.toString())) {
    return true;
  } else {
    const [balance] = (await Promise.all([
      getBalance({ account: wallet, contract: token, client }),
    ])) as [bigint];
    if (balance > 0 && tokenAmount.gt(approved.toString())) {
      const tx = await approveERC20Token({
        contract: token,
        spender,
        amount: balance,
        wallet,
        client,
        writeContractAsync,
      });
      const res = await waitForTransactionReceipt(client, {
        hash: tx,
      });
      if (res.status === "success") {
        return true;
      } else {
        throw new Error("Approval failed");
      }
    }
  }
}
