import { Address } from "@/components/address";
import { TokenNumber } from "@/components/token-number";
import { api } from "@/primitive/api";
import { IconEmptyCoin, SelectOption } from "@/primitive/components";
import { useDebounce, useRequest } from "ahooks";
import { useMemo, useState } from "react";
import { SearchToken, TokenValue } from ".";
import { CommonInput } from "./common";
import { useChainStore } from "@/app/layout/chain-provider";
type InnerData = TokenValue &
  Pick<Partial<SearchToken>, "volume_24h_usd" | "liquidity" | "price">;
export function TokenInputBuy({
  value,
  className,
  onChange,
}: {
  className?: string;
  value: TokenValue;
  onChange: (value: TokenValue) => void;
}) {
  const { chain } = useChainStore();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, { wait: 300 });

  const [data, setData] = useState<InnerData[]>([]);
  const { loading } = useRequest(
    async () => {
      api.v1
        .get<SearchToken[]>("/agent-account/defi/search", {
          chain: chain,
          query: debouncedSearch,
        })
        .then((res) => {
          setData(
            res.map((item) => {
              return {
                ca: item.address,
                ticker: item.symbol,
                logo: item.logo_uri,
                volume_24h_usd: item.volume_24h_usd,
                liquidity: item.liquidity,
                price: item.price,
              };
            })
          );
        });
    },
    {
      refreshDeps: [debouncedSearch],
    }
  );
  const selectedData = useMemo(
    () => data.find((item) => item.ca === value.ca),
    [data, value]
  );
  return (
    <div className='flex w-full flex-col gap-8'>
      <CommonInput
        data={data}
        value={value}
        search={search}
        setSearch={setSearch}
        onChange={onChange}
        className={className}
        loading={loading}
        TokenItem={TokenItem}
      />
      {selectedData && (
        <span className='text-size-12 text-text2'>
          Price: <TokenNumber number={selectedData.price ?? ""} prefix={"$"} />
        </span>
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
      {value.logo ? (
        <img
          src={value.logo}
          alt='logo'
          loading='lazy'
          className='w-32 h-32 rounded-full object-contain'
        />
      ) : (
        <IconEmptyCoin className='text-size-32' />
      )}
      <div className='flex flex-col'>
        <span className='text-size-14 text-text1 font-bold'>
          {value.ticker}
        </span>
        <Address address={value.ca} className='text-size-12 text-text2' />
      </div>
      <div className='flex-1'></div>
      <div className='flex flex-col items-end'>
        <div className='flex  text-size-14 text-text1 font-bold'>
          Liq: <TokenNumber number={value?.liquidity ?? ""} />
        </div>
        <div className='flex text-size-12 text-text2'>
          Vol 24h:{" "}
          <TokenNumber number={value?.volume_24h_usd ?? ""} prefix={"$"} />
        </div>
      </div>
    </SelectOption>
  );
}
