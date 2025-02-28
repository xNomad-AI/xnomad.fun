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
      },
    });
    setUseAgentImage(false);
    reader.readAsDataURL(file);
  });

  return (
    <ChatContentContainer
      message={message}
      showTimestamp={step !== "input"}
      showCopyButton={step !== "input"}
    >
      {step === "input" ? (
        <div className='flex flex-col gap-16 w-full'>
          <span className='font-bold text-size-16'>Issue Token</span>
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
              Upload a images in JPEG/PNG/GIF formats, with a size limit of
              10MB.
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
                  },
                });
              }}
            />
          </FormItem>
          <div className='w-full flex justify-end items-center gap-16'>
            <Button
              size='s'
              variant='secondary'
              onClick={() => {
                deleteMessageById(message.id);
              }}
            >
              Cancel
            </Button>
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
      ) : null}
    </ChatContentContainer>
  );
}
