#!/usr/bin/env bash -e

BUCKET_NAME="${LAMBDA_S3_BUCKET_NAME:?S3 bucket name required}"
CALLBACK="${GITHUB_OAUTH_CALLBACK_URL:?Callback url is required}"
CLIENT_ID="${GITHUB_CLIENT_ID:?Github client ID required}"
CLIENT_SECRET="${GITHUB_CLIENT_SECRET:?Github client secret required}"

if aws s3 ls s3://${BUCKET_NAME} 2>&1 | grep -q 'NoSuchBucket'; then
    aws s3 mb s3://${BUCKET_NAME}
fi

sam package --output-template-file packaged.yaml --s3-bucket ${BUCKET_NAME}

sam deploy --template-file packaged.yaml \
        --stack-name github-activity-server \
        --capabilities CAPABILITY_IAM \
        --parameter-overrides "GithubClientId=${CLIENT_ID} GithubClientSecret=${CLIENT_SECRET} GithubOauthCallbackUrl=${CALLBACK}"
