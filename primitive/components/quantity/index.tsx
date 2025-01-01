import clsx from "clsx";
import {
  ChangeEventHandler,
  ClipboardEventHandler,
  useRef,
  useState,
} from "react";
import ClickAwayListener from "react-click-away-listener";

import { PropsWithClassName } from "../helper";
import { IconAdd, IconAddCircle, IconRemove, IconRemovecircle } from "../icon";
import { InteractiveBox } from "../interactive-box";
import { containerStyle, iconStyle, inputStyle } from "./style";
import { QuantityVariant } from "./type";

interface QuantityProps {
  value?: number;
  onChange?: (newValue: number) => void;
  range: [number, number];
  disabled?: boolean;
  typeable?: boolean;
  variant?: QuantityVariant;
}

export const Quantity = (props: PropsWithClassName<QuantityProps>) => {
  const {
    value = 1,
    onChange,
    range,
    disabled = false,
    className,
    typeable = false,
    variant = "plain",
  } = props;
  const [min, max] = range;

  const canMinus = !disabled && value > min;
  const canAdd = !disabled && value < max;
  const [editMode, setEditMode] = useState(false);

  const [waitingForInput, setWaitingForInput] = useState(false);

  const label = waitingForInput ? "" : value.toString();

  const ref = useRef<HTMLDivElement>(null);

  const emitChange = (value: number) => {
    if (!disabled) {
      onChange?.(value);
      setWaitingForInput(false);
    }
  };

  const normalizeInput = (value: string) => {
    const pureInt = value.replace(/[^0-9\s]*/g, "");
    const int = Number.parseInt(pureInt, 10);
    if (Number.isNaN(int) || pureInt === "") {
      setWaitingForInput(true);
    } else if (int > max) {
      emitChange(max);
    } else if (int < min) {
      emitChange(min);
    } else {
      emitChange(int);
    }
  };

  const handleFocus = () => {
    if (!disabled) {
      setEditMode(true);
    } else {
      setEditMode(false);
    }
  };

  const handleMinus = () => {
    if (canMinus) {
      setEditMode(true);
      emitChange(value - 1);
    }
  };

  const handlePlus = () => {
    if (canAdd) {
      setEditMode(true);
      emitChange(value + 1);
    }
  };

  const handleUserInput: ChangeEventHandler<HTMLInputElement> = (e) => {
    normalizeInput(e.target.value);
  };

  const handleUserPaste: ClipboardEventHandler<HTMLInputElement> = (e) => {
    normalizeInput(e.clipboardData.getData("text"));
  };

  const handleBlur = () => {
    setEditMode(false);
    setWaitingForInput(false);
  };

  const isGhost = variant === "ghost";

  const Minus = IconRemove;

  const Add = IconAdd;

  return (
    <ClickAwayListener onClickAway={handleBlur}>
      <div
        className={clsx(
          "flex items-center justify-center  text-text1 shadow-default",
          containerStyle[variant],
          editMode ? "border-primary" : "",
          className
        )}
        ref={ref}
        onClick={handleFocus}
      >
        <InteractiveBox
          static={!isGhost}
          className={clsx(
            "cursor-pointer aria-disabled:cursor-not-allowed",
            iconStyle[variant]
          )}
          onClick={handleMinus}
          disabled={!canMinus || disabled}
          aria-disabled={!canMinus || disabled}
        >
          <Minus />
        </InteractiveBox>
        <input
          className={clsx(
            "text-center bg-transparent border-none outline-none",
            typeable && "cursor-text ",
            inputStyle[variant]
          )}
          size={0}
          type='text'
          value={label}
          disabled={disabled || !typeable}
          onChange={handleUserInput}
          onPaste={handleUserPaste}
        />
        <InteractiveBox
          static={!isGhost}
          className={clsx(
            "cursor-pointer aria-disabled:cursor-not-allowed",
            iconStyle[variant]
          )}
          onClick={handlePlus}
          disabled={!canAdd || disabled}
          aria-disabled={!canAdd || disabled}
        >
          <Add />
        </InteractiveBox>
      </div>
    </ClickAwayListener>
  );
};
