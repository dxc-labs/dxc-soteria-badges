'use strict';

const slugid = require('slugid');
const httpStatus = require('http-status-codes');

const aws = require('/opt/nodejs/aws');
const hash = require('/opt/nodejs/hashToken');
const restAPI = require('/opt/nodejs/restApi');
const config = require('/opt/nodejs/config');

aws.region = config.getDeployTime('region');
const sitesTable = config.getDeployTime('SitesTableName');

let gateKeeperTokenGet = async (event, context) => {
    return await new Promise(async (resolve, reject) => {
        try {
            console.log("event:", JSON.stringify(event));
            console.log("context:", JSON.stringify(context));

            let gateKeeperIdentities = JSON.parse(event.body);
            //Generate token and store hashed
            let token = slugid.nice();
            let hashedToken = await hash.getHashOfToken(token);
            gateKeeperIdentities['token'] = hashedToken;
            //Insert Site Record
            const params = {
                Item: gateKeeperIdentities,
                TableName: sitesTable
            };
            let result = await aws.dbInsert(params);
            console.log("Record has been inserted successfully", result);
            //Return token
            return resolve(restAPI.prepareResponse(httpStatus.OK, { "token": token }));
        } catch (error) {
            console.error("Error: ", error);
            return resolve(restAPI.prepareResponse(httpStatus.INTERNAL_SERVER_ERROR));
        }
    })
};

module.exports = {
    handler: gateKeeperTokenGet,
};
