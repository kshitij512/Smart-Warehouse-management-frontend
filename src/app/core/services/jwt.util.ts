export interface JwtPayload {
  sub: string;
  role: string;
  exp: number;
}

export function decodeJwt(token: string): JwtPayload {
  const payload = token.split('.')[1];
  const decoded = atob(payload);
  return JSON.parse(decoded);
}
