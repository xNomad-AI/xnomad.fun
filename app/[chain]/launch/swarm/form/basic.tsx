import {
  ActionButton,
  Button,
  Card,
  FormItem,
  IconClose,
  message,
  TextField,
} from "@/primitive/components";
import { useMemoizedFn, useMount } from "ahooks";
import clsx from "clsx";
import { useSwarmStore } from "../store";
import {
  DESCRIPTION_LIMIT,
  LOGO_SIZE_IN_BYTE,
  LOGO_SIZE_IN_MB,
  IMAGE_ID,
} from "./constants";
import { isValidSolanaAddress } from "@/lib/utils/address";
import { validNumberInput } from "@/lib/utils/input-helper";
import { checkForm } from "@/app/[chain]/agent/[address]/chat/lib/form";
import { validateEmail } from "@/primitive/utils/email";

export function BasicForm() {
  const { form, updateForm, setStep, setForm } = useSwarmStore();
  const onLogoFileChange = useMemoizedFn((file?: File | null) => {
    if (!file) {
      return;
    }
    if (file.size > LOGO_SIZE_IN_BYTE) {
      message(`File size should be less than ${LOGO_SIZE_IN_MB}MB`, {
        type: "error",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const img = document.getElementById(IMAGE_ID) as HTMLImageElement;
      img.src = e.target?.result as string;
    };
    updateForm("basic", "image", {
      value: file,
      isInValid: false,
      errorMsg: "",
    });
    reader.readAsDataURL(file);
  });
  useMount(() => {
    onLogoFileChange(form.basic.image.value);
  });
  return (
    <>
      <div className='min-h-0 flex-1 h-full w-full flex flex-col gap-48 overflow-scroll'>
        <div className='w-full flex flex-col gap-16'>
          <FormItem label='Swarm Name' {...form.basic.name}>
            <TextField
              variant={form.basic.name.isInValid ? "error" : "normal"}
              value={form.basic.name.value}
              placeholder='e.g. Walle'
              onChange={(e) => {
                updateForm("basic", "name", {
                  value: e.target.value,
                  isInValid: false,
                  errorMsg: "",
                });
              }}
            />
          </FormItem>
          <FormItem label='Swarm Logo' {...form.basic.image}>
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
                className={clsx(
                  "relative h-[12.5rem] w-[12.5rem] rounded-6 bg-surface border border-white-20 flex items-center justify-center cursor-pointer",
                  {
                    "!border-red": form.basic.image.isInValid,
                  }
                )}
              >
                <ActionButton
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const img = document.getElementById(
                      IMAGE_ID
                    ) as HTMLImageElement;
                    img.src = "";
                    updateForm("basic", "image", {
                      value: null,
                      isInValid: false,
                      errorMsg: "",
                    });
                  }}
                  className={
                    form.basic.image.value
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
                  width={200}
                  height={200}
                  className={
                    form.basic.image.value
                      ? "w-full h-full object-contain rounded-6 absolute left-0 top-0 z-2"
                      : "hidden z-0"
                  }
                />
                <div
                  className={clsx(
                    "z-1 border text-black bg-white border-white-20 px-24 h-40 flex items-center justify-center rounded-6",
                    { "hidden z-0": form.basic.image.value }
                  )}
                >
                  Upload Image
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
              accept='.jpg,.png,.svg,.jpeg,.webp'
              size={5000}
            />
            <p className='text-text2'>
              120*120px recommended, jpg./png./svg. accepted, keep your size
              under 5M
            </p>
          </FormItem>
          <FormItem label='Description' {...form.basic.description}>
            <Card
              className={clsx("p-12 focus-within:border-white-40", {
                "border-red": form.basic.description.isInValid,
              })}
            >
              <textarea
                placeholder={"Less than 500 characters"}
                className='min-h-[76px] bg-transparent w-full focus-visible:outline-none placeholder:text-text2'
                value={form.basic.description.value}
                onChange={(e) => {
                  const value = e.target.value;
                  const isInvalid = value.length > DESCRIPTION_LIMIT;
                  updateForm("basic", "description", {
                    value: e.target.value,
                    isInValid: isInvalid,
                    errorMsg: isInvalid
                      ? `Description should be less than ${DESCRIPTION_LIMIT} characters`
                      : "",
                  });
                }}
              />
            </Card>
          </FormItem>
        </div>
        <div className='flex w-full flex-col gap-16'>
          <span className='text-size-16 font-bold'>Creator Details</span>
          <FormItem label='Email' {...form.basic.email}>
            <TextField
              variant={form.basic.email.isInValid ? "error" : "normal"}
              value={form.basic.email.value}
              onChange={(e) => {
                const value = e.target.value;
                const isValid = validateEmail(value);
                updateForm("basic", "email", {
                  value: value,
                  isInValid: !isValid,
                  errorMsg: isValid ? "" : "Invalid email address",
                });
              }}
            />
          </FormItem>
          <FormItem label='Receiver Address' {...form.basic.receiver}>
            <TextField
              variant={form.basic.receiver.isInValid ? "error" : "normal"}
              value={form.basic.receiver.value}
              onChange={(e) => {
                const value = e.target.value;
                const isValid = isValidSolanaAddress(value);
                updateForm("basic", "receiver", {
                  value: value,
                  isInValid: !isValid,
                  errorMsg: isValid ? "" : "Invalid Solana address",
                });
              }}
            />
            <span className='text-size-12 text-text2'>
              Enter the address where you'd like to receive royalty and payment
              for your sales mint and secondary.
            </span>
          </FormItem>
          <FormItem label='Royalty' {...form.basic.royalty}>
            <TextField
              variant={form.basic.royalty.isInValid ? "error" : "normal"}
              value={form.basic.royalty.value}
              placeholder='0-10%'
              suffixNode='%'
              onChange={(e) => {
                const value = validNumberInput(e.target.value, true);
                const isValid =
                  parseFloat(value) <= 10 && parseFloat(value) >= 0;
                updateForm("basic", "royalty", {
                  value: value,
                  isInValid: !isValid,
                  errorMsg: isValid ? "" : "Royalty must be between 0 and 10%",
                });
              }}
            />
            <span className='text-size-12 text-text2'>
              The royalty will be charged each time the NFTs are sold
            </span>
          </FormItem>
        </div>
        <div className='flex w-full flex-col gap-16'>
          <span className='text-size-16 font-bold'>Social Media(Optional)</span>
          <FormItem label='Website' {...form.basic.website}>
            <TextField
              variant={form.basic.website.isInValid ? "error" : "normal"}
              value={form.basic.website.value}
              onChange={(e) => {
                updateForm("basic", "website", {
                  value: e.target.value,
                  isInValid: false,
                  errorMsg: "",
                });
              }}
            />
          </FormItem>
          <FormItem label='Discord' {...form.basic.discord}>
            <TextField
              variant={form.basic.discord.isInValid ? "error" : "normal"}
              value={form.basic.discord.value}
              onChange={(e) => {
                updateForm("basic", "discord", {
                  value: e.target.value,
                  isInValid: false,
                  errorMsg: "",
                });
              }}
            />
          </FormItem>
          <FormItem label='Twitter Handle' {...form.basic.twitter}>
            <TextField
              variant={form.basic.twitter.isInValid ? "error" : "normal"}
              value={form.basic.twitter.value}
              onChange={(e) => {
                updateForm("basic", "twitter", {
                  value: e.target.value,
                  isInValid: false,
                  errorMsg: "",
                });
              }}
            />
          </FormItem>
        </div>
      </div>
      <div className='w-full pb-32 flex flex-col gap-16 items-center'>
        <Button
          onClick={() => {
            const { allValid, newForm } = checkForm(form.basic);
            if (!allValid) {
              setForm({
                ...form,
                basic: newForm,
              });
              return;
            }
            setStep("assets");
          }}
          className='w-full max-w-[400px]'
        >
          Next Step
        </Button>
      </div>
    </>
  );
}
