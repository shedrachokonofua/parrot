const Maybe = require('folktale/maybe');
const User = require('./user');
const { of } = require('folktale/concurrency/task');

describe('#findUserByTwitterId', () => {
  it('should Nothing if user does not exist', async () => {
    const UserModelMock = {
      findOne: () => Promise.resolve(null) 
    };
    const result = await User.findUserByTwitterId(UserModelMock, true).run().promise();
    expect(Maybe.Nothing.hasInstance(result)).toEqual(true);
  });

  it('should return Just user if user exists', async () => {
    const UserModelMock = {
      findOne: () => Promise.resolve(true) 
    };
    const result = await User.findUserByTwitterId(UserModelMock, true).run().promise();
    expect(Maybe.Just.hasInstance(result)).toEqual(true);
  });
});

describe('#findOrCreate', () => {
  const UserModelMock = {
    findOne: Promise.resolve,
    create: Promise.resolve
  };

  it('should create user if it does not exist', async () => {
    const findUserByTwitterIdMock = () => of(Maybe.Nothing());
    const createUserMock = jest
      .fn()
      .mockImplementation((_, user) => of(user));

    const action = User.findOrCreate(createUserMock, findUserByTwitterIdMock, UserModelMock, { tId: true });
    const result = await action.run().promise();
    
    expect(createUserMock.mock.calls.length).toBe(1);
    expect(result).toEqual({ tId: true });
  });

  it('should return user if exists', async () => {
    const findUserByTwitterIdMock = () => of(Maybe.Just(true));
    const createUserMock = jest
      .fn();
    const action = User.findOrCreate(createUserMock, findUserByTwitterIdMock, UserModelMock, { tId: true });
    const result = await action.run().promise();
    
    expect(createUserMock.mock.calls.length).toBe(0);
    expect(result).toEqual(true);
  });
});