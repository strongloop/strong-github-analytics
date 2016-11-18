'use strict';

var Octokat = require('octokat');
var Promise = require('bluebird');
var _ = require('lodash');
var debug = require('./debug')('find');
var moment = require('moment');
var util = require('./util');

exports.command = 'find <repo>';
exports.describe = 'Find issues older than a certain age (default 30 days).';

exports.builder = function(yargs) {
  return yargs.option('user', {
    alias: 'u',
    describe: 'The username of the authorized GitHub account.',
  }).option('password', {
    alias: 'p',
    describe: 'The password for the account.',
  }).option('age', {
    alias: 'a',
    describe: 'The age, in days, after which an issue is considered old.',
  }).option('token', {
    alias: 't',
    describe: 'The GitHub auth token (instead of user/password).',
  }).option('silent', {
    describe: 'Omit messages about the operation (limit responses to data).',
  }).option('verbose', {
    alias: 'v',
    describe: 'Return the whole issues object (not including function defs).',
  }).option('count', {
    describe: 'Return the number of matching issues instead of their JSON.',
  });
};

exports.handler = function(argv, options) {
  var opts = options || {};
  var _console = opts.console || console;
  // Shim the console log call with our own.
  _console.lg = _console.log;
  _console.log = function() {
    return argv.silent ? null : _console.lg.apply(this, arguments);
  };
  _console.log('Searching for issues...');
  return find(argv, options).then(function(issues) {
    // Use pre-shim log; do not silent this output.
    if (argv.count) {
      _console.lg('Found %s matching issues. ', issues.length);
    } else {
      _console.lg(JSON.stringify(issues));
    }
    return Promise.resolve(issues);
  }).catch(function(err) {
    // Do not silence failures!
    return _console.lg(err);
  });
};

function find(argv, options) {
  debug('argv: %j', argv);
  var age = argv.age || 0;
  var opts = options || {};
  // Injectables
  var Octo = opts.octokatCtor || Octokat;
  var octo;
  if (argv.user && argv.password) {
    octo = new Octo({
      username: argv.user,
      password: argv.password,
      token: argv.token,
    });
  } else if (argv.token) {
    octo = new Octo({ token: argv.token });
  } else {
    octo = new Octo();
  }
  debug('Finding issues on %s...', argv.repo);
  var target = util.parseGitRepo(argv.repo);
  debug('Owner: %s Repository: %s', target.owner, target.repo);
  return octo.repos(target.owner, target.repo).fetch()
    .then(function(repoInfo) {
      debug('Fetch issues from repository');
      return util.getAllPages(repoInfo.issues.fetch, { state: 'open' });
    }).then(function(issues) {
      debug('Open issues returned: %s', issues.length);
      var matches = _.map(issues, function(issue) {
        var result = null;
        var now = moment();
        // GitHub's API doesn't set the updatedAt to anything if an issue
        // has not been updated!
        var lastUpdated = moment(issue.updatedAt || issue.createdAt);
        var updatedAt = moment(lastUpdated);
        var diff = now.diff(updatedAt, 'days');
        if (diff >= age) {
          result = _(issue).omitBy(_.isNil).omitBy(_.isFunction);
          if (!argv.verbose) {
            result = result.pick([
              'id',
              'number',
              'url',
              'title',
              'state',
              'assignee',
              'assignees',
              'createdAt',
              'updatedAt',
            ]);
          }
          return result.value();
        }
      });
      return Promise.resolve(_.compact(matches));
    }).catch(function(err) {
      debug('error: %s', err);
      return Promise.reject(err);
    });
};
