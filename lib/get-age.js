'use strict';

var IssueFinder = require('strong-github-api').IssueFinder;
var Promise = require('bluebird');
var debug = require('./debug')('get-age');
var util = require('./util');

exports.command = 'get-age <repo>';
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
  }).option('status', {
    alias: 's',
    describe: '(Optional) status of the issues',
  });

};

/*
 * Filter out pull requests
 */
function getIssuesOnly(issues) {
  issues = issues.filter(function(issue){
    return issue.pullRequest === undefined;
  });
  return Promise.resolve(issues);
};

/**
 * Calculate the age of the issue.
 * If the issue is closed,
 * the age is the duration between closedAt date and the createdAt date.
 * If the issue is open,
 * the age is the duration between current date and the createdAt date
 * @param {Object[]} issues
 */
function calculateAge(issues) {
  issues.forEach(function(issue){
    var lapse;
    if (issue.closedAt) {
      lapse = new Date(issue.closedAt - issue.createdAt);
    } else {
      lapse = new Date() - new Date(issue.createdAt);
    }
    var one_day = 1000 * 60 * 60 * 24;
    issue.age = Math.round(lapse / one_day);
  });
};

/**
 * Build the output JSON with the desired attributes
 * @param {Object[]} issues
 */
function filterIssueAttr(issues) {
  var filteredIssues = [];
  issues.forEach(function(issue){
    var newIssue = {};
    newIssue.number = issue.number;
    newIssue.title = issue.title;
    newIssue.html_url = issue.html_url;
    newIssue.age = issue.age;
    newIssue.state = issue.state;
    filteredIssues.push(newIssue);
  });
  return filteredIssues;
}

exports.handler = function(argv, options) {
  var opts = options || {};
  var _console = opts.console || console;
  // Shim the console log call with our own.
  _console.lg = _console.log;
  _console.log = function() {
    return argv.silent ? null : _console.lg.apply(this, arguments);
  };

  // set verbose to true all the time in order to get the right result
  // argv.verbose = true;

  var octo = util.octokatBuilder(argv, opts);
  debug('Finding issues on %s...', argv.repo);
  var target = util.parseGitRepo(argv.repo);
  debug('Owner: %s Repository: %s', target.owner, target.repo);
  _console.log('Searching for issues...');
  var issueFinder = new IssueFinder({
    octo: octo,
    owner: target.owner,
    repo: target.repo,
  });

  return issueFinder.find({}).then(function(issues) {
  // return issueFinder.find({ state: argv.status }).then(function(issues) {
    debug('Matching issues returned: %s', issues.length);

    getIssuesOnly(issues).then(function(issues){
      calculateAge(issues);
      issues = filterIssueAttr(issues);
      // console.log('verbose =', argv.verbose);
      // if (!argv.verbose)
      //   issues = issueFinder.summarizeIssues(issues);
      // Use pre-shim log; do not silent this output.
      if (argv.count) {
        _console.lg('Found %s matching issues. ', issues.length);
      } else {
        _console.lg(JSON.stringify(issues));
      }
      return Promise.resolve(issues);
    });
  }).catch(function(err) {
    // Do not silence failures!
    return _console.lg(err);
  });
};
