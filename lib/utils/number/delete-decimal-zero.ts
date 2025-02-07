export function deleteDecimalZero(num: number | string): string {
  const target = `${num}`;

  if (target.includes('.')) {
    const last = target.slice(-1)[0];
    if (last === '0' || last === '.') {
      return deleteDecimalZero(target.slice(0, -1));
    }
  }

  return target;
}
