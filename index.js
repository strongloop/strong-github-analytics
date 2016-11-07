#!/usr/bin/env node
'use strict';

var f = require('util').format;
var program = require('commander');

var pkg = require('./package.json');
program.version(pkg.version)
  .command(f('closing-time [-a|--age [days] -c|--close -l|--label]',
    '[repositories...]'))
  .option('-a, --age [days]', f('Define the age limit, in days, for issues.',
    'Defaults to 30 days.'))
  .option('-c, --close', 'Close any issues that exceed the age limit.')
  .option('-l, --label', 'Label any issues that exceed the age limit.')
  .parse(process.argv);
