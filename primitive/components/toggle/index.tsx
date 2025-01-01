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
        "flex items-center justify-center w-[2.625em] h-[1.25em] rounded-full text-white overflow-hidden text-size-16",
        disable ? "cursor-not-allowed" : "cursor-pointer",
        !value || disable ? "bg-brand bg-opacity-[0.1]" : "bg-brand",
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
          className={clsx(
            "w-[1em] h-[1em] rounded-full",
            disable ? "bg-text2" : "bg-[white]"
          )}
        />
      </motion.div>
    </div>
  );
}
