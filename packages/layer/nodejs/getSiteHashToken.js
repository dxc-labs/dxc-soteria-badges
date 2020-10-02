'use strict';

const aws = require('./aws');
const config = require('./config');

exports.getGateKeeperIdentity = async function getGateKeeperIdentity(locationId) {
    const params = {
        TableName: config.getDeployTime('SitesTableName'),
        Key: {
            'locationId': locationId
        }
    };
    
    const result = await aws.dbGet(params);
    if (result.Item) {
        console.log("Gate Keeper Identity:", result.Item.token);
        return result.Item.token;
    }
    return null; // Gate Keeper Identity not found
};
