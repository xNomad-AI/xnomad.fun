import { FormValue } from "@/primitive/components";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

const BaseForm = {
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
  personality: {
    value: "",
    required: false,
    isInValid: false,
    errorMsg: "",
  } satisfies FormValue<string>,
  knowledge: {
    value: "",
    required: false,
    isInValid: false,
    errorMsg: "",
  } satisfies FormValue<string>,
  greeting: {
    value: "",
    required: false,
    isInValid: false,
    errorMsg: "",
  } satisfies FormValue<string>,
  lore: {
    value: "",
    required: false,
    isInValid: false,
    errorMsg: "",
  } satisfies FormValue<string>,
  style: {
    value: "",
    required: false,
    isInValid: false,
    errorMsg: "",
  } satisfies FormValue<string>,
  adjectives: {
    value: "",
    required: false,
    isInValid: false,
    errorMsg: "",
  } satisfies FormValue<string>,
};
export type FormKey = keyof typeof BaseForm;
type FromValueType = string | File | null;
type Step = "form" | "success" | "upload" | "mode" | "rarity";
export const useLaunchStore = create(
  immer<{
    step: Step;
    setStep: (step: Step) => void;
    form: typeof BaseForm;
    updateForm: (key: FormKey, value: FormValue<FromValueType>) => void;
    resetAll: () => void;
    setInitForm: (form: typeof BaseForm) => void;
  }>((set) => ({
    step: "mode",
    setStep: (step) =>
      set((state) => {
        state.step = step;
      }),
    collectionId: undefined,
    metadata: undefined,

    form: BaseForm,

    updateForm: (key, value) =>
      set((state) => {
        const form = state.form;
        const newObject = {
          ...form[key],
          ...value,
        };
        state.form = {
          ...form,
          [key]: newObject,
        };
      }),
    resetAll: () => {
      set((state) => {
        state.form = BaseForm;
      });
    },
    setInitForm: (form) => {
      set((state) => {
        state.form = form;
      });
    },
  }))
);
