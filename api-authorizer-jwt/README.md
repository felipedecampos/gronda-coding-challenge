# Lambda Authorizer

## Description

This lambda authorizer is to be setup in API Gateway to be used as a middleware to validate the JSON Web Token (JWT) before forwarding the request

## Dependencies

This lambda use the package npm `"jsonwebtoken": "^8.5.1"` to validate a JSON Web Token (JWT)

The authorizer expects to receive in `Header`the parameter `Authorization: Bearer ***TOKEN***`

## DOTENV

- JWT_SIGNING_KEY_SECRET_NAME: The secret name to get the rsa_pub_key from AWS Secrets Manager and use to decode the JWT received from the request
- JWT_PAYLOAD_ISSUERS: The issuers which must match with the issuer from JWT

## Setup

```bash
cp .env-example .env.local
```

## Additional Security

- [AWS API Gateway Lambda Authorizers Documentation](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html)

## References

- [AWS DOC - configure lambda authorization](https://docs.aws.amazon.com/apigateway/latest/developerguide/configure-api-gateway-lambda-authorization-with-console.html)

- [AWS DOC - lambda authorizer output](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-lambda-authorizer-output.html)

