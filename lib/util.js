'use strict';

exports.parseGitRepo = function(repo) {
  var ownerAndRepo = repo.split('\/');
  return {
    owner: ownerAndRepo[0],
    repo: ownerAndRepo[1].replace('.git', ''),
  };
};

// Run a promise method until it fails to return values.
exports.getAllPages = function(pro) {
  var _ = require('lodash');
  var collection = pro;
  return next(pro.nextPage);

  function next(fn) {
    if (!fn) {
      return collection;
    } else {
      return fn().then(function(items) {
        collection = _.concat(collection, items);
        return next(items.nextPage);
      });
    }
  }
};
