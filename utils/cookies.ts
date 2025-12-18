export const parseCookies = (cookieHeader: string | undefined): Record<string, string> => {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;

  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const [rawName, ...rest] = part.trim().split('=');
    if (!rawName) continue;
    const rawValue = rest.join('=');
    cookies[decodeURIComponent(rawName)] = decodeURIComponent(rawValue || '');
  }
  return cookies;
};

export type CookieOptions = {
  maxAge?: number;
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'lax' | 'strict' | 'none';
};

export const serializeCookie = (name: string, value: string, options: CookieOptions = {}): string => {
  const path = options.path ?? '/';
  const sameSite = options.sameSite ?? 'lax';
  const secure = options.secure ?? false;
  const httpOnly = options.httpOnly ?? false;

  const attrs: string[] = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    `Path=${path}`,
    `SameSite=${sameSite}`,
  ];

  if (typeof options.maxAge === 'number') attrs.push(`Max-Age=${options.maxAge}`);
  if (secure) attrs.push('Secure');
  if (httpOnly) attrs.push('HttpOnly');

  return attrs.join('; ');
};

export const getCookieValue = (cookieHeader: string | undefined, name: string): string | null => {
  const cookies = parseCookies(cookieHeader);
  return cookies[name] ?? null;
};
