export function isOwner(address: string, owner: string) {
  return address && owner && address.toLowerCase() === owner.toLowerCase();
}
