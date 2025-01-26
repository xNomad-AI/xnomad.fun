"use client";
import { IconSearch, Select, TextField } from "@/primitive/components";
import { nftSearchSortByLabels, nftSearchSortBys } from "@/types/collection";
import { useCollectionStore } from "./store";

export function CollectionFilter() {
  const { setNftSearchParams, nftSearchParams } = useCollectionStore();
  return (
    <div className='w-full flex items-center gap-12 justify-between'>
      {/* <Button
        variant='solid'
        className='!px-0 !w-[40px]'
        onClick={() => {
          setTraitsFilterOpen(!traitsFilterOpen);
        }}
      >
        <IconFilterAlt className='text-size-24' />
      </Button> */}
      <TextField
        className='w-[20rem]'
        onChange={(e) => {
          setNftSearchParams({ keyword: e.target.value });
        }}
        placeholder='Search NFTs'
        prefixNode={<IconSearch />}
      />
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
