import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { useRadioButtonGroup } from "./context";
import clsx from "clsx";
import { style } from "./style";

export function RadioButtonGroupSlider() {
  const { value, setInitialized, container, initialized, variant } =
    useRadioButtonGroup();
  const [animate, setAnimate] = useState({ width: 0, x: 0 });
  const start = useRef(false);

  // 如果是第一次，那么是没有动画的， 不然才需要动画
  // 通过init来控制动画
  // use update effect
  useEffect(() => {
    const el = container?.current?.querySelector<HTMLElement>(
      `[aria-label='${value}']`
    );
    if (el) {
      const x = el.offsetLeft;
      const { width } = el.getBoundingClientRect();
      setAnimate({ width, x });
      if (start.current === false) {
        start.current = true;
        setInitialized?.(true);
      }
    }
  }, [container, setInitialized, value]);

  return initialized ? (
    <motion.div
      className={clsx(
        style.item[variant],
        "absolute rounded-4 top-4 left-0 h-[calc(100%-8px)] z-1"
      )}
      animate={animate}
      initial={false}
    />
  ) : null;
}
