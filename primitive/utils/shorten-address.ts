export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '-';

  if (chars + chars - 2 > address.length) {
    return address;
  }

  return `${address.slice(0, chars)}...${address.slice(-chars + 2)}`;
}
