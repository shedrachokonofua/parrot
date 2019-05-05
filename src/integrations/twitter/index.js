const twit = require('twit');
const Twitter = require('./twitter');
const { getCredsByUserId } = require('../../modules/user');
const { fromPromised } = require('folktale/concurrency/task');

const client = Twitter.twitterClient(
  twit, 
  process.env.TWITTER_CONSUMER_KEY,
  process.env.TWITTER_CONSUMER_SECRET
);

const getCredsByUserIdTask = fromPromised(getCredsByUserId);
const clientForUser = Twitter.clientForUser(getCredsByUserIdTask, client);

const getTweetById = Twitter.getTweetById(clientForUser);
const deleteRetweet = Twitter.deleteRetweet(clientForUser);
const retweet = Twitter.retweet(getTweetById, deleteRetweet, clientForUser);

module.exports = {
  _client: client,
  async getTweetById(userId, tweetId) {
    return getTweetById(userId, tweetId).run().promise();
  },
  async retweet(userId, tweetId) {
    return retweet(userId, tweetId).run().promise();
  }
};