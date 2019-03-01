const morgan = require('morgan');
const fs = require('fs');

module.exports = function (sails) {

    return {

        /**
         * Default configuration
         *
         * We do this in a function since the configuration key for
         * the hook is itself configurable, so we can't just return
         * an object.
         */
        defaults: {

            requestloggerfile: {
                // Turn morgan logging on by default in development environment
                // and off for production, using the 'dev' format
                //see: https://github.com/expressjs/morgan#predefined-formats for more formats
                format: 'dev',
                logLocation: 'console',
                fileLocation: 'access.log',
                inDevelopment: true,
                inProduction: false,
                fileRotationOptions: {
                    frequency: 'daily',
                    verbose: false,
                    date_format: 'YYYYMMDD'
                },
                // Log in default `morgan` formats or custom JSON format defined by `jsonFormat`
                formatType: 'default',
                // The Custom JSON format to use if `formatType` is `json`
                //  this is ignored for all other `formatType`s
                jsonFormat: null
            }
        },

        routes: {

            before: {

                'all /*': function addRequestLogging(req, res, next) {
                    // If the hook has been deactivated, just return
                    //Need to define requestlogger manually, since don't have acces to this.configKey
                    // this has been moved to init as this activity is required only once
                    // not in every call
                    //var loggerSettings = sails.config['requestloggerfile'];
                    let isProduction = process.env.NODE_ENV === 'production';
                    let logger = null;
                    if ((isProduction && loggerSettings.inProduction === true) ||
                        (!isProduction && loggerSettings.inDevelopment === true)) {
                        if (loggerSettings.logLocation === 'file') {
                            // create a write stream (in append mode)
                            // this has been moved to init as this is causing too many file
                            // descriptors to be opened
                            // var accessLogStream = fs.createWriteStream(loggerSettings.fileLocation, {flags: 'a'});
                            logger = getLogger(loggerSettings, {stream: accessLogStream});
                        } else if (loggerSettings.logLocation === 'rotateFile') {
                            loggerSettings.fileRotationOptions['filename'] = loggerSettings.fileLocation;
                            let rotatingLogStream = require('file-stream-rotator').getStream(loggerSettings.fileRotationOptions);
                            logger = getLogger(loggerSettings, {stream: rotatingLogStream});
                        } else {
                            logger = getLogger(loggerSettings);
                        }
                        logger(req, res, function (err) {
                            if (err) next(err);

                            next();

                        });
                    } else {
                        next();
                    }
                }
            }
        },

        /**
         * Initialize the hook
         * @param  {Function} cb Callback for when we're done initializing
         */
        initialize: function (cb) {
            loggerSettings = sails.config['requestloggerfile'];
            accessLogStream = fs.createWriteStream(loggerSettings.fileLocation, {flags: 'a'}); // Finally
            cb();
        }

    };

    function getLogger(loggerSettings, options) {

        if (loggerSettings.formatType === 'json') {

            if (!loggerSettings.jsonFormat) {
                loggerSettings.jsonFormat = {
                    date: {
                        token: 'date',
                        params: [],
                        prefix: '',
                        suffix: ''
                    },
                    identifier: {
                        token: 'request-field',
                        params: ['identifier'],
                        prefix: '',
                        suffix: ''
                    },
                    remoteAddr: {
                        token: 'remote-addr',
                        params: [],
                        prefix: '',
                        suffix: ''
                    },
                    method: {
                        token: 'method',
                        params: [],
                        prefix: '',
                        suffix: ''
                    },
                    url: {
                        token: 'url',
                        params: [],
                        prefix: '',
                        suffix: ''
                    },
                    status: {
                        token: 'status',
                        params: [],
                        prefix: '',
                        suffix: ''
                    },
                    contentLength: {
                        token: 'res',
                        params: ['content-length'],
                        prefix: '',
                        suffix: ''
                    },
                    responseTime: {
                        token: 'response-time',
                        params: [],
                        prefix: '',
                        suffix: ' ms'
                    },
                    userAgent: {
                        token: 'user-agent',
                        params: [],
                        prefix: '',
                        suffix: ''
                    }
                };
            }

            return morgan(function (tokens, req, res) {
                let jsonFormat = {};

                for (let key in loggerSettings.jsonFormat) {
                    if (loggerSettings.jsonFormat.hasOwnProperty(key)) {
                        if (loggerSettings.jsonFormat[key].token) {
                            if (!loggerSettings.jsonFormat[key].params) {
                                loggerSettings.jsonFormat[key].params = [];
                            }
                            jsonFormat[key] =
                                (loggerSettings.jsonFormat[key].prefix || '') +
                                tokens[loggerSettings.jsonFormat[key].token](
                                    req,
                                    res,
                                    ...loggerSettings.jsonFormat[key].params
                                )
                                + (loggerSettings.jsonFormat[key].suffix || '');
                        }
                    }
                }

                return JSON.stringify(jsonFormat);
            }, options);
        }

        return morgan(loggerSettings.format, options);
    }
};

morgan.token('request-field', function getRequestField(req, res, field) {
    return req[field];
});
