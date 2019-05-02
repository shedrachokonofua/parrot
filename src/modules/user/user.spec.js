const Maybe = require('folktale/maybe');
const User = require('./user');
const { of } = require('folktale/concurrency/task');

describe('#getUser', () => {
  it('should Maybe.Nothing if user does not exist', async () => {
    const UserModelMock = {
      findOne: () => Promise.resolve(null) 
    };
    const result = await User.getUser(UserModelMock, true).run().promise();
    expect(Maybe.Nothing.hasInstance(result)).toEqual(true);
  });

  it('should return Maybe.Just user if user exists', async () => {
    const UserModelMock = {
      findOne: () => Promise.resolve(true) 
    };
    const result = await User.getUser(UserModelMock, true).run().promise();
    expect(Maybe.Just.hasInstance(result)).toEqual(true);
  });
});

describe('#getOrCreate', () => {
  it('should create user if it does not exist', async () => {
    const getUserByTwitterIdMock = () => of(Maybe.Nothing());
    const createUserMock = jest.fn().mockImplementation(of);

    const action = User.getOrCreate(createUserMock, getUserByTwitterIdMock, { tId: true });
    const result = await action.run().promise();
    
    expect(createUserMock.mock.calls.length).toBe(1);
    expect(result).toEqual({ tId: true });
  });

  it('should return user if exists', async () => {
    const getUserByTwitterIdMock = () => of(Maybe.Just(true));
    const createUserMock = jest
      .fn();
    const action = User.getOrCreate(createUserMock, getUserByTwitterIdMock, { tId: true });
    const result = await action.run().promise();
    
    expect(createUserMock.mock.calls.length).toBe(0);
    expect(result).toEqual(true);
  });
});

describe('#getCredsByUserId', () => {
  it('should throw error if user does not exist', async () => {
    const getUserByIdMock = () => of(Maybe.Nothing());
    const action = User.getCredsByUserId(getUserByIdMock, 1);
    await expect(action.run().promise()).rejects.toEqual('User does not exist.');
  });

  it('should return Maybe.Nothing if missing either cred', async () => {
    const mockData = {
      creds: {
        access: 123
      }
    };
    const getUserByIdMock = () => of(Maybe.Just(mockData));
    const result = await User.getCredsByUserId(getUserByIdMock, 1).run().promise();
    expect(result).toEqual(Maybe.Nothing());
  });
})