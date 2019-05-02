const Result = require('folktale/result');
const Maybe = require('folktale/maybe');
const twitter = require('./twitter');
const { of, fromPromised, rejected } = require('folktale/concurrency/task');

describe('#getTweetById', () => {
  it('should return Result.Error if user credentials missing', async () => {
    const getCredsByUserIdMock = () => of(Maybe.Nothing());
    const twitterClientMock = {};
    const result = await twitter.getTweetById(getCredsByUserIdMock, twitterClientMock, 1, 1).run().promise();
    expect(result).toEqual(Result.Error('User missing credentials.'));
  });

  it('should return Result.Error if error returned from client call', async () => {
    const getCredsByUserIdMock = () => of(Maybe.Just({
      token: 1,
      secret: 2
    }));
    const twitterClientMock = () => ({
      get: () => Promise.reject('Request failed.')
    });
    const result = await twitter.getTweetById(getCredsByUserIdMock, twitterClientMock, 1, 1).run().promise();
    expect(result).toEqual(Result.Error('Request failed.'));
  });

  it('should return Result.Ok if request successful', async () => {
    const getCredsByUserIdMock = () => of(Maybe.Just({
      token: 1,
      secret: 2
    }));
    const twitterClientMock = () => ({
      get: () => Promise.resolve({
        data: 'test'
      })
    });
    const result = await twitter.getTweetById(getCredsByUserIdMock, twitterClientMock, 1, 1).run().promise();
    expect(result).toEqual(Result.Ok('test'));
  });
});