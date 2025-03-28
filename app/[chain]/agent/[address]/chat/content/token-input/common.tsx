import { Address } from "@/components/address";
import { Empty } from "@/components/empty";
import {
  Dropdown,
  DropdownController,
  IconEmptyCoin,
  Spin,
  TextField,
} from "@/primitive/components";
import { useRef, useState } from "react";
import { TokenValue } from ".";

export function CommonInput<T extends TokenValue>({
  data,
  value,
  onChange,
  className,
  TokenItem,
  loading,
  search,
  setSearch,
}: {
  data: T[];
  TokenItem: React.ComponentType<{
    value: T;
    selected: boolean;
    handleSelect: (value: TokenValue) => void;
  }>;
  value: TokenValue;
  onChange: (value: TokenValue) => void;
  className?: string;
  loading?: boolean;
  search?: string;
  setSearch: (value: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const dropdownRef = useRef<DropdownController>(null);

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
                  setSearch(value.ticker);
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
        clearable
        onClear={() => {
          onChange({ ca: "", ticker: "", logo: "" });
          setSearch("");
        }}
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
              {value.logo ? (
                <img
                  src={value.logo}
                  alt='logo'
                  className='w-20 h-20 rounded-full object-contain'
                />
              ) : (
                <IconEmptyCoin className='text-size-20' />
              )}
              <span className='text-size-14 text-text1'>{value.ticker}</span>
              <Address address={value.ca} className='text-size-12 text-text2' />
            </div>
          )
        }
        value={focused ? search : value.ticker ? " " : undefined}
        onChange={(e) => {
          setSearch(e.target.value);
        }}
      />
    </Dropdown>
  );
}
