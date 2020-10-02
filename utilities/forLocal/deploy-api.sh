# Create API
SWAGGER_FILE=functions/api/raa_swagger.json
STAGE_NAME=dev
STAGE_DESC=Developmnet

id=`aws apigateway get-rest-apis --region $AWS_REGION | jq -r '.items[] | select(.name=="raa-prod") | .id'`
echo $id

for i in $id
do 
    aws apigateway delete-rest-api --region $AWS_REGION --rest-api-id $i
done

#aws ssm put-parameter --region $AWS_REGION --name "rta_api_config" --type "String" --value " " --overwrite
REST_API_ID=`aws apigateway import-rest-api --region $AWS_REGION --body file://$SWAGGER_FILE | jq -r ".id"`
echo "Restapi ID is $REST_API_ID"

# Create Deployment
DEPLOY_ID=`aws apigateway create-deployment --region $AWS_REGION --rest-api-id $REST_API_ID  --description "first deployment" | jq -r ".id"`
echo "Deployment ID is ${DEPLOY_ID}"

# Stage Deployment
aws apigateway create-stage --region $AWS_REGION --rest-api-id ${REST_API_ID} --deployment-id ${DEPLOY_ID} --stage-name "${STAGE_NAME}" --description "${STAGE_DESC}"

# Invoke URL
targetApiPath="https://${REST_API_ID}.execute-api.${AWS_REGION}.amazonaws.com/${STAGE_NAME}"
export REST_API=$targetApiPath
echo $REST_API
# echo "Target API Path is ${targetApiPath}"

# # Update Swagger

# aws apigateway put-rest-api --rest-api-id ${REST_API_ID} --mode merge --body ${SWAGGER_FILE}

# # Re-deploy to same stage

# aws apigateway create-deployment --rest-api-id ${REST_API_ID}  --description "second deployment" --stage-name ${STAGE_NAME}

# # Delete API

# aws apigateway delete-rest-api --rest-api-id ${REST_API_ID}