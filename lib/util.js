'use strict';

exports.parseGitRepo = function(repo) {
  var ownerAndRepo = repo.split('\/');
  return {
    owner: ownerAndRepo[0],
    repo: ownerAndRepo[1].replace('.git', ''),
  };
};
