import { createContext, RefObject, useContext } from 'react';

export type RadioButtonGroupContext<T = any> = {
  value?: T;
  onChange?: (value: T) => void;
  initialized: boolean;
  setInitialized?: (value: boolean) => void;
  container: RefObject<HTMLDivElement | null>;
  width?: string;
  disableAnimation?: boolean;
  variant: RadioButtonVariant;
};

export type RadioButtonVariant = 'normal' | 'reverse';

export const radioButtonGroupContext = createContext<RadioButtonGroupContext>({
  initialized: false,
  container: { current: null },
  variant: 'normal',
});

export function useRadioButtonGroup() {
  return useContext(radioButtonGroupContext);
}
