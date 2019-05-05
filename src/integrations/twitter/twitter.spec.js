const Result = require('folktale/result');
const Maybe = require('folktale/maybe');
const twitter = require('./twitter');
const { of, fromPromised, rejected } = require('folktale/concurrency/task');

describe('#clientForUser', () => {
  it('should throw error if user credentials missing', async () => {
    const getCredsByUserIdMock = () => of(Maybe.Nothing());
    const twitterClientMock = {};
    const result = twitter.clientForUser(getCredsByUserIdMock, twitterClientMock, 1);
    await expect(result.run().promise()).rejects.toEqual('User missing credentials.');
  });
});

describe('#retweet', () => {
  it('should call deleteRetweet if already exists', async () => {
    const clientForUserMock = () => of({
      get: () => {}
    });
    const getTweetByIdMock = () => of({
      retweeted: true,
      current_user_retweet: {
        id_str: "123"
      }
    });
    const deleteRetweetMock = jest.fn().mockImplementation(of);
    await twitter.retweet(getTweetByIdMock, deleteRetweetMock, clientForUserMock, 1, 1).run().promise();
    expect(deleteRetweetMock.mock.calls.length).toEqual(1);
  });

  it('should throw error if error occurs', async () => {
    const clientForUserMock = () => of({
      get: () => {}
    });
    const getTweetByIdMock = () => rejected('Mock Error');
    const deleteRetweetMock = jest.fn().mockImplementation(of);
    const action = twitter.retweet(getTweetByIdMock, deleteRetweetMock, clientForUserMock, 1, 1).run().promise();
    await expect(action).rejects.toEqual('Mock Error');
  });

  // it('should return Result.Ok if successful');
});