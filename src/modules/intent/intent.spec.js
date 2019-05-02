const Maybe = require('folktale/maybe');
const Result = require('folktale/result');
const Validation = require('folktale/validation');
const Intent = require('./intent');
const { of } = require('folktale/concurrency/task');

describe('#validateStartTime', () => {
  it('should return false for invalid time string or non hour sharp times', () => {
    expect(Intent.validateStartTime('25:02')).toEqual(Result.Error());
    expect(Intent.validateStartTime('20:02 ')).toEqual(Result.Error());
    expect(Intent.validateStartTime('a4:02')).toEqual(Result.Error());
    expect(Intent.validateStartTime('2:02')).toEqual(Result.Error());
    expect(Intent.validateStartTime('7:00')).toEqual(Result.Error());
    expect(Intent.validateStartTime('21:02')).toEqual(Result.Error());
  });

  it('should return false for valid time string', () => {
    expect(Intent.validateStartTime('21:00')).toEqual(Result.Ok());
  });
});

describe('#validateIntentData', () => {
  it('should return Validation.Success if no errors', async () => {
    const userHasIntentOnTweetMock = () => of(Maybe.Just());
    const userExistsMock = () => of(Maybe.Just());
    const tweetExistsMock = () => of(Result.Ok());
    const validateStartTimeMock = () => of(Result.Ok());
    const params = {
      userId: 123,
      tweetId: 123,
      startTime: '10:10'
    };
    const result = await Intent.validateIntentData(
      userHasIntentOnTweetMock,
      userExistsMock,
      tweetExistsMock,
      validateStartTimeMock,
      params
    ).run().promise();
    expect(result).toEqual(Validation.Success());
  });

  it('should return concatenation of Validation errors if any', async () => {
    const userHasIntentOnTweetMock = () => of(Maybe.Nothing());
    const userExistsMock = () => of(Maybe.Just());
    const tweetExistsMock = () => of(Result.Error('Not Authorized.'));
    const validateStartTimeMock = () => of(Result.Error(['Error 1']));
    const params = {
      userId: 123,
      tweetId: 123,
      startTime: '10:10'
    };
    const result = await Intent.validateIntentData(
      userHasIntentOnTweetMock,
      userExistsMock,
      tweetExistsMock,
      validateStartTimeMock,
      params
    ).run().promise();
    expect(result).toEqual(Validation.Failure(['Error 1', 'Not Authorized.', 'User has intent on tweet.']));
  });
});

describe('#createIntent', () => {
  it('should reject on validation errors', async () => {
    const IntentModelMock = {};
    const validateDataMock = () => of(Validation.Failure('Mock Error'));
    const action = Intent.createIntent(IntentModelMock, validateDataMock, true);
    await expect(action.run().promise()).rejects.toEqual('Mock Error');
  });

  it('should create user if no validation errors', async () => {
    const IntentModelMock = {
      create: () => Promise.resolve({ _id: 3 })
    };
    const validateDataMock = () => of(Validation.Success());
    const result = await Intent
      .createIntent(IntentModelMock, validateDataMock, true)
      .run()
      .promise();
    expect(result).toEqual({ _id: 3 });
  });
});

describe('#deleteIntent', () => {
  it('should throw error if intent does not exist.', async () => {
    const getIntentByIdMock = () => of(Maybe.Nothing());
    const IntentModelMock = {};

    const action = Intent.deleteIntent(
      IntentModelMock, 
      getIntentByIdMock,
      1
    );
    await expect(action.run().promise()).rejects.toEqual('Intent does not exist.');
  });

  it('should delete intent', async () => {
    const getIntentByIdMock = () => of(Maybe.Just());
    const IntentModelMock = {
      deleteOne: jest.fn().mockImplementation(() => Promise.resolve())
    };
    await Intent.deleteIntent(
      IntentModelMock, 
      getIntentByIdMock,
      1
    ).run().promise();
    
    expect(IntentModelMock.deleteOne.mock.calls.length).toBe(1);
  });
});

describe('#modifyIntent', () => {
  it('should throw error if intent does not exist.', async () => {
    const getIntentByIdMock = () => of(Maybe.Nothing());
    const IntentModelMock = {};

    const action = Intent.modifyIntent(
      IntentModelMock, 
      getIntentByIdMock,
      1,
      { foo: 'bar' }
    );
    await expect(action.run().promise()).rejects.toEqual('Intent does not exist.');
  });

  it('should modify intent', async () => {
    const getIntentByIdMock = () => of(Maybe.Just());
    const IntentModelMock = {
      updateOne: jest.fn().mockImplementation(() => Promise.resolve())
    };
    await Intent.modifyIntent(
      IntentModelMock, 
      getIntentByIdMock,
      1,
      { foo: 'bar' }
    ).run().promise();
    
    expect(IntentModelMock.updateOne.mock.calls.length).toBe(1);
  });
});
