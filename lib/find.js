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
  });
};

exports.handler = function(argv, options) {
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
      var matches = [];
      _.each(issues, function(issue) {
        var updatedAt = new Date(issue.updatedAt);
        debug('updatedAt: ', updatedAt);
        if (updatedAt < range) {
          matches.push(issue);
        }
      });
      return Promise.resolve(matches);
    }).then(function(issues) {
      debug('Issues older than %s:', age);
      return _.each(issues, function(issue) { debug(issue); });
    }).catch(function(err) {
      debug('error: %s', err);
      return Promise.reject(err);
    });
};
