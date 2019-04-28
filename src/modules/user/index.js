const User = require('./user');
const UserModel = require('./model/');

module.exports = {
  async findOrCreate(userData) {
    return User.findOrCreate(
      User.createUser,
      User.findUserByTwitterId,
      UserModel,
      userData
    ).run().promise();
  },
  async findUserByTwitterId(twitterId) {
    return User.findUserByTwitterId(
      UserModel,
      twitterId
    ).run().promise();
  }
}