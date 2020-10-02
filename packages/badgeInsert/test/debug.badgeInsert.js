'use strict';
const badgeInsert = require('../index.js');

const callLambda = async () => {
    return await new Promise(async function(resolve, reject) {
        try {
            let event = require("./success.json");
            let result = await badgeInsert.handler(event);
            console.log("Result of badgeInsert: ", result);
            resolve(result);
        } catch( error ) {
            console.error("badgeInsert error : ", error);
            reject(error);
        }
    });
}

console.info("Start debug.badgeInsert...");
let res = callLambda();
res.then(
    (value) => console.info("End debug.badgeInsert...", value),
    (error) => console.error("End debug.badgeInsert...", error)
);
