const Maybe = require('folktale/maybe');
const Result = require('folktale/result');
const Validation = require('folktale/validation');
const Intent = require('./intent');
const { of } = require('folktale/concurrency/task');
const moment = require('moment');

describe('#validateIntentData', () => {
  it('should return Validation.Success if no errors', async () => {
    const userHasIntentOnTweetMock = () => of(Maybe.Just());
    const userExistsMock = () => of(Maybe.Just());
    const tweetExistsMock = () => of(Result.Ok());
    const params = {
      userId: 123,
      tweetId: 123,
      startTime: '10:10'
    };
    const result = await Intent.validateIntentData(
      userHasIntentOnTweetMock,
      userExistsMock,
      tweetExistsMock,
      params
    ).run().promise();
    expect(result).toEqual(Validation.Success());
  });

  it('should return concatenation of Validation errors if any', async () => {
    const userHasIntentOnTweetMock = () => of(Maybe.Nothing());
    const userExistsMock = () => of(Maybe.Just());
    const tweetExistsMock = () => of(Result.Error('Not Authorized.'));
    const params = {
      userId: 123,
      tweetId: 123,
      startTime: '10:10'
    };
    const result = await Intent.validateIntentData(
      userHasIntentOnTweetMock,
      userExistsMock,
      tweetExistsMock,
      params
    ).run().promise();
    expect(result).toEqual(Validation.Failure(['Not Authorized.', 'User has intent on tweet.']));
  });
});

describe('#calculateInitialNextTrigger', () => {
  it('return valid next trigger', () => {
    const createdTime = moment('2010-01-01 10:51');
    const startTime = '8:00';
    const interval = 5;
    const initialNextTrigger = Intent.calculateInitialNextTrigger(createdTime, startTime, interval);
    expect(initialNextTrigger).toEqual(moment('2010-01-01 13:00'));
  });
});

describe('#createIntent', () => {
  it('should reject on validation errors', async () => {
    const IntentModelMock = {};
    const validateDataMock = () => of(Validation.Failure('Mock Error'));
    const action = Intent.createIntent(IntentModelMock, validateDataMock, true, moment());
    await expect(action.run().promise()).rejects.toEqual('Mock Error');
  });

  it('should create user if no validation errors', async () => {
    const IntentModelMock = {
      create: () => Promise.resolve({ _id: 3 })
    };
    const validateDataMock = () => of(Validation.Success());
    const result = await Intent
      .createIntent(IntentModelMock, validateDataMock, true, moment())
      .run()
      .promise();
    expect(result).toEqual({ _id: 3 });
  });

  it('should set nextTrigger time', async () => {
    const IntentModelMock = {
      create: jest.fn().mockImplementation(() => Promise.resolve())
    };
    const mockIntentData = {
      userId: 123,
      tweetId: '123',
      startTime: '10:00',
      interval: 2,
      enabled: true
    };
    const now = moment('2010-01-02 15:00');
    const validateDataMock = () => of(Validation.Success());
    const result = await Intent
      .createIntent(IntentModelMock, validateDataMock, mockIntentData, now)
      .run()
      .promise();
    console.log(IntentModelMock.create.mock.calls[0][0])
    expect(IntentModelMock.create.mock.calls[0][0].nextTrigger).toEqual(moment('2010-01-02 16:00'));
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

// describe('#getImpedingIntents', () => {
//   it('should return all intents to be triggered within interval period', async () => {
//     const now = moment("2010-01-02 10:00");
//     const mockIntents = [{ // should trigger
//       startTime: '12:00',
//       interval: 2,
//       createdAt: moment("2010-01-01"),
//       enabled: true
//     }, { // should not trigger: not impending
//       startTime: '11:00',
//       interval: 2,
//       createdAt: moment("2010-01-01"),
//       enabled: false
//     }, { // should not trigger: not enabled
//       startTime: '10:00',
//       interval: 6,
//       createdAt: moment("2010-01-01"),
//       enabled: false
//     }, { // should trigger
//       startTime: '19:00',
//       interval: 5,
//       createdAt: moment("2010-01-01"),
//       enabled: true
//     }, { // should not trigger: not impending
//       startTime: '12:00',
//       interval: 7,
//       createdAt: moment("2010-01-01"),
//       enabled: true
//     }];
//   });
// })
