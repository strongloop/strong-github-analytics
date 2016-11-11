'use strict';

var Promise = require('bluebird');
var moment = require('moment');

module.exports = Octokat;

function Octokat() {
  var self = this;
  this.otherIssues = [
    {
      id: 2345678,
      number: 3,
      url: 'https://github.com/magicOrg/fakeRepo',
      title: 'Does\'nt pop enough!',
      state: 'open',
      assignee: null,
      assignees: [],
      createdAt: moment().subtract(36, 'days'),
      updatedAt: moment().subtract(35, 'days'),
      extraProperty: 'an extra field to test verbosity',
      fnProperty: function() {
        return 'A function that we do not want in our returned issues!';
      },
    },
    {
      id: 4567890,
      number: 4,
      url: 'https://github.com/magicOrg/fakeRepo',
      title: 'Needs more cowbell',
      state: 'open',
      assignee: null,
      assignees: [],
      createdAt: moment().subtract(71, 'days'),
      updatedAt: moment().subtract(70, 'days'),
      extraProperty: 'an extra field to test verbosity',
      fnProperty: function() {
        return 'A function that we do not want in our returned issues!';
      },
    },
  ];
  this.issues = [
    {
      id: 1234567,
      number: 1,
      url: 'https://github.com/magicOrg/fakeRepo',
      title: 'Does\'nt pop enough!',
      state: 'open',
      assignee: null,
      assignees: [],
      createdAt: moment().subtract(36, 'days'),
      updatedAt: moment().subtract(35, 'days'),
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
      createdAt: moment().subtract(71, 'days'),
      updatedAt: moment().subtract(70, 'days'),
      extraProperty: 'an extra field to test verbosity',
      fnProperty: function() {
        return 'A function that we do not want in our returned issues!';
      },
    },
  ];
  this.issues.nextPage = function() {
    return Promise.resolve(self.otherIssues);
  };
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
