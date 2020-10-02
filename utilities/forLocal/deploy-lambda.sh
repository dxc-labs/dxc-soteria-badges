#!/bin/bash

echo '=================================== Deployment of lambda started (deploy-lambda.sh) ===================================================='
pwd

export LAMBDA_EXECUTE_CONFIG_MEMORY=512
export LAMBDA_EXECUTE_TIMEOUT=25
export LAMBDA_EXECUTE_RUNTIME_MEMORY=1024
export LAMBDA_VERSIONS_TO_KEEP=5
export ROLE_EXTENSION=${ENVIRONMENT}-${USER}-badges-GatewayExecute-$AWS_REGION
export DXC_PASSLOCATOR="https://${APPLICATION_DOMAIN_NAME}.${HOSTED_ZONE_NAME}/b/"
export Source_EmailId=${sourceEmailId}
export Apple_PassKit_Bucket=${ENVIRONMENT}-${USER}-badges-apple-passkit-$AWS_REGION
export ENVIRONMENT=$ENVIRONMENT
echo env:$ENVIRONMENT
export USER=$USER
echo user:$USER
export APPLICATION="raa" 
export appleCertificate=${ENVIRONMENT}-${USER}-badges-appleCertificate
export appleCertificateKey=${ENVIRONMENT}-${USER}-badges-appleCertificateKey
export applePassTypeIdentifier=${ENVIRONMENT}-${USER}-badges-applePassTypeIdentifier
export appleTeamIdentifier=${ENVIRONMENT}-${USER}-badges-appleTeamIdentifier
export splitTokenKey=${ENVIRONMENT}-${USER}-safetysuite-splitTokenKey


cd functions/serverless && npm install && serverless deploy --region $AWS_REGION --dxc-role-extension $ROLE_EXTENSION --memorySize $LAMBDA_EXECUTE_CONFIG_MEMORY --timeout $LAMBDA_EXECUTE_TIMEOUT --dxc-lambda-execute-runtime-memory $LAMBDA_EXECUTE_RUNTIME_MEMORY --dxc-lambda-versions-to-keep $LAMBDA_VERSIONS_TO_KEEP --dxc-passLocator $DXC_PASSLOCATOR --dxc-sourceEmailId $Source_EmailId --dxc-applePassKitBucket $Apple_PassKit_Bucket --dxc-environment $ENVIRONMENT --dxc-app-name $APPLICATION  --dxc-user $USER --dxc-appleCertificate $appleCertificate --dxc-appleCertificateKey $appleCertificateKey --dxc-applePassTypeIdentifier $applePassTypeIdentifier --dxc-appleTeamIdentifier $appleTeamIdentifier --dxc-splitTokenKey $splitTokenKey


echo '=================================== Deployment of lambdas is done ==============================================================='


# echo '=================================== Attach Autherization trigger ==============================================================='


# export dynamoDBStream=`cat ../setting.json | jq -r ".dynamoDBStream"`


# jsonVal=$( aws lambda list-event-source-mappings --function-name ${ENVIRONMENT}-${USER}-badges-requestProcess --region $AWS_REGION --query EventSourceMappings[0].UUID)
# jsonVal=${jsonVal//'"'/}
# echo ${jsonVal}
# if [ "$jsonVal" == "null" ]
# then

# #create
# aws lambda create-event-source-mapping --function-name ${ENVIRONMENT}-${USER}-badges-requestProcess --enabled --event-source-arn $dynamoDBStream --maximum-retry-attempts 3 --starting-position LATEST --region $AWS_REGION
# else
# #update
# aws lambda update-event-source-mapping --uuid $jsonVal --function-name ${ENVIRONMENT}-${USER}-badges-requestProcess --maximum-retry-attempts 3 --region $AWS_REGION --enabled
# fi


# echo '=================================== Attach Autherization trigger done ==============================================================='
