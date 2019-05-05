const R = require('ramda');
const Result = require('folktale/result');
const Maybe = require('folktale/maybe');
const { of, fromPromised, rejected, do: taskDo } = require('folktale/concurrency/task');

module.exports.twitterClient = R.curry((clientDep, consumerKey, consumerSecret, accessToken, accessSecret) => {
  return new clientDep({
    consumer_key: consumerKey,
    consumer_secret: consumerSecret,
    access_token: accessToken,
    access_token_secret: accessSecret
  });
});

module.exports.clientForUser = R.curry((getCredsByUserId, twitterClient, userId) => {
  return getCredsByUserId(userId)
    .chain(result => result.matchWith({
      Just: (data) => of(data.value),
      Nothing: () => rejected('User missing credentials.')
    }))
    .map(({ token, secret }) => twitterClient(token, secret));
});

module.exports.getTweetById = R.curry((clientForUser, userId, tweetId) => {
  return clientForUser(userId)
    .chain(client => fromPromised(client.get.bind(client))('statuses/show/:id', { id: tweetId, include_my_retweet: true }))
    .map(R.prop('data'));
});

module.exports.deleteRetweet = R.curry((clientForUser, userId, tweetId) => {
  return clientForUser(userId)
    .chain(client => fromPromised(client.post.bind(client))('statuses/unretweet/:id', { id: tweetId }))
    .map(R.prop('data'));
});

module.exports.retweet = R.curry((getTweetById, deleteRetweet, clientForUser, userId, tweetId) => {
  return getTweetById(userId, tweetId)
    .chain(R.ifElse(
      R.propEq('retweeted', true), 
      () => deleteRetweet(userId, tweetId), 
      of
    ))
    .chain(clientForUser(user))
    .chain(client => fromPromised(client.post.bind(client))('statuses/retweet/:id', { id: tweetId }))
    .map(R.prop('data'));
});