const twit = require('twit');
const Twitter = require('./twitter');
const { getCredsByUserId } = require('../../modules/user');
const { fromPromised } = require('folktale/concurrency/task');

const client = Twitter.twitterClient(
  twit, 
  process.env.TWITTER_CONSUMER_KEY,
  process.env.TWITTER_CONSUMER_SECRET
);

const getTweetById = Twitter.getTweetById(
  fromPromised(getCredsByUserId),
  client
);

module.exports = {
  _client: client,
  async getTweetById(userId, tweetId) {
    return getTweetById(userId, tweetId).run().promise();
  }
};