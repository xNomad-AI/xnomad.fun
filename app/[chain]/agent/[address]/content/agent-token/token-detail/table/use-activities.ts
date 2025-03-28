import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTokenPageSocketStore } from "../store/socket";
import { useAgentStore } from "../../../../store";
import { api } from "@/primitive/api";
import { useMemoizedFn, useRequest } from "ahooks";
export type TokenTransaction = {
  maker: string;
  amountUsd: string;
  amount: string;
  event: string;
  priceUsd: string;
  txHash: string;
  timestamp: number;
};
type SocketResponse = {
  tokenAddress: string;
  transfers: TokenTransaction[];
  timestamp: number;
};

export type TokenTransactionList = {
  transfers: TokenTransaction[];
  nextCursor: string | null;
};
function getTokenTxs({
  address,
  walletAddress,
  cursor,
  chain,
}: {
  address: string;
  asc?: 0 | 1;
  walletAddress?: string;
  cursor?: string | null;
  limit?: number;
  chain: string;
}) {
  return api.ts.get<TokenTransactionList>(
    `/addresses/token/transactions/${address}`,
    {
      walletAddress,
      cursor,
      chain,
    }
  );
}
export function useActivities(ready: boolean) {
  const { nft } = useAgentStore();
  const address = nft.primaryCoin?.address as string;
  const { socket } = useTokenPageSocketStore();
  const [news, setNews] = useState<TokenTransaction[]>([]);
  const [olds, setOlds] = useState<TokenTransaction[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const {
    data: txs,
    refresh,
    loading,
  } = useRequest(
    async () => {
      const res = await getTokenTxs({ address, chain: nft.chain });
      setNextCursor(res.nextCursor);
      return res;
    },
    {
      refreshDeps: [address],
      ready: !!address && ready,
    }
  );

  const data = useMemo(() => {
    const data = txs?.transfers ?? [];
    const result = [...news, ...data, ...olds];
    return result;
  }, [news, txs?.transfers, olds]);
  const loadMore = useMemoizedFn(() => {
    if (
      !socket ||
      data.length === 0 ||
      loadingMore ||
      !nextCursor ||
      nextCursor === "0"
    ) {
      return;
    }
    setLoadingMore(true);
    if (nft.chain === "solana") {
      socket.emit(
        "getTokenTransfers",
        address,
        data.slice(-1)[0].timestamp * 1000
      );
    } else {
      getTokenTxs({
        address,
        chain: nft.chain,
        cursor: nextCursor,
      }).then((res) => {
        setNextCursor(res.nextCursor);
        if (res.transfers.length > 0) {
          setOlds((array) => [...array, ...res.transfers]);
        }
        setLoadingMore(false);
      });
    }
  });

  useRequest(
    async () => {
      getTokenTxs({
        address,
        chain: nft.chain,
        limit: 10,
      }).then((res) => {
        setNews((news) => {
          const newTx = res.transfers.filter((item) =>
            txs?.transfers.every((i) => i.txHash !== item.txHash)
          );
          return [...newTx, ...news];
        });
      });
    },
    {
      ready:
        !!address &&
        ready &&
        nft.chain !== "solana" &&
        !loadingMore &&
        !loading,
      pollingInterval: 5000,
    }
  );

  useEffect(() => {
    refresh();
    if (socket === null || nft.chain !== "solana") {
      setLoadingMore(false);
      return;
    }
    socket.on("tokenTransfers", (data: SocketResponse) => {
      setNews((value) => {
        const next = [...data.transfers, ...value];
        return next;
      });
    });

    socket.on("tokenHistoryTransfers", (data: SocketResponse) => {
      setOlds((array) => [...array, ...data.transfers]);
      setLoadingMore(false);
    });

    return () => {
      socket.off("tokenTransfers");
      socket.off("tokenHistoryTransfers");
      setNews([]);
      setOlds([]);
    };
  }, [socket]);

  return {
    data,
    loading,
    loadMore,
    hasMore: Boolean(nextCursor) && nextCursor !== "0",
    loadingMore,
  };
}
