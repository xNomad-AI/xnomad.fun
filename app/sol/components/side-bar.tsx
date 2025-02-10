"use client";
import clsx from "clsx";
import { useCollectionStore } from "./store";
import {
  Checkbox,
  Collapse,
  IconDownFilled,
  Modal,
  ModalContent,
  TextField,
} from "@/primitive/components";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/primitive/api";
import { toCardNum } from "@/lib/utils/number";
import { InfiniteScrollList } from "@/components/infinit-scroll";
import { TextWithEllipsis } from "@/components/text-with-ellipsis";
import { useBreakpoint } from "@/primitive/hooks/use-screen";
interface Trait {
  traitValues: {
    value: string;
    count: number;
  }[];
  traitType: string;
}
export function SideBar() {
  const { collection, traitsFilterOpen, setTraitsFilterOpen } =
    useCollectionStore();
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
      return acc + curr.traitValues.length;
    }, 0);
  }, [filterTemplate]);
  const content = (
    <Collapse
      defaultValue={true}
      title={
        <span className='font-bold'>Traits({toCardNum(traitsCount)})</span>
      }
    >
      {filterTemplate.map((template) => {
        const count = template.traitValues.length;
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
  );
  const { breakpoint } = useBreakpoint();
  return (
    <>
      <div
        className={clsx(
          "mobile:hidden flex flex-col gap-8 w-[240px] h-[calc(100vh-372px)] overflow-auto flex-shrink-0",
          {
            hidden: !traitsFilterOpen,
          }
        )}
      >
        {content}
      </div>
      <Modal
        open={traitsFilterOpen && breakpoint === "mobile"}
        onMaskClick={() => {
          setTraitsFilterOpen(false);
        }}
      >
        <ModalContent>{content}</ModalContent>
      </Modal>
    </>
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
        <div className='w-[120px] mobile:w-[unset] mobile:flex-1 flex items-center'>
          Value
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
          Total
        </div>
        <div className='w-[50px] flex items-center'></div>
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
            return (
              <div
                key={trait.value}
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
                className={clsx(
                  "w-full cursor-pointer flex items-center gap-8 h-48 hover:bg-white/[0.06]"
                )}
              >
                <TextWithEllipsis className='w-[120px] mobile:w-[unset] mobile:flex-1'>
                  {trait.value}
                </TextWithEllipsis>
                <div className='w-[48px] flex items-center justify-end'>
                  {toCardNum(trait.count)}
                </div>
                <div className='w-[50px] flex items-center justify-end'>
                  <Checkbox
                    className='text-size-16'
                    value={Boolean(checkedTrait)}
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
