# github-activity-server

[![Tests](https://github.com/Dasmicrobot/github-activity-server/actions/workflows/test.yml/badge.svg?branch=master)](https://github.com/Dasmicrobot/github-activity-server/actions/workflows/test.yml)
[![Deploy to AWS API Gateway](https://github.com/Dasmicrobot/github-activity-server/actions/workflows/deploy.yml/badge.svg?branch=master)](https://github.com/Dasmicrobot/github-activity-server/actions/workflows/deploy.yml)
[![GitHub issues](https://img.shields.io/github/issues/Dasmicrobot/github-activity-server.svg)](https://github.com/Dasmicrobot/github-activity-server/issues)
[![GitHub last commit](https://img.shields.io/github/last-commit/Dasmicrobot/github-activity-server.svg)](https://github.com/Dasmicrobot/github-activity-server/commits/master)

## Requirements

* [Docker installed](https://www.docker.com/community-edition)
* [SAM CLI installed](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)

**For production**
* AWS CLI configured with appropriate permissions, 
  e.g. allow the following in an IAM policy 
  `lambda:*, iam:*, cloudformation:*, apigateway:*, s3:*`

## API

Production url: https://api.app.gitactivity.com

| Path | Headers | Query params |
| ---- | ------- | ------------ |
| `/github/organisations` | `X-Github-Token` (required) | |
| `/github/repositories` | `X-Github-Token` (required) | `organisation` (required), `pushedWithinDays` |

## Local development

**Start a local server (similar to API Gateway in production)**

```bash
sam local start-api --port 8080 --env-vars env.example.json
```

If the previous command ran successfully you should now be able to hit the following 
local endpoint to invoke your function `http://localhost:8080/oauth/github/login/callback`

**Invoke a separate function locally using a sample event payload**

```bash
sam local invoke --no-event OauthGithubAuthorizeFunction --env-vars env.example.json
```

## Packaging and deployment

See script [deploy.sh](./deploy.sh)

- Create a `S3 bucket` to store the packaged lambda functions:
```bash
aws s3 mb s3://BUCKET_NAME
```
- Package Lambda functions (uploads to S3):
```bash
sam package \
    --output-template-file packaged.yaml \
    --s3-bucket BUCKET_NAME
```
- Create Cloudformation Stack and deploy packaged resources.
```bash
sam deploy \
    --template-file packaged.yaml \
    --stack-name github-activity-server \
    --capabilities CAPABILITY_IAM
```

After deployment is complete you can run the following command to retrieve the API Gateway Endpoint URL:
```bash
aws cloudformation describe-stacks \
    --stack-name github-activity-server \
    --query 'Stacks[].Outputs[?OutputKey==`ApiUrl`]' \
    --output table
``` 

## Fetch, tail, and filter Lambda function logs

`NOTE`: This command works for all AWS Lambda functions; not just the ones you deploy using SAM.

```bash
sam logs -n OauthGithubAuthorizeFunction --stack-name github-activity-server --tail
```

## Cleanup

In order to delete the deployed Serverless Application you can use the following AWS CLI Command:

```bash
aws cloudformation delete-stack --stack-name github-activity-server
```
