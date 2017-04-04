'use strict';

var _ = require('lodash');
var debug = require('./debug')('make-sprint');
var fmt = require('util').format;
var genMilestones = require('strong-github-api').milestoneGenerator;
var inspect = require('util').inspect;
var moment = require('moment');
var os = require('os');
var util = require('./util');

exports.command = 'make-sprint <due_date> [options..]';
exports.describe = fmt('Automatically create a milestone for a list of repos.',
  'Use an ISO 8601 date for your <date> parameter.');

exports.builder = function(yargs) {
  return yargs.option('user', {
    alias: 'u',
    describe: 'The username of the authorized GitHub account.',
  }).option('password', {
    alias: 'p',
    describe: 'The password for the account.',
  }).option('token', {
    alias: 't',
    describe: 'The GitHub auth token (instead of user/password).',
    type: 'string',
  }).option('org', {
    alias: 'o',
    describe: fmt('The name of the organization. If not provided,',
      'the user\'s repositories will be targeted instead.'),
  }).option('title', {
    describe: 'A quoted string that will become the sprint title.',
  }).option('description', {
    alias: 'd',
    describe: 'A quoted string that describes the sprint/milestone.',
  }).option('silent', {
    describe: 'Omit messages about the operation.',
  }).option('verbose', {
    alias: 'v',
    describe: 'Provide details about each repository\'s milestone operation.',
  }).option('dryrun', {
    describe: 'Simulate the run; do not create the milestones',
  }).option('useList', {
    alias: 'l',
    describe: fmt('Path to a JSON file with target repositories.',
    'Use this to avoid automatically scanning orgs/users.'),
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

  var octo = util.octokatBuilder(argv, opts);
  opts.token = argv.token;
  opts.user = argv.user;
  opts.org = argv.org;
  opts.octo = octo;
  opts.dueOn = moment(argv.due_date).toISOString();
  opts.title = argv.title || 'Sprint ' + opts.dueOn;
  opts.description = argv.description ||
    'Created by strong-github-analytics!';
  opts.verbose = argv.verbose;
  opts.dryrun = argv.dryrun;
  opts.list = argv.useList;
  debug('options: %s', inspect(opts));
  _console.log('Generating milestones...');
  return genMilestones(opts).then(function(msgs) {
    if (argv.verbose) {
      _console.log(msgs.join(os.EOL));
      _console.log('Properties used for milestone: %s',
        inspect(_.omit(opts, 'octo', 'password', 'token', 'console')));
    }
    _console.log(
        fmt('Complete! Created milestones for %s repositories', msgs.length));
  }).catch(function(err) {
    // Do not silence failures!
    if (argv.verbose) {
      return _console.log(err.stack);
    } else {
      return _console.lg(err);
    }
  });
};
