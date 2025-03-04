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
import { useMemoizedFn } from "ahooks";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { FILE_SIZE_IN_BYTE, FILE_SIZE_IN_MB, IMAGE_ID } from "./constants";
import { IssueTokenFormType } from "./types";
import { NFT } from "@/types";
import BigNumber from "bignumber.js";
import { PublicKey } from "@solana/web3.js";
import { useSolana } from "@/lib/hooks/use-solana";

export function IssueTokenForm({
  form,
  setForm,
  nftImage,
  account,
}: {
  form: IssueTokenFormType;
  setForm: (form: IssueTokenFormType) => void;
  account: PublicKey;
  nftImage: string | File;
}) {
  const [balance, setBalance] = useState<BigNumber>(BigNumber(0));
  const { getSolBalance } = useSolana();

  useEffect(() => {
    getSolBalance(account).then((balance) => {
      setBalance(balance);
    });
  }, []);
  const [useAgentImage, setUseAgentImage] = useState(false);
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
      const img = document.getElementById(IMAGE_ID) as HTMLImageElement;
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
  return (
    <>
      <FormItem label={"Token Name"} {...form.tokenName}>
        <TextField
          className='!bg-background'
          value={form.tokenName.value}
          placeholder='Less than 20 characters'
          onChange={(event) => {
            const value = event.target.value;
            if (value.length > 20) {
              setForm({
                ...form,
                tokenName: {
                  ...form.tokenName,
                  value,
                  isInValid: true,
                  errorMsg: "Less than 20 characters",
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
          onChange={(event) => {
            setForm({
              ...form,
              symbol: {
                ...form.symbol,
                value: event.target.value,
                isInValid: false,
              },
            });
          }}
        />
      </FormItem>
      <FormItem label='Image' {...form.image}>
        <div className='flex flex-col gap-4'>
          <label
            htmlFor='nft-image'
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
                  IMAGE_ID
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
              id={IMAGE_ID}
              alt='nft-image'
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
          id='nft-image'
          name='nft-image'
          className='hidden'
          accept='.jpg,.png,.svg,.jpeg,.webp,.gif'
          size={5000}
        />
        <p className='text-text2'>
          Upload a images in JPEG/PNG/GIF formats, with a size limit of 10MB.
        </p>

        <button
          className='flex items-center gap-8 w-fit'
          onClick={() => {
            const result = !useAgentImage;
            setUseAgentImage(result);
            if (result) {
              const img = document.getElementById(IMAGE_ID) as HTMLImageElement;
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
            } else {
              const img = document.getElementById(IMAGE_ID) as HTMLImageElement;
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
          <span>Or use AI-NFT image</span>
        </button>
      </FormItem>
      <Divider horizontal className='w-full' />
      <FormItem label={"Description"} {...form.description}>
        <TextField
          className='!bg-background'
          value={form.description.value}
          placeholder='Less than 200 characters'
          onChange={(event) => {
            const value = event.target.value;
            if (value.length > 200) {
              setForm({
                ...form,
                description: {
                  ...form.description,
                  value,
                  isInValid: true,
                  errorMsg: "Less than 200 characters",
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
            setForm({
              ...form,
              twitter: {
                ...form.twitter,
                value: event.target.value,
                isInValid: false,
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
            setForm({
              ...form,
              telegram: {
                ...form.telegram,
                value: event.target.value,
                isInValid: false,
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
            setForm({
              ...form,
              website: {
                ...form.website,
                value: event.target.value,
                isInValid: false,
              },
            });
          }}
        />
      </FormItem>
      <Divider horizontal className='w-full' />
      <FormItem
        label={"Buy(SOL)"}
        desc={
          "Purchasing a small amount of your token is optional but can help protect your coin from snipers."
        }
        {...form.amount}
      >
        <TextField
          className='!bg-background'
          value={form.amount.value}
          placeholder='Initial Buy Amount'
          onChange={(event) => {
            const value = validNumberInput(event.target.value, true);
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
          &nbsp;SOL
        </div>
      </FormItem>
    </>
  );
}
