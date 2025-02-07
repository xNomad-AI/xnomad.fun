// https://stackoverflow.com/questions/143815/determine-if-an-html-elements-content-overflows/29689110

export function checkOverflow(el: HTMLElement) {
  const curOverflow = el.style.overflow;

  if (!curOverflow || curOverflow === 'visible') {
    el.style.overflow = 'hidden';
  }

  const isOverflowing = el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight;

  el.style.overflow = curOverflow;

  return isOverflowing;
}
