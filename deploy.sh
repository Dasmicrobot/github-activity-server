#!/usr/bin/env bash -e

B="${LAMBDA_S3_BUCKET_NAME:?S3 bucket name required}"
X="${GITHUB_OAUTH_CALLBACK_URL:?Callback url is required}"
Y="${GITHUB_OAUTH_CLIENT_ID:?Github client ID required}"
Z="${GITHUB_OAUTH_CLIENT_SECRET:?Github client secret required}"

if aws s3 ls s3://${LAMBDA_S3_BUCKET_NAME} 2>&1 | grep -q 'NoSuchBucket'; then
    aws s3 mb s3://${LAMBDA_S3_BUCKET_NAME}
fi

sam package --output-template-file packaged.yaml --s3-bucket ${LAMBDA_S3_BUCKET_NAME}

sam deploy --template-file packaged.yaml \
        --stack-name github-activity-server \
        --capabilities CAPABILITY_IAM \
        --parameter-overrides GithubClientId=${GITHUB_OAUTH_CLIENT_ID} GithubClientSecret=foobar GithubOauthCallbackUrl=${GITHUB_OAUTH_CALLBACK_URL}
