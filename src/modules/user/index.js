const User = require('./user');
const UserModel = require('./model/');

const getUser = User.getUser(UserModel);
const createUser = User.createUser(UserModel);
const getUserById = User.getUserById(getUser);
const getUserByTwitterId = User.getUserByTwitterId(getUser);
const getOrCreate = User.getOrCreate(createUser);
const getCredsByUserId = User.getCredsByUserId(getUserById);

module.exports = {
  async getUserById(id) {
    return getUserById(id).run().promise();
  },
  async getOrCreate(userData) {
    return getOrCreate(getUserByTwitterId, userData).run().promise();
  },
  async findUserByTwitterId(twitterId) {
    return getUserByTwitterId(twitterId).run().promise();
  },
  async getCredsByUserId(userId) {
    return getCredsByUserId(userId).run().promise();
  }
}