import { Handler, APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult, Context } from 'aws-lambda';
import { InfoLog, ErrorLog } from 'md-logs'; // TODO: Create lambda layer to log in CloudWatch
import { validateToken } from './services/jwt';
import { extractTokenFromHeader } from './services/jwt';
import { sanitize } from './sanitize';

export const handler: Handler = async (event: APIGatewayTokenAuthorizerEvent, lambdaContext: Context, callback) => {
  const token: string | null = extractTokenFromHeader(event);

  if (!(token.length > 0) || typeof token !== 'string') {
    InfoLog({
      tag: 'INTEGRATION',
      description: 'Bad Request: Authorization Token',
    });
    callback('Unauthorized');
  }

  try {
    InfoLog({
      tag: 'INTEGRATION',
      description: 'Validating authorization token',
    });

    let data: APIGatewayAuthorizerResult = await validateToken(token, lambdaContext);

    if (!data) {
      InfoLog({
        tag: 'INTEGRATION',
        description: 'Expectation Failed',
      });
      callback('Unauthorized');
    }

    let sanitizedData: APIGatewayAuthorizerResult = sanitize(data, lambdaContext);

    callback(null, sanitizedData);
  } catch (e) {
    ErrorLog({
      e,
      tag: 'INTEGRATION',
      description: 'Error getting payload from JWT',
      eventID: lambdaContext.awsRequestId,
      eventVersion: lambdaContext.functionVersion,
      resourceId: lambdaContext.functionVersion,
      resourceType: lambdaContext.functionName,
      job: {
        action: 'SELECT',
        service: 'DYNAMODB',
      },
    });

    callback('Unauthorized');
  }
};
