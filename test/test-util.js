'use strict';

var tap = require('tap');
var util = require('../lib/util');

tap.test('util', function(t) {
  t.test('parseGitRepo', function(t) {
    var result = util.parseGitRepo('batman/batcave.git');
    t.equals(result.owner, 'batman', 'owner was correct');
    t.equals(result.repo, 'batcave', 'repo was correct');
    t.end();
  });
  t.end();
});
