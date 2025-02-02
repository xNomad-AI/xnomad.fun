export function shallowIncludes<T extends Record<string, unknown>>(
  source: T[],
  object: Partial<Record<keyof T, unknown>>
) {
  return Boolean(shallowFind(source, object));
}

export function shallowFilter<T extends Record<string, unknown>>(
  source: T[],
  object: Partial<Record<keyof T, unknown>>
) {
  return source.filter((each) => {
    return !Object.keys(object).every((key) => each[key] === object[key]);
  });
}

export function shallowFind<T extends Record<string, unknown>>(source: T[], object: Partial<Record<keyof T, unknown>>) {
  return source.find((each) => {
    return Object.keys(object).every((key) => {
      return each[key] === object[key];
    });
  });
}
