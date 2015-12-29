var morgan = require('morgan');
var fs = require('fs');

module.exports = function(sails) {

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
        }
      }
    },

    routes: {

      before: {

        'all /*': function addRequestLogging (req, res, next) {
          // If the hook has been deactivated, just return
          //Need to define requestlogger manually, since don't have acces to this.configKey
          // this has been moved to init as this activity is required only once
          // not in every call
          //var loggerSettings = sails.config['requestloggerfile'];
          var isProduction = process.env.NODE_ENV === 'production';
          var logger = null;
          if ((isProduction && loggerSettings.inProduction === true) ||
              (!isProduction && loggerSettings.inDevelopment === true)) {
            if(loggerSettings.logLocation == 'file') {
              // create a write stream (in append mode)
              // this has been moved to init as this is causing too many file
              // descriptors to be opened
             // var accessLogStream = fs.createWriteStream(loggerSettings.fileLocation, {flags: 'a'});
              logger = morgan(loggerSettings.format, {stream: accessLogStream});
            } else if(loggerSettings.logLocation == 'rotateFile') {
              loggerSettings.fileRotationOptions['filename'] = loggerSettings.fileLocation;
              var rotatingLogStream = require('file-stream-rotator').getStream(loggerSettings.fileRotationOptions);
              logger = morgan(loggerSettings.format, {stream: rotatingLogStream});
            } else {
              logger = morgan(loggerSettings.format);
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
    initialize: function(cb) {
      loggerSettings = sails.config['requestloggerfile'];
      accessLogStream = fs.createWriteStream(loggerSettings.fileLocation, {flags: 'a'}); // Finally
      cb();
    }

  };
};
