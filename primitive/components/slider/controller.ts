import { useCallback, useRef, useState } from "react";

function ensureNumber(value: number, fallback: number) {
  return typeof value === "number" && !Number.isNaN(value) ? value : fallback;
}

function initRatios(
  _start: number,
  _end: number,
  min: number,
  max: number
): [number, number] {
  const reverse = _start > _end;
  const start = ensureNumber(reverse ? _end : _start, min);
  const end = ensureNumber(reverse ? _start : _end, max);

  if (start > max || start < min || end > max || end < min) {
    return [0, 0];
  }

  const total = max - min;

  if (total === 0) {
    return [0, 0];
  }

  return [(start - min) / total, 1 - (end - min) / total];
}

function normalizeValue(value: number, step: number, ceil = false) {
  const accuracy = `${step}`.split(".")[1]?.length ?? 0;
  const _value = ceil ? Math.ceil(value / step) : Math.floor(value / step);
  return Number.parseFloat((_value * step).toFixed(accuracy));
}

export function useSliderController(
  range: [number, number],
  section?: [number, number],
  onChange?: (value: [number, number], ratios: [number, number]) => void // mouse down时触发，changeValue时不触发
) {
  const [min, setMin] = useState(range[0]);
  const [max, setMax] = useState(range[1]);
  const [initStart, initEnd] = section ?? range;
  const [ratios, setRatios] = useState<[number, number]>(() =>
    initRatios(initStart, initEnd, min, max)
  );
  const [width, setWidth] = useState(0);
  const [value, setValue] = useState(section ?? range);
  const container = useRef<HTMLDivElement>(null);

  const changeValue = useCallback(
    (_start: number, _end: number) => {
      const start = ensureNumber(_start, min);
      const end = ensureNumber(_end, max);
      if (start > end || end > max || start < min) {
        return;
      }
      const total = max - min;
      if (total === 0) {
        setValue([min, max]);
        setRatios([0, 0]);
      } else {
        setValue([start, end]);
        setRatios([(start - min) / total, 1 - (end - min) / total]);
      }
    },
    [min, max]
  );

  // 改变距离左右边的距离 百分比
  const changePosition = useCallback(
    (start: number, end: number) => {
      if (start > 1 || end > 1 || start < 0 || end < 0) {
        return;
      }
      const total = max - min;
      if (total === 0) {
        setRatios([0, 0]);
        setValue([min, max]);
        onChange?.([min, max], [0, 0]);
      } else {
        setRatios([start, end]);
        const reverse = start + end > 1;
        const _value = reverse
          ? [(1 - end) * total + min, start * total + min]
          : [start * total + min, (1 - end) * total + min];
        setValue([_value[0], _value[1]]);
        onChange?.([_value[0], _value[1]], [start, end]);
      }
    },
    [max, min, onChange]
  );

  return {
    refs: {
      container,
    },
    value,
    width,
    ratios,
    changeValue,
    changePosition,
    normalizeValue,
    range,
    setWidth,
    setMin,
    setMax,
  };
}

export type SliderController = ReturnType<typeof useSliderController>;
