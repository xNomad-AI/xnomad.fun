type Option = {
  max?: number;
};
export function toInt(value: string, option: Option = {}) {
  const { max } = option;
  const int = Number.parseInt(value.replace(/-/g, ''), 10);
  if (Number.isNaN(int)) {
    return '';
  } else {
    if (int === 0) {
      return '';
    }
    if (typeof max === 'number' && int > max) {
      return `${max}`;
    }
    return `${int}`;
  }
}
