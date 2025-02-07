import { Address } from "@/components/address";
import { toIntl } from "@/lib/utils/number/bignumber";
import { Card, Button, message } from "@/primitive/components";
import BigNumber from "bignumber.js";
import { useMemo, useEffect, PropsWithChildren } from "react";
import { getPortfolio } from "./network";
import { useAgentStore } from "../../store";

export function DepositContainer({
  address,
  children,
}: PropsWithChildren<{ address: string }>) {
  const { setPortfolio, portfolio } = useAgentStore();
  const solItem = useMemo(
    () => portfolio?.items.filter((item) => item.symbol === "SOL")?.[0],
    [portfolio]
  );
  useEffect(() => {
    if (!address) return;
    getPortfolio({
      address,
    }).then((data) => {
      setPortfolio(data);
    });
  }, [address]);
  return (
    <div className='w-full flex flex-col gap-16'>
      <Card className='flex items-center justify-between p-16'>
        <div className='flex flex-col gap-4'>
          <span className='text-size-12'>Agent Wallet</span>
          <Address
            className='text-size-20 font-bold'
            wholeAddress
            enableCopy
            address={address}
          />
          <div>
            Balance:&nbsp;
            {toIntl(
              BigNumber(solItem?.balance ?? "0").div(
                10 ** (solItem?.decimals ?? 9)
              )
            )}
            &nbsp;SOL
          </div>
        </div>
        <Button
          className='!text-black'
          onClick={() => {
            message("Coming soon");
          }}
        >
          Deposit
        </Button>
      </Card>
      {children}
    </div>
  );
}
