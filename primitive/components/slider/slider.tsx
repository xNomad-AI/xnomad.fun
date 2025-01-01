import { useMemoizedFn } from "ahooks";
import clsx from "clsx";
import { useEffect, useMemo } from "react";

import { Block } from "./block";
import { SliderController } from "./controller";
import { useMovableElement } from "./helper";

export interface SliderProps {
  controller: SliderController;
  step?: number;
  verbose?: boolean;
  singleBlock?: boolean;
  blockSize?: number;
  borderSize?: number;
  progressBarHeight?: number;
  format?: (value: number, raw: number) => string | number;
  disabled?: boolean;
  fillerAction?: "drag" | "click";
  className?: string;
}

function defaultVerboseFormat(value: number) {
  return value;
}

const getSize = (next: number, limit: number) => {
  if (next <= 0) {
    return 0;
  }
  if (next > limit) {
    return limit;
  }
  return next;
};

export function Slider(props: SliderProps) {
  const {
    controller,
    verbose = false,
    step = 1,
    format = defaultVerboseFormat,
    blockSize = 16,
    progressBarHeight = 4,
    singleBlock = false,
    disabled,
    borderSize = 0.5,
    fillerAction = "drag",
    className,
  } = props;

  const { refs, width, ratios, value, setWidth } = controller;
  const [left, right] = ratios;
  const { container } = refs;
  const [start, end] = [left * width, right * width];
  const isClickMode = useMemo(
    () => fillerAction === "click" || singleBlock,
    [fillerAction, singleBlock]
  );

  const { ref: filler } = useMovableElement<HTMLDivElement>((x) => {
    const nextStart = start + x;
    const nextEnd = end - x;

    const start_movable = nextStart >= 0 && nextStart <= width;
    const end_movable = nextEnd >= 0 && nextEnd <= width;

    if (!(!start_movable || !end_movable || singleBlock || disabled)) {
      const start = getSize(nextStart, width);
      const end = getSize(nextEnd, width);
      controller.changePosition(start / width, end / width);
    }
  });

  const { ref: leftBlock } = useMovableElement<HTMLDivElement>((x) => {
    if (!disabled) {
      const next = start + x;
      const _start = getSize(next, width);
      controller.changePosition(_start / width, right);
    }
  });

  const { ref: rightBlock } = useMovableElement<HTMLDivElement>((x) => {
    if (!disabled) {
      const next = end - x;
      const _end = getSize(next, width);
      controller.changePosition(left, _end / width);
    }
  });

  const handleMouseDown = useMemoizedFn((e: MouseEvent) => {
    const x = e.pageX;
    const leftOffset = x - (leftBlock.current?.getClientRects?.()?.[0]?.x ?? 0);
    const rightOffset =
      x - (rightBlock.current?.getClientRects?.()?.[0]?.x ?? 0);
    const nextStart = start + leftOffset;
    const nextEnd = end - rightOffset + blockSize;
    const shouldChangeRightBlock =
      singleBlock || Math.abs(leftOffset) > Math.abs(rightOffset);

    if (!disabled) {
      const _start = getSize(nextStart, width);
      const _end = getSize(nextEnd, width);
      if (shouldChangeRightBlock) {
        controller.changePosition(left, _end / width);
      } else {
        controller.changePosition(_start / width, right);
      }
    }
  });

  useEffect(() => {
    const dom = container.current;
    if (isClickMode && dom) {
      dom.addEventListener("mousedown", handleMouseDown);
    }
    return () => {
      if (isClickMode && dom) {
        dom.removeEventListener("mousedown", handleMouseDown);
      }
    };
  }, [isClickMode, container, handleMouseDown]);

  const reverse = start + end > width;

  useEffect(() => {
    const dom = container.current;
    const handleResize = (width: number) => {
      setWidth(width - blockSize);
    };

    const observer = new ResizeObserver((entries) => {
      handleResize(entries?.[0]?.contentRect?.width ?? 0);
    });

    if (dom) {
      handleResize(dom.clientWidth);
      observer.observe(dom);
    }

    return () => {
      observer.disconnect();
    };
  }, [blockSize, container, setWidth]);

  return (
    <div
      className={clsx(
        "relative flex flex-col flex-nowrap items-center justify-center",
        "h-16",
        className
      )}
      ref={container}
      style={{
        height: blockSize > progressBarHeight ? blockSize : progressBarHeight,
      }}
    >
      <div
        className={clsx("w-full relative bg-brand-10 rounded-full")}
        style={{ height: progressBarHeight }}
      >
        <div
          draggable='false'
          ref={isClickMode ? null : filler}
          style={{
            left: reverse ? width - end : start,
            right: reverse ? width - start : end,
          }}
          className={clsx(
            "absolute top-0 left-0 bottom-0 right-0",
            disabled
              ? "bg-secondary cursor-not-allowed active:cursor-not-allowed"
              : "bg-brand",
            "rounded-[inherit]",
            singleBlock || isClickMode
              ? "cursor-default active:cursor-default"
              : "cursor-grab active:cursor-grab"
          )}
        ></div>
      </div>

      {singleBlock ? null : (
        <Block
          disabled={disabled}
          style={{
            left: start,
            height: blockSize,
            width: blockSize,
            borderWidth: borderSize,
          }}
          ref={leftBlock}
          verbose={verbose}
          tooltip={format(
            controller.normalizeValue(reverse ? value[1] : value[0], step),
            reverse ? value[1] : value[0]
          )}
        />
      )}

      <Block
        disabled={disabled}
        style={{
          right: end,
          height: blockSize,
          width: blockSize,
          borderWidth: borderSize,
        }}
        ref={rightBlock}
        verbose={verbose}
        tooltip={format(
          controller.normalizeValue(reverse ? value[0] : value[1], step),
          reverse ? value[0] : value[1]
        )}
      />
    </div>
  );
}
