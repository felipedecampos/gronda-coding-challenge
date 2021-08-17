import { Context } from 'aws-lambda';
import { ErrorLog } from 'md-logs'; // TODO: Create lambda layer to log in CloudWatch
import { AWSError, SecretsManager } from 'aws-sdk';
import * as constants from './constants';

/**
 * Get secret value from AWS Secrets Manager by secretName given
 */
export const getSecretValue = async (secretName: string, lambdaContext: Context): Promise<string> => {
  // AWS Secrets Manager client
  const clientAWS = new SecretsManager({ region: constants.region });

  return new Promise((resolve, reject) => {
    clientAWS.getSecretValue({ SecretId: secretName }, function(
      err: AWSError,
      data: SecretsManager.GetSecretValueResponse,
    ) {
      // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
      if (err) {
        ErrorLog({
          e: err,
          tag: 'RUNTIME',
          description: `Error getting secret value (${secretName}) from AWS SecretsManager client`,
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
      } else {
        // Decrypts secret using the associated KMS CMK.
        // Depending on whether the secret is a string or binary, one of these fields will be populated.
        if ('SecretString' in data) {
          resolve(String(data.SecretString));
        } else {
          const buff = new Buffer(String(data.SecretBinary), 'base64');
          resolve(buff.toString('utf8'));
        }
      }
    });
  });
};
