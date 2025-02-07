type Option = {
  negative?: boolean;
};

export function toDecimal(value: string, option: Option = {}) {
  const { negative } = option;
  if (negative) {
    console.log('todo negative');
  }
  if (value === '.') {
    return '0.';
  }
  const hasDot = value.includes('.');
  const [int_str, decimal_str = ''] = value.split('.');
  const decimal = decimal_str.replace(/[^0-9]/g, '').slice(0, 16);
  const int = Number.parseInt(int_str.replace(/[^0-9]/g, ''), 10);
  if (Number.isNaN(int)) {
    return '';
  }
  return `${int}${hasDot ? '.' : ''}${decimal}`;
}
