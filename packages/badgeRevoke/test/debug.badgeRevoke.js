'use strict';
const revokeBadge = require('../index.js');

const callLambda = async () => {
    return await new Promise(async function(resolve, reject) {
        try {
            let event = require("./success.json");
            let result = await revokeBadge.handler(event);
            console.log("Result of revokeBadge: ", result);
            resolve(result);
        } catch( error ) {
            console.error("Badge revoke : ", error);
            reject(error);
        }
    });
}

console.info("Start debug.revokeBadge...");
let res = callLambda();
res.then(
    (value) => console.info("End debug.revokeBadge...", value),
    (error) => console.error("End debug.revokeBadge...", error)
);
