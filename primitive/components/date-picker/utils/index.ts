export function formatDate(ts: number) {
  const date = new Date(ts);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  return `${month < 10 ? `0${month}` : month}/${day < 10 ? `0${day}` : day}/${year}`;
}
