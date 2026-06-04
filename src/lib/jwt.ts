interface GoogleJwtPayload {
  sub: string;
  email: string;
  name: string;
  picture: string;
  exp: number;
  iat: number;
}

export function decodeGoogleJwt(token: string): GoogleJwtPayload {
  const [, payload] = token.split('.');
  const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
  return JSON.parse(decoded) as GoogleJwtPayload;
}

export function getTokenExpiry(token: string): number {
  try {
    return decodeGoogleJwt(token).exp * 1000;
  } catch {
    return 0;
  }
}

export function msUntilExpiry(token: string, now: number = Date.now()): number {
  return getTokenExpiry(token) - now;
}
