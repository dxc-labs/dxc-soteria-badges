'use strict';

const httpStatus = require('http-status-codes');
const path = require('path');

const aws = require('/opt/nodejs/aws.js');
const restAPI = require('/opt/nodejs/restApi');
const config = require('/opt/nodejs/config');

aws.region = config.getDeployTime('region');
const requestsTable = config.getDeployTime('BadgesTableName');
const applePassKitBucket = config.getDeployTime('applePassKitBucket');
const emailIndex = config.getDeployTime('emailIndex');

let badgeDelete = async (event, context) => {
    return await new Promise(async (resolve, reject) => {
        try {
            console.log("event:", JSON.stringify(event));
    
            let email = event.queryStringParameters.userId;
            let queryResult = await aws.dbGetMany(getInputParamsByEmail(email));
            console.log('queryResult:', queryResult);
            if((queryResult.Count) == 0) {
                return resolve(restAPI.prepareResponse(httpStatus.NOT_FOUND));
            }
            for (let id = 0, leng = queryResult.Items.length; id < leng; ++id) {
                const params = {
                    TableName: requestsTable,
                    Key: {
                        'requestId': queryResult.Items[id].requestId
                    }
                };
                let filename = path.basename(queryResult.Items[id].applepassUrl);
                console.log('filename: ', filename);
                
                if(queryResult.Items[id].passType == 'employee') {
                    let result = await aws.getFile(applePassParams(filename, 'Employee'))
                    if(!result.Body) {
                        console.log('Employee Apple pass not found');
                        return resolve(restAPI.prepareResponse(httpStatus.NOT_FOUND));
                    }
                    else {
                        let result = await aws.deleteFile(applePassParams(filename, 'Employee'));
                    }
                }
                else if(queryResult.Items[id].passType == 'visitor') {
                    let result = await aws.getFile(applePassParams(filename, 'Visitor'))
                    if(!result.Body) {
                        console.log('Vistor Apple pass not found');
                        return resolve(restAPI.prepareResponse(httpStatus.NOT_FOUND));
                    }
                    else {
                        let result = await aws.deleteFile(applePassParams(filename, 'Visitor'));
                    }  
                }
                let deleteResult = await aws.dbDelete(params);
                if(!deleteResult) {
                    return resolve(restAPI.prepareResponse(httpStatus.NOT_FOUND));
                }
            }
            return resolve(restAPI.prepareResponse(httpStatus.OK));
        }
        catch(error) {
            console.error("Error: ", error);
            return resolve(restAPI.prepareResponse(httpStatus.INTERNAL_SERVER_ERROR));
        }
    })
};

function getInputParamsByEmail(email) {
    let badgeParams = {
        TableName: requestsTable,
        ProjectionExpression: "requestId, passType, applepassUrl",
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: {
            ":email": email
        },
        IndexName: emailIndex
    };
    return badgeParams;
}

function applePassParams(filename, passType) {
    let params = {
        Bucket: `${applePassKitBucket}/ApplePass/${passType}`,
        Key: filename
    };
    return params; 
};

module.exports = {
    handler: badgeDelete
};
