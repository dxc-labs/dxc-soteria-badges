httpStatus = require('http-status-codes');

exports.prepareResponse = function prepareResponse(statusCode, message) {
    return {
        "statusCode": statusCode,
        "headers": {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST,GET,OPTIONS'
        },
        "body": JSON.stringify(message ? message : {}),
        "isBase64Encoded": false,
    };
};
