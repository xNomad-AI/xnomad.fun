export function isOwner(address?: string, owner?: string) {
  return Boolean(
    address && owner && address.toLowerCase() === owner.toLowerCase()
  );
}
