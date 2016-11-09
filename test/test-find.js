'use strict';

var _ = require('lodash');
var debug = require('../lib/debug')('test-find');
var find = require('../lib/find').handler;
var tap = require('tap');

tap.test('find issues', function(t) {

  t.test('older than the default value', function(t) {
    return issueAssert(t, {
      token: 'fakeToken',
      repo: 'org/fakeRepo',
    }, 2);
  });

  t.test('older than a specified value', function(t) {
    return issueAssert(t, {
      token: 'fakeToken',
      repo: 'org/fakeRepo',
      age: 60,
    }, 1);
  });

  function issueAssert(t, args, count) {
    var opts = {
      octokatCtor: require('./fixtures/fake-octokat'),
      console: {
        // Silence console output for tests.
        log: function() {},
      },
    };
    return find(args, opts).then(function(issues) {
      t.assert(issues, 'issues exist');
      debug('issues: ', issues);
      t.equals(_.keys(issues).length, count, 'correct number of issues found');
      t.end();
    });
  }

  t.end();
});
