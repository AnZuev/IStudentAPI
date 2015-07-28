var logger = require('winston');
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  colorize: true,
  prettyPrint: true
});
module.exports = logger
