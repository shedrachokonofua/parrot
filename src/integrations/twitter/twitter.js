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

module.exports.getTweetById = (getCredsByUserId, twitterClient, userId, tweetId) => {
  return getCredsByUserId(userId)
    .chain(result => result.matchWith({
      Just: (data) => of(data.value),
      Nothing: () => rejected('User missing credentials.')
    }))
    .map(({ token, secret }) => twitterClient(token, secret))
    .chain(client => fromPromised(client.get.bind(client))('statuses/show/:id', { id: tweetId }))
    .map(({ data }) => Result.Ok(data))
    .orElse(error => of(Result.Error(error)));
}