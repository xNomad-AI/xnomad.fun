import { PublicKey } from "@solana/web3.js";
import { useRequest } from "ahooks";
import BigNumber from "bignumber.js";
import { useSolana } from "./use-solana";
import { useBalance, useReadContracts } from "wagmi";
import { erc20Abi } from "viem";
import { TokenAmount } from "@solana/web3.js";

import { useChainStore } from "@/app/layout/chain-provider";

export interface BalanceConfig {
  disablePooling: boolean;
  pollingInterval?: number;
}
function useSolBalance(account?: PublicKey | null, config?: BalanceConfig) {
  const { getSolBalance } = useSolana();
  const { refreshAsync, data: balance } = useRequest(
    async () => {
      if (!account || typeof account === "string") return BigNumber(0);
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

function useSPLBalance(
  token: string,
  account?: PublicKey | null,
  config?: BalanceConfig
) {
  const { getSPLBalance } = useSolana();
  const { refreshAsync, data: balance } = useRequest(
    async () => {
      if (!account || typeof account === "string") return undefined;
      const res = await getSPLBalance(token, account);
      return res;
    },
    {
      refreshDeps: [token, account, config?.disablePooling],
      pollingInterval: config?.pollingInterval ?? 5000,
      ready: Boolean(token) && Boolean(account) && !config?.disablePooling,
    }
  );
  return { balance: balance ?? undefined, refreshAsync };
}

function useEVMBalance(address?: string, config?: BalanceConfig) {
  const { data, refetch } = useBalance({
    address: address as `0x${string}`,
  });
  const { refreshAsync } = useRequest(
    async () => {
      if (!address || typeof address !== "string") return BigNumber(0);
      await refetch();
    },
    {
      refreshDeps: [address, config?.disablePooling],
      pollingInterval: config?.pollingInterval ?? 5000,
      ready: Boolean(address) && !config?.disablePooling,
    }
  );
  return {
    balance: new BigNumber(data?.value.toString() ?? "0"),
    refreshAsync,
  };
}

function useEVMTokenBalance(
  token: string,
  address?: string,
  config?: BalanceConfig
) {
  const { refetch } = useReadContracts({
    contracts: [
      {
        abi: erc20Abi,
        address: token as `0x${string}`,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
      },
      {
        abi: erc20Abi,
        address: token as `0x${string}`,
        functionName: "decimals",
      },
    ],
  });
  const { refreshAsync, data: balance } = useRequest(
    async () => {
      if (!address || !token || typeof address !== "string") return undefined;
      const res = await refetch();
      const balance = BigNumber(res?.data?.[0].result?.toString() ?? "0").div(
        10 ** parseInt(res?.data?.[1].result?.toString() ?? "0")
      );
      return {
        amount: res?.data?.[0].result?.toString() ?? "0",
        decimals: parseInt(res?.data?.[1].result?.toString() ?? "0"),
        uiAmount: balance.toNumber(),
        uiAmountString: balance.toString(),
      } satisfies TokenAmount;
    },
    {
      refreshDeps: [address, token, config?.disablePooling],
      pollingInterval: config?.pollingInterval ?? 5000,
      ready: Boolean(address) && Boolean(token) && !config?.disablePooling,
    }
  );
  return { balance: balance ?? undefined, refreshAsync };
}

export function useBalanceOnChain(
  account: PublicKey | string | null,
  config?: BalanceConfig
) {
  const { chain } = useChainStore();
  const { balance: sol, refreshAsync: solRefetch } = useSolBalance(
    account as PublicKey,
    config
  );
  const { balance: evm, refreshAsync: evmRefetch } = useEVMBalance(
    account as string,
    config
  );
  return {
    balance: chain === "solana" ? sol : evm,
    refreshAsync: chain === "solana" ? solRefetch : evmRefetch,
  };
}

export function useTokenBalanceOnChain(
  token: string,
  account: PublicKey | string | null,
  config?: BalanceConfig
) {
  const { chain } = useChainStore();

  const { balance: spl, refreshAsync: splRefetch } = useSPLBalance(
    token,
    account as PublicKey,
    config
  );
  const { balance: evm, refreshAsync: evmRefetch } = useEVMTokenBalance(
    token,
    account as string,
    config
  );
  return {
    balance: chain === "solana" ? spl : evm,
    refreshAsync: chain === "solana" ? splRefetch : evmRefetch,
  };
}
