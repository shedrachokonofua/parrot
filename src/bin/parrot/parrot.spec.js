const R = require('ramda');
const Observable = require('rxjs');
const Parrot = require('./parrot');
const Maybe = require('folktale/maybe');

describe('#getImpendingIntents$', () => {
  it('should emit all intents from getImpedingIntents', done => {
    const emitted = [];
    const mockIntents = [1, 2, 3];
    const getImpedingIntentsMock = () => Promise.resolve(mockIntents);
    const source$ = Parrot.getImpendingIntents$(getImpedingIntentsMock);
    source$.subscribe({
      next: (val) => emitted.push(val),
      complete: () => {
        expect(emitted).toEqual(mockIntents);
        done();
      }
    });
  });
});

describe('#shiftNextTrigger$', () => {
  it('should call shiftNextTrigger', done => {
    const loggerMock = {
      info: () => {},
      error: () => {}
    };
    const mockIntent = { _id: 1 };
    const shiftNextTriggerMock = jest.fn().mockImplementation(() => Promise.resolve());
    const source$ = Parrot.shiftNextTrigger$(loggerMock, shiftNextTriggerMock, mockIntent);
    source$.subscribe({
      complete: () => {
        expect(shiftNextTriggerMock.mock.calls.length).toEqual(1);
        done();
      }
    });
  });

  it('should log if shift fails', done => {
    const loggerMock = {
      info: jest.fn(),
      error: jest.fn()
    };
    const mockIntent = { _id: 1 };
    const shiftNextTriggerMock = jest.fn().mockImplementation(() => Promise.reject());
    const source$ = Parrot.shiftNextTrigger$(loggerMock, shiftNextTriggerMock, mockIntent);
    source$.subscribe({
      complete: () => {
        expect(loggerMock.info.mock.calls.length).toEqual(0);
        expect(loggerMock.error.mock.calls.length).toEqual(1);
        done();
      }
    });
  });

  it('should log if shift succeeds', done => {
    const loggerMock = {
      info: jest.fn(),
      error: jest.fn()
    };
    const mockIntent = { _id: 1 };
    const shiftNextTriggerMock = jest.fn().mockImplementation(() => Promise.resolve(mockIntent));
    const source$ = Parrot.shiftNextTrigger$(loggerMock, shiftNextTriggerMock, mockIntent);
    source$.subscribe({
      complete: () => {
        expect(loggerMock.info.mock.calls.length).toEqual(1);
        expect(loggerMock.error.mock.calls.length).toEqual(0);
        done();
      }
    });
  });

  it('should emit if shift successful', done => {
    const emitted = [];
    const loggerMock = {
      info: () => {},
      error: () => {}
    };
    const mockIntent = { _id: 1 };
    const shiftNextTriggerMock = jest.fn().mockImplementation(() => Promise.resolve(mockIntent));
    const source$ = Parrot.shiftNextTrigger$(loggerMock, shiftNextTriggerMock, mockIntent);
    source$.subscribe({
      next: val => emitted.push(val),
      complete: () => {
        expect(emitted.length).toEqual(1);
        expect(emitted[0]._id).toEqual(1);
        done();
      }
    });
  });

  it('should not emit if shift fails', done => {
    const emitted = [];
    const loggerMock = {
      info: () => {},
      error: () => {}
    };
    const mockIntent = { _id: 1 };
    const shiftNextTriggerMock = jest.fn().mockImplementation(() => Promise.reject());
    const source$ = Parrot.shiftNextTrigger$(loggerMock, shiftNextTriggerMock, mockIntent);
    source$.subscribe({
      next: val => emitted.push(val),
      complete: () => {
        expect(emitted.length).toEqual(0);
        done();
      }
    });
  });
});

describe('#retweet$', () => {
  it('should call retweet', done => {
    const loggerMock = {
      info: () => {},
      error: () => {}
    };
    const mockIntent = {
      userId: 1,
      tweetId: 1
    };
    const retweet = jest.fn().mockImplementation(() => Promise.resolve());
    const source$ = Parrot.retweet$(loggerMock, retweet, mockIntent);
    source$.subscribe({
      complete: () => {
        expect(retweet.mock.calls.length).toEqual(1);
        done();
      }
    });
  });

  it('should log on error', done => {
    const loggerMock = {
      info: () => {},
      error: jest.fn()
    };
    const mockIntent = {
      userId: 1,
      tweetId: 1
    };
    const retweet = jest.fn().mockImplementation(() => Promise.reject());
    const source$ = Parrot.retweet$(loggerMock, retweet, mockIntent);
    source$.subscribe({
      complete: () => {
        expect(loggerMock.error.mock.calls.length).toEqual(1);
        done();
      }
    });
  });

  it('should not emit on error', done => {
    const emitted = [];
    const loggerMock = {
      info: () => {},
      error: () => {}
    };
    const mockIntent = {
      userId: 1,
      tweetId: 1
    };
    const retweet = jest.fn().mockImplementation(() => Promise.reject());
    const source$ = Parrot.retweet$(loggerMock, retweet, mockIntent);
    source$.subscribe({
      next: val => emitted.push(val),
      complete: () => {
        expect(emitted.length).toEqual(0);
        done();
      }
    });
  });
  
  it('should emit if no error', done => {
    const emitted = [];
    const loggerMock = {
      info: () => {},
      error: () => {}
    };
    const mockIntent = {
      userId: 1,
      tweetId: 1
    };
    const retweet = jest.fn().mockImplementation(() => Promise.resolve());
    const source$ = Parrot.retweet$(loggerMock, retweet, mockIntent);
    source$.subscribe({
      next: val => {
        emitted.push(val)
      },
      complete: () => {
        expect(emitted.length).toEqual(1);
        done();
      }
    });
  });
});

describe('#process$', () => {
  it('should throw error if getImpendingIntents$ throws error', done => {
    const getImpendingIntentsMock$ = Observable.throwError('Mock Issue');
    const mockStream = jest.fn().mockImplementation((data) => Observable.of(data));
    const source$ = Parrot.process$(
      mockStream, 
      mockStream,
      getImpendingIntentsMock$
    );
    source$.subscribe({
      error: (error) => {
        expect(error).toEqual('Mock Issue');
        expect(mockStream.mock.calls.length).toEqual(0);
        done();
      }
    });
  });

  it('should filter out unenabled intents after shiftNextTrigger$', done => {
    const enabled = [];
    const mockIntents = [
      { enabled: true, tweetId: 1, userId: 1, _id: 1 },
      { enabled: false, tweetId: 1, userId: 1, _id: 2 },
      { enabled: true, tweetId: 1, userId: 1, _id: 3 }
    ];
    const getImpendingIntentsMock$ = Observable.of(...mockIntents);
    const retweetMock$ = jest.fn().mockImplementation((data) => {
      enabled.push(data);
      return Observable.of(data)
    });
    const mockStream = jest.fn().mockImplementation((data) => Observable.of(data));
    const source$ = Parrot.process$(
      retweetMock$,
      mockStream,
      getImpendingIntentsMock$
    );
    source$.subscribe({
      complete: () => {
        expect(enabled).toEqual([
          { enabled: true, tweetId: 1, userId: 1, _id: 1 },
          { enabled: true, tweetId: 1, userId: 1, _id: 3 }
        ]);
        done();
      }
    });
  });
});