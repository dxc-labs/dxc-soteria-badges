'use strict';
const gateKeeperTokenGet = require('../index.js');

const callLambda = async () => {
    return await new Promise(async function(resolve, reject) {
        try {
            let event = require("./success.json");
            let result = await gateKeeperTokenGet.handler(event);
            console.log("Result of gateKeeperTokenGet: ", result);
            resolve(result);
        } catch( error ) {
            console.error("gateKeeperTokenGet error : ", error);
            reject(error);
        }
    });
}

console.info("Start debug.gateKeeperTokenGet...");
let res = callLambda();
res.then(
    (value) => console.info("End debug.gateKeeperTokenGet...", value),
    (error) => console.error("End debug.gateKeeperTokenGet...", error)
);
