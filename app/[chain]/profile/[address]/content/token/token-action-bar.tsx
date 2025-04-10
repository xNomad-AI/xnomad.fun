"use client";
import { IconClose, IconFilterAlt } from "@/primitive/components";
import { useTokenStore } from "../../store";
import { Portfolio } from "./type";
import { TextWithEllipsis } from "@/components/text-with-ellipsis";
import { Address } from "@/components/address";
import clsx from "clsx";

export function TokenActionBar() {
  const {
    removeSelectedPortfolio,
    clearAll,
    selectedPortfolio,
    filterOpen,
    setFilterOpen,
  } = useTokenStore();

  return (
    <div className='flex flex-col gap-12'>
      <div className='flex items-center gap-8'>
        <button
          title='Filter Tokens'
          className={clsx(
            "w-40 h-40 rounded-4 border flex items-center justify-center",
            {
              "border-white-20": !filterOpen,
              "border-white": filterOpen,
            }
          )}
          onClick={() => setFilterOpen(!filterOpen)}
        >
          <IconFilterAlt className='text-size-24' />
        </button>

        <div className='flex flex-wrap gap-8'>
          {selectedPortfolio.map((item) => (
            <button
              title='Remove'
              key={item.wallet}
              className='rounded-4 max-w-[240px] h-32 flex items-center justify-center px-8 bg-white-10'
              onClick={() => removeSelectedPortfolio(item)}
            >
              <Address address={item.wallet} />
              <IconClose className='text-size-16' />
            </button>
          ))}
          {selectedPortfolio.length > 0 && (
            <button onClick={clearAll}>Clear All</button>
          )}
        </div>
      </div>
    </div>
  );
}
