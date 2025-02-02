export const checkIfScrollBottom = (node: HTMLElement, delta = 0) => {
  const { scrollTop, scrollHeight, clientHeight } = node;
  if (scrollTop + clientHeight + delta >= scrollHeight) {
    return true;
  }
  return false;
};
