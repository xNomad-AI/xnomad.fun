export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(Number(value));
}
