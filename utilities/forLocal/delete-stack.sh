echo "**************************************Delete Stack*******************************"

#Delete Stack Commands 

#./delete-stack.sh --AWS_REGION us-east-1 --AWS_ACCOUNT 0123456789012 --ENVIRONMENT dev --USER jenkins --APPLICATION_BUCKET xxx-xxx-jenkins-website --STACK_PREFIX xxx-dev-jenkins --TF_STATE_BUCKET_NAME xxx-tfstate-bucket-ap-south-1


# TODO: Fix error checking
while [ $# -gt 0 ]; do
    if [[ $1 == *"--"* ]]; then
        param="${1/--/}"
        declare $param="$2"
    fi
    shift
done

AWS_REGION=${AWS_REGION:-}
AWS_ACCOUNT=${AWS_ACCOUNT:-}
ENVIRONMENT=${ENVIRONMENT:-}
USER=${USER:-}
STACK_PREFIX=${STACK_PREFIX:-}
TF_STATE_BUCKET_NAME=${TF_STATE_BUCKET_NAME:-}


echo "$TF_STATE_BUCKET_NAME , $AWS_ACCOUNT , $ENVIRONMENT , $USER , $AWS_REGION , $STACK_PREFIX"

cd functions/serverless && npm install && serverless remove --region $AWS_REGION

cd ../..

echo "Emptying Application Bucket"
if aws s3 rm "s3://raa-deploys-$AWS_REGION" --recursive; then
    echo "Application Bucket Empty"
fi

cd functions/terraform

terraform init -backend-config "bucket=$TF_STATE_BUCKET_NAME" -backend-config "region=$AWS_REGION" -backend-config "key=rtastate/terraform.tfstate" -var aws_account="$AWS_ACCOUNT"

terraform destroy -auto-approve -var aws_account="$AWS_ACCOUNT" -var region="$AWS_REGION" -var bucket="$TF_STATE_BUCKET_NAME"

echo "Deleting TF_STATE_BUCKET_NAME Bucket"
if aws s3 rb "s3://${TF_STATE_BUCKET_NAME}" --force ; then
    echo "Temporary Bucket Deleted"
fi

if aws cloudformation delete-stack --stack-name ${STACK_PREFIX}-api --region $AWS_REGION; then
        echo "${STACK_PREFIX}-api deleted!"
fi
if aws cloudformation delete-stack --stack-name ${STACK_PREFIX}-storage --region $AWS_REGION; then
        echo "${STACK_PREFIX}-storage deleted!"
fi
if aws cloudformation delete-stack --stack-name ${STACK_PREFIX}-cdn --region $AWS_REGION; then
        echo "${STACK_PREFIX}-cdn deleted!"
fi

echo "**************************************Delete Stack Done*******************************"
