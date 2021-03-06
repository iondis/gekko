var _ = require('lodash');
// listen to all messages and internally queue
// all candles and trades, when done report them
// all back at once

module.exports = done => {
  var trades = [];
  var roundtrips = [];
  var candles = [];
  var report = false;
  var indicatorResults = {};

  return {
    message: message => {
      if (message.type === 'candle') candles.push(message.candle);
      else if (message.type === 'trade') trades.push(message.trade);
      else if (message.type === 'roundtrip') roundtrips.push(message.roundtrip);
      else if (message.type === 'report') report = message.report;
      else if (message.log) console.log(message.log);
      else if (message.type === 'indicatorResult') {
        if (!_.has(indicatorResults, message.indicatorResult.name))
          indicatorResults[message.indicatorResult.name] = [];

        indicatorResults[message.indicatorResult.name].push({
          result: message.indicatorResult.result,
          date: message.indicatorResult.date,
          type: message.indicatorResult.type,
          indicator: message.indicatorResult.indicator,
          baseType: message.indicatorResult.baseType
        });
      }
    },
    exit: status => {
      if (status !== 0) done('Child process has died.');
      else
        done(null, {
          trades,
          candles,
          report,
          roundtrips,
          indicatorResults
        });
    },
  };
};
