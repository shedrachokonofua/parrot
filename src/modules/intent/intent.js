const R = require('ramda');
const Maybe = require('folktale/maybe');
const Result = require('folktale/result');
const Validation = require('folktale/validation');
const { of, rejected, fromPromised, waitAll } = require('folktale/concurrency/task');
const moment = require('moment');

module.exports.calculateInitialNextTrigger = (createdTime, startHour, interval) => {
  const startHourOnCreatedDay = (created, hour) => moment(created).set({ hour, minute: 0, second: 0 });
  return R.until(
    hour => moment(hour).isAfter(createdTime),
    hour => moment(hour).add(interval, 'hours')
  )(startHourOnCreatedDay(createdTime, startHour));
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
    getTweetById(userId, tweetId).map(Result.Ok).orElse(reason => of(Result.Error([ reason ]))),
    maybeToResult(getUserById(userId), 'User does not exist.'),
    maybeToResult(getUserIntentByTweet(userId, tweetId), 'User has intent on tweet.')
  ])
  .map(R.map(Validation.fromResult))
  .map(Validation.collect);
});

module.exports.createIntent = R.curry((IntentModel, calculateInitialNextTrigger, validateData, intentData, now) => {
  const nextTrigger = data => calculateInitialNextTrigger(now, data.startHour, data.interval);
  const setInitialNextTrigger = data => R.set(R.lensProp('nextTrigger'), nextTrigger(data), data);

  return validateData(intentData)
    .chain(result => result.matchWith({
      Success: () => of(intentData),
      Failure: (reasons) => rejected(reasons.value)
    }))
    .map(setInitialNextTrigger)
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
      Just: () => fromPromised(IntentModel.findOneAndUpdate)({ _id: id }, changes, { new: true }),
      Nothing: () => rejected('Intent does not exist.')
    }));
});

module.exports.shiftNextTrigger = R.curry((getIntentById, modifyIntent, id) => {
  return getIntentById(id)
    .chain(result => result.matchWith({
      Just: (data) => of(data.value),
      Nothing: () => rejected('Intent does not exist.')
    }))
    .chain(({ nextTrigger, interval }) => modifyIntent(id, { nextTrigger: moment(nextTrigger).add(interval, 'hours') }));
});

module.exports.getImpedingIntents = R.curry((getIntents, currentTime) => {
  return getIntents({ nextTrigger: currentTime });
});