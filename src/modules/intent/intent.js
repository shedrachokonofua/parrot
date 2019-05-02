const R = require('ramda');
const Maybe = require('folktale/maybe');
const Result = require('folktale/result');
const Validation = require('folktale/validation');
const { of, rejected, fromPromised, waitAll } = require('folktale/concurrency/task');
const moment = require('moment');

module.exports.calculateInitialNextTrigger = (createdTime, startTime, interval) => {
  const startHour = startTime.split(':')[0];
  const startTime = moment
};

module.exports.getIntents = R.curry((IntentModel, query) => {
  return fromPromised(IntentModel.find)(query)
    .map(R.ifElse(R.isEmpty, Maybe.Nothing, Maybe.Just))
});

module.exports.getIntentsByUser = R.curry((getIntents, userId) => getIntents({ userId }))

module.exports.getUserIntentByTweet = R.curry((getIntents, userId, tweetId) => getIntents({ userId, tweetId }));

module.exports.validateIntentData = R.curry((
  getUserIntentByTweet, 
  getUserById, 
  getTweetById, 
  { userId, tweetId }
) => {
  const maybeToResult = (maybeTask, failureReason) => {
    return maybeTask.map(result => result.matchWith({
      Just: () => Result.Ok(),
      Nothing: () => Result.Error([ failureReason ])
    }));
  }
  return waitAll([
    getTweetById(userId, tweetId),
    maybeToResult(getUserById(userId), 'User does not exist.'),
    maybeToResult(getUserIntentByTweet(userId, tweetId), 'User has intent on tweet.')
  ])
  .map(R.map(Validation.fromResult))
  .map(Validation.collect);
});

module.exports.createIntent = R.curry((IntentModel, validateData, intentData, now) => {
  return validateData(intentData)
    .chain(result => result.matchWith({
      Success: () => of(intentData),
      Failure: (reasons) => rejected(reasons.value)
    }))
    .chain(fromPromised(IntentModel.create));
});

module.exports.getIntentById = R.curry((IntentModel, id) => fromPromised(IntentModel.findById)(id));

module.exports.deleteIntent = R.curry((IntentModel, getIntentById, id) => {
  return getIntentById(id)
    .chain(result => result.matchWith({
      Just: () => fromPromised(IntentModel.deleteOne)({ _id: id }),
      Nothing: () => rejected('Intent does not exist.')
    }));
});

module.exports.modifyIntent = R.curry((IntentModel, getIntentById, id, changes) => {
  return getIntentById(id)
    .chain(result => result.matchWith({
      Just: () => fromPromised(IntentModel.updateOne)({ _id: id }, changes),
      Nothing: () => rejected('Intent does not exist.')
    }));
});

module.exports.getImpedingIntents = R.curry((getIntents, currentTime, triggerPeriod) => {
  
});