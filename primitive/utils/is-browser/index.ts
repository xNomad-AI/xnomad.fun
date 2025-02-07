export function isBrowser() {
  return globalThis.window === globalThis;
}
