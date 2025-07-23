import {
  RadioButtonGroup,
  RadioButton,
  FormItem,
  TextField,
  ActionButton,
  IconClose,
  Card,
  Button,
  message,
} from "@/primitive/components";
import clsx from "clsx";
import { FILE_SIZE_IN_BYTE, FILE_SIZE_IN_MB, IMAGE_ID } from "../constants";
import { Container } from "./container";
import { useLaunchStore } from "../store";
import { Step } from "./content";
import { useConnectModalStore } from "@/components/connect-modal/store";
import { useMemoizedFn } from "ahooks";
import { useState } from "react";
import { useUserStore } from "@/app/layout/chain-provider/hook";
export function Base({
  step,
  onNextStep,
}: {
  step: Step;
  onNextStep: () => void;
}) {
  const { userAddress, openConnectModal } = useUserStore();
  const { form, updateForm } = useLaunchStore();
  const [mode, setMode] = useState<"simple" | "advance">("simple");
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
  return (
    <Container
      className='w-full my-64 mx-32 mobile:m-16'
      value='base'
      current={step}
    >
      <h1 className='text-size-24 font-bold'>Create Your Own AI Agent</h1>
      <p className='text-text2'>
        * Customize your own AI agent and launch it as an NFT!
        <br />
        * The AI agent is built on the ElizaOS framework.
        <br />* (Optional) Issue an agent token with your AI-NFT.
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
                placeholder="e.g. I'm Walle, and I'm here to make waves and change the game! How can I inspire you today? "
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
          onClick={() => {
            if (!userAddress) {
              openConnectModal();
              return;
            }
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
            onNextStep();
          }}
        >
          Next Step
        </Button>
      </div>
    </Container>
  );
}
