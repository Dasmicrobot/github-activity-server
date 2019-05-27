# github-activity-server

[![Build Status](https://travis-ci.org/Dasmicrobot/github-activity-server.svg?branch=master)](https://travis-ci.org/Dasmicrobot/github-activity-server)
[![GitHub issues](https://img.shields.io/github/issues/Dasmicrobot/github-activity-server.svg)](https://github.com/Dasmicrobot/github-activity-server/issues)
[![GitHub last commit](https://img.shields.io/github/last-commit/Dasmicrobot/github-activity-server.svg)](https://github.com/Dasmicrobot/github-activity-server/commits/master)

## Requirements

* AWS CLI already configured with Administrator permission
* [NodeJS 10.10+ installed](https://nodejs.org/en/download/releases/)
* [Docker installed](https://www.docker.com/community-edition)

## Setup process

### Local development

**Invoking function locally using a local sample payload**

```bash
sam local invoke --no-event OauthGithubAuthorizeFunction --parameter-overrides ParameterKey=GithubClientId,ParameterValue=foobar
```
 
**Invoking function locally through local API Gateway**

```bash
sam local start-api --parameter-overrides 'ParameterKey=GithubClientId,ParameterValue=XXXXXXX ParameterKey=GithubClientSecret,ParameterValue=XXXXXXX ParameterKey=GithubOatuhCallbackUrl,ParameterValue=http://127.0.0.1:8080/callback.html'
```

If the previous command ran successfully you should now be able to hit the following local endpoint to invoke your function `http://localhost:3000/$FunctionPath`

## Packaging and deployment


Create `S3 bucket`:
```bash
aws s3 mb s3://BUCKET_NAME
```

Package Lambda (uploads to S3):

```bash
sam package \
    --output-template-file packaged.yaml \
    --s3-bucket BUCKET_NAME
```

Create Cloudformation Stack and deploy your SAM resources.

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

In order to delete our Serverless Application recently deployed you can use the following AWS CLI Command:

```bash
aws cloudformation delete-stack --stack-name github-activity-server
```
