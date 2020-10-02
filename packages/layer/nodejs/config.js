const aws = require('./aws');

class Paramters {
    getRunTime = async (param, doDecrypt = false) => {
        return aws.getSystemParameter(param, doDecrypt);
    }
    getDeployTime(param) {
        return process.env[param];
    }
}

module.exports = new Paramters();
