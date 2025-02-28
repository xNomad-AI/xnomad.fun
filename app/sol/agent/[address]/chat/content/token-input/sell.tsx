import { Address } from "@/components/address";
import { TokenNumber } from "@/components/token-number";
import { SelectOption } from "@/primitive/components";
import { useMemo, useState } from "react";
import { TokenValue } from ".";
import { WalletItem } from "../../../content/container/network";
import { CommonInput } from "./common";
type InnerData = TokenValue &
  Pick<Partial<WalletItem>, "priceUsd" | "uiAmount">;
export function TokenInputSell({
  value,
  className,
  onChange,
  tokenLimitList,
  tokenAmount,
}: {
  className?: string;
  value: TokenValue;
  onChange: (value: TokenValue) => void;
  tokenLimitList?: InnerData[];
  tokenAmount?: number;
}) {
  const [search, setSearch] = useState("");
  const data = useMemo(() => {
    return (
      tokenLimitList?.filter(
        (item) =>
          item.ca.toLowerCase().includes(search.toLowerCase()) ||
          item.ticker.toLowerCase().includes(search.toLowerCase())
      ) ?? []
    );
  }, [tokenLimitList, value, search]);

  return (
    <div className='flex flex-col gap-8 w-full'>
      <CommonInput
        data={data}
        value={value}
        search={search}
        setSearch={setSearch}
        onChange={onChange}
        className={className}
        TokenItem={TokenItem}
      />
      {tokenAmount && (
        <div className='flex items-center gap-4 text-text2'>
          Balance: <TokenNumber number={tokenAmount ?? ""} />
        </div>
      )}
    </div>
  );
}

function TokenItem({
  value,
  selected,
  handleSelect,
}: {
  value: InnerData;
  selected: boolean;
  handleSelect: (value: TokenValue) => void;
}) {
  return (
    <SelectOption
      className='h-[58px]'
      selected={selected}
      handleSelect={(e) => {
        e.stopPropagation();
        handleSelect(value);
      }}
    >
      <img
        src={value.logo}
        alt='logo'
        loading='lazy'
        className='w-32 h-32 rounded-full object-contain'
      />
      <div className='flex flex-col'>
        <span className='text-size-14 text-text1 font-bold'>
          {value.ticker}
        </span>
        <Address address={value.ca} className='text-size-12 text-text2' />
      </div>
      <div className='flex-1'></div>
      <div className='flex flex-col items-end'>
        <div className='flex  text-size-14 text-text1 font-bold'>
          Amount: <TokenNumber number={value?.uiAmount ?? ""} />
        </div>
        <div className='flex text-size-12 text-text2'>
          Price: <TokenNumber number={value?.priceUsd ?? ""} prefix={"$"} />
        </div>
      </div>
    </SelectOption>
  );
}
