import { useBreakpoint } from "@/primitive/hooks/use-screen";
import { useMemoizedFn, useMount } from "ahooks";
import { processCsvFile } from "./utils";
import { isValidSolanaAddress } from "@/lib/utils/address";
import {
  FormItem,
  IconArrowDown,
  IconArrowForwardright,
  IconClose,
  IconDateRange,
  IconSendSell,
  message,
  TextField,
} from "@/primitive/components";
import { Stage, WhitelistStage } from "../../store/creator";
import { useSwarmStore } from "../../store";
import { TextAnchor } from "@/components/text-button";
import { TextWithEllipsis } from "@/components/text-with-ellipsis";
import { validNumberInput } from "@/lib/utils/input-helper";
import { RangePickerWithoutConfirm } from "@/components/range-picker";
import { useRef, useState } from "react";
import clsx from "clsx";
import { format } from "date-fns";

export function StageForm({
  stage,
  index,
  isWhiteList,
}: {
  stage: Stage | WhitelistStage;
  index: number;
  isWhiteList?: boolean;
}) {
  const { form, updateForm } = useSwarmStore();
  const { breakpoint } = useBreakpoint();
  const updateStage = useMemoizedFn(
    (newStage: Partial<Stage | WhitelistStage>) => {
      const key = isWhiteList ? "whitelistStages" : "publicStages";
      const newStages = [...form.mint[key].value];
      newStages[index] = {
        ...newStages[index],
        ...newStage,
      };
      updateForm("mint", key, {
        value: newStages,
        isInValid: false,
        errorMsg: "",
      });
    }
  );
  const deleteStage = useMemoizedFn((index: number) => {
    const key = isWhiteList ? "whitelistStages" : "publicStages";
    const newStages = [...form.mint[key].value];
    newStages.splice(index, 1);
    updateForm("mint", key, {
      value: newStages,
      isInValid: false,
      errorMsg: "",
    });
  });
  const processCSV = useMemoizedFn((file: File, index: number) => {
    processCsvFile(file)
      .then((res) => {
        if (
          res.some((address, index) => {
            const isInvalid = !isValidSolanaAddress(address as any);
            if (isInvalid) {
              message(`Address at index ${index} is invalid`, {
                type: "error",
              });
            }
            return isInvalid;
          })
        ) {
          return;
        }
        updateStage({
          whitelistAddresses: {
            value: file,
            isInValid: false,
            errorMsg: "",
          },
        });
      })
      .catch((error) => {
        message(error, {
          type: "error",
        });
      });
  });
  const [isFolded, setIsFolded] = useState(false);
  return (
    <div className='rounded-12 border flex flex-col transition-all duration-300 ease-in-out'>
      <div
        className='flex items-center justify-between p-16 cursor-pointer'
        onClick={() => {
          setIsFolded(!isFolded);
        }}
      >
        <div className='flex items-center gap-4'>
          <IconArrowDown
            className={clsx(
              "text-size-20 rotate-180 transition-all duration-300 ease-in-out",
              {
                "!rotate-0": !isFolded,
              }
            )}
          />
          <span className='text-size-16 font-bold'>Stage {index + 1}</span>
        </div>
        <IconClose
          className='cursor-pointer text-size-20'
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (
              form.mint.publicStages.value.length +
                form.mint.whitelistStages.value.length >
              1
            )
              deleteStage(index);
          }}
        />
      </div>
      <div
        className={clsx(
          "w-full flex flex-col gap-16  p-16 -mt-16 transition-all duration-300 ease-in-out",
          {
            "max-h-0 opacity-0 pointer-events-none overflow-hidden": isFolded,
          }
        )}
      >
        <FormItem label='Name' {...stage.name}>
          <TextField
            value={stage.name?.value}
            placeholder='Amount'
            onChange={(e) => {
              updateStage({
                name: {
                  value: e.target.value,
                  isInValid: false,
                  errorMsg: "",
                },
              });
            }}
          />
        </FormItem>
        <FormItem label='Sale Price' {...stage.price}>
          <TextField
            placeholder='Amount'
            type='number'
            onWheel={(e) => {
              e.currentTarget.blur();
              e.preventDefault();
            }}
            value={stage.price.value}
            onChange={(e) => {
              const value = validNumberInput(e.target.value, true);
              updateStage({
                price: {
                  value: value,
                  isInValid: false,
                  errorMsg: "",
                },
              });
            }}
          />
        </FormItem>
        <FormItem
          label='Maximum Mints per Address'
          {...stage.maxMintPerAddress}
        >
          <TextField
            value={stage.maxMintPerAddress.value}
            type='number'
            onWheel={(e) => {
              e.currentTarget.blur();
              e.preventDefault();
            }}
            onChange={(e) => {
              updateStage({
                maxMintPerAddress: {
                  value: validNumberInput(e.target.value),
                  isInValid: false,
                  errorMsg: "",
                },
              });
            }}
          />
        </FormItem>
        <FormItem
          label='Mint Period'
          isInValid={stage.startTime.isInValid || stage.endTime.isInValid}
          errorMsg={stage.startTime.errorMsg || stage.endTime.errorMsg}
          required
        >
          <label>
            <div className='flex items-center w-full h-40 gap-8 bg-surface border-1 border-white-20 rounded-4'>
              <input
                type='datetime-local'
                value={stage.startTime.value}
                onChange={(e) => {
                  console.log(e.target.value);
                  updateStage({
                    startTime: {
                      value: e.target.value,
                      isInValid: false,
                      errorMsg: "",
                    },
                  });
                }}
                min={new Date().toISOString().slice(0, 16)}
                max={
                  stage.endTime.value
                    ? new Date(stage.endTime.value).toISOString().slice(0, 16)
                    : undefined
                }
                className='bg-transparent flex-1 ml-12'
                aria-label='Time'
              />

              <IconArrowForwardright
                className={clsx("shrink-0", "text-text2")}
              />

              <input
                type='datetime-local'
                value={stage.endTime.value}
                min={
                  stage.startTime.value
                    ? new Date(stage.startTime.value).toISOString().slice(0, 16)
                    : new Date().toISOString().slice(0, 16)
                }
                onChange={(e) => {
                  updateStage({
                    endTime: {
                      value: e.target.value,
                      isInValid: false,
                      errorMsg: "",
                    },
                  });
                }}
                className='bg-transparent flex-1'
                aria-label='Time'
              />
              {(stage.startTime.value || stage.endTime.value) && (
                <IconClose
                  onClick={() => {
                    updateStage({
                      startTime: {
                        value: "",
                        isInValid: false,
                        errorMsg: "",
                      },
                      endTime: {
                        value: "",
                        isInValid: false,
                        errorMsg: "",
                      },
                    });
                  }}
                  className='text-text2 shrink-0 mr-12'
                />
              )}
            </div>
          </label>
        </FormItem>
        {isWhiteList && (
          <FormItem
            label='Whitelist Address'
            {...(stage as WhitelistStage).whitelistAddresses}
          >
            <div className='flex gap-4 flex-col w-full'>
              <label
                className='h-[10rem] w-full rounded-6 bg-surface p-16 cursor-pointer flex flex-col items-center justify-center gap-8'
                htmlFor={"whitelistInput" + index}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer?.files?.[0];
                  if (!file) return;
                  processCSV(file, index);
                }}
              >
                {(stage as WhitelistStage).whitelistAddresses?.value ? (
                  <div className='flex items-center gap-8'>
                    <TextWithEllipsis className='max-w-[12.5rem] min-w-0'>
                      {(stage as WhitelistStage).whitelistAddresses.value?.name}
                    </TextWithEllipsis>
                    <IconClose
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        updateStage({
                          whitelistAddresses: {
                            value: null,
                            isInValid: false,
                            errorMsg: "",
                          },
                        });
                      }}
                    />
                  </div>
                ) : (
                  <>
                    <IconSendSell className='text-size-24' />
                    <span className='text-size-16'>
                      Drag files here or click to browse{" "}
                    </span>
                  </>
                )}
                <span className='text-text2 text-size-12'>
                  Accepted files type: CSV
                </span>
              </label>
              <span className='text-text2 mt-4 text-size-12'>
                <TextAnchor
                  download
                  href='https://static.nftgo.io/flow/sample.csv'
                  className='inline-flex underline !text-text1'
                >
                  Download
                </TextAnchor>
                &nbsp;a sample .csv for correct formatting
              </span>
            </div>
            <input
              className='hidden'
              id={"whitelistInput" + index}
              name={"whitelistInput" + index}
              type='file'
              accept='.csv'
              onChange={(e) => {
                const file = e.target?.files?.[0];
                if (!file) return;
                processCSV(file, index);
                e.currentTarget.value = "";
              }}
            />
          </FormItem>
        )}
      </div>
      <ScrollIntoBar />
    </div>
  );
}

function ScrollIntoBar() {
  const ref = useRef<HTMLDivElement>(null);
  useMount(() => {
    ref.current?.scrollIntoView({
      behavior: "smooth",
    });
  });
  return <div ref={ref} className='w-full h-0'></div>;
}
