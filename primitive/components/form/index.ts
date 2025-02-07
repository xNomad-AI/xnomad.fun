export * from "./item";
export interface FormValue<T> {
  value: T;
  required?: boolean;
  isInValid: boolean;
  errorMsg?: string;
}
