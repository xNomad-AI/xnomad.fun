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
  message,
  Toggle,
} from "@/primitive/components";
import { POST_INTERVAL_MIN, POST_MAX_LENGTH, useTwitterStore } from "./store";
import clsx from "clsx";
import { Config } from "../types";
import { useEffect, useRef, useState } from "react";
import { useMemoizedFn } from "ahooks";
import { onError } from "@/lib/utils/error";
import { TextAnchor } from "@/components/text-button";
import { validNumberInput } from "@/lib/utils/input-helper";

export function TwitterModal({
  open,
  onClose,
  config,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  config?: Config;
  onSave: (config: Partial<Config>, testContent?: string) => Promise<void>;
}) {
  const { form, updateForm } = useTwitterStore();
  const [saving, setSaving] = useState(false);
  const initForm = useMemoizedFn(() => {
    config?.settings.secrets?.TWITTER_USERNAME &&
      updateForm("userName", {
        value: config?.settings.secrets.TWITTER_USERNAME,
        isInValid: false,
        errorMsg: "",
      });
    config?.settings.secrets?.TWITTER_PASSWORD &&
      updateForm("password", {
        value: config?.settings.secrets.TWITTER_PASSWORD,
        isInValid: false,
        errorMsg: "",
      });
    config?.settings.secrets?.TWITTER_2FA_SECRET &&
      updateForm("twoFa", {
        value: config?.settings.secrets.TWITTER_2FA_SECRET,
        isInValid: false,
        errorMsg: "",
      });
    config?.settings.secrets?.TWITTER_EMAIL &&
      updateForm("email", {
        value: config?.settings.secrets.TWITTER_EMAIL,
        isInValid: false,
        errorMsg: "",
      });
    config?.postExamples &&
      updateForm("examples", {
        value: config?.postExamples,
        isInValid: false,
        errorMsg: "",
      });
    config?.templates?.twitterPostTemplate &&
      updateForm("examples", {
        value: config?.templates.twitterPostTemplate,
        isInValid: false,
        errorMsg: "",
      });
    updateForm("testContent", {
      value: "",
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
        <FormItem
          suffix={
            <TextAnchor
              withDecoration
              href='https://docs.xnomad.ai/xnomad.fun/ai-agent-interaction-guide'
            >
              Tutorial
            </TextAnchor>
          }
          label='User Name'
          {...form.userName}
        >
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
        <FormItem label='2FA Secret' {...form.twoFa}>
          <TextField
            value={form.twoFa.value}
            placeholder='Enter your 2FA secret. It must be 16 uppercase letters or numbers.'
            onChange={(e) => {
              updateForm("twoFa", {
                value: e.target.value.toUpperCase(),
                isInValid: false,
                errorMsg: "",
              });
            }}
            variant={form.twoFa.isInValid ? "error" : "normal"}
          />
        </FormItem>
        <FormItem label='Prompt' {...form.prompt}>
          <TextField
            value={form.prompt.value}
            placeholder='Enter your prompt'
            onChange={(e) => {
              updateForm("prompt", {
                value: e.target.value,
                isInValid: false,
                errorMsg: "",
              });
            }}
            variant={form.prompt.isInValid ? "error" : "normal"}
          />
        </FormItem>
        <FormItem label='Minimum Post-Interval' {...form.postIntervalMin}>
          <TextField
            value={form.postIntervalMin.value}
            placeholder='Enter min interval(minimum 5 minutes)'
            onChange={(e) => {
              const value = validNumberInput(e.target.value);
              updateForm("postIntervalMin", {
                value:
                  !value || parseFloat(value) < POST_INTERVAL_MIN
                    ? POST_INTERVAL_MIN
                    : value,
                isInValid: false,
                errorMsg: "",
              });
            }}
            suffixNode={<span>minutes</span>}
            variant={form.postIntervalMin.isInValid ? "error" : "normal"}
          />
        </FormItem>
        <FormItem label='Maximum Post-Interval' {...form.postIntervalMax}>
          <TextField
            value={form.postIntervalMax.value}
            placeholder='Enter max interval'
            onChange={(e) => {
              updateForm("postIntervalMax", {
                value: validNumberInput(e.target.value),
                isInValid: false,
                errorMsg: "",
              });
            }}
            suffixNode={<span>minutes</span>}
            variant={form.postIntervalMax.isInValid ? "error" : "normal"}
          />
        </FormItem>
        <FormItem label='Post Immediately' {...form.postImmediately}>
          <Toggle
            value={form.postImmediately.value}
            onChange={(value) => {
              updateForm("postImmediately", {
                value,
                isInValid: false,
                errorMsg: "",
              });
            }}
          />
        </FormItem>
        <FormItem label='Suspend Login' {...form.postSuspend}>
          <Toggle
            value={form.postSuspend.value}
            onChange={(value) => {
              updateForm("postSuspend", {
                value,
                isInValid: false,
                errorMsg: "",
              });
            }}
          />
        </FormItem>
        <FormItem label='Maximum Post-Length' {...form.postMaxLength}>
          <TextField
            value={form.postMaxLength.value}
            placeholder='Enter max character length'
            onChange={(e) => {
              const value = validNumberInput(e.target.value);
              updateForm("postMaxLength", {
                value:
                  value && parseFloat(value) > POST_MAX_LENGTH
                    ? POST_MAX_LENGTH
                    : value,
                isInValid: false,
                errorMsg: "",
              });
            }}
            suffixNode={<span>characters</span>}
            variant={form.postMaxLength.isInValid ? "error" : "normal"}
          />
        </FormItem>
        <FormItem label='Test Content' {...form.testContent}>
          <TextField
            value={form.testContent.value}
            placeholder='Test twitter content'
            onChange={(e) => {
              updateForm("testContent", {
                value: e.target.value,
                isInValid: false,
                errorMsg: "",
              });
            }}
            variant={form.testContent.isInValid ? "error" : "normal"}
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
              onSave(
                {
                  postExamples: form.examples.value,
                  templates: {
                    twitterPostTemplate: form.prompt.value,
                  },
                  settings: {
                    secrets: {
                      TWITTER_USERNAME: form.userName.value,
                      TWITTER_PASSWORD: form.password.value,
                      TWITTER_2FA_SECRET: form.twoFa.value,
                      TWITTER_EMAIL: form.email.value,
                      POST_INTERVAL_MIN: form.postIntervalMin.value,
                      POST_INTERVAL_MAX: form.postIntervalMax.value,
                      POST_IMMEDIATELY: form.postImmediately.value,
                      TWITTER_LOGIN_SUSPEND: form.postSuspend.value,
                      MAX_LENGTH: form.postMaxLength.value,
                    },
                  },
                },
                form.testContent.value
              )
                .then(() => {
                  message("Twitter integration updated successfully", {
                    type: "success",
                  });

                  setSaving(false);
                  onClose();
                })
                .catch((error) => {
                  onError(error);
                  setSaving(false);
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
