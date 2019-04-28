const R = require('ramda');
const Maybe = require('folktale/maybe');
const { task, of } = require('folktale/concurrency/task');

module.exports.createUser = (UserModel, userData) => task(resolver => {
  UserModel
    .create(userData)
    .then(user => resolver.resolve(user))
    .catch(error => resolver.reject(error));
});

module.exports.findUserByTwitterId = (UserModel, twitterId) => task(resolver => {
  const containResult = R.ifElse(R.isNil, Maybe.Nothing, Maybe.Just);
  UserModel
    .findOne({ tId: twitterId })
    .then(user => resolver.resolve(containResult(user)))
    .catch(error => resolver.reject(error));
});

module.exports.findOrCreate = function (createUser, findUserByTwitterId, UserModel, userData) {
  return findUserByTwitterId(UserModel, R.prop('tId'))
    .chain(result => result.matchWith({
      Just: data => of(data.value),
      Nothing: () => createUser(UserModel, userData)
    }));
}