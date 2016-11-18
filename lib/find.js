'use strict';

var IssueFinder = require('./octokat/issue-finder');
var Promise = require('bluebird');
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

  var octo = util.octokatBuilder(argv, options);
  debug('Finding issues on %s...', argv.repo);
  var target = util.parseGitRepo(argv.repo);
  debug('Owner: %s Repository: %s', target.owner, target.repo);
  _console.log('Searching for issues...');
  var issueFinder = new IssueFinder({
    octo: octo,
    owner: target.owner,
    repo: target.repo,
  });
  return issueFinder.find({ state: 'open' }).then(function(issues) {
    debug('Open issues returned: %s', issues.length);
    return issueFinder.olderThan(issues, argv.age);
  }).then(function(issues) {
    if (!argv.verbose)
      issues = issueFinder.summarizeIssues(issues);
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
