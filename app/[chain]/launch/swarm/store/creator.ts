import { FormValue } from "@/primitive/components";
import { createStore } from "zustand";
import { immer } from "zustand/middleware/immer";
export interface Stage {
  name: FormValue<string>;
  price: FormValue<string>;
  maxMintPerAddress: FormValue<string>;
  startTime: FormValue<string>;
  endTime: FormValue<string>;
}
export interface WhitelistStage extends Stage {
  whitelistAddresses: FormValue<File | null>;
}
const BasicForm = {
  name: {
    value: "",
    required: true,
    isInValid: false,
    errorMsg: "",
  } satisfies FormValue<string>,
  image: {
    value: null,
    required: true,
    isInValid: false,
    errorMsg: "",
  } as FormValue<File | null>,
  description: {
    value: "",
    required: true,
    isInValid: false,
    errorMsg: "",
  } satisfies FormValue<string>,
  email: {
    value: "",
    required: true,
    isInValid: false,
    errorMsg: "",
  } satisfies FormValue<string>,
  receiver: {
    value: "",
    required: true,
    isInValid: false,
    errorMsg: "",
  } satisfies FormValue<string>,
  royalty: {
    value: "",
    required: true,
    isInValid: false,
    errorMsg: "",
  } satisfies FormValue<string>,
  website: {
    value: "",
    required: false,
    isInValid: false,
    errorMsg: "",
  } satisfies FormValue<string>,
  discord: {
    value: "",
    required: false,
    isInValid: false,
    errorMsg: "",
  } satisfies FormValue<string>,
  twitter: {
    value: "",
    required: false,
    isInValid: false,
    errorMsg: "",
  } satisfies FormValue<string>,
};
const assetsForm = {
  assets: {
    value: null,
    required: true,
    isInValid: false,
    errorMsg: "",
  } as FormValue<File | null>,
};
const AgentForm = {
  background: {
    value: "",
    required: true,
    isInValid: false,
    errorMsg: "",
  } satisfies FormValue<string>,
  style: {
    value: "",
    required: true,
    isInValid: false,
    errorMsg: "",
  } satisfies FormValue<string>,
};
export const emptyStage: Stage = {
  name: {
    value: "",
    required: true,
    isInValid: false,
    errorMsg: "",
  } satisfies FormValue<string>,
  price: {
    value: "",
    required: true,
    isInValid: false,
    errorMsg: "",
  } satisfies FormValue<string>,
  maxMintPerAddress: {
    value: "",
    required: true,
    isInValid: false,
    errorMsg: "",
  } satisfies FormValue<string>,
  startTime: {
    value: "",
    required: true,
    isInValid: false,
    errorMsg: "",
  } satisfies FormValue<string>,
  endTime: {
    value: "",
    required: true,
    isInValid: false,
    errorMsg: "",
  } satisfies FormValue<string>,
};
export const emptyWhitelistStage: WhitelistStage = {
  ...emptyStage,
  whitelistAddresses: {
    value: null,
    required: true,
    isInValid: false,
    errorMsg: "",
  } satisfies FormValue<File | null>,
};
const mintForm = {
  whitelistStages: {
    value: [],
    required: false,
    isInValid: false,
    errorMsg: "",
  } as FormValue<WhitelistStage[]>,
  publicStages: {
    value: [emptyStage],
    required: false,
    isInValid: false,
    errorMsg: "",
  } as FormValue<Stage[]>,
};
const BaseForm = {
  basic: BasicForm,
  assets: assetsForm,
  agent: AgentForm,
  mint: mintForm,
};
export const steps = [
  "basic",
  "assets",
  "agent",
  "mint",
  "waiting",
  "success",
] as const;
export const stepTitles = {
  basic: "Details",
  assets: "Assets",
  agent: "Agent Setting",
  mint: "Mint Setting",
  waiting: "Waiting",
  success: "Success",
};
export type Step = (typeof steps)[number];
export type Form = keyof typeof BaseForm;
export type FormKey =
  | keyof typeof BaseForm.basic
  | keyof typeof BaseForm.assets
  | keyof typeof BaseForm.agent
  | keyof typeof BaseForm.mint;
type FromValueType = string | File | Stage[] | WhitelistStage[] | null;
export const createSwarmStore = () =>
  createStore(
    immer<{
      form: typeof BaseForm;
      updateForm: (
        form: Form,
        key: FormKey,
        value: FormValue<FromValueType>
      ) => void;
      resetAll: () => void;
      step: Step;
      setStep: (step: Step) => void;
      setForm: (form: typeof BaseForm) => void;
    }>((set) => ({
      step: "basic",
      setStep: (step) => {
        set((state) => {
          state.step = step;
        });
      },
      form: BaseForm,

      updateForm: (form, key, value) =>
        set((state) => {
          const newForm: any = { ...state.form[form] };
          newForm[key] = {
            ...newForm[key],
            ...value,
          };
          state.form[form] = newForm;
        }),
      resetAll: () => {
        set((state) => {
          state.form = BaseForm;
        });
      },
      setForm: (form) => {
        set((state) => {
          state.form = form;
        });
      },
    }))
  );
