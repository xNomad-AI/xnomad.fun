"use client";
import clsx from "clsx";
import { useCollectionStore } from "./store";
import {
  Checkbox,
  Collapse,
  IconDownFilled,
  TextField,
} from "@/primitive/components";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/primitive/api";
import { toCardNum } from "@/lib/utils/number";
import { InfiniteScrollList } from "@/components/infinit-scroll";
import { TextWithEllipsis } from "@/components/text-with-ellipsis";
interface Trait {
  traitValues: {
    value: string;
    count: number;
  }[];
  traitType: string;
}
export function SideBar() {
  const { collection, traitsFilterOpen } = useCollectionStore();
  const [filterTemplate, setFilterTemplate] = useState<Trait[]>([]);
  useEffect(() => {
    api.v1
      .get<{
        traits: Trait[];
      }>(`/nft/solana/collections/${collection?.id}/filter-template`)
      .then((res) => {
        setFilterTemplate(res.traits);
      });
  }, [collection]);
  const traitsCount = useMemo(() => {
    return filterTemplate.reduce((acc, curr) => {
      return acc + curr.traitValues.reduce((acc, curr) => acc + curr.count, 0);
    }, 0);
  }, [filterTemplate]);
  return (
    <div
      className={clsx("flex flex-col gap-8 w-[240px]", {
        hidden: !traitsFilterOpen,
      })}
    >
      <Collapse
        title={
          <span className='font-bold'>Traits({toCardNum(traitsCount)})</span>
        }
      >
        {filterTemplate.map((template) => {
          const count = template.traitValues.reduce(
            (acc, curr) => acc + curr.count,
            0
          );
          return (
            <Collapse
              key={template.traitType}
              title={
                <div className='flex justify-between items-center w-full'>
                  <span>{template.traitType}</span>
                  <span>{toCardNum(count)}</span>
                </div>
              }
            >
              <TraitFilter
                data={template.traitValues}
                type={template.traitType}
              />
            </Collapse>
          );
        })}
      </Collapse>
    </div>
  );
}

function TraitFilter({
  data,
  type,
}: {
  data: Trait["traitValues"];
  type: string;
}) {
  const [keyword, setKeyword] = useState("");
  const [sortBy] = useState<"count">("count");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const showData = useMemo(() => {
    return data
      .filter((item) => item.value.includes(keyword))
      .sort((a, b) => {
        if (sortBy === "count") {
          return direction === "asc" ? a.count - b.count : b.count - a.count;
        }
        return 0;
      });
  }, [data, keyword, sortBy, direction]);
  const { setNftSearchParams, nftSearchParams } = useCollectionStore();
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
        <div className='w-[80px] flex items-center'>Value</div>
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
          Total
        </div>
        <div className='w-[90px] flex items-center'></div>
      </div>
      {showData.length > 0 ? (
        <InfiniteScrollList
          height={320}
          items={showData}
          itemSize={48}
          gutterSize={0}
          renderItem={(trait) => {
            const checkedTrait = nftSearchParams.traitsQuery.find(
              (param) =>
                param.traitType === type && trait.value === param.traitValue
            );
            console.log({
              checkedTrait,
              nftSearchParams,
              type,
              trait,
            });
            return (
              <div
                key={trait.value}
                className={clsx(
                  "w-full flex items-center gap-8 h-48 hover:bg-white/[0.06]"
                )}
              >
                <TextWithEllipsis className='w-[80px]'>
                  {trait.value}
                </TextWithEllipsis>
                <div className='w-[48px] flex items-center justify-end'>
                  {toCardNum(trait.count)}
                </div>
                <div className='w-[90px] flex items-center justify-end'>
                  <Checkbox
                    value={Boolean(checkedTrait)}
                    onClick={() => {
                      if (!checkedTrait) {
                        setNftSearchParams({
                          traitsQuery: [
                            ...nftSearchParams.traitsQuery,
                            {
                              traitType: type,
                              traitValue: trait.value,
                            },
                          ],
                        });
                      } else {
                        setNftSearchParams({
                          traitsQuery: nftSearchParams.traitsQuery.filter(
                            (param) =>
                              type !== param.traitType ||
                              param.traitValue !== trait.value
                          ),
                        });
                      }
                    }}
                  />
                </div>
              </div>
            );
          }}
          hasNextPage={false}
          isNextPageLoading={false}
          loadNextPage={() => {}}
        />
      ) : (
        <div className='flex justify-center w-full p-16 items-center'>
          No data
        </div>
      )}
    </div>
  );
}
