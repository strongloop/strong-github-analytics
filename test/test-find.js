'use strict';

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
    var opts = { octokatCtor: require('./fixtures/fake-octokat') };
    return find(args, opts).then(function(issues) {
      t.assert(issues, 'issues exist');
      debug('issues: ', issues);
      t.assert(issues instanceof Array, 'issues are an array');
      t.equals(issues.length, count, 'correct number of issues found');
      t.end();
    });
  }

  t.end();
});
