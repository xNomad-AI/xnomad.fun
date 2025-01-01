export function page() {
  return globalThis.window === globalThis ? document.getElementById('page') : null;
}
