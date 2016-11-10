'use strict';

var Octokat = require('octokat');
var Promise = require('bluebird');
var _ = require('lodash');
var debug = require('./debug')('find');
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
    default: 30,
  }).option('token', {
    alias: 't',
    describe: 'The GitHub auth token (instead of user/password).',
  }).option('silent', {
    describe: 'Omit messages about the operation (limit responses to data).',
  }).option('verbose', {
    alias: 'v',
    describe: 'Return the whole issues object (not including function defs).',
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
    _console.log('Found %s issues: ', _.keys(issues).length);
    // Use pre-shim log; do not silent this output.
    _console.lg(JSON.stringify(issues));
    return Promise.resolve(issues);
  }).catch(function(err) {
    // Do not silence failures!
    return _console.lg(err);
  });
};

function find(argv, options) {
  debug('argv: %j', argv);
  // Defaults
  var age = argv.age || 30;
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
      return repoInfo.issues.fetch({ state: 'open' });
    }).then(function(issues) {
      debug('Open issues returned: %s', issues.length);
      var range = new Date();
      range.setDate(range.getDate() - age);
      debug('range: ', range);
      var matches = _.mapValues(issues, function(issue) {
        var result = null;
        var updatedAt = new Date(issue.updatedAt);
        if (updatedAt < range) {
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
        } else {
          return null;
        }
      });
      return Promise.resolve(_.omitBy(matches, _.isNil));
    }).catch(function(err) {
      debug('error: %s', err);
      return Promise.reject(err);
    });
};
