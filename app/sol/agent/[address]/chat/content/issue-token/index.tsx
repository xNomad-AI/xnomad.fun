import { validNumberInput } from "@/lib/utils/input-helper";
import {
  ActionButton,
  Button,
  Checkbox,
  FormItem,
  FormValue,
  IconClose,
  TextField,
  message as toast,
} from "@/primitive/components";
import { useEffect, useState } from "react";
import { TokenNumber } from "@/components/token-number";
import BigNumber from "bignumber.js";
import { ChatContentContainer } from "../container";
import { ContentWithUser, IAttachment } from "../../types";
import { useSolana } from "@/lib/hooks/use-solana";
import { useWallet } from "@solana/wallet-adapter-react";
import clsx from "clsx";
import { FILE_SIZE_IN_BYTE, FILE_SIZE_IN_MB, IMAGE_ID } from "./constants";
import { useMemoizedFn } from "ahooks";
import { useChatContext } from "../../store";
import { PublicKey } from "@solana/web3.js";
import { NFT } from "@/types";
import { CancelButton } from "../cancel-button";

export function IssueToken({
  message,
  nft,
}: {
  message: ContentWithUser;
  nft: NFT;
}) {
  const { deleteMessageById, addAndSendMessage } = useChatContext();
  const { getSolBalance } = useSolana();
  const [balance, setBalance] = useState<BigNumber>(BigNumber(0));
  useEffect(() => {
    getSolBalance(new PublicKey(nft.agentAccount.solana)).then((balance) => {
      setBalance(balance);
    });
  }, []);
  const [form, setForm] = useState<{
    tokenName: FormValue<string>;
    description: FormValue<string>;
    twitter: FormValue<string>;
    telegram: FormValue<string>;
    website: FormValue<string>;
    image: FormValue<File | null>;
    symbol: FormValue<string>;
    amount: FormValue<string>;
  }>({
    tokenName: {
      value: "",
      required: true,
      isInValid: false,
      errorMsg: "",
    },
    description: {
      value: "",
      required: true,
      isInValid: false,
      errorMsg: "",
    },
    image: {
      value: null,
      required: true,
      isInValid: false,
      errorMsg: "",
    },
    symbol: {
      value: "",
      required: true,
      isInValid: false,
      errorMsg: "",
    },
    telegram: {
      value: "",
      required: false,
      isInValid: false,
      errorMsg: "",
    },
    amount: {
      value: "",
      required: false,
      isInValid: false,
      errorMsg: "",
    },
    website: {
      value: "",
      required: false,
      isInValid: false,
      errorMsg: "",
    },
    twitter: {
      value: "",
      required: false,
      isInValid: false,
      errorMsg: "",
    },
  });
  const step = message.step;
  const [useAgentImage, setUseAgentImage] = useState(false);
  const onLogoFileChange = useMemoizedFn((file?: File) => {
    if (!file) {
      return;
    }
    if (file.size > FILE_SIZE_IN_BYTE) {
      toast(`File size should be less than ${FILE_SIZE_IN_MB}MB`, {
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
    <ChatContentContainer message={message}>
      <div className='flex flex-col gap-16 w-full'>
        <div className='flex items-center gap-8'>
          <span className='font-bold text-size-16'>Issue Token</span>
          <div className='flex items-center gap-4'>
            <span className='text-size-12 text-text2'>Powered by Pump.fun</span>
            <svg
              width='16'
              height='17'
              viewBox='0 0 16 17'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <mask
                id='mask0_6019_24423'
                style={{
                  maskType: "luminance",
                }}
                maskUnits='userSpaceOnUse'
                x='0'
                y='1'
                width='16'
                height='15'
              >
                <path
                  d='M15.1998 1.2998H0.799805V15.6998H15.1998V1.2998Z'
                  fill='white'
                />
              </mask>
              <g mask='url(#mask0_6019_24423)'>
                <path
                  d='M13.208 8.82361C14.8416 7.18997 14.8416 4.54132 13.208 2.90768C11.5743 1.27403 8.92567 1.27403 7.29203 2.90768L2.40769 7.79202C0.774049 9.42566 0.774049 12.0743 2.40769 13.708C4.04133 15.3416 6.68999 15.3416 8.32363 13.708L13.208 8.82361Z'
                  fill='white'
                />
                <path
                  d='M5.0328 5.16699L2.4075 7.79139C1.62291 8.57598 1.18213 9.64011 1.18213 10.7497C1.18213 11.8593 1.62291 12.9234 2.4075 13.708C3.19209 14.4926 4.25622 14.9334 5.3658 14.9334C6.47537 14.9334 7.53951 14.4926 8.3241 13.708L10.9485 11.0827L5.0328 5.16699Z'
                  fill='#52D48F'
                />
                <path
                  d='M7.87832 13.2618C7.54839 13.5919 7.15669 13.8537 6.72557 14.0324C6.29446 14.211 5.83237 14.303 5.3657 14.3031C4.42322 14.3033 3.51927 13.929 2.85272 13.2627C2.18616 12.5964 1.8116 11.6926 1.81143 10.7501C1.81126 9.80762 2.1855 8.90367 2.85182 8.23712L7.73612 3.35372C8.06476 3.01802 8.45671 2.75082 8.8893 2.56758C9.32188 2.38435 9.7865 2.28872 10.2563 2.28622C10.7261 2.28373 11.1917 2.37442 11.6262 2.55304C12.0607 2.73167 12.4555 2.99469 12.7877 3.32688C13.1198 3.65907 13.3829 4.05384 13.5615 4.48835C13.7401 4.92285 13.8308 5.38847 13.8283 5.85825C13.8258 6.32803 13.7302 6.79266 13.547 7.22524C13.3637 7.65782 13.0965 8.04977 12.7608 8.37842L7.87832 13.2609V13.2618ZM13.2072 2.90822C12.4227 2.12379 11.3588 1.68311 10.2494 1.68311C9.13997 1.68311 8.07601 2.12379 7.29152 2.90822L2.40812 7.79162C1.62353 8.57609 1.1827 9.64011 1.18262 10.7496C1.18253 11.8591 1.6232 12.9232 2.40767 13.7078C3.19214 14.4924 4.25616 14.9332 5.36565 14.9333C6.47514 14.9334 7.53923 14.4927 8.32382 13.7082L13.2081 8.82392C13.9925 8.03942 14.4332 6.97546 14.4332 5.86607C14.4332 4.75667 13.9916 3.69271 13.2072 2.90822Z'
                  fill='#044735'
                />
              </g>
            </svg>
          </div>
        </div>

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
                const img = document.getElementById(
                  IMAGE_ID
                ) as HTMLImageElement;
                img.src = nft.image;
                // file from image url
                fetch(nft.image)
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
                const img = document.getElementById(
                  IMAGE_ID
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
            <span>Or use AI-NFT image</span>
          </button>
        </FormItem>
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
        <FormItem label={"Buy(SOL)"} {...form.amount}>
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
        <div className='w-full flex justify-end items-center gap-16'>
          <CancelButton
            onClick={() => {
              deleteMessageById(message.id);
            }}
          />
          <Button
            size='s'
            onClick={() => {
              if (Object.values(form).some((item) => item.isInValid)) {
                return;
              }
              let allValid = true;
              const newForm = { ...form };
              Object.keys(newForm).forEach((_key) => {
                const key = _key as keyof typeof newForm;
                if (newForm[key].required && !newForm[key].value) {
                  allValid = false;
                  newForm[key].isInValid = true;
                  newForm[key].errorMsg = "Required";
                }
              });
              if (!allValid) {
                setForm(newForm);
                return;
              }
              addAndSendMessage(
                `Create a new token called ${
                  form.tokenName.value
                } with symbol ${form.symbol.value}${
                  form.twitter.value
                    ? `, with twitter ${form.twitter.value}`
                    : ""
                } with description "${form.description.value}"${
                  form.twitter.value
                    ? `, with twitter ${form.twitter.value}`
                    : ""
                }${
                  form.twitter.value
                    ? `, with website ${form.website.value}`
                    : ""
                }${
                  form.telegram.value
                    ? `, with telegram ${form.telegram.value}`
                    : ""
                }${
                  form.amount.value
                    ? `, buy ${form.amount.value} SOL worth`
                    : ""
                }.`,
                form.image.value
              );
              deleteMessageById(message.id);
            }}
          >
            Confirm
          </Button>
        </div>
      </div>
    </ChatContentContainer>
  );
}
