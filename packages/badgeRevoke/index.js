'use strict';

const axios = require('axios');
const httpStatus = require('http-status-codes');

const aws = require('/opt/nodejs/aws');
const restAPI = require('/opt/nodejs/restApi');
const config = require('/opt/nodejs/config');

aws.region = config.getDeployTime('region');
const requestsTable = config.getDeployTime('BadgesTableName');
const sourceEmailId = config.getDeployTime('sourceEmailId');
const dashboardEmailAPIBaseURL = config.getDeployTime('dashboardEmailAPIBaseURL');
const dashboardsAPIKeySSMName = config.getDeployTime('dashboardsAPIKeySSMName');
const emailTemplateNotifyRevocationToEmployeeBadge = config.getDeployTime('emailTemplateNotifyRevocationToEmployeeBadge');
const emailTemplateNotifyRevocationToVisitorBadge = config.getDeployTime('emailTemplateNotifyRevocationToVisitorBadge');
const mystatus = 'Cancelled';

let badgeRevoke = async (event, context) => {
    return await new Promise(async (resolve, reject) => {
        try {
            console.log("event:", JSON.stringify(event));
            console.log("context:", JSON.stringify(context));

            let badgeRequest = JSON.parse(event.body);
            let requestId = badgeRequest.passId;
            let revokeReason = badgeRequest.revokeReason;
            let notificationMessage;
            // Get Badge
            const params = {
                TableName: requestsTable,
                Key: {
                    'requestId': badgeRequest.passId
                }
            };
            const result = await aws.dbGet(params);
            if (!result.Item) {
                return resolve(restAPI.prepareResponse(httpStatus.NOT_FOUND));
            }
            // Update Badge
            let revokeDetails = result.Item;
            let updateResult = await aws.dbUpdate(await getUpdateParams(requestId, revokeReason))
            console.log('Updated badgeDetails: ', updateResult);

            notificationMessage = await notifyBadgeRevoke(revokeDetails.passType, notificationMessage, revokeReason, revokeDetails.email, revokeDetails.passLocation)

            // Notify User Badge Revoke
            console.log("Calling Dashboard API to send E-Mail")
            let dashboardsAPIKey = await config.getRunTime(dashboardsAPIKeySSMName, true);
            await axios.post(dashboardEmailAPIBaseURL,
                notificationMessage,
                { headers: { "x-api-key": dashboardsAPIKey } });
            console.log("E-Mail sent successfully");

            // Reslove successful on completion of the request
            return resolve(restAPI.prepareResponse(httpStatus.OK));
        } catch (error) {
            console.error("Error: ", error);
            return resolve(restAPI.prepareResponse(httpStatus.INTERNAL_SERVER_ERROR));
        }
    })
};

async function notifyBadgeRevoke(userType, sendEmailAPIBody, revokeReason, email, passLocation) {
    if (userType === 'employee') {
        sendEmailAPIBody = {
            "template_name": emailTemplateNotifyRevocationToEmployeeBadge,
            "sentfrom": sourceEmailId,
            "data": {
                "revokeReason": revokeReason
            },
            "sendto": [email]
        };
    }
    else {
        sendEmailAPIBody = {
            "template_name": emailTemplateNotifyRevocationToVisitorBadge,
            "sentfrom": sourceEmailId,
            "data": {
                "revokeReason": revokeReason,
                "passLocation": passLocation
            },
            "sendto": [email]
        };
    }
    return sendEmailAPIBody;
}

async function getUpdateParams(key, revokeReason) {
    let updatedParams = {
        TableName: requestsTable,
        Key: {
            requestId: key
        },
        UpdateExpression: " SET #statusParam = :status, revokeReason = :revokeReason, updatedDate = :updatedDate",
        ExpressionAttributeNames: {
            "#statusParam": "status"
        },
        ExpressionAttributeValues: {
            ":status": mystatus,
            ":revokeReason": revokeReason,
            ":updatedDate": Date.now()
        },
        ReturnValues: "UPDATED_NEW"
    }

    return updatedParams;
}

module.exports = {
    handler: badgeRevoke,
};
