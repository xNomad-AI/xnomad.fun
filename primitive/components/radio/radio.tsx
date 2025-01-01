import clsx from "clsx";
import React, {
  PropsWithChildren,
  ReactElement,
  useContext,
  useMemo,
  useState,
} from "react";
import { motion } from "framer-motion";
import RadioGroupContext from "./context";

function StyledDot({
  disabled,
  checked,
}: {
  checked?: boolean;
  disabled?: boolean;
}) {
  return (
    <motion.div
      animate={{
        scale: 1,
      }}
      initial={{
        scale: 0,
      }}
      className={clsx(
        "rounded-full h-8 w-8 absolute left-4 bg-brand cursor-pointer opacity-0",
        {
          "!bg-text2 cursor-not-allowed": disabled,
          "!opacity-100": checked,
        }
      )}
    ></motion.div>
  );
}

export type RadioProps = PropsWithChildren<
  {
    children?: string | ReactElement;
    checked?: boolean;
    defaultChecked?: boolean;
    value?: string;
    disabled?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  } & React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >
>;

export function Radio(props: RadioProps) {
  const {
    children,
    checked,
    defaultChecked,
    value,
    disabled,
    onChange,
    className,
    ...rest
  } = props;
  const [radioChecked, setRadioChecked] = useState(defaultChecked);

  const groupContext = useContext(RadioGroupContext);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    groupContext?.onChange?.(e);
    // groupContext 没有值表示radio单独使用；checked 为undefined表示此时Radio是非受控组件
    if (!groupContext && checked === undefined) {
      setRadioChecked(e.target?.checked);
    }
  };

  // 当 groupContext 有值即 radio 是以 group 形式出现的，此时忽略 checked
  const isChecked = groupContext
    ? groupContext.value === value
    : radioChecked ?? checked;

  return (
    <div {...rest} className={clsx("flex items-center gap-8", className)}>
      <div
        className='flex items-center justify-center'
        style={{ position: "relative" }}
      >
        <input
          className={clsx(
            "appearance-none bg-transparent my-auto border border-brand rounded-full h-16 w-16 cursor-pointer hover:border-brand",
            { "!border-text2": disabled }
          )}
          type='radio'
          checked={isChecked}
          value={value}
          disabled={disabled}
          onChange={handleChange}
        />
        {isChecked ? (
          <StyledDot checked={isChecked} disabled={disabled} />
        ) : null}
      </div>

      {children ? (
        <div className='flex items-center justify-center'>
          <label
            className={clsx("cursor-pointer select-none", {
              "!cursor-not-allowed": disabled,
            })}
          >
            {children}
          </label>
        </div>
      ) : null}
    </div>
  );
}
