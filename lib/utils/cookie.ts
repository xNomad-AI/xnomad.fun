// 读取所有的cookie
export function getAllCookies() {
  const cookies = document.cookie.split(';');
  const cookieObj: Record<string, string> = {};
  cookies.forEach(function (cookie) {
    const parts = cookie.split('=');
    const name = parts[0].trim();
    const value = decodeURIComponent(parts[1]);
    cookieObj[name] = value;
  });
  return cookieObj;
}

// 读取特定名称的cookie值
export function getCookie(name: string) {
  const cookies = getAllCookies();
  return cookies[name];
}
