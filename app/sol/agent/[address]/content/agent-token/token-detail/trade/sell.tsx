import { useMemoizedFn } from "ahooks";
import { useTokenPagePriceStore } from "../store/price";
import { useTradeStore } from "../store/trade";
import { useTradeConfigStore } from "../store/trade-config";
import { BaseTemplate } from "./base";
import { useEffect, useMemo, useState } from "react";
import { isNumber } from "@/lib/utils/number/is-number";
import { Button, IconSol, message } from "@/primitive/components";
import { toDecimal } from "@/lib/utils/number/to-decimal";
import { copyToClipboard } from "@/lib/utils/copy";
import { useAgentStore } from "../../../../store";

export function SellSection() {
  const { nft } = useAgentStore();
  const [value, setValue] = useState("");
  const { tokenPrice } = useTokenPagePriceStore();
  const {
    solGasData,
    tokenBalance,
    handleSell,
    sellLoading,
    tokenDecimal,
    updateBalance,
  } = useTradeStore();

  const { tradeMode, setTradeMode, setPriorityFeeType } = useTradeConfigStore();

  const sell = useMemoizedFn(async () => {
    await handleSell(+value * 10 ** (tokenDecimal ?? 9));
    setValue("");
    updateBalance();
  });

  const received = useMemo(() => {
    const amount = +value;
    const sol = solGasData?.eth_usd_price;
    const token = +tokenPrice;
    if (typeof amount === "number" && !Number.isNaN(amount) && sol && token) {
      return ((amount * token) / sol).toString();
    }
    return "--";
  }, [value, solGasData?.eth_usd_price, tokenPrice]);

  useEffect(() => {
    if (isNumber(+received) && +received >= 2 && tradeMode !== "ANTI-MEV") {
      setTradeMode("ANTI-MEV");
      setPriorityFeeType("veryHigh");
    }
  }, [received]);

  return (
    <BaseTemplate
      confirmNode={
        <>
          <Button
            stretch
            variant='danger'
            disabled={
              !isNumber(+value) ||
              tokenBalance === 0 ||
              tokenBalance < +value ||
              +value <= 0
            }
            onClick={() => sell()}
            loading={sellLoading}
          >
            SELL
          </Button>
          <Button
            variant='secondary'
            stretch
            onClick={() => {
              if (+value > 0) {
                copyToClipboard(
                  `Sell ${value} $${nft.primaryCoin?.symbol}(${nft.primaryCoin?.address}) for SOL`
                );
                message(
                  "Copied successfully. You can send it to your agent to trade tokens."
                );
              } else {
                message("Please enter a valid amount to generate buy prompt");
              }
            }}
          >
            Generate Buy Prompt
          </Button>
        </>
      }
      value={value}
      mevWarning={isNumber(+received) && +received >= 2}
      onChange={(value) => {
        const n = toDecimal(value);
        setValue(n);
      }}
      received={received}
      placeholder='Amount'
      quoteSymbol={<IconSol />}
      balance={tokenBalance?.toString()}
      onQuickActionClick={(value) => {
        setValue((tokenBalance * value).toString());
      }}
      quicks={[
        {
          value: 0.25,
          label: "25%",
        },
        {
          value: 0.5,
          label: "50%",
        },
        {
          value: 0.75,
          label: "75%",
        },
        {
          value: 1,
          label: "100%",
        },
      ]}
    />
  );
}
