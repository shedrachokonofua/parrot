const Logger = require('pino')();
const Parrot = require('./parrot');
const { getImpedingIntents, shiftNextTrigger } = require('../../modules/intent');
const { getCredsByUserId } = require('../../modules/user');
const { retweet } = require('../../integrations/twitter');

const getImpendingIntents$ = Parrot.getImpendingIntents$(getImpedingIntents);
const shiftNextTrigger$ = Parrot.shiftNextTrigger$(Logger, shiftNextTrigger);
const assignIntentUserCreds$ = Parrot.assignIntentUserCreds$(Logger, getCredsByUserId);
const retweet$ = Parrot.retweet$(Logger, retweet);
const process$ = Parrot.process$(retweet$, assignIntentUserCreds$, shiftNextTrigger$, getImpendingIntents$);

module.exports = {
  run() {
    process$.subscribe({
      next: intent => Logger.info(intent, 'Retweet performed on intent'),
      error: error => Logger.error(error),
      complete: () => Logger.info('Run Complete')
    });
  }
}