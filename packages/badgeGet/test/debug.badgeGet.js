'use strict';
const getBadge = require('../index.js');

const callLambda = async () => {
    return await new Promise(async function(resolve, reject) {
        try {
            let event = require("./success.json");
            let result = await getBadge.handler(event);
            console.log("Result of getBadge: ", result);
            resolve(result);
        } catch( error ) {
            console.error("Profile Get : ", error);
            reject(error);
        }
    });
}

console.info("Start debug.getBadge...");
let res = callLambda();
res.then(
    (value) => console.info("End debug.getBadge...", value),
    (error) => console.error("End debug.getBadge...", error)
);
