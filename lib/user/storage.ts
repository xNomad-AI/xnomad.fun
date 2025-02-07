import { storage } from "@/primitive/utils/storage";

export type AuthorizationToken = {
  jwt: string;
  address: string;
  expires: number;
};

export type TokenMap = Record<string, AuthorizationToken>;

export const userStorageKeys = {
  token: "token",
  tokenMap: "token-map",
};

export function cookiesTokenKey(chain: string) {
  return `${chain}-token`;
}

export function cookiesAddressKey(chain: string) {
  return `${chain}-address`;
}

function getTokenMap() {
  return storage.get<TokenMap>(userStorageKeys.tokenMap, {});
}

function cacheToken(address: string, jwt: string, expires: number) {
  const token = {
    address,
    jwt,
    expires,
  } satisfies AuthorizationToken;

  const tokenMap = getTokenMap();
  tokenMap[address] = token;
  storage.set<TokenMap>(userStorageKeys.tokenMap, tokenMap);
  storage.set<AuthorizationToken>(userStorageKeys.token, token);
}

function ensureTokenNotExpired(token: AuthorizationToken | null) {
  if (token) {
    const expired = token.expires - Date.now() <= 0;
    if (!expired) {
      return token;
    }
  }

  return null;
}

function getCurrentToken() {
  const data = storage.get<AuthorizationToken | null>(
    userStorageKeys.token,
    null
  );
  const token = ensureTokenNotExpired(data);
  if (token === null) {
    storage.remove(userStorageKeys.token);
  }
  return token;
}

function getCachedToken(address: string) {
  const tokenMap = getTokenMap();
  const data = tokenMap[address];
  const token = ensureTokenNotExpired(data);
  if (token === null) {
    delete tokenMap[address];
    storage.set<TokenMap>(userStorageKeys.tokenMap, tokenMap);
  }
  return token;
}

function removeTokenFromTokenMap(address: string) {
  const token = getCachedToken(address);
  if (token) {
    const tokenMap = storage.get<TokenMap>(userStorageKeys.tokenMap, {});
    delete tokenMap[token.address];
    storage.set<TokenMap>(userStorageKeys.tokenMap, tokenMap);
  }
}

function removeCurrentToken() {
  storage.remove(userStorageKeys.token);
}

export const userStorage = {
  cacheToken,
  removeTokenFromTokenMap,
  getCurrentToken,
  getCachedToken,
  removeCurrentToken,
};
