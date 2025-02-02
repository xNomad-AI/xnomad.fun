export const validNumberInput = (value: string, withDecimal?: boolean) => {
  if (withDecimal) {
    if (value.match(/[^0-9.]/g)) {
      return value.replace(/[^0-9.]/g, '');
    }
    return value;
  } else {
    if (value.match(/[^0-9]/g)) {
      return value.replace(/[^0-9]/g, '');
    }
    return value;
  }
};
