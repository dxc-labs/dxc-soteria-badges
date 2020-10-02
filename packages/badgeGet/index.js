'use strict';
const httpStatus = require('http-status-codes');

const aws = require('/opt/nodejs/aws');
const config = require('/opt/nodejs/config');
const restAPI = require('/opt/nodejs/restApi');
const verifyPassToken = require('/opt/nodejs/hashToken');
const getSiteToken = require('/opt/nodejs/getSiteHashToken');

aws.region = config.getDeployTime('region');
const requestsTableName = config.getDeployTime('BadgesTableName');

let badgeGet = async (event, context) => {
    return await new Promise(async (resolve, reject) => {
        try {
            console.log("event:", JSON.stringify(event));
            console.log("context:", JSON.stringify(context));

            let badgeRequestId = event.pathParameters.requestId;

            let authKey;
            if (event.headers.hasOwnProperty('Authorization')) {
                authKey = event.headers.Authorization;
            } else {
                return resolve(restAPI.prepareResponse(httpStatus.FORBIDDEN));
            }
            let caller = null;
            if (event.headers.hasOwnProperty('x-caller')) {
                caller = event.headers['x-caller'];
            }
            //Checkpoint's Get Badge Request
            if (caller === 'checkpoint') {
                let locationId = null;
                if (event.headers.hasOwnProperty('x-locationid')) {
                    locationId = event.headers['x-locationid'];
                } else {
                    console.log("GateKeeper has not set x-locationid in headers")
                    return resolve(restAPI.prepareResponse(httpStatus.FORBIDDEN));
                }
                const gateKeeperIdentity = await getSiteToken.getGateKeeperIdentity(locationId)
                if (!gateKeeperIdentity) {
                    return resolve(restAPI.prepareResponse(httpStatus.NOT_FOUND));
                }
                const isAuthorized = await verifyPassToken.authorizeToken(gateKeeperIdentity, authKey)
                console.log("Gate Keeper isAuthorized : ", isAuthorized);
                if (!isAuthorized) {
                    return resolve(restAPI.prepareResponse(httpStatus.FORBIDDEN));
                }

                const params = {
                    TableName: requestsTableName,
                    Key: {
                        'requestId': badgeRequestId
                    }
                };
                const result = await aws.dbGet(params);

                if (!result.Item) {
                    return resolve(restAPI.prepareResponse(httpStatus.NOT_FOUND));
                }
                const { applepassUrl, hashedToken, email, ...badge } = result.Item;
                console.log("Badge:", badge);
                return resolve(restAPI.prepareResponse(httpStatus.OK, badge));
            } else {
                //Get Badge Request
                const params = {
                    TableName: requestsTableName,
                    Key: {
                        'requestId': badgeRequestId
                    }
                };
                const result = await aws.dbGet(params);
                if (!result.Item) {
                    return resolve(restAPI.prepareResponse(httpStatus.NOT_FOUND));
                }
                const isAuthorized = await verifyPassToken.authorizeToken(result.Item.hashedToken, authKey);
                console.log("Is Pass Token Valid: ", isAuthorized);
                if (!isAuthorized) {
                    return resolve(restAPI.prepareResponse(httpStatus.FORBIDDEN));
                }
                const applepassUrl = result.Item.applepassUrl
                let url = new URL(applepassUrl)
                console.log('applepassUrl', applepassUrl)
                let getParams = {
                    Bucket: url.host.split('.')[0],
                    Key: url.pathname.slice(1)
                }
                let data = await aws.getFile(getParams);
                if (!data.Body) {
                    return resolve(restAPI.prepareResponse(httpStatus.NOT_FOUND));
                }
                result.Item.applepassUrl = data.Body.toString('base64');
                return resolve(restAPI.prepareResponse(httpStatus.OK, result.Item));
            }
        } catch (error) {
            console.error("Error: ", error);
            return resolve(restAPI.prepareResponse(httpStatus.INTERNAL_SERVER_ERROR));
        }
    })
}

module.exports = {
    handler: badgeGet,
};
