# sails-hook-requestlogger-file

*Note: Requires Sails.js version >=0.11.0-rc*

[Sails JS](http://sailsjs.org) hook to activate [morgan](https://github.com/expressjs/morgan) request logging for yoursails app.

It can also automatically rotate your log file using the [file-stream-rotator](https://www.npmjs.com/package/file-stream-rotator) module

Forked from [sails-hook-requestlogger](https://github.com/artificialio/sails-hook-requestlogger)

## Installation

`npm install sails-hook-requestlogger-file`

## Usage

Just lift your app as normal and all your server requests will be logged, with useful information such as response-time, straight to your console. As a default it is activated in your dev environment but deactivated in production.

## Configuration

By default, configuration lives in `sails.config.requestloggerfile`.

Parameter           | Type        | Details
------------------- | ----------- |:---------------------------------
format              | ((string))  | Defines which logging [format](https://github.com/expressjs/morgan#predefined-formats) to use. Deaults to `dev`.
logLocation         | ((string))  | Defines where to log: `console`, `file` or `rotateFile`. Defaults to `console`. If `rotateFile` is specified, the log file will be rotated as per `fileRotationOptions` config
fileLocation        | ((string))  | Location of file relative to project root (if `file` or `rotateFile` is specified in `logLocation`. This has no effect if `console` is specified in `logLocation`. 
inDevelopment       | ((boolean)) | Whether or not to log requests in development environment.  Defaults to `true`.
inProduction        | ((boolean)) | Whether or not to log requests in production environment  Defaults to `false`.
fileRotationOptions | ((Object))  | A JSON Object ([details here](https://github.com/expressjs/morgan#log-file-rotation)) defining the log file rotation properties (if `rotateFile` is specified in `logLocation`. This has no effect if `console`/`file` is specified in `logLocation`.
formatType          | ((string))  | Defines which formatType to use for logging: `default` or `json`. Defaults to `default` and use `format` config option. If set to `json`, uses `jsonFormat` config option and logs will be written in JSON (`stringify`ed) format.
jsonFormat          | ((Object))  | A JSON Object ([details here](#json-format-options)) defining which JSON format to use for logging. This has no effect unless `formatType` is set to `json`.

**`fileRotationOptions` defaults**

Parameter           | Type        | Default Value
------------------- | ----------- |:---------------------------------
frequency           | ((string))  | daily
verbose             | ((string))  | false
date_format         | ((string))  | YYYYMMDD


**`jsonFormat` defaults**

````
{
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
}
````

Here, `identifier: {token: 'request-field',params: ['identifier']},` uses a custom `token` named ``, ([provided by the hook](#custom-morgan-tokens-provided) out of the box!), to use the `req.identifier` in the JSON format.


### JSON Format Options

`jsonFormat` to be specified in the following format:

````
{
    key: {
        token: 'tokenName',
        params: ['Array','of', 'params','to','be','sent','to','morgan\'s tokens method','after req,res'],
        prefix: 'string',
        suffix: 'string'
    }
}
````

**Example:**

The default values of `jsonFormat` will translate to:

````
morgan(function (tokens, req, res) {
    return JSON.stringify({
        date: tokens.date(req, res),
        identifier: tokens['request-field'](req, res, 'identifier'),
        remoteAddr: tokens['remote-addr'](req, res),
        method: tokens.method(req, res),
        url: tokens.url(req, res),
        status: tokens.status(req, res),
        contentLength: tokens.res(req, res, 'content-length'),
        responseTime: tokens['response-time'](req, res) + ' ms',
        userAgent: tokens['user-agent'](req, res)
    });
}

````

### Custom Morgan Tokens provided

````
morgan.token('request-field', function getRequestField(req, res, field) {
    return req[field];
});
````


That&rsquo;s it!
