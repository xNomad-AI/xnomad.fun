const defaultFormat = (value: number) => `${value}`;

export function rangeText(from: number | null, to: number | null, format: (value: number) => string = defaultFormat) {
  let text = '';

  if (to === null && from !== null) {
    text = `>= ${format(from)}`;
  } else if (from === null && to !== null) {
    text = `<= ${format(to)}`;
  } else if (from !== null && to !== null) {
    if (from === to) {
      text = `${format(from)}`;
    } else {
      text = `${format(from)} to ${format(to)}`;
    }
  }
  return text;
}
