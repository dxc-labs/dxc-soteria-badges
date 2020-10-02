'use strict';
const badgeGet = require('../index.js').handler;
const successResponse = require('../index.js').successResponse;
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { unexpectedError } = require('../index.js');

chai.use(chaiAsPromised);
const expect = chai.expect;
const should = chai.should();

chai.config.includeStack = true;
chai.config.showDiff = true;
chai.config.truncateThreshold = 0; // default is 40. 0 disables truncating

// mocha context not available if u use arrow functions.  E.g. this.timeout() will fail
// if done() not used, tests run sequentially
describe('/ Surveys / Badge Get / 1 /', () => {
    it('should successfully insert', async function () {
        let event = require("./success.json");
        let result = await badgeGet(event).should.be.fulfilled;
        expect(result.statusCode).to.equal(successResponse.statusCode);
        console.dir(result);
    });
    it.only('should handle fatal errors', async function () {
        let result = await badgeGet(null).should.be.fulfilled;
        expect(result.statusCode).to.equal(unexpectedError.statusCode);
        console.dir(result);
    });
});
