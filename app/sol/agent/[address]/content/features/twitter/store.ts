import { FormValue } from "@/primitive/components";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
export const POST_INTERVAL_MIN = 5; //minutes
export const POST_MAX_LENGTH = 200; //characters
const BaseForm = {
  userName: {
    value: "",
    required: true,
    isInValid: false,
    errorMsg: "",
  } as FormValue<string>,
  password: {
    value: "",
    required: true,
    isInValid: false,
    errorMsg: "",
  } as FormValue<string>,
  twoFa: {
    value: "",
    required: false,
    isInValid: false,
    errorMsg: "",
  } as FormValue<string>,
  email: {
    value: "",
    required: true,
    isInValid: false,
    errorMsg: "",
  } satisfies FormValue<string>,
  postIntervalMin: {
    value: 5,
    required: false,
    isInValid: false,
    errorMsg: "",
  } as FormValue<number>,
  postIntervalMax: {
    value: 30,
    required: false,
    isInValid: false,
    errorMsg: "",
  } as FormValue<number>,
  postImmediately: {
    value: false,
    required: false,
    isInValid: false,
    errorMsg: "",
  } as FormValue<boolean>,
  postSuspend: {
    value: false,
    required: false,
    isInValid: false,
    errorMsg: "",
  } as FormValue<boolean>,
  postMaxLength: {
    value: 30,
    required: false,
    isInValid: false,
    errorMsg: "",
  } as FormValue<number>,
  examples: {
    value: [""],
    required: false,
    isInValid: false,
    errorMsg: "",
  } as FormValue<string[]>,
  prompt: {
    value: "",
    required: false,
    isInValid: false,
    errorMsg: "",
  } as FormValue<string>,
  testContent: {
    value: "",
    required: false,
    isInValid: false,
    errorMsg: "",
  } as FormValue<string>,
};
export type FormKey = keyof typeof BaseForm;
type FromValueType = string | string[] | number | boolean;
export const useTwitterStore = create(
  immer<{
    form: typeof BaseForm;
    updateForm: (key: FormKey, value: FormValue<FromValueType>) => void;
    resetAll: () => void;
    setInitForm: (form: typeof BaseForm) => void;
  }>((set) => ({
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
