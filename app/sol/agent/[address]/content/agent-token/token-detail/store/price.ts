import constate from "constate";
import { useEffect, useMemo, useState } from "react";

import { useTokenPageSocketStore } from "./socket";

function useService({ initialPrice }: { initialPrice: number }) {
  const { socket } = useTokenPageSocketStore();
  const [_tokenPrice, setTokenPrice] = useState(initialPrice);

  const price = useMemo(() => {
    if (_tokenPrice > 0) {
      return _tokenPrice;
    }

    return 0;
  }, [_tokenPrice]);

  useEffect(() => {
    if (socket) {
      socket.on("ohlcData", ({ ohlcData }) => {
        const data = ohlcData?.data;
        const price = +data.c;
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
