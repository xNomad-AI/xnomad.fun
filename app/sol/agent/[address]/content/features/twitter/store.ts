import { FormValue } from "@/primitive/components";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

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
  examples: {
    value: [""],
    required: false,
    isInValid: false,
    errorMsg: "",
  } as FormValue<string[]>,
  testContent: {
    value: "",
    required: false,
    isInValid: false,
    errorMsg: "",
  } as FormValue<string>,
};
export type FormKey = keyof typeof BaseForm;
type FromValueType = string | string[];
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
