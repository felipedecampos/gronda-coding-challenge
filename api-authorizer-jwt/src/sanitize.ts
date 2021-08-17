import { APIGatewayAuthorizerResult, Context } from 'aws-lambda';

export const sanitize = (data: APIGatewayAuthorizerResult, lambdaContext: Context): APIGatewayAuthorizerResult => {
  // Maybe you need to sanitize your response
  return data;
};
