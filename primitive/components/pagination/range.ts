export const range = {
  end(end: number, size: number, step = 1) {
    const result: number[] = [];

    for (let i = 0; i < size; i++) {
      result[i] = end - (size - i - 1) * step;
    }

    return result;
  },
  start(start: number, size: number, step = 1) {
    const result: number[] = [];

    for (let i = 0; i < size; i++) {
      result[i] = start + i * step;
    }

    return result;
  },
};
