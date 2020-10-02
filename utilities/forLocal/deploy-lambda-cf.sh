# Deployment script for AWS CloudFormation Templates
#!/usr/bin/env bash
# Deployment script for AWS CloudFormation Templates

# * Replaces values within the template with actual values
# * Package the CF template

function upload_api_spec() {
    echo -ne "\tUploading API spec... "
    aws s3 cp "$API_SPEC" s3://${CF_BUCKET_NAME}/openapi.yaml >/dev/null &&
        echo -e "Done" ||
        # If error logic here
        echo -e "Error"
}

function package_template() {
    echo -ne "\tPackaging template... "

    aws cloudformation package \
        --region $AWS_REGION \
        --template-file="${TEMPLATE_FILE}" \
        --s3-bucket="${CF_BUCKET_NAME}" \
        --output-template-file="${OUTPUT_TEMPLATE}" \
        >/dev/null &&
        echo -e "Done" ||
        # If error logic here
        echo -e "Error"
}

# * Deploys the packaged CF template
# * Replaces values within the template with actual values
function deploy_template() {
    echo -ne "\tDeploying template... "

    aws cloudformation deploy \
        --region $AWS_REGION \
        --template-file $OUTPUT_TEMPLATE \
        --stack-name $STACK_NAME \
        --capabilities CAPABILITY_IAM \
        --parameter-overrides \
        ApplicationName=$PROJECT_NAME \
        Environment=$ENVIRONMENT \
        User=$USER \
        HostedZoneName=$HOSTED_ZONE_NAME \
        AcmCertificateArn=$ACM_CERTIFICATE_ARN \
        ApiDomainName=$API_DOMAIN_NAME \
        passLocator=$passLocator \
        applePassKitBucket=$applePassKitBucket \
        sourceEmailId=$sourceEmailId \
        CloudFormationBucket=$CF_BUCKET_NAME \
        Module=$MODULE \
        Prefix=$STACK_PREFIX \
        --tags \
        Application=$PROJECT_NAME \
        Environment=$ENVIRONMENT \
        >/dev/null &&
        echo -e "Done" ||
        # If error logic here
        echo -e "Error"

}

function setTerminationProtection() {
    echo "Setting Terminiation Protection"
    if [ "$ENVIRONMENT" = "prod" ] || [ "$ENVIRONMENT" = "test" ]; then
        echo "Adding stack protection"
        aws cloudformation update-termination-protection \
        --enable-termination-protection \
        --stack-name "$STACK_NAME"
    fi
    echo "Terminiation Protection Set"
    # TODO: Catch Errors
}

# * Print out stack details after deployment
function describeStacks() {
    echo "Stack Details"
    aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query Stacks[].Outputs \
    --region ${AWS_REGION} \
    --output table 
    # TODO: Catch Errors
}

function zipLambdas(){
    pwd
    cd '../functions/cloudformation/lambda/lambdaFunctions'
    mkdir -p zipped
    for folder in */ ; do
        if [ "$folder" != "zipped/" ]; then
            echo $folder
            zip_name=${folder//[!0-9a-zA-Z-]}.zip
            echo $zip_name
            cd $folder
            mkdir lib
            cp ../layer/nodejs/*.js lib/
            npm install
            7z a -r "../zipped/$zip_name" index.* node_modules* nodejs* lib*
            cd ..
        fi
    done
    cd ../../../../
    pwd
}

function deploy() {
    echo ""
    MODULE=$1
    TEMPLATE_FILE="$CLOUDFORMATION_DIR/${MODULE}/template.yaml"
    OUTPUT_TEMPLATE="$CLOUDFORMATION_DIR/${MODULE}/packaged-template.yaml"

    if [ "$1" = "lambda" ]; then
        echo -e "Deploying Lambda..."
        zipLambdas
        pre_deploy
        upload_api_spec
        package_template
        deploy_template

    else
        echo -e "Not implemented..."
    fi
}

pre_deploy() {
    STACK_NAME=${STACK_PREFIX}-${MODULE} &&
        echo -e "\tSTACK_NAME: $STACK_NAME"
}

post_deploy() {
    setTerminationProtection
    describeStacks
}
echo "****************************************** Start Lambda and Database deploy *************************************************************"
#*#################################################
#* Args
#*################################################
ENVIRONMENT=${environment:-dev}
USER=${user:-}

# TODO: Fix error checking
while [ $# -gt 0 ]; do
    if [[ $1 == *"--"* ]]; then
        param="${1/--/}"
        declare "${param^^}"="$2"
    fi
    shift
done

# TODO: Document
# if [ -z "$USER" ]; then
#     read -p "Enter username: " USER
# fi

# if [ -z "$PROFILE" ]; then
#     read -p "Enter aws profile name: " PROFILE
# fi

#*#################################################
#* Vars
#*################################################
cd "${0%/*}"
ROOT_DIR=$(PWD)

PROJECT_NAME="badges"
CLOUDFORMATION_DIR="functions/cloudformation"
API_SPEC="$CLOUDFORMATION_DIR/lambda/openapi.yaml"
API_DOMAIN_NAME="$API_DOMAIN_NAME.$HOSTED_ZONE_NAME"

clear
# echo -e "################################################################################################\n"
echo -e "PROJECT_NAME: $PROJECT_NAME"

STACK_PREFIX="${ENVIRONMENT}-${USER}-badges"
echo "$STACK_PREFIX"


echo -ne "ACCOUNT_ID: " &&
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text) &&
    echo -ne "$ACCOUNT_ID\n"

CF_BUCKET_NAME=${ENVIRONMENT}-${USER}-badges-cloudformation-artifacts-${AWS_REGION}


# echo -e "\n################################################################################################"

#*#################################################
#* Main
#*#################################################
echo "Deploying...."
deploy lambda && post_deploy
echo "****************************************** Done Lambda and Database deploy *************************************************************"
