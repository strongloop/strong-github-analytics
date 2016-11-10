'use strict';

module.exports = Console;

function Console() {
  this.calls = [];
}

Console.prototype.log = function() {
  this.calls.push({ args: arguments });
};
