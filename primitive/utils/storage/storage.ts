import { storageConfig } from './config';

type StorageObject<T = unknown> = {
  value: T;
};

function isStorageObject<T>(obj: unknown): obj is StorageObject<T> {
  return typeof obj === 'object' && obj !== null && Object.hasOwn(obj, 'value');
}

function f(key: string) {
  return `${storageConfig.prefix}-${key}`;
}

function get<T>(key: string, defaultValue: T): T {
  try {
    const value = localStorage.getItem(f(key));
    if (value !== null) {
      const obj = JSON.parse(value);
      if (isStorageObject<T>(obj)) {
        return obj.value;
      }
    }
  } catch (e) {
    console.log('storage error: ', e);
  }
  remove(key);
  return defaultValue;
}

function set<T>(key: string, value: T) {
  const so: StorageObject<T> = {
    value,
  };
  localStorage.setItem(f(key), JSON.stringify(so));
}

function remove(key: string) {
  localStorage.removeItem(f(key));
}

export const storage = {
  get,
  set,
  remove,
};
