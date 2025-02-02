export function isSameString(source: unknown, target: unknown, shallow = true) {
  if (typeof source === "string" && typeof target === "string") {
    if (shallow) {
      return source.toLowerCase() === target.toLowerCase();
    }
    return source === target;
  }
  return false;
}

export function isSubString(target: unknown, source: unknown) {
  if (typeof source === "string" && typeof target === "string") {
    return target.toLowerCase().includes(source.toLowerCase());
  }
  return false;
}

export function upperFirstLetter(str: string) {
  return str
    .split(" ")
    .map((res) => res.charAt(0).toUpperCase() + res.slice(1))
    .join(" ");
}

export function isBase64(str: string) {
  try {
    return Buffer.from(str, "base64").toString("base64") === str;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export function isHex(str: string) {
  return /^[0-9A-Fa-f]+$/.test(str);
}

export * from "./range-text";
