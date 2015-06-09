# sails-hook-requestlogger-file

*Note: Requires Sails.js version >=0.11.0-rc*

[Sails JS](http://sailsjs.org) hook to activate [morgan](https://github.com/expressjs/morgan) request logging for yoursails app.

Forked from [sails-hook-requestlogger](https://github.com/artificialio/sails-hook-requestlogger)

### Installation

`npm install sails-hook-requestlogger-file`

### Usage

Just lift your app as normal and all your server requests will be logged, with useful information such as response-time, straight to your console. As a default it is activated in your dev environment but deactivated in production.

### Configuration

By default, configuration lives in `sails.config.requestloggerfile`.

Parameter      | Type                | Details
-------------- | ------------------- |:---------------------------------
format        | ((string)) | Defines which logging [format](https://github.com/expressjs/morgan#predefined-formats) to use. Deaults to `dev`.
logLocation   | ((string)) | Defines where to log: `console` or `file`. Defaults to `console`.
fileLocation  | ((string)) | Location of file relative to project root (if `file` is specified in `logLocation`. This has no effect if `console` is specified in `logLocation`. 
inDevelopment | ((boolean)) | Whether or not to log requests in development environment.  Defaults to `true`.
inProduction  | ((boolean)) | Whether or not to log requests in production environment  Defaults to `false`.

That&rsquo;s it!
