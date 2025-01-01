"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { PropsWithChildren, useRef } from "react";

import { useMountFloatLayer } from "../float-layer";

type ModalProps = {
  open?: boolean;
  className?: string;
  onMaskClick?: () => void;
  size?: "l" | "m" | "s";
};

export function Modal(props: PropsWithChildren<ModalProps>) {
  const { children, open = false, className, onMaskClick, size = "l" } = props;

  const mask = useRef<HTMLDivElement | null>(null);

  const modal = (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={mask}
          className={clsx(
            "absolute top-0 left-0 h-full w-screen bg-primary-20"
          )}
          animate={{
            backdropFilter: "blur(0.625rem)",
          }}
          initial={{
            backdropFilter: `blur(0.3125rem)`,
          }}
          exit={{
            backdropFilter: "blur(0)",
            opacity: 0,
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (mask.current === e.target) {
              onMaskClick?.();
            }
          }}
        >
          <motion.div
            animate={{
              y: 0,
              opacity: 1,
            }}
            initial={{
              y: "-1rem",
              opacity: 0.5,
            }}
            exit={{
              y: "-2rem",
              opacity: 0,
            }}
            autoFocus
            className={clsx(
              "absolute bg-background border top-32 right-0 bottom-32 left-0 m-auto max-h-[min(42.5rem,_calc(100%_-_4rem))] h-fit",
              "rounded-12 overflow-hidden",
              "portrait-tablet:w-[30rem]",
              size === "l" && "w-[55rem] landscape-tablet:w-[42.5rem]",
              size === "m" && "w-[42.5rem] landscape-tablet:w-[42.5rem]",
              size === "s" && "w-[30rem]",
              // for drawer
              "mobile:h-auto mobile:bottom-0 mobile:left-0 mobile:right-0 mobile:max-h-[80%] mobile:w-screen mobile:m-0 mobile:rounded-b-none mobile:top-auto",
              className
            )}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return useMountFloatLayer(modal, {
    until: open,
    mount: true,
  });
}
