'use strict';
const deleteBadge = require('../index.js');

const callLambda = async () => {
    return await new Promise(async function(resolve, reject) {
        try {
            let event = require("./success.json");
            let result = await deleteBadge.handler(event);
            console.log("Result of deleteBadge: ", result);
            resolve(result);
        } catch( error ) {
            console.error("Badge delete : ", error);
            reject(error);
        }
    });
}

console.info("Start debug.deleteBadge...");
let res = callLambda();
res.then(
    (value) => console.info("End debug.deleteBadge...", value),
    (error) => console.error("End debug.deleteBadge...", error)
);
