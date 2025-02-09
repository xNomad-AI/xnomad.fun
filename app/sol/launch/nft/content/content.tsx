"use client";
import {
  ActionButton,
  Button,
  Card,
  FormItem,
  IconClose,
  IconInfo,
  message,
  RadioButton,
  RadioButtonGroup,
  Spin,
  TextField,
  Tooltip,
} from "@/primitive/components";
import { useLaunchStore } from "../store";
import { useRef, useState } from "react";
import { useMemoizedFn } from "ahooks";
import { FILE_SIZE_IN_BYTE, FILE_SIZE_IN_MB, IMAGE_ID } from "../constants";
import clsx from "clsx";
import { TextWithEllipsis } from "@/components/text-with-ellipsis";
import { bungee } from "@/app/layout/font";
import { api } from "@/primitive/api";
import { CreatePreCheck, uploadMetaData } from "../network";
import { onError } from "@/lib/utils/error";
import { useWallet } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";
import { useSolana } from "@/lib/hooks/use-solana";
import { useConnectModalStore } from "@/components/connect-modal/store";
import { useRouter } from "next/navigation";
import { Container } from "./container";
export type Step = "base" | "review" | "creating" | "success";
const EXPIRED_TIME_IN_SECOND = 60;
export function Content() {
  const { form, updateForm, resetAll } = useLaunchStore();
  const router = useRouter();
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const { setVisible } = useConnectModalStore();
  const [mode, setMode] = useState<"simple" | "advance">("simple");
  const [step, setStep] = useState<Step>("base");
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
    updateForm("image", {
      value: file,
      isInValid: false,
      errorMsg: "",
    });
    reader.readAsDataURL(file);
  });
  const [preCheck, setPreCheck] = useState<CreatePreCheck | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [imageMetadata, setImageMetadata] = useState<string | null>(null);
  const lastSubmitTime = useRef(0);
  const submit = useMemoizedFn(async () => {
    if (!publicKey) {
      setVisible(true);
      return;
    }
    setSubmitting(true);
    try {
      const imageUrl =
        imageMetadata || (await uploadMetaData(form.image.value as File));
      setImageMetadata(imageUrl);
      const res = await api.v1.post<CreatePreCheck>(
        "/launchpad/solana/create-common-collection-nft",
        {
          nft: {
            adjectives: form.adjectives.value.split(","),
            description: form.description.value,
            greeting: form.greeting.value,
            image: imageUrl,
            knowledge: form.knowledge.value.split("."),
            lore: form.lore.value.split(","),
            name: form.name.value,
            personality: form.personality.value.split(","),
            style: form.style.value.split(","),
          },
          userAddress: publicKey?.toBase58(),
        }
      );
      lastSubmitTime.current = Date.now();
      setSubmitting(false);
      setPreCheck(res);
      setStep("review");
    } catch (error) {
      onError(error);
      setSubmitting(false);
    }
  });
  const { connection, inspectTransaction } = useSolana();
  const create = useMemoizedFn(async () => {
    if (Date.now() - lastSubmitTime.current > EXPIRED_TIME_IN_SECOND * 1000) {
      message("Transaction info expired, please submit again", {
        type: "error",
      });
      setStep("base");
      return;
    }
    if (!preCheck || !signTransaction || !sendTransaction) {
      return;
    }
    try {
      const versionTx = VersionedTransaction.deserialize(
        new Uint8Array(Buffer.from(preCheck.tx, "hex"))
      );
      setStep("creating");
      const res = await signTransaction(versionTx);
      const tx = await connection.sendTransaction(res, {
        preflightCommitment: "confirmed",
      });
      inspectTransaction(tx).then(() => {
        setStep("success");
        resetAll();
      });
    } catch (error) {
      setStep("review");
      onError(error);
    }
  });
  return (
    <div className='w-full flex flex-col gap-16 items-center p-16'>
      <Container
        className='w-full my-64 mx-32 mobile:m-16'
        value='base'
        current={step}
      >
        <h1 className='text-size-24 font-bold'>Create An AI-NFT</h1>
        <p>
          Notice: The AI-NFTs you create will be in the [Nomads Society]
          collection.
        </p>
        <RadioButtonGroup disableAnimation onChange={setMode} value={mode}>
          <RadioButton value='simple'>Simple Mode</RadioButton>
          <RadioButton value='advance'>Advanced Mode</RadioButton>
        </RadioButtonGroup>
        <FormItem label='Name' {...form.name}>
          <TextField
            variant={form.name.isInValid ? "error" : "normal"}
            value={form.name.value}
            placeholder='e.g. Walle'
            onChange={(e) => {
              updateForm("name", {
                value: e.target.value,
                isInValid: false,
                errorMsg: "",
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
              className='relative h-[12.5rem] w-[12.5rem] rounded-6 bg-surface border border-white-20 flex items-center justify-center cursor-pointer'
            >
              <ActionButton
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  const img = document.getElementById(
                    IMAGE_ID
                  ) as HTMLImageElement;
                  img.src = "";
                  updateForm("image", {
                    value: null,
                    isInValid: false,
                    errorMsg: "",
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
                width={200}
                height={200}
                className={
                  form.image.value
                    ? "w-full h-full object-contain rounded-6 absolute left-0 top-0 z-2"
                    : "hidden z-0"
                }
              />
              <div
                className={clsx(
                  "z-1 border text-black bg-white border-white-20 px-24 h-40 flex items-center justify-center rounded-6",
                  { "hidden z-0": form.image.value }
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
            Please upload your image with a maximum size of 5MB. Ensure that the
            content is appropriate and does not contain any sensitive material.
          </p>
        </FormItem>
        <FormItem label='Description' {...form.description}>
          <Card
            className={clsx("p-12 focus-within:border-white-40", {
              "border-red": form.description.isInValid,
            })}
          >
            <textarea
              placeholder={`e.g. Walle is a small, diligent robot designed to clean Earth's waste.
He has spent centuries compacting trash while developing a fascination for human artifacts.
His most prized possession is a VHS tape of Hello, Dolly!.
He longs for companionship and dreams of love.
When he meets EVE, he follows her across space on an adventure.
Despite his mechanical nature, he displays deep emotions and loyalty.`}
              className='min-h-[76px] bg-transparent w-full focus-visible:outline-none placeholder:text-text2'
              value={form.description.value}
              onChange={(e) => {
                updateForm("description", {
                  value: e.target.value,
                  isInValid: false,
                  errorMsg: "",
                });
              }}
            />
          </Card>
        </FormItem>
        {mode === "advance" && (
          <>
            <FormItem label='Personality' {...form.personality}>
              <Card
                className={clsx("p-12 focus-within:border-white-40", {
                  "border-red": form.personality.isInValid,
                })}
              >
                <textarea
                  className='min-h-[76px] bg-transparent w-full focus-visible:outline-none placeholder:text-text2'
                  value={form.personality.value}
                  placeholder='e.g. Curious, Loyal, Gentle, Playful, Determined, Romantic'
                  onChange={(e) => {
                    updateForm("personality", {
                      value: e.target.value,
                      isInValid: false,
                      errorMsg: "",
                    });
                  }}
                />
              </Card>
            </FormItem>
            <FormItem label='Greeting' {...form.greeting}>
              <Card
                className={clsx("p-12 focus-within:border-white-40", {
                  "border-red": form.greeting.isInValid,
                })}
              >
                <textarea
                  className='min-h-[76px] bg-transparent w-full focus-visible:outline-none placeholder:text-text2'
                  value={form.greeting.value}
                  placeholder="e.g. Brave, Kind, Resourceful, Loving, Nostalgic, PersistentHey! I'm Wallet, and I'm here to make waves and change the game! How can I inspire you today? "
                  onChange={(e) => {
                    updateForm("greeting", {
                      value: e.target.value,
                      isInValid: false,
                      errorMsg: "",
                    });
                  }}
                />
              </Card>
            </FormItem>
            <FormItem label='Lore' {...form.lore}>
              <Card
                className={clsx("p-12 focus-within:border-white-40", {
                  "border-red": form.lore.isInValid,
                })}
              >
                <textarea
                  className='min-h-[76px] bg-transparent w-full focus-visible:outline-none placeholder:text-text2'
                  value={form.lore.value}
                  placeholder={`e.g. Walle was left behind on a deserted Earth covered in garbage.
He continued working long after humanity left the planet.
Over centuries, he developed emotions and a whimsical personality.
He befriended a small cockroach named Hal.
His love for EVE led him on a journey through space.
He ultimately played a key role in bringing humanity back to Earth.`}
                  onChange={(e) => {
                    updateForm("lore", {
                      value: e.target.value,
                      isInValid: false,
                      errorMsg: "",
                    });
                  }}
                />
              </Card>
            </FormItem>
            <FormItem label='Style' {...form.style}>
              <Card
                className={clsx("p-12 focus-within:border-white-40", {
                  "border-red": form.style.isInValid,
                })}
              >
                <textarea
                  className='min-h-[76px] bg-transparent w-full focus-visible:outline-none placeholder:text-text2'
                  value={form.style.value}
                  placeholder='e.g. Innocent, Hopeful, Expressive, Nonverbal, Gestural, Emotion-driven'
                  onChange={(e) => {
                    updateForm("style", {
                      value: e.target.value,
                      isInValid: false,
                      errorMsg: "",
                    });
                  }}
                />
              </Card>
            </FormItem>
            <FormItem label='Adjectives' {...form.adjectives}>
              <Card
                className={clsx("p-12 focus-within:border-white-40", {
                  "border-red": form.adjectives.isInValid,
                })}
              >
                <textarea
                  className='min-h-[76px] bg-transparent w-full focus-visible:outline-none placeholder:text-text2'
                  value={form.adjectives.value}
                  placeholder='e.g. Brave, Kind, Resourceful, Loving, Nostalgic, Persistent'
                  onChange={(e) => {
                    updateForm("adjectives", {
                      value: e.target.value,
                      isInValid: false,
                      errorMsg: "",
                    });
                  }}
                />
              </Card>
            </FormItem>
          </>
        )}
        <FormItem label='Knowledge' {...form.knowledge}>
          <Card
            className={clsx("p-12 focus-within:border-white-40", {
              "border-red": form.knowledge.isInValid,
            })}
          >
            <textarea
              className='min-h-[76px] bg-transparent w-full focus-visible:outline-none placeholder:text-text2'
              value={form.knowledge.value}
              placeholder={`e.g. Walle understands waste management and recycling processes.
He has gathered extensive knowledge from human artifacts found in the trash.
He recognizes and appreciates music, film, and small wonders of the past.
He knows how to repair himself using spare parts from other Walle units.
He understands basic spaceflight after traveling aboard the Axiom.
He has learned about plants and their significance in restoring life to Earth.`}
              onChange={(e) => {
                updateForm("knowledge", {
                  value: e.target.value,
                  isInValid: false,
                  errorMsg: "",
                });
              }}
            />
          </Card>
        </FormItem>
        <div className='h-0 w-full'></div>
        <div className='w-full flex items-center justify-center'>
          <Button
            className='max-w-[25rem] !w-full'
            loading={submitting}
            onClick={() => {
              if (
                Object.keys(form).some(
                  (key) => form[key as keyof typeof form].isInValid
                )
              ) {
                return;
              }
              let allValid = true;
              Object.keys(form).forEach((_key) => {
                const key = _key as keyof typeof form;
                if (typeof form[key].value === "boolean") {
                  return;
                }
                if (form[key].required && !form[key].value) {
                  updateForm(key, {
                    isInValid: true,
                    errorMsg: "This field is required",
                    value: form[key].value,
                  });
                  allValid = false;
                }
              });
              if (!allValid) return;
              submit();
            }}
          >
            {submitting ? "Checking" : "Next Step"}
          </Button>
        </div>
      </Container>
      <Container
        className='w-full my-64 mx-32 mobile:m-16'
        value='review'
        current={step}
      >
        <h1 className='text-size-24 font-bold'>Confirm Creating</h1>
        <Card className='w-full p-16 flex items-center gap-24'>
          <img
            height={80}
            width={80}
            className='flex-shrink-0 rounded-12 object-contain w-[80px] aspect-square'
            src={form.image.value ? URL.createObjectURL(form.image.value) : ""}
          />
          <TextWithEllipsis
            className={clsx("flex-1 text-size-24", bungee.className)}
          >
            {form.name.value}
          </TextWithEllipsis>
        </Card>
        <div className='w-full flex flex-col gap-16'>
          <div className='flex items-center justify-between w-full'>
            <span>AI-NFT Creating Fee</span>
            <p className={"font-bold"}>
              <span
                className={clsx({
                  "line-through text-text2":
                    (preCheck?.discountPercentage ?? 0) > 0,
                })}
              >
                {preCheck?.fee} SOL
              </span>
              {(preCheck?.discountPercentage ?? 0) > 0 && (
                <span>&nbsp;{preCheck?.feeAfterDiscount} SOL</span>
              )}
            </p>
          </div>
          <div className='flex items-center justify-between w-full'>
            <div className='flex items-center gap-4'>
              Discount{" "}
              <Tooltip
                content={"xNomad holders enjoy a 70% reduction in creating fee"}
                contentClassName='!w-fit'
              >
                <IconInfo />
              </Tooltip>
            </div>
            {(preCheck?.discountPercentage ?? 0) > 0 ? (
              <div className='flex items-center gap-8'>
                <div className='h-18 px-4 flex items-center text-black text-size-12 bg-[url(/tag-bg.webp)] bg-no-repeat bg-center bg-cover rounded-4'>
                  xNomad Holder
                </div>
                <span>{preCheck?.discountPercentage ?? 0}% off</span>
              </div>
            ) : (
              <span>0</span>
            )}
          </div>
          <span className='text-size-12 italic text-red'>
            * Please create NFT within {EXPIRED_TIME_IN_SECOND}s
          </span>
        </div>
        <div></div>
        <div className='w-full flex items-center justify-center'>
          <Button
            loading={submitting}
            onClick={() => {
              create();
            }}
            className='!w-full max-w-[400px]'
          >
            Create
          </Button>
        </div>
      </Container>
      <Container
        className='h-[calc(100vh-64px)] justify-center items-center'
        value='creating'
        current={step}
      >
        <Spin className='!text-[64px]' />
        <p className='text-center text-size-16 font-bold'>
          Estimated time is about 3 minutes. Please do not close the page until
          asset submission is completed.
        </p>
      </Container>
      <Container
        className='h-[calc(100vh-64px)] justify-center items-center'
        value='success'
        current={step}
      >
        <img
          height={320}
          width={320}
          className='flex-shrink-0 rounded-12 border object-contain border-white-20 w-[20rem] aspect-square'
          src={imageMetadata ?? ""}
        />
        <p className='text-center text-size-20 font-bold'>
          Congratulations! Your AI-NFT was launched successfully!
        </p>
        <div className='w-full flex items-center justify-center'>
          <Button
            className='!w-full max-w-[400px]'
            onClick={() => {
              resetAll();
              router.push(`/sol/profile/${publicKey?.toBase58()}`);
            }}
          >
            View My AI-NFT
          </Button>
        </div>
      </Container>
    </div>
  );
}
