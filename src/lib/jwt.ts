interface GoogleJwtPayload {
  sub: string;
  email: string;
  name: string;
  picture: string;
}

export function decodeGoogleJwt(token: string): GoogleJwtPayload {
  const [, payload] = token.split('.');
  const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
  return JSON.parse(decoded) as GoogleJwtPayload;
}
