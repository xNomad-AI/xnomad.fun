import {
  Dropdown,
  DropdownController,
  IconArrowDown,
  message,
  SelectOption,
} from "@/primitive/components";
import Image from "next/image";
import { useChainStore } from "../chain-provider";
import clsx from "clsx";
import { useRef, useState } from "react";
import { useEventListener, useMemoizedFn } from "ahooks";
import { SupportedChain } from "@/types/preference";
const UNSUPPORTED_PAGES = ["/agent/", "/xnomad"];
export function ChainSelect() {
  const { chain, setChain } = useChainStore();
  const [opened, setOpened] = useState(false);
  const dropdownController = useRef<DropdownController>(null);
  const onChainChange = useMemoizedFn((newChain: SupportedChain) => {
    const preChain = chain;
    if (
      UNSUPPORTED_PAGES.some((page) => window.location.pathname.includes(page))
    ) {
      message("This page does not support chain switching", {
        type: "error",
      });
      return;
    }
    setChain(newChain);
    dropdownController.current?.close();
    window.history.pushState(
      null,
      "",
      window.location.pathname.replace("/" + preChain, "/" + newChain) +
        window.location.search
    );
  });
  useEventListener("popstate", () => {
    const { pathname } = window.location;
    const isBsc = pathname.includes("/bsc");
    const chain = isBsc ? "bsc" : "solana";
    setChain(chain);
  });
  return (
    <Dropdown
      ref={dropdownController}
      onVisibleChange={setOpened}
      trigger={["click"]}
      dropdownClassName='bg-surface'
      content={
        <div className='flex flex-col w-[200px]'>
          <SelectOption
            reverse
            className='!rounded-[0px]'
            handleSelect={() => {
              onChainChange("solana");
            }}
            selected={chain === "solana"}
          >
            <Image src={"/chain/solana.svg"} height={16} width={16} alt='' />
            <span>Solana</span>
          </SelectOption>

          <SelectOption
            reverse
            className='!rounded-[0px]'
            handleSelect={() => {
              onChainChange("bsc");
            }}
            selected={chain === "bsc"}
          >
            <Image src={"/chain/bsc.svg"} height={16} width={16} alt='' />
            <span>BNB Smart Chain</span>
          </SelectOption>
        </div>
      }
    >
      <button className='px-8 h-28 flex items-center gap-4 bg-surface rounded-full'>
        <Image
          src={chain === "solana" ? "/chain/solana.svg" : "/chain/bsc.svg"}
          height={20}
          width={20}
          className='rounded-full object-cover'
          alt=''
        />
        <span>{chain === "solana" ? "SOL" : "BSC"}</span>
        <IconArrowDown
          className={clsx(
            "text-size-16 transition-transform duration-300 ease-in-out",
            {
              "rotate-180": opened,
            }
          )}
        />
      </button>
    </Dropdown>
  );
}
