import {
  APIGatewayTokenAuthorizerEvent,
  APIGatewayAuthorizerResult,
  PolicyDocument,
  APIGatewayAuthorizerResultContext,
  Context,
} from 'aws-lambda';
import { InfoLog, ErrorLog } from 'md-logs'; // TODO: Create lambda layer to log in CloudWatch
import { getSecretValue } from '../secret';
import { verify, VerifyOptions } from 'jsonwebtoken';
import { JwtPayload } from '../../interfaces/jwt';
import * as constants from './constants';

/**
 * Extract Bearer token from request
 */
export const extractTokenFromHeader = (event: APIGatewayTokenAuthorizerEvent): string => {
  if (typeof event.authorizationToken === 'undefined') {
    return '';
  }

  const authorization: string[] = event.authorizationToken.split(' ') ?? [];

  if (authorization.length !== 2) {
    return '';
  }

  if (authorization[0] !== 'Bearer' || !(authorization[1].length > 0) || typeof authorization[1] !== 'string') {
    return '';
  }

  return authorization[1];
};

/**
 * Validate issue date from JWT token `iat` (Issued At)
 */
const validateJwtPayloadIssuedAt = (jwtPayload: JwtPayload): boolean => {
  if (typeof jwtPayload.iat !== 'number') {
    throw new Error('Invalid "issued at" extracted from JWT Payload');
  }

  if (jwtPayload.iat > new Date().getTime() / 1000) {
    throw new Error('Invalid "issued at" (the time at which the JWT was issued)');
  }

  return true;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isJwtPayload = (object: any): object is JwtPayload => true;

/**
 * Validate request token
 */
export const validateToken = async (token: string, lambdaContext: Context): Promise<APIGatewayAuthorizerResult> => {
  /**
   * TODO: Talvez precisemos tratar o `Resource: *` para incluir apenas os ARNs
   * dos endpoints liberados para o client
   */
  const policyDocument: PolicyDocument = {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'execute-api:Invoke',
        Effect: 'Allow',
        Resource: '*',
      },
    ],
  };

  let context: APIGatewayAuthorizerResultContext = {};

  let response: APIGatewayAuthorizerResult = {
    principalId: 'user',
    policyDocument: policyDocument,
    context: {},
  };

  return new Promise(async (resolve, reject) => {
    try {
      // Get rsa_pub_key from AWS Secrets Manager Client
      if (typeof constants.jwtSigningKeySecretName !== 'string' || !(constants.jwtSigningKeySecretName.length > 0)) {
        throw new Error('Signing key secret name not found in Dotenv');
      }

      const rsa_pub_key = await getSecretValue(constants.jwtSigningKeySecretName, lambdaContext);

      const issuers = constants.JwtPayloadIssuers.split(',');

      if (! (issuers.length > 0)) {
        throw new Error('Invalid issuer that issued the JWT');
      }

      const validateOptions: VerifyOptions = {
        issuer: issuers
      }

      // Checking token autenticity
      const objectDecodedPayload = verify(token, rsa_pub_key, validateOptions);

      // Check if payload decoded matchs with JwtPayload interface
      if (!isJwtPayload(objectDecodedPayload)) {
        throw new Error('Invalid JWT Payload');
      }

      const jwtDecodedPayload: JwtPayload = objectDecodedPayload;

      // Validate issue date from JWT token `iat` (Issued At)
      validateJwtPayloadIssuedAt(jwtDecodedPayload);

      // Encoding payload to base64 to associate in response
      const stringPayload = JSON.stringify(jwtDecodedPayload);
      const buffPayload = Buffer.from(stringPayload, 'utf-8');

      context = {
        auth: buffPayload.toString('base64'),
      };

      Object.assign(response.context, context);

      InfoLog({
        tag: 'INTEGRATION',
        description: 'Getting response from JWT payload',
      });

      resolve(response);
    } catch (err) {
      ErrorLog({
        e: err,
        tag: 'RUNTIME',
        description: 'Error validating JWT',
        eventID: lambdaContext.awsRequestId,
        eventVersion: lambdaContext.functionVersion,
        resourceId: lambdaContext.functionVersion,
        resourceType: lambdaContext.functionName,
        job: {
          action: 'HTTP',
          service: 'LAMBDA',
        },
      });

      reject(err);
    }
  });
};
