var winston = require('winston'),
    moment = require('moment'),
    date = moment(),
    filename = date.format('YYYY-MM-DD'),
    file = 'log-files/' + filename,
    logger = new (winston.Logger)({
    levels: {
        info: 1,
        error: 2
    },
    colors: {
        info: 'green',
        error: 'red'
    },
    transports: [
        new (winston.transports.File)({
            name: 'info-file',
            filename: file,
            level: 'info',
            json: true,
            colorize: true,
            timestamp: true,
            prettyPrint: true
        }),
        new (winston.transports.File)({
            name: 'error-file',
            filename: file,
            level: 'error',
            colorize: true,
            json: true,
            handleExceptions: true,
            humanReadableUnhandledException: true,
            timestamp: true,
            prettyPrint: true
        })
    ],
    exitOnError: false
});
module.exports = logger;