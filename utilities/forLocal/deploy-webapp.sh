#!/bin/bash
# Deployment script for WebApp


echo "APPLICATION_BUCKET=$APPLICATION_BUCKET"
export APPLICATION_DIR="web"
echo "APPLICATION_DIR=$APPLICATION_DIR"
# export REACT_APP_API_DOMAIN="https://xxx.execute-api.us-east-1.amazonaws.com/dev"
echo "REACT_APP_API_DOMAIN=$REACT_APP_API_DOMAIN"

echo -e "Deploying Web Application..."
echo -ne "\tApp bucket name: ${APPLICATION_BUCKET}\n"

echo -ne "\tPACKAGE_VERSION: " &&
    PACKAGE_VERSION=$(cat $APPLICATION_DIR/package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]') &&
    echo -e $PACKAGE_VERSION

echo "\tBuilding application... "
cd $APPLICATION_DIR
rm -r build
npm install
npm run build
echo "Done"

echo -ne "\tUploading files... " &&
    aws s3 sync build s3://$APPLICATION_BUCKET --delete >/dev/null &&
    echo -e "Done"

echo -ne "\tSetting cache-control header... " &&
    aws s3api copy-object --copy-source $APPLICATION_BUCKET/index.html --bucket $APPLICATION_BUCKET --key index.html --metadata-directive REPLACE --cache-control "max-age=0" --content-type "text/html" >/dev/null &&
    echo -e "Done"