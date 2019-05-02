const { fromPromised } = require('folktale/concurrency/task'); 
const { getUserById } = require('../user/');
const { getTweetById } = require('../../integrations/twitter/')
const Intent = require('./intent');
const IntentModel = require('./model/');

const getIntentById = Intent.getIntentById(IntentModel);
const getIntents = Intent.getIntents(IntentModel);
const getUserIntentByTweet = Intent.getUserIntentByTweet(getIntents);
const getIntentsByUser = Intent.getIntentsByUser(getIntents);
const createIntent = Intent.createIntent(IntentModel);
const modifyIntent = Intent.modifyIntent(IntentModel, getIntentById);
const deleteIntent = Intent.deleteIntent(IntentModel, getIntentById);
const validateIntentData = Intent.validateIntentData(
  getUserIntentByTweet,
  fromPromised(getUserById),
  fromPromised(getTweetById),
  Intent.validateStartTime
);

module.exports = {
  async createIntent(data) {
    return createIntent(validateIntentData, data).run().promise();
  },
  async getIntentsByUser(userId) {
    return getIntentsByUser(userId).run().promise();
  },
  async getIntentById(id) {
    return getIntentById(id).run().promise();
  },
  async modifyIntent(id, changes) {
    return modifyIntent(id, changes).run().promise();
  },
  async deleteIntent(id) {
    return deleteIntent(id).run().promise();
  }
};