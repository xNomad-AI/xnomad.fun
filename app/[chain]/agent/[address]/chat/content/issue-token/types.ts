import { FormValue } from "@/primitive/components";

export interface IssueTokenFormType {
  tokenName: FormValue<string>;
  description: FormValue<string>;
  twitter: FormValue<string>;
  telegram: FormValue<string>;
  website: FormValue<string>;
  image: FormValue<File | null>;
  symbol: FormValue<string>;
  amount: FormValue<string>;
}

export const initialIssueTokenForm: IssueTokenFormType = {
  tokenName: {
    value: "",
    required: true,
    isInValid: false,
    errorMsg: "",
  },
  description: {
    value: "",
    required: true,
    isInValid: false,
    errorMsg: "",
  },
  image: {
    value: null,
    required: true,
    isInValid: false,
    errorMsg: "",
  },
  symbol: {
    value: "",
    required: true,
    isInValid: false,
    errorMsg: "",
  },
  telegram: {
    value: "",
    required: false,
    isInValid: false,
    errorMsg: "",
  },
  amount: {
    value: "",
    required: false,
    isInValid: false,
    errorMsg: "",
  },
  website: {
    value: "",
    required: false,
    isInValid: false,
    errorMsg: "",
  },
  twitter: {
    value: "",
    required: false,
    isInValid: false,
    errorMsg: "",
  },
};
