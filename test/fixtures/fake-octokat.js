'use strict';

var Promise = require('bluebird');

module.exports = Octokat;

function Octokat() {
  var self = this;
  var now = new Date();
  this.issues = [
    {
      id: 1234567,
      number: 1,
      url: 'https://github.com/magicOrg/fakeRepo',
      title: 'Does\'nt pop enough!',
      state: 'open',
      assignee: null,
      assignees: [],
      createdAt: new Date().setDate(now.getDate() - 36),
      updatedAt: new Date().setDate(now.getDate() - 35),
      extraProperty: 'an extra field to test verbosity',
      fnProperty: function() {
        return 'A function that we do not want in our returned issues!';
      },
    },
    {
      id: 4567893,
      number: 2,
      url: 'https://github.com/magicOrg/fakeRepo',
      title: 'Needs more cowbell',
      state: 'open',
      assignee: null,
      assignees: [],
      createdAt: new Date().setDate(now.getDate() - 71),
      updatedAt: new Date().setDate(now.getDate() - 70),
      extraProperty: 'an extra field to test verbosity',
      fnProperty: function() {
        return 'A function that we do not want in our returned issues!';
      },
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
