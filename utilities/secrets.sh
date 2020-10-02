#  Secrets for Badges component
ProjectName="--- Project Name Here"  # e.g. soteria
TenantName="--- Tenant Name Here ---" # e.g., xxx
EnvironmentName="--- Environment Name Here ---" # e.g. sbx
ComponentName="badges"
AWS_REGION="--- AWS Region Here ---" # e.g. us-east-1

splitTokenKey="--- Generate a slug ID and put it here ---"

# ---- START - Apple Pass Config Parameters -----

# Apple Pass Certificate to be generated from Apple Developer Account
# In Apple Developer Account, go to 'Certificates, Identifiers & Profiles'
# Select 'Identifiers' on the left menu
# Filter identifiers by 'Pass Type ID'
# Create a Pass Type ID, follow on-screen instructions
# and download the certificate (.p12 format)
# Convert Apple Certificate from .p12 to .pem(there you will have to enter
# Passphrase (unique key) for encrypting and decrypting .pem file)
appleCertificate="--- Apple Certificate Here ---" # .pem file contents

# Passphrase to be added (for decrypting .pem)
appleCertificateKey="--- Apple Certificate Key Here ---"

# e.g. pass.com.example.xxx
applePassTypeIdentifier="--- Apple Pass Type Identifier Here ---"

# Organization Unit
appleTeamIdentifier="--- Apple Team Identifier Here ---"

applePassValidityInDays="30"

# E.g., xxx@example.com,xxx@example.com OR none
testUserList="--- List Email Ids Here OR none ---"  

#Email list for testcases
testCaseEmailList="--- Comma Separated List of Email IDs Here for test cases ---"
# To store badge links, make it to true otherwise false
enableTestMode="--- true OR false ---"

# ---- END -  Apple Pass Config Parameters -----

#APIKeys
dashboardsAPIKey="--- Dashboards API Key Here ---"
apikey="--- x-api-key for testcases Here ---"


if aws ssm put-parameter --region $AWS_REGION --name "${ProjectName}-${TenantName}-${EnvironmentName}-${ComponentName}-appleCertificate" --type "SecureString" --value "${appleCertificate}" --tier Advanced --overwrite; then
	echo "Upload done"
fi

if aws ssm put-parameter --region $AWS_REGION --name "${ProjectName}-${TenantName}-${EnvironmentName}-${ComponentName}-appleCertificateKey" --type "String" --value "${appleCertificateKey}" --tier Standard --overwrite; then
	echo "Upload done"
fi

if aws ssm put-parameter --region $AWS_REGION --name "${ProjectName}-${TenantName}-${EnvironmentName}-${ComponentName}-applePassTypeIdentifier" --type "String" --value "${applePassTypeIdentifier}" --tier Standard --overwrite; then
	echo "Upload done"
fi

if aws ssm put-parameter --region $AWS_REGION --name "${ProjectName}-${TenantName}-${EnvironmentName}-${ComponentName}-appleTeamIdentifier" --type "String" --value "${appleTeamIdentifier}" --tier Standard --overwrite; then
	echo "Upload done"
fi

if aws ssm put-parameter --region $AWS_REGION --name "${ProjectName}-${TenantName}-${EnvironmentName}-${ComponentName}-splitTokenKey" --type "String" --value "${splitTokenKey}" --tier Standard --overwrite; then
	echo "Upload done"
fi

if aws ssm put-parameter --region $AWS_REGION --name "${ProjectName}-${TenantName}-${EnvironmentName}-${ComponentName}-applePassValidityInDays" --type "String" --value "${applePassValidityInDays}" --tier Standard --overwrite; then
	echo "Upload done"
fi

if aws ssm put-parameter --region $AWS_REGION --name "${ProjectName}-${TenantName}-${EnvironmentName}-${ComponentName}-testUserList" --type "StringList" --value "${testUserList}" --tier Standard --overwrite; then
		echo "SSM testUserList created"
fi

if aws ssm put-parameter --region $AWS_REGION --name "${ProjectName}-${TenantName}-${EnvironmentName}-${ComponentName}-enableTestMode" --type "String" --value "${enableTestMode}" --tier Standard --overwrite; then
		echo "SSM enableTestMode created"
fi

if aws ssm put-parameter --region $AWS_REGION --name "${ProjectName}-${TenantName}-${EnvironmentName}-${ComponentName}-testCaseEmailList" --type "StringList" --value "${testCaseEmailList}" --tier Standard --overwrite; then
 		echo "SSM testCaseEmailList created"
fi

if aws ssm put-parameter --region $AWS_REGION --name "${ProjectName}-${TenantName}-${EnvironmentName}-${ComponentName}-dashboardsAPIKey" --type "SecureString" --value "${dashboardsAPIKey}" --tier Standard --overwrite; then
		echo "SSM dashboardsAPIKey created"
fi

if aws ssm put-parameter --region $AWS_REGION --name "${ProjectName}-${TenantName}-${EnvironmentName}-${ComponentName}-apikey" --type "SecureString" --value "${apikey}" --tier Standard --overwrite; then
		echo "SSM apikey created"
fi

for f in utilities/emailTemplates/*.json;
do 
	echo "Processing $f file.."
	sed "s/StackName/${ProjectName}-${TenantName}-${EnvironmentName}-${ComponentName}/g" $f | tee emailTemplateFile.json
	if aws ses create-template --cli-input-json file://emailTemplateFile.json; then
		echo "SES $(basename "$f" .json) Email Template created!!"
	fi
done
