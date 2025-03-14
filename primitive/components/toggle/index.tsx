import clsx from "clsx";
import { motion } from "framer-motion";

interface SwitchProps {
  value?: boolean;
  onChange?: (value: boolean) => void;
  className?: string;
  disable?: boolean;
}

export function Toggle(props: SwitchProps) {
  const { className, disable, value, onChange } = props;

  const handleClick = () => {
    if (!disable) {
      onChange?.(!value);
    }
  };

  return (
    <div
      className={clsx(
        "flex items-center justify-center w-[2.625em] h-[1.25em] rounded-full text-white overflow-hidden text-size-16 bg-brand",
        disable ? "cursor-not-allowed" : "cursor-pointer",
        {
          "bg-opacity-[0.1]": !value || disable,
          "bg-opacity-1": value && !disable,
        },
        className
      )}
      onClick={handleClick}
      aria-disabled={disable}
      aria-roledescription='toggle'
    >
      <motion.div
        className={clsx("px-[0.125em] w-full box-border")}
        animate={{
          x: value ? "50%" : 0,
        }}
        initial={false}
      >
        <motion.div
          className={clsx("w-[1em] h-[1em] rounded-full", {
            "bg-text2": disable,
            "bg-white": !disable && !value,
            "bg-[#0D0F10]": !disable && value,
          })}
        />
      </motion.div>
    </div>
  );
}
