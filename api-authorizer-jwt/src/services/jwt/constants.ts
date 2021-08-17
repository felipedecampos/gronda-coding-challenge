/**
 * JWT constants
 */
export const jwtSigningKeySecretName: string = process.env.JWT_SIGNING_KEY_SECRET_NAME ?? '';
export const JwtPayloadIssuers: string = process.env.JWT_PAYLOAD_ISSUERS ?? '';
