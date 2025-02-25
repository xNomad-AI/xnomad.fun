import { Address } from "@/components/address";
import { Empty } from "@/components/empty";
import { TokenNumber } from "@/components/token-number";
import { api } from "@/primitive/api";
import {
  Dropdown,
  DropdownController,
  SelectOption,
  Spin,
  TextField,
} from "@/primitive/components";
import { useDebounce, useRequest } from "ahooks";
import { useRef, useState } from "react";
import { SearchToken, TokenValue } from ".";
type InnerData = TokenValue &
  Pick<Partial<SearchToken>, "volume_24h_usd" | "liquidity">;
export function TokenInputBuy({
  value,
  className,
  onChange,
}: {
  className?: string;
  value: TokenValue;
  onChange: (value: TokenValue) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, { wait: 300 });
  const dropdownRef = useRef<DropdownController>(null);
  const [data, setData] = useState<InnerData[]>([]);
  const { loading } = useRequest(
    async () => {
      api.v1
        .get<SearchToken[]>("/agent-account/defi/search", {
          chain: "solana",
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
              };
            })
          );
        });
    },
    {
      refreshDeps: [debouncedSearch],
    }
  );
  return (
    <Dropdown
      trigger={["click"]}
      ref={dropdownRef}
      stretch
      className='!w-full'
      content={
        <div className='w-full flex flex-col max-h-[20rem] overflow-auto'>
          {loading ? (
            <div className='w-full h-[200px] flex items-center justify-center'>
              <Spin />
            </div>
          ) : data.length > 0 ? (
            data.map((item) => (
              <TokenItem
                key={item.ca}
                value={item}
                selected={item.ca === value.ca}
                handleSelect={(value) => {
                  onChange(value);
                  setFocused(false);
                  dropdownRef.current?.close();
                }}
              />
            ))
          ) : (
            <Empty />
          )}
        </div>
      }
    >
      <TextField
        className={className}
        placeholder='Search ticker or CA'
        onClick={(e) => {
          if (dropdownRef.current?.opened) {
            e.stopPropagation();
          }
        }}
        onFocus={() => {
          setFocused(true);
        }}
        onBlur={() => {
          setFocused(false);
        }}
        prefixNode={
          focused || !value.ticker ? (
            ""
          ) : (
            <div className='flex items-center gap-8'>
              <img
                src={value.logo}
                alt='logo'
                className='w-20 h-20 rounded-full object-contain'
              />
              <span className='text-size-14 text-text1'>{value.ticker}</span>
              <Address address={value.ca} className='text-size-12 text-text2' />
            </div>
          )
        }
        value={focused ? search : " "}
        onChange={(e) => {
          setSearch(e.target.value);
        }}
      />
    </Dropdown>
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
