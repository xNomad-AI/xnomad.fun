import cx from "clsx";
import {
  DetailedHTMLProps,
  HTMLAttributes,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTabs } from "./tabs";
import { motion } from "framer-motion";

type Props = DetailedHTMLProps<
  HTMLAttributes<HTMLUListElement>,
  HTMLUListElement
>;

export function TabList(props: Props) {
  const { children, className, ...attributes } = props;
  const { variant, activeTabKey } = useTabs();
  const needSlider = variant === "slider";
  const [animate, setAnimate] = useState<{ width: number; x: number } | null>(
    null
  );
  const container = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const handleChange = () => {
      const el = container?.current?.querySelector<HTMLElement>(
        `[aria-label='${activeTabKey}']`
      );
      if (el) {
        const x = el.offsetLeft;
        const { width } = el.getBoundingClientRect();
        setAnimate({ width, x });
      }
    };

    handleChange();

    window.addEventListener("resize", handleChange);
    return () => {
      window.removeEventListener("resize", handleChange);
    };
  }, [activeTabKey, container]);

  return (
    <ul
      ref={container}
      className={cx(
        "flex items-center gap-16 relative overflow-auto scrollbar",
        className
      )}
      role='tablist'
      {...attributes}
    >
      {children}
      {needSlider && animate !== null ? (
        <motion.div
          className='h-2 bg-primary absolute bottom-0 rounded-2'
          animate={animate}
          initial={false}
        ></motion.div>
      ) : null}
    </ul>
  );
}
