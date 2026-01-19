const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard', // Formato de hora (ex: 2023-10-20 15:30:00)
      ignore: 'pid,hostname',
    }
  }
});

module.exports = logger;