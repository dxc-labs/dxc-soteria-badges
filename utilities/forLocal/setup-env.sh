#!/bin/bash

echo '=================================== Setup Env start (setup-env.sh)===================================================='
set +x

echo "****aws region is $AWS_REGION"

exp="export TF_STATE_BUCKET_NAME=${ENVIRONMENT}-${USER}-badges-tfstate-bucket-$AWS_REGION"
eval $exp

echo "*****aws domain is $domainName"

echo -ne "AWS_ACCOUNT: " &&
    AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text) &&
    echo -ne "$AWS_ACCOUNT\n"

# part of setting up run time environment, create S3 bucket to store terraform state if one does not already exists

if aws s3 ls $TF_STATE_BUCKET_NAME 2>&1 | grep -q 'NoSuchBucket';
then
	echo "Creating S3 bucket $TF_STATE_BUCKET_NAME in $AWS_REGION"
    aws s3 mb "s3://${TF_STATE_BUCKET_NAME}" --region $AWS_REGION
else
    echo "Terraform backend bucket already exists"
fi

echo '=================================== Done Setup Env start (setup-env.sh)===================================================='