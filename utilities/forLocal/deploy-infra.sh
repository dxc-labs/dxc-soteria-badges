#!/bin/bash

echo '=================================== Deploy Infrastructure Started (deploy-infra.sh) ================================================'

[ -n "${AWS_ACCESS_KEY_ID}" ] || { echo "AWS_ACCESS_KEY_ID environment variable not defined"; exit 1; }
[ -n "${AWS_SECRET_ACCESS_KEY}" ] || { echo "AWS_SECRET_ACCESS_KEY environment variable not defined"; exit 1; }

# Validate AWS keys list backend bucket

cd functions/terraform

rm -rf .terraform

terraform init -backend-config "bucket=$TF_STATE_BUCKET_NAME" -backend-config "region=$AWS_REGION" -backend-config "key=rtastate/terraform.tfstate" -var aws_account="$AWS_ACCOUNT"

terraform plan -var aws_account="$AWS_ACCOUNT" -var region="$AWS_REGION" -var bucket="$TF_STATE_BUCKET_NAME" -var domainName="$domainName" -var appleCertificate="$appleCertificate" -var appleCertificateKey="$appleCertificateKey" -var applePassTypeIdentifier="$applePassTypeIdentifier" -var appleTeamIdentifier="$appleTeamIdentifier" -var splitTokenKey="$splitTokenKey" -var environment="$ENVIRONMENT" -var user="$USER"

terraform apply -auto-approve -var aws_account="$AWS_ACCOUNT" -var region="$AWS_REGION" -var bucket="$TF_STATE_BUCKET_NAME" -var domainName="$domainName" -var appleCertificate="$appleCertificate" -var appleCertificateKey="$appleCertificateKey" -var applePassTypeIdentifier="$applePassTypeIdentifier" -var appleTeamIdentifier="$appleTeamIdentifier" -var splitTokenKey="$splitTokenKey" -var environment="$ENVIRONMENT" -var user="$USER"

# export dynamoDBStream=$(terraform output dynamoDBStream)

# echo '{"dynamoDBStream":"'"$dynamoDBStream"'"}' > ../setting.json

# cat ../setting.json

cd ..

echo '=================================== Deploy Infrastructure Done (deploy-infra.sh) ================================================'
