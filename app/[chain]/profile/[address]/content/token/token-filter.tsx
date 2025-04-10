"use client";
import {
  Collapse,
  IconDownFilled,
  Modal,
  ModalContent,
} from "@/primitive/components";
import { Portfolio } from "./type";
import { TextField } from "@/primitive/components/text-field";
import { Checkbox } from "@/primitive/components/checkbox";
import { useMemo, useState } from "react";
import { useTokenStore } from "../../store";
import clsx from "clsx";
import { TextWithEllipsis } from "@/components/text-with-ellipsis";
import { TokenNumber } from "@/components/token-number";
import { useBreakpoint } from "@/primitive/hooks/use-screen";

export function TokenFilter({ data }: { data: Portfolio[] }) {
  const { filterOpen, setFilterOpen } = useTokenStore();
  const content = (
    <Collapse
      defaultValue={true}
      title={<span className='font-bold'>Owners</span>}
    >
      <OwnerFilter data={data} />
    </Collapse>
  );
  const { breakpoint } = useBreakpoint();
  return (
    <>
      <div
        className={clsx(
          "mobile:hidden flex flex-col gap-8 w-[240px] h-[calc(100vh-372px)] overflow-auto flex-shrink-0",
          {
            hidden: !filterOpen,
          }
        )}
      >
        {content}
      </div>
      <Modal
        open={filterOpen && breakpoint === "mobile"}
        onMaskClick={() => {
          setFilterOpen(false);
        }}
      >
        <ModalContent>{content}</ModalContent>
      </Modal>
    </>
  );
}
function OwnerFilter({ data }: { data: Portfolio[] }) {
  const [keyword, setKeyword] = useState("");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const { addSelectedPortfolio, removeSelectedPortfolio, selectedPortfolio } =
    useTokenStore();
  const showData = useMemo(() => {
    return data
      .filter((item) => item.wallet.includes(keyword))
      .sort((a, b) => {
        return (a.totalUsd - b.totalUsd) * (direction === "asc" ? 1 : -1);
      });
  }, [data, keyword, direction]);
  return (
    <div className='flex flex-col w-full gap-8'>
      <TextField
        onChange={(e) => {
          setKeyword(e.target.value);
        }}
        placeholder='Search'
        className='w-full'
      />
      <div className='w-full flex items-center gap-8 border-b border-white-20 h-32'>
        <div className='w-[120px] mobile:w-[unset] mobile:flex-1 flex items-center'>
          Owner
        </div>
        <div
          onClick={() => {
            setDirection(direction === "asc" ? "desc" : "asc");
          }}
          className='w-[48px] cursor-pointer flex items-center gap-8 justify-end'
        >
          <IconDownFilled
            className={clsx(
              "text-size-12 transition-all duration-300 ease-out",
              {
                "transform rotate-180": direction === "asc",
              }
            )}
          />{" "}
          Value
        </div>
        <div className='w-[50px] flex items-center'></div>
      </div>
      {showData.length > 0 ? (
        showData.map((item) => {
          const checked = selectedPortfolio.find(
            (item) => item.wallet === item.wallet
          );
          return (
            <div
              key={item.wallet}
              onClick={() => {
                if (!checked) {
                  addSelectedPortfolio(item);
                } else {
                  removeSelectedPortfolio(item);
                }
              }}
              className={clsx(
                "w-full cursor-pointer flex items-center gap-8 h-48 hover:bg-white/[0.06]"
              )}
            >
              <TextWithEllipsis className='w-[120px] mobile:w-[unset] mobile:flex-1'>
                {item.wallet}
              </TextWithEllipsis>
              <div className='w-[48px] flex items-center justify-end'>
                <TokenNumber number={item.totalUsd} prefix={"$"} />
              </div>
              <div className='w-[50px] flex items-center justify-end'>
                <Checkbox className='text-size-16' value={Boolean(checked)} />
              </div>
            </div>
          );
        })
      ) : (
        <div className='flex justify-center w-full p-16 items-center'>
          No data
        </div>
      )}
    </div>
  );
}
