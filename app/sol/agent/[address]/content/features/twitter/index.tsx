import {
  Modal,
  ModalTitleWithBorder,
  ModalContent,
  FormItem,
  TextField,
  IconAdd,
  IconRemove,
  IconEye,
  IconEyeClosed,
  Button,
} from "@/primitive/components";
import { useTwitterStore } from "./store";
import clsx from "clsx";
import { Config } from "../types";
import { useEffect, useRef, useState } from "react";
import { useMemoizedFn } from "ahooks";

export function TwitterModal({
  open,
  onClose,
  config,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  config?: Config;
  onSave: (config: Config) => void;
}) {
  const { form, updateForm } = useTwitterStore();
  const [saving, setSaving] = useState(false);
  const initForm = useMemoizedFn(() => {
    config?.character.settings.secrets.TWITTER_USERNAME &&
      updateForm("userName", {
        value: config?.character.settings.secrets.TWITTER_USERNAME,
        isInValid: false,
        errorMsg: "",
      });
    config?.character.settings.secrets.TWITTER_PASSWORD &&
      updateForm("password", {
        value: config?.character.settings.secrets.TWITTER_PASSWORD,
        isInValid: false,
        errorMsg: "",
      });
    config?.character.settings.secrets.TWITTER_2FA_SECRET &&
      updateForm("twoFa", {
        value: config?.character.settings.secrets.TWITTER_2FA_SECRET,
        isInValid: false,
        errorMsg: "",
      });
    config?.character.settings.secrets.TWITTER_EMAIL &&
      updateForm("email", {
        value: config?.character.settings.secrets.TWITTER_EMAIL,
        isInValid: false,
        errorMsg: "",
      });
    config?.character.postExamples &&
      updateForm("examples", {
        value: config?.character.postExamples,
        isInValid: false,
        errorMsg: "",
      });
  });
  useEffect(() => {
    setSaving(false);
    initForm();
  }, [open]);
  const scrollIntoBar = useRef<HTMLDivElement | null>(null);
  const [seePassword, setSeePassword] = useState(false);
  return (
    <Modal open={open} size='m' onMaskClick={onClose}>
      <ModalTitleWithBorder closable onClose={onClose}>
        Twitter Integration
      </ModalTitleWithBorder>
      <ModalContent className='gap-16 max-h-[600px] overflow-auto pb-0'>
        <FormItem label='User Name' {...form.userName}>
          <TextField
            value={form.userName.value}
            placeholder='Enter your username'
            onChange={(e) => {
              updateForm("userName", {
                value: e.target.value,
                isInValid: false,
                errorMsg: "",
              });
            }}
            variant={form.userName.isInValid ? "error" : "normal"}
          />
        </FormItem>
        <FormItem label='Password' {...form.password}>
          <TextField
            type={seePassword ? "text" : "password"}
            value={form.password.value}
            placeholder='Enter your password'
            onChange={(e) => {
              updateForm("password", {
                value: e.target.value,
                isInValid: false,
                errorMsg: "",
              });
            }}
            variant={form.password.isInValid ? "error" : "normal"}
            suffixNode={
              !seePassword ? (
                <button
                  onClick={() => {
                    setSeePassword(true);
                  }}
                >
                  <IconEye />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSeePassword(false);
                  }}
                >
                  <IconEyeClosed />
                </button>
              )
            }
          />
        </FormItem>
        <FormItem label='2FA Secret' {...form.twoFa}>
          <TextField
            value={form.twoFa.value}
            placeholder='Enter your 2FA secret'
            onChange={(e) => {
              updateForm("twoFa", {
                value: e.target.value,
                isInValid: false,
                errorMsg: "",
              });
            }}
            variant={form.twoFa.isInValid ? "error" : "normal"}
          />
        </FormItem>
        <FormItem label='Email' {...form.email}>
          <TextField
            value={form.email.value}
            placeholder='Enter your email'
            onChange={(e) => {
              updateForm("email", {
                value: e.target.value,
                isInValid: false,
                errorMsg: "",
              });
            }}
            variant={form.email.isInValid ? "error" : "normal"}
          />
        </FormItem>
        <FormItem label='Example Tweets(Max 10)' {...form.examples}>
          {form.examples.value.map((example, index) => {
            return (
              <div key={index} className='w-full flex items-center gap-16'>
                <TextField
                  value={example}
                  className='w-full'
                  placeholder='e.g. Be water, my friend.'
                  onChange={(e) => {
                    const newExamples = [...form.examples.value];
                    newExamples[index] = e.target.value;
                    updateForm("examples", {
                      value: newExamples,
                      isInValid: false,
                      errorMsg: "",
                    });
                  }}
                  variant={form.email.isInValid ? "error" : "normal"}
                />
                {form.examples.value.length > 1 &&
                index < form.examples.value.length - 1 ? (
                  <button
                    className='h-32 w-32 flex items-center justify-center'
                    onClick={() => {
                      const newExamples = [...form.examples.value];
                      newExamples.splice(index, 1);
                      updateForm("examples", {
                        value: newExamples,
                        isInValid: false,
                        errorMsg: "",
                      });
                    }}
                  >
                    <IconRemove className='text-size-20' />
                  </button>
                ) : (
                  <button
                    className={clsx(
                      "h-32 w-32 flex items-center justify-center",
                      {
                        "cursor-not-allowed": form.examples.value.length >= 10,
                      }
                    )}
                    onClick={() => {
                      if (form.examples.value.length >= 10) return;
                      const newExamples = [...form.examples.value];
                      newExamples.push("");
                      updateForm("examples", {
                        value: newExamples,
                        isInValid: false,
                        errorMsg: "",
                      });
                      setTimeout(() => {
                        scrollIntoBar.current?.scrollIntoView({
                          behavior: "smooth",
                        });
                      }, 50);
                    }}
                  >
                    <IconAdd className='text-size-20' />
                  </button>
                )}
              </div>
            );
          })}
          <div ref={scrollIntoBar} className='w-full h-0'></div>
        </FormItem>
        <div className='w-full flex items-center gap-16 sticky bottom-0 py-24 -mt-24 bg-background'>
          <Button variant='secondary' stretch onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={saving}
            stretch
            onClick={() => {
              if (Object.values(form).some((item) => item.isInValid)) return;
              let allValid = true;
              for (const _key in form) {
                const key = _key as keyof typeof form;
                if (form[key].required && !form[key].value) {
                  allValid = false;
                  updateForm(key, {
                    ...form[key],
                    isInValid: true,
                    errorMsg: "This field is required",
                  });
                }
              }
              if (!allValid) return;
              setSaving(true);
              onSave({
                character: {
                  postExamples: form.examples.value,
                  settings: {
                    secrets: {
                      TWITTER_USERNAME: form.userName.value,
                      TWITTER_PASSWORD: form.password.value,
                      TWITTER_2FA_SECRET: form.twoFa.value,
                      TWITTER_EMAIL: form.email.value,
                    },
                  },
                },
              });
            }}
          >
            Save
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
