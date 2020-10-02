'use strict';

const axios = require('axios');
const slugid = require('slugid');
const httpStatus = require('http-status-codes');

const aws = require('/opt/nodejs/aws');
const config = require('/opt/nodejs/config');
const hash = require('/opt/nodejs/hashToken');
const restAPI = require('/opt/nodejs/restApi');
const passKit = require('/opt/nodejs/applepass');
aws.region = config.getDeployTime('region');

const passLocator = config.getDeployTime('passLocator');
const sourceEmailId = config.getDeployTime('sourceEmailId');
const BadgesTableName = config.getDeployTime('BadgesTableName');
const testUserListParamName = config.getDeployTime('testUserListParamName');
const dashboardEmailAPIBaseURL = config.getDeployTime('dashboardEmailAPIBaseURL');
const dashboardsAPIKeySSMName = config.getDeployTime('dashboardsAPIKeySSMName');
const enableTestModeParamName = config.getDeployTime('enableTestModeParamName');
const testCaseEmailListParamName = config.getDeployTime('testCaseEmailListParamName');
const emailTemplateSendBadgeLinkToEmployee = config.getDeployTime('emailTemplateSendBadgeLinkToEmployee');
const emailTemplateSendBadgeLinkToVisitor = config.getDeployTime('emailTemplateSendBadgeLinkToVisitor');
const g_approvedStatus = 'Approved';

let badgeInsert = async (event, context) => {
    return await new Promise(async (resolve, reject) => {
        try {
            console.log("event:", JSON.stringify(event));
            console.log("context:", JSON.stringify(context));

            let badgeRequest = JSON.parse(event.body);
            console.log('badgeRequest: ', badgeRequest);

            let token = slugid.nice();
            let enableTestMode = await config.getRunTime(enableTestModeParamName);
            if (enableTestMode === 'true' && await hasUser(badgeRequest.email, testCaseEmailListParamName)) {
                token = event.headers.passToken4Test;
            }

            //Insert Badge
            let items = await setParams(badgeRequest, enableTestMode, token);
            if (!items) {
                return resolve(restAPI.prepareResponse(httpStatus.INTERNAL_SERVER_ERROR));
            }
            let params = {
                Item: items,
                TableName: BadgesTableName
            };
            console.log('badgeRequest params: ', params);
            let data = await aws.dbInsert(params);
            console.log("Record has been inserted successfully");

            //Notify User with Badge Link
            let notificationMessage = await notifyBadgeLink(items, token)
            console.log("Calling Dashboard API to send E-Mail")
            let dashboardsAPIKey = await config.getRunTime(dashboardsAPIKeySSMName, true);
            await axios.post(dashboardEmailAPIBaseURL,
                notificationMessage,
                { headers: { "x-api-key": dashboardsAPIKey } });
            console.log("E-Mail sent successfully");

            // resolve successful on Insert
            return resolve(restAPI.prepareResponse(httpStatus.OK, { "requestId": items.requestId }));

        } catch (error) {
            console.error("Error: ", error);
            return resolve(restAPI.prepareResponse(httpStatus.INTERNAL_SERVER_ERROR));
        }
    })

};

async function setParams(badgeRequest, enableTestMode, token) {

    const requestId = slugid.nice();
    let { name, email, passType, passLocation, visitorOrgName, employeeNumber } = badgeRequest;
    let items = {
        "requestId": requestId,
        "name": name,
        "email": email,
        "passType": passType,
        "status": g_approvedStatus,
        "createdDate": Date.now(),
        "updatedDate": Date.now(),
    };

    let hashedToken = await hash.getHashOfToken(token);
    items['hashedToken'] = hashedToken;
    //Generate Apple Pass
    let applepass = await passKit.createpass(passType, passLocation, name, requestId);
    if (!applepass) {
        return null;
    }
    items["applepassUrl"] = applepass;
    if (enableTestMode === 'true' && await doAddBadgeLink(email)) {
        console.log('Adding badge link ');
        let badgeLink = `${passLocator}${requestId}#${token}`;
        items["badgeLink"] = badgeLink;
    }
    if (passType == 'visitor') {
        let currentDate = new Date();
        items['validDate'] = currentDate.toLocaleDateString();
        items['passLocation'] = passLocation;
        items['visitorOrgName'] = visitorOrgName;
        items['passLocation'] = passLocation;
    } else {
        items['employeeNumber'] = employeeNumber;
    }
    return items;
};

async function notifyBadgeLink(items, token) {
    let { passType, requestId, email, validDate, passLocation } = items;
    let sendEmailAPIBody;
    if (passType == "employee") {
        sendEmailAPIBody = {
            "template_name": emailTemplateSendBadgeLinkToEmployee,
            "sentfrom": sourceEmailId,
            "data": {
                "passLocator": passLocator,
                "requestId": requestId,
                "token": token
            },
            "sendto": [email]
        };
    }
    else {
        sendEmailAPIBody = {
            "template_name": emailTemplateSendBadgeLinkToVisitor,
            "sentfrom": sourceEmailId,
            "data": {
                "passLocator": passLocator,
                "requestId": requestId,
                "token": token,
                "passLocation": passLocation,
                "validDate": validDate
            },
            "sendto": [email]
        };
    }
    return sendEmailAPIBody;
}

async function hasUser(email, userList) {
    let emailList = await config.getRunTime(userList);
    let emailArray = emailList.split(',');
    return emailArray.includes(email);
}

async function doAddBadgeLink(email) {
    let emailList = await config.getRunTime(testUserListParamName);
    let emailArray = emailList.split(',');
    return emailArray.includes(email);
}

module.exports = {
    handler: badgeInsert
};
