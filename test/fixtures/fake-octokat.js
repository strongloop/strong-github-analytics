'use strict';

var Promise = require('bluebird');

module.exports = Octokat;

function Octokat() {
  var self = this;
  var now = new Date();
  this.issues = [
    {
      state: 'open',
      updatedAt: new Date().setDate(now.getDate() - 35),
    },
    {
      state: 'open',
      updatedAt: new Date().setDate(now.getDate() - 70),
    },
  ];
  this.repoInfo = {
    issues: {
      fetch: function(filter) {
        return Promise.resolve(self.issues);
      },
    },
  };
}

Octokat.prototype.repos = function() {
  var self = this;
  return {
    fetch: function() {
      return Promise.resolve(self.repoInfo);
    },
  };
};
