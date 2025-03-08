import { useState } from "react";
import { SellSection } from "./sell";
import { BuySection } from "./buy";
import { Card, RadioButton, RadioButtonGroup } from "@/primitive/components";

export function TradeSection() {
  const [tab, setTab] = useState<"buy" | "sell" | "auto">("buy");
  return (
    <Card className='flex flex-col gap-16 w-full p-16'>
      <RadioButtonGroup
        disableAnimation
        onChange={(value) => setTab(value)}
        className='!w-full'
        value={tab}
      >
        <RadioButton className='flex-1' value='buy'>
          BUY
        </RadioButton>
        <RadioButton className='flex-1' value='sell'>
          SELL
        </RadioButton>
      </RadioButtonGroup>
      {tab === "buy" ? <BuySection /> : null}
      {tab === "sell" ? <SellSection /> : null}
    </Card>
  );
}
