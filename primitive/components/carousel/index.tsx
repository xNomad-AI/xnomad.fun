"use client";
import { useMemoizedFn, useUnmount } from "ahooks";
import { AnimatePresence, motion, wrap } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  IconArrowForward,
  IconArrowForwardright,
  IconArrowLeft,
  IconArrowRight,
} from "../icon";

const OpacityVariants = {
  enter: () => {
    return {
      opacity: 0,
    };
  },
  center: {
    zIndex: 1,
    opacity: 1,
  },
  exit: () => {
    return {
      zIndex: 0,
      opacity: 0,
    };
  },
};

const TranslateVariants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    };
  },
  center: {
    zIndex: 1,
    // x: 0,
    opacity: 1,
  },
  exit: (direction: number) => {
    return {
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    };
  },
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};
const DEFUALT_AUTO_PLAY_INTERVAL = 5000;
export function Carousel<T>({
  data,
  Render,
  animationType = "opacity",
  autoPlay: _autoPlay,
}: {
  data: T[];
  Render: (props: { data: T }) => JSX.Element;
  animationType?: "opacity" | "translate";
  autoPlay?: boolean;
}) {
  const [[page, direction], setPage] = useState([0, 0]);
  const imageIndex = wrap(0, data.length, page);
  const autoSliderInterval = useRef<NodeJS.Timer>();
  const autoPlay = useMemo(
    () => _autoPlay && data.length > 1,
    [_autoPlay, data.length]
  );
  const resetAutoSlider = useMemoizedFn(() => {
    if (autoSliderInterval.current) {
      clearInterval(autoSliderInterval.current as any);
    }
    autoSliderInterval.current = setInterval(() => {
      setPage((old) => [old[0] + 1, 1]);
    }, DEFUALT_AUTO_PLAY_INTERVAL);
  });
  const paginate = useMemoizedFn((newDirection: number) => {
    setPage([page + newDirection, newDirection]);
    if (autoPlay) {
      resetAutoSlider();
    }
  });
  const variants =
    animationType === "opacity" ? OpacityVariants : TranslateVariants;
  useEffect(() => {
    if (autoPlay) {
      resetAutoSlider();
    }
  }, [autoPlay]);
  useUnmount(() => {
    if (autoSliderInterval.current) {
      clearInterval(autoSliderInterval.current as any);
    }
  });
  return (
    <div className='w-full h-full min-w-0 min-h-0 relative overflow-hidden flex items-center justify-center bg-transparent rounded-12'>
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={page}
          custom={direction}
          variants={variants}
          initial='enter'
          animate='center'
          className='absolute w-full h-full top-0 left-0'
          exit='exit'
          transition={
            animationType === "translate"
              ? {
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }
              : {
                  opacity: { duration: 0.2 },
                }
          }
          drag='x'
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);

            if (swipe < -swipeConfidenceThreshold) {
              paginate(1);
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1);
            }
          }}
        >
          <Render data={data[imageIndex]} />
        </motion.div>
      </AnimatePresence>
      {data.length > 1 ? (
        <>
          <div
            onClick={() => paginate(-1)}
            className='absolute cursor-pointer px-16 w-[50%] h-full left-0 top-0 flex items-center justify-center z-2 group'
          >
            <div
              className='absolute left-0 shadow-base flex items-center justify-center w-[72px] h-[72px] rounded-full bg-white opacity-100 transition-opacity duration-300 shadow-default'
              style={{ left: 16 }}
            >
              <IconArrowForwardright className='text-size-24 text-[#1b1b1b] rotate-[180deg]' />
            </div>
          </div>
          <div
            onClick={() => paginate(1)}
            className='absolute cursor-pointer px-16 w-[50%] h-full right-0 top-0 flex items-center justify-center z-2 group'
          >
            <div
              className='absolute right-0shadow-base flex items-center justify-center w-[72px] h-[72px] rounded-full bg-white opacity-100 transition-opacity duration-300 shadow-default'
              style={{ right: 16 }}
            >
              <IconArrowForwardright className='text-size-24 text-[#1b1b1b]' />
            </div>
          </div>
        </>
      ) : null}
      {/* {data.length > 1 && (
        <div className='flex items-center gap-8 absolute bottom-24 z-2'>
          {data.map((_, i) => (
            <div
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setPage([i, i - imageIndex]);
                if (autoPlay) {
                  resetAutoSlider();
                }
              }}
              className={`cursor-pointer w-8 h-8 border border-solid border-dividingLine rounded-full bg-white ${
                i === imageIndex ? "!bg-brand" : ""
              }`}
            />
          ))}
        </div>
      )} */}
    </div>
  );
}
