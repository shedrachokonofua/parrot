const R = require('ramda');
const Maybe = require('folktale/maybe');
const { of, fromPromised, rejected } = require('folktale/concurrency/task');

module.exports.createUser = R.curry((UserModel, userData) => fromPromised(UserModel.create)(userData));

module.exports.getUser = R.curry((UserModel, search) => {
  return fromPromised(UserModel.findOne)(search)
    .map(R.ifElse(R.isNil, Maybe.Nothing, Maybe.Just));
});

module.exports.getUserByTwitterId = R.curry((getUser, twitterId) => getUser({ tid: twitterId }));

module.exports.getUserById = R.curry((getUser, id) => getUser({ _id: id }));

module.exports.getOrCreate = R.curry((createUser, getUserByTwitterId, userData) => {
  return getUserByTwitterId(userData.tId)
    .chain(result => result.matchWith({
      Just: data => of(data.value),
      Nothing: () => createUser(userData)
    }));
});

module.exports.getCredsByUserId = R.curry((getUserById, userId) => {
  const missingEitherCred = creds => R.or(R.isNil(creds.token), R.isNil(creds.secret));

  return getUserById(userId)
    .chain(result => result.matchWith({
      Just: data => of(data.value),
      Nothing: () => rejected('User does not exist.')
    }))
    .map(R.prop('creds'))
    .map(R.ifElse(missingEitherCred, Maybe.Nothing, Maybe.Just))
});