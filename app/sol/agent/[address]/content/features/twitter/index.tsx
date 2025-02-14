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
  Card,
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
      updateForm("prompt", {
        value: config?.templates.twitterPostTemplate,
        isInValid: false,
        errorMsg: "",
      });
    config?.settings.secrets?.POST_INTERVAL_MIN &&
      updateForm("postIntervalMin", {
        value: config?.settings.secrets.POST_INTERVAL_MIN,
        isInValid: false,
        errorMsg: "",
      });
    config?.settings.secrets?.POST_INTERVAL_MAX &&
      updateForm("postIntervalMax", {
        value: config?.settings.secrets.POST_INTERVAL_MAX,
        isInValid: false,
        errorMsg: "",
      });
    config?.settings.secrets?.POST_IMMEDIATELY &&
      updateForm("postImmediately", {
        value: config?.settings.secrets.POST_IMMEDIATELY,
        isInValid: false,
        errorMsg: "",
      });
    config?.settings.secrets?.TWITTER_LOGIN_SUSPEND &&
      updateForm("postSuspend", {
        value: config?.settings.secrets.TWITTER_LOGIN_SUSPEND,
        isInValid: false,
        errorMsg: "",
      });
    config?.settings.secrets?.MAX_LENGTH &&
      updateForm("postMaxLength", {
        value: config?.settings.secrets.MAX_LENGTH,
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
          <Card
            className={clsx("p-12 focus-within:border-white-40", {
              "border-red": form.prompt.isInValid,
            })}
          >
            <textarea
              placeholder={
                "Describe how your agent should behave on Twitter, what type of content should be posted, etc. It would be helpful to provide some tweet examples."
              }
              className='min-h-[76px] bg-transparent w-full focus-visible:outline-none placeholder:text-text2'
              value={form.prompt.value}
              onChange={(e) => {
                updateForm("prompt", {
                  value: e.target.value,
                  isInValid: false,
                  errorMsg: "",
                });
              }}
            />
          </Card>
        </FormItem>
        <FormItem label='Minimum Post-Interval' {...form.postIntervalMin}>
          <TextField
            value={form.postIntervalMin.value}
            placeholder='Enter min interval(minimum 5 minutes)'
            onBlur={() => {
              if (
                !form.postIntervalMin.value ||
                form.postIntervalMin.value < POST_INTERVAL_MIN
              ) {
                updateForm("postIntervalMin", {
                  value: POST_INTERVAL_MIN,
                  isInValid: false,
                  errorMsg: "",
                });
              }
            }}
            onChange={(e) => {
              const value = validNumberInput(e.target.value);
              updateForm("postIntervalMin", {
                value: value,
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
            onBlur={() => {
              if (
                !form.postIntervalMax.value ||
                form.postIntervalMax.value < form.postIntervalMin.value
              ) {
                updateForm("postIntervalMax", {
                  value: form.postIntervalMax.value,
                  isInValid: true,
                  errorMsg: "Max interval should be greater than min interval",
                });
              }
            }}
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
            value={form.postImmediately.value === "true"}
            onChange={(value) => {
              updateForm("postImmediately", {
                value: value ? "true" : "false",
                isInValid: false,
                errorMsg: "",
              });
            }}
          />
        </FormItem>
        {/* <FormItem label='Suspend Login' {...form.postSuspend}>
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
        </FormItem> */}
        <FormItem label='Maximum Post-Length' {...form.postMaxLength}>
          <TextField
            value={form.postMaxLength.value}
            placeholder='Enter max character length'
            onBlur={() => {
              if (
                !form.postMaxLength.value ||
                form.postMaxLength.value > POST_MAX_LENGTH
              ) {
                updateForm("postMaxLength", {
                  value: POST_MAX_LENGTH,
                  isInValid: false,
                  errorMsg: "",
                });
              }
            }}
            onChange={(e) => {
              const value = validNumberInput(e.target.value);
              updateForm("postMaxLength", {
                value: value,
                isInValid: false,
                errorMsg: "",
              });
            }}
            suffixNode={<span>characters</span>}
            variant={form.postMaxLength.isInValid ? "error" : "normal"}
          />
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
