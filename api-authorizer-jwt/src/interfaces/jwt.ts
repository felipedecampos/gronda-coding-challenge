export interface JwtPayload {
  iss: string;
  iat: number;
  nbf: number;
  exp: number;
  aud: string;
  sub: string;
}
