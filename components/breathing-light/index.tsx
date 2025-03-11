"use client";

import { PropsWithClassName } from "@/primitive/components";
import clsx from "clsx";
import { motion } from "framer-motion";

type Props = {
  pause?: boolean;
  disabled?: boolean;
};
export function BreathingLight(props: PropsWithClassName<Props>) {
  const { className, pause, disabled } = props;

  return (
    <motion.div
      className={clsx("aspect-square rounded-full", className, {
        "bg-yellow text-yellow": !disabled && pause,
        "bg-green text-green": !disabled && !pause,
        "bg-white-40 text-white-40": disabled,
      })}
      animate={{
        boxShadow: "0px 0px 10px 0px currentColor",
        transition: {
          duration: 1,
          type: "tween",
          repeat: pause ? 0 : Infinity,
          repeatType: "reverse",
        },
      }}
      initial={{
        boxShadow: "0px 0px 0px 0px currentColor",
      }}
    />
  );
}
