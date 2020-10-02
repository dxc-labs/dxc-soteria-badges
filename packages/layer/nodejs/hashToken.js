const config = require('./config');

async function getHashOfToken(token){

    const splitTokenKey = await config.getRunTime(config.getDeployTime('splitTokenKey'));
    const crypto = require('crypto');
    let hash = crypto.createHmac('sha256', splitTokenKey).update(token).digest('base64');
    return hash;
}

async function authorizeToken(hashOfToken, token) {

    const hash = await getHashOfToken(token);
    return (hashOfToken === hash);
}

module.exports = {
    getHashOfToken,
    authorizeToken
};
