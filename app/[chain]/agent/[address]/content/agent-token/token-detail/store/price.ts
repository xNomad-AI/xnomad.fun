import constate from "constate";
import { useEffect, useMemo, useState } from "react";

import { useTokenPageSocketStore } from "./socket";
import { useAgentStore } from "../../../../store";

function useService({ initialPrice }: { initialPrice: number }) {
  const { primaryToken } = useAgentStore();
  const { socket } = useTokenPageSocketStore();
  const [_tokenPrice, setTokenPrice] = useState(initialPrice);

  const price = useMemo(() => {
    if (_tokenPrice > 0) {
      return _tokenPrice;
    } else if (primaryToken?.price) {
      return primaryToken?.price;
    }

    return 0;
  }, [_tokenPrice]);

  useEffect(() => {
    if (socket) {
      socket.on("ohlcData", ({ ohlcData }) => {
        const data = ohlcData?.data;
        const price = +data?.c;
        setTokenPrice(price);
      });
      return () => {
        setTokenPrice(0);
      };
    }
  }, [socket]);

  return {
    tokenPrice: price,
  };
}

export const [TokenPagePriceStoreProvider, useTokenPagePriceStore] =
  constate(useService);
