import clsx from "clsx";
import { PropsWithChildren, useRef, useState } from "react";

import {
  RadioButtonGroupContext,
  RadioButtonVariant,
  radioButtonGroupContext,
} from "./context";
import { RadioButtonGroupSlider } from "./slider";
import { style } from "./style";

const { Provider } = radioButtonGroupContext;

export type RadioButtonGroupProps<T> = {
  value?: T;
  onChange?: (value: T) => void;
  width?: string;
  className?: string;
  disableAnimation?: boolean;
  variant?: RadioButtonVariant;
};

export function RadioButtonGroup<T>(
  props: PropsWithChildren<RadioButtonGroupProps<T>>
) {
  const {
    children,
    className,
    disableAnimation,
    variant = "normal",
    ...input
  } = props;
  const [initialized, setInitialized] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  const value: RadioButtonGroupContext<T> = {
    ...input,
    initialized,
    setInitialized,
    container,
    disableAnimation,
    variant,
  };

  return (
    <Provider value={value}>
      <div
        className={clsx(
          "h-40 overflow-hidden w-max rounded-6",
          style.container[variant],
          className
        )}
      >
        <div
          className='flex h-full items-center rounded-4 p-4 bg-surface flex-nowrap relative'
          ref={container}
        >
          {children}
          {!disableAnimation && <RadioButtonGroupSlider />}
        </div>
      </div>
    </Provider>
  );
}
