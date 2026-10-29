export interface JwtUserPayload {
  sub: string;
  name: string;
  email: string;
}

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const binary = atob(padded);

  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export function decodeJwtPayload(token: string): JwtUserPayload | null {
  try {
    const segment = token.split('.')[1];
    if (!segment) return null;

    const payload = JSON.parse(new TextDecoder('utf-8').decode(base64UrlToBytes(segment)));
    const { sub, name, email } = payload ?? {};

    if (typeof sub !== 'string' || typeof name !== 'string' || typeof email !== 'string') {
      return null;
    }

    return { sub, name, email };
  } catch {
    return null;
  }
}
