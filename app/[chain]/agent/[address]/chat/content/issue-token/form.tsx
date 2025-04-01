import { TokenNumber } from "@/components/token-number";
import { validNumberInput } from "@/lib/utils/input-helper";
import {
  FormItem,
  TextField,
  ActionButton,
  IconClose,
  Checkbox,
  message,
  Divider,
} from "@/primitive/components";
import { useMemoizedFn, useMount } from "ahooks";
import clsx from "clsx";
import { useMemo, useState } from "react";
import {
  FILE_SIZE_IN_BYTE,
  FILE_SIZE_IN_MB,
  TOKEN_IMAGE_ID,
} from "./constants";
import { IssueTokenFormType } from "./types";
import { PublicKey } from "@solana/web3.js";
import { useBalanceOnChain } from "@/lib/hooks/balance";
import { urlValidation } from "@/primitive/utils/url";
import { getCurrencySymbol } from "@/app/layout/chain-provider/utils";
import { useChainStore } from "@/app/layout/chain-provider";
const TICKER_LIMIT = 10;
const NAME_LIMIT = 20;
const DESCRIPTION_LIMIT = 200;
export function IssueTokenForm({
  form,
  setForm,
  nftImage,
  account,
}: {
  form: IssueTokenFormType;
  setForm: (form: IssueTokenFormType) => void;
  account: PublicKey | string | undefined | null;
  nftImage: string | File;
}) {
  const { chain } = useChainStore();
  const { balance } = useBalanceOnChain(account);
  const [useAgentImage, setUseAgentImage] = useState(
    form.image.value ? false : true
  );
  const onLogoFileChange = useMemoizedFn((file?: File) => {
    if (!file) {
      return;
    }
    if (file.size > FILE_SIZE_IN_BYTE) {
      message(`File size should be less than ${FILE_SIZE_IN_MB}MB`, {
        type: "error",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const img = document.getElementById(TOKEN_IMAGE_ID) as HTMLImageElement;
      img.src = e.target?.result as string;
    };
    setForm({
      ...form,
      image: {
        ...form.image,
        value: file,
        isInValid: false,
      },
    });
    setUseAgentImage(false);
    reader.readAsDataURL(file);
  });
  const setNFTImageAsTokenImage = useMemoizedFn(() => {
    const img = document.getElementById(TOKEN_IMAGE_ID) as HTMLImageElement;
    if (typeof nftImage === "string") {
      img.src = nftImage;
      // file from image url
      fetch(nftImage)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "image.png", {
            type: blob.type,
          });
          setForm({
            ...form,
            image: {
              ...form.image,
              value: file,
              isInValid: false,
            },
          });
        });
    } else {
      img.src = URL.createObjectURL(nftImage);
      setForm({
        ...form,
        image: {
          ...form.image,
          value: nftImage,
          isInValid: false,
        },
      });
    }
  });
  useMount(() => {
    if (useAgentImage) {
      setNFTImageAsTokenImage();
    } else if (form.image.value) {
      const img = document.getElementById(TOKEN_IMAGE_ID) as HTMLImageElement;
      img.src = URL.createObjectURL(form.image.value);
    }
  });
  const minimumInitialBuyAmount = useMemo(() => {
    if (chain === "solana") {
      return 0.01;
    } else {
      return 0.002;
    }
  }, [chain]);
  return (
    <>
      <FormItem label={"Token Name"} {...form.tokenName}>
        <TextField
          className='!bg-background'
          value={form.tokenName.value}
          placeholder={`Less than ${NAME_LIMIT} characters`}
          onChange={(event) => {
            const value = event.target.value;
            if (value.length > NAME_LIMIT) {
              setForm({
                ...form,
                tokenName: {
                  ...form.tokenName,
                  value,
                  isInValid: true,
                  errorMsg: `Less than ${NAME_LIMIT} characters`,
                },
              });
              return;
            }
            setForm({
              ...form,
              tokenName: {
                ...form.tokenName,
                value: event.target.value,
                isInValid: false,
              },
            });
          }}
        />
      </FormItem>
      <FormItem label={"Symbol"} {...form.symbol}>
        <TextField
          className='!bg-background'
          value={form.symbol.value}
          prefixNode={<span className='text-text2'>$</span>}
          placeholder={`Less than ${TICKER_LIMIT} character`}
          onChange={(event) => {
            const value = event.target.value;
            if (value.length > TICKER_LIMIT) {
              setForm({
                ...form,
                symbol: {
                  ...form.symbol,
                  value,
                  isInValid: true,
                  errorMsg: `Less than ${TICKER_LIMIT} character`,
                },
              });
              return;
            }
            setForm({
              ...form,
              symbol: {
                ...form.symbol,
                value: value,
                isInValid: false,
              },
            });
          }}
        />
      </FormItem>
      <FormItem label='Image' {...form.image}>
        <div className='flex flex-col gap-4'>
          <label
            htmlFor='token-image'
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              onLogoFileChange(file);
            }}
            className='relative h-[7.5rem] w-[7.5rem] rounded-6 bg-background border border-white-20 flex items-center justify-center cursor-pointer'
          >
            <ActionButton
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                const img = document.getElementById(
                  TOKEN_IMAGE_ID
                ) as HTMLImageElement;
                img.src = "";
                setUseAgentImage(false);
                setForm({
                  ...form,
                  image: {
                    ...form.image,
                    value: null,
                    isInValid: false,
                  },
                });
              }}
              className={
                form.image.value
                  ? "text-size-16 rounded-full !h-20 !w-20 !min-w-[unset] !absolute -top-8 -right-8 z-3"
                  : "hidden"
              }
            >
              <IconClose />
            </ActionButton>
            <img
              id={TOKEN_IMAGE_ID}
              alt='token-image'
              src={""}
              width={120}
              height={120}
              className={
                form.image.value
                  ? "w-full h-full object-contain rounded-6 absolute left-0 top-0 z-2"
                  : "hidden z-0"
              }
            />
            <div
              className={clsx(
                "z-1 border text-black bg-white font-bold text-size-12 border-white-20 px-16 h-32 flex items-center justify-center rounded-6",
                { "hidden z-0": form.image.value }
              )}
            >
              Upload
            </div>
          </label>
        </div>
        <input
          type='file'
          onChange={(e) => {
            const file = e.target.files?.[0];
            onLogoFileChange(file);
            e.currentTarget.value = "";
          }}
          id='token-image'
          name='token-image'
          className='hidden'
          accept='.jpg,.png,.gif,.svg,.jpeg,.webp'
          size={5000}
        />
        <p className='text-text2 text-size-12'>
          Upload a image in JPEG/PNG/GIF formats, with a size limit of 10MB.
        </p>

        <button
          title='Use AI-NFT image'
          className='flex items-center gap-8 w-fit'
          onClick={() => {
            const result = !useAgentImage;
            setUseAgentImage(result);
            if (result) {
              setNFTImageAsTokenImage();
            } else {
              const img = document.getElementById(
                TOKEN_IMAGE_ID
              ) as HTMLImageElement;
              img.src = "";
              setForm({
                ...form,
                image: {
                  ...form.image,
                  value: null,
                  isInValid: false,
                },
              });
            }
          }}
        >
          <Checkbox value={useAgentImage} />
          <span>Use AI-NFT image</span>
        </button>
      </FormItem>
      <Divider horizontal className='w-full' />
      <p className='text-size-12 text-text2'>
        You are allowed to modify the following information after the launch,
        for a fee of 1 {getCurrencySymbol(chain)}.
      </p>
      <FormItem label={"Description"} {...form.description}>
        <TextField
          className='!bg-background'
          value={form.description.value}
          placeholder={`Less than ${DESCRIPTION_LIMIT} characters`}
          onChange={(event) => {
            const value = event.target.value;
            if (value.length > DESCRIPTION_LIMIT) {
              setForm({
                ...form,
                description: {
                  ...form.description,
                  value,
                  isInValid: true,
                  errorMsg: `Less than ${DESCRIPTION_LIMIT} characters`,
                },
              });
              return;
            }
            setForm({
              ...form,
              description: {
                ...form.description,
                value: event.target.value,
                isInValid: false,
              },
            });
          }}
        />
      </FormItem>

      <FormItem label={"X(Twitter)"} {...form.twitter}>
        <TextField
          className='!bg-background'
          value={form.twitter.value}
          placeholder='e.g. https://twitter.com/username'
          onChange={(event) => {
            const value = event.target.value;
            const isValid = urlValidation(value);
            setForm({
              ...form,
              twitter: {
                ...form.twitter,
                value,
                isInValid: !isValid,
                errorMsg: isValid ? "" : "Invalid URL",
              },
            });
          }}
        />
      </FormItem>
      <FormItem label={"Telegram"} {...form.telegram}>
        <TextField
          className='!bg-background'
          value={form.telegram.value}
          placeholder='e.g. https://t.me/username'
          onChange={(event) => {
            const value = event.target.value;
            const isValid = urlValidation(value);
            setForm({
              ...form,
              telegram: {
                ...form.telegram,
                value,
                isInValid: !isValid,
                errorMsg: isValid ? "" : "Invalid URL",
              },
            });
          }}
        />
      </FormItem>
      <FormItem label={"Website"} {...form.website}>
        <TextField
          className='!bg-background'
          value={form.website.value}
          placeholder='e.g. https://example.com'
          onChange={(event) => {
            const value = event.target.value;
            const isValid = urlValidation(value);
            setForm({
              ...form,
              website: {
                ...form.website,
                value,
                isInValid: !isValid,
                errorMsg: isValid ? "" : "Invalid URL",
              },
            });
          }}
        />
      </FormItem>

      <Divider horizontal className='w-full' />
      <FormItem
        label={`Buy(${getCurrencySymbol(chain)})`}
        desc={`Purchase at least ${minimumInitialBuyAmount} ${getCurrencySymbol(
          chain
        )} to initiate trading.`}
        {...form.amount}
      >
        <TextField
          className='!bg-background'
          value={form.amount.value}
          placeholder={`>${minimumInitialBuyAmount} ${getCurrencySymbol(
            chain
          )}`}
          onBlur={() => {
            if (parseFloat(form.amount.value) < minimumInitialBuyAmount) {
              setForm({
                ...form,
                amount: {
                  ...form.amount,
                  isInValid: true,
                  errorMsg: `Amount should be more than ${minimumInitialBuyAmount} ${getCurrencySymbol(
                    chain
                  )}`,
                },
              });
            }
          }}
          onChange={(event) => {
            let value = validNumberInput(event.target.value, true);
            if (
              parseFloat(value) > 0 &&
              parseFloat(value) < minimumInitialBuyAmount
            ) {
              value = `${minimumInitialBuyAmount}`;
            }

            setForm({
              ...form,
              amount: {
                ...form.amount,
                value,
                isInValid: false,
              },
            });
          }}
        />
        <div className='text-size-12'>
          Balance:&nbsp;
          <TokenNumber number={balance} />
          &nbsp;{getCurrencySymbol(chain)}
        </div>
      </FormItem>
    </>
  );
}
