'use strict';

var Promise = require('bluebird');
var _ = require('lodash');
var debug = require('../lib/debug')('test-find');
var find = require('../lib/find').handler;
var tap = require('tap');

tap.test('find issues', function(t) {
  t.test('simple issue tests', function(t) {

    var defaultAge = basicChecks(t, 'default age', 4, {
      token: 'fakeToken',
      repo: 'magicOrg/fakeRepo',
    });

    var nonDefaultAge = basicChecks(t, 'non-default age', 2, {
      token: 'fakeToken',
      repo: 'magicOrg/fakeRepo',
      age: 60,
    });
    return Promise.map([defaultAge, nonDefaultAge], function(issues) {
      _.each(issues, function(issue) {
        t.notOk(issue['extraProperty'], 'no extra properties');
        t.notOk(issue['fnProperty'], 'no function properties');
      });
      return null;
    }).finally(t.end);
  });

  t.test('verbose issue tests', function(t) {
    var defaultAge = basicChecks(t, 'default age', 4, {
      token: 'fakeToken',
      repo: 'magicOrg/fakeRepo',
      verbose: true,
    });

    var nonDefaultAge = basicChecks(t, 'non-default age', 2, {
      token: 'fakeToken',
      repo: 'magicOrg/fakeRepo',
      verbose: true,
      age: 60,
    });

    return Promise.map([defaultAge, nonDefaultAge], function(issues) {
      _.each(issues, function(issue) {
        t.ok(issue['extraProperty'], 'no extra properties');
        t.notOk(issue['fnProperty'], 'no function properties');
      });
      return null;
    }).finally(t.end);
  });

  t.test('silent flag', function(t) {
    return consoleChecks(t, 'silent', 1, {
      token: 'fakeToken',
      repo: 'magicOrg/fakeRepo',
      verbose: true,
      silent: true,
    }).then(function(fakeConsole) {
      var args = fakeConsole.calls[0].args;
      t.assert(args, 'arguments exist');
      t.notOk(_.includes(args, 'Searching for issues...'), 'no human output');
    }).finally(t.end);
  });

  t.test('no silent flag', function(t) {
    return consoleChecks(t, 'loud', 2, {
      token: 'fakeToken',
      repo: 'magicOrg/fakeRepo',
      verbose: true,
    }).then(function(fakeConsole) {
      var args = fakeConsole.calls[0].args;
      t.assert(args, 'arguments exist');
      t.ok(_.includes(args, 'Searching for issues...'), 'human output found');
    }).finally(t.end);
  });

  function basicChecks(t, label, count, args) {
    var Console = require('./fixtures/fake-console');
    var opts = {
      octokatCtor: require('./fixtures/fake-octokat'),
      console: new Console(),
    };
    return find(args, opts).then(function(issues) {
      t.comment(label);
      t.assert(issues, 'issues exist');
      debug('issues: ', issues);
      t.equals(issues.length, count, 'correct number of issues found');
      return issues;
    });
  }

  function consoleChecks(t, label, count, args) {
    var Console = require('./fixtures/fake-console');
    var opts = {
      octokatCtor: require('./fixtures/fake-octokat'),
      console: new Console(),
    };
    return find(args, opts).then(function() {
      debug('console calls: %j', opts.console.calls);
      t.equals(opts.console.calls.length, count, 'number of calls match');
      return opts.console;
    });
  }

  t.end();
});
