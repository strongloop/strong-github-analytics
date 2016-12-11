'use strict';

exports.parseGitRepo = function(repo) {
  var ownerAndRepo = repo.split('\/');
  return {
    owner: ownerAndRepo[0],
    repo: ownerAndRepo[1].replace('.git', ''),
  };
};

exports.getAllPages = function(fetch, params) {
  var Promise = require('bluebird');
  var _ = require('lodash');
  var collection = [];
  return fetch(params).then(function(items) {
    collection = items;
    return next(items.nextPage);
  });

  function next(fn) {
    if (!fn) {
      return Promise.resolve(collection);
    } else {
      return fn().then(function(items) {
        collection = _.concat(collection, items);
        return next(items.nextPage);
      });
    }
  }
};

// Helper function to manage creation of an octokat instance.
exports.octokatBuilder = function(argv, options) {
  var Octo = options.octokatCtor || require('octokat');
  var opts = {};
  if (argv.token) {
    opts = { token: argv.token };
  } else if (argv.user && argv.password) {
    opts = {
      username: argv.user,
      password: argv.password,
    };
  }
  return new Octo(opts);
};
