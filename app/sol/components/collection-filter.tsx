"use client";
import {
  IconFilterAlt,
  IconSearch,
  Select,
  TextField,
} from "@/primitive/components";
import { nftSearchSortByLabels, nftSearchSortBys } from "@/types/collection";
import { useCollectionStore } from "./store";
import { useDebounce } from "ahooks";
import { useEffect, useState } from "react";

export function CollectionFilter() {
  const {
    setNftSearchParams,
    nftSearchParams,
    setTraitsFilterOpen,
    traitsFilterOpen,
  } = useCollectionStore();
  const [_keyword, setKeyword] = useState<string | undefined>(undefined);
  const keyword = useDebounce(_keyword, { wait: 300 });
  useEffect(() => {
    setNftSearchParams({ keyword });
  }, [keyword]);
  return (
    <div className='w-full flex items-center gap-12 justify-between'>
      <div className='flex items-center gap-12'>
        <button
          className='w-40 h-40 rounded-4 border border-white-20 flex items-center justify-center'
          onClick={() => {
            setTraitsFilterOpen(!traitsFilterOpen);
          }}
        >
          <IconFilterAlt className='text-size-24' />
        </button>
        <TextField
          className='w-[20rem]'
          onChange={(e) => {
            setKeyword(e.target.value);
          }}
          placeholder='Search NFTs'
          prefixNode={<IconSearch />}
        />
      </div>

      <Select
        className='self-end justify-self-end'
        value={nftSearchParams.sortBy}
        optionConfig={{
          data: nftSearchSortBys.map((item) => item),
          renderer: (item) => nftSearchSortByLabels[item],
        }}
        onSelect={(value) => {
          setNftSearchParams({ sortBy: value });
        }}
        titleConfig={{
          renderer: (item) => item && `Sort by ${nftSearchSortByLabels[item]}`,
        }}
      />
    </div>
  );
}
