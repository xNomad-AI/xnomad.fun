export function getSearchParam(name: string, search?: string) {
  const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`);
  const query = (search || window.location.search).slice(1).match(reg); // 匹配目标参数
  if (query != null) {
    return query[2];
  } else {
    return null;
  }
}

export function updateLocationQuery(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Record<string, any>,
  keepOrigin = true
) {
  const currentQueryString = window.location.search;
  const searchParams = new URLSearchParams(
    keepOrigin ? currentQueryString : ""
  );
  const keys = Object.keys(params);
  keys.forEach((key) => {
    searchParams.set(key, params[key]);
  });
  const str = searchParams.toString();
  window.history.replaceState(null, "", `?${str}`);
}

export function localeUrl(url: string, locale: string) {
  if (locale === "en") {
    return url;
  }
  return `/${locale}${url}`.replaceAll("//", "/");
}
