import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type FormField = {
  value: any;
  isInValid: boolean;
  errorMsg: string;
};

interface ApiKeyForm {
  name: FormField;
  expirationDays: FormField;
}

export const API_KEY_MIN_EXPIRATION = 1;
export const API_KEY_MAX_EXPIRATION = 365;

export const useApiKeyStore = create(
  immer<{
    form: ApiKeyForm;
    updateForm: (key: keyof ApiKeyForm, value: Partial<FormField>) => void;
    resetForm: () => void;
  }>((set) => {
    const defaultForm: ApiKeyForm = {
      name: {
        value: "",
        isInValid: false,
        errorMsg: "",
      },
      expirationDays: {
        value: 30,
        isInValid: false,
        errorMsg: "",
      },
    };

    return {
      form: defaultForm,
      updateForm: (key, value) => {
        set((state) => {
          state.form[key] = {
            ...state.form[key],
            ...value,
          };
        });
      },
      resetForm: () => {
        set((state) => {
          state.form = defaultForm;
        });
      },
    };
  })
); 