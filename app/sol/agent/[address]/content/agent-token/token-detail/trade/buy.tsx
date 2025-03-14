import { BaseTemplate } from "./base";
import { useEffect, useMemo, useState } from "react";
import { useTradeStore } from "../store/trade";
import { useTokenPagePriceStore } from "../store/price";
import { useTradeConfigStore } from "../store/trade-config";
import { isNumber } from "@/lib/utils/number/is-number";
import { Button, IconSol, message } from "@/primitive/components";
import { toDecimal } from "@/lib/utils/number/to-decimal";
import { useMemoizedFn } from "ahooks";
import { copyToClipboard } from "@/lib/utils/copy";
import { useAgentStore } from "../../../../store";

export function BuySection() {
  const { nft } = useAgentStore();
  const [value, setValue] = useState("");
  const {
    buyLoading,
    handleBuy,
    updateBalance,
    solBalance,
    solGasData,
    ensureLargeAmountMEV,
  } = useTradeStore();
  const { tokenPrice } = useTokenPagePriceStore();
  const { tradeMode, setTradeMode, setPriorityFeeType } = useTradeConfigStore();

  const buy = useMemoizedFn(async () => {
    await handleBuy(+value);
    setValue("");
    updateBalance();
  });

  useEffect(() => {
    if (isNumber(+value) && +value >= 2 && tradeMode !== "ANTI-MEV") {
      setTradeMode("ANTI-MEV");
      setPriorityFeeType("veryHigh");
    }
  }, [value]);

  const received = useMemo(() => {
    const amount = +value;
    const sol = solGasData?.eth_usd_price;
    const token = tokenPrice;
    if (typeof amount === "number" && !Number.isNaN(amount) && sol && token) {
      return ((amount * sol) / token).toString();
    }
    return "--";
  }, [value, solGasData?.eth_usd_price, tokenPrice]);

  return (
    <BaseTemplate
      confirmNode={
        <>
          <Button
            stretch
            disabled={
              !isNumber(+value) ||
              solBalance?.isZero() ||
              solBalance?.lt(value) ||
              +value <= 0
            }
            onClick={() => buy()}
            loading={buyLoading}
          >
            BUY
          </Button>
          <Button
            variant='secondary'
            stretch
            onClick={() => {
              if (+value > 0) {
                copyToClipboard(
                  `Buy $${nft.primaryCoin?.symbol}(${nft.primaryCoin?.address}) with ${value} SOL`
                );
                message(
                  "Copied successfully. You can send it to your agent to trade tokens.",
                  { type: "success" }
                );
              } else {
                message("Please enter a valid amount to generate buy prompt", {
                  type: "error",
                });
              }
            }}
          >
            Generate Buy Prompt
          </Button>
        </>
      }
      received={received}
      mevWarning={isNumber(+value) && +value >= 2}
      balance={solBalance?.toString()}
      placeholder='Amount'
      symbol={<IconSol />}
      value={value}
      onChange={(value) => {
        const n = toDecimal(value);
        setValue(n);
        ensureLargeAmountMEV(+n);
      }}
      onQuickActionClick={(value) => {
        setValue(value.toString());
      }}
      quicks={[
        {
          value: 0.01,
          label: "0.01 Sol",
        },
        {
          value: 0.1,
          label: "0.1 Sol",
        },
        {
          value: 0.5,
          label: "0.5 Sol",
        },
        {
          value: 1,
          label: "1 Sol",
        },
      ]}
    />
  );
}
