const R = require('ramda');
const Observable = require('rxjs');
const { mergeAll, filter, mergeMap, catchError, map, mapTo, tap } = require('rxjs/operators');
const { Success, Failure } = require('folktale/validation');

module.exports.getImpendingIntents$ = getImpedingIntents => Observable.from(getImpedingIntents()).pipe(mergeAll());

module.exports.shiftNextTrigger$ = R.curry((logger, shiftNextTrigger, intent) => {
  return Observable
    .of(intent._id)
    .pipe(
      mergeMap(shiftNextTrigger),
      tap({
        next: ({ _id }) => logger.info({ intentId: _id }, 'nextTrigger attribute shifted for intent.'),
        error: error => logger.error(error, 'Failed to shift nextTrigger')
      }),
      map(Success),
      catchError(() => Observable.of(Failure())),
      filter(Success.hasInstance),
      map(R.prop('value'))
    );
});

module.exports.retweet$ = (logger, retweet, intent) => {
  return Observable
    .of(intent)
    .pipe(
      mergeMap(intent => Observable.from(retweet(intent.userId, intent.tweetId))),
      tap({
        error: error => logger.error(error, 'Failed to retweet')
      }),
      mapTo(Success(intent)),
      catchError(() => Observable.of(Failure())),
      filter(Success.hasInstance),
      map(R.prop('value'))
    )
};

module.exports.process$ = (retweet$, shiftNextTrigger$, getImpendingIntents$) => {
  return getImpendingIntents$
    .pipe(
      mergeMap(shiftNextTrigger$),
      filter(R.propEq('enabled', true)),
      mergeMap(retweet$)
    );
}