#!/usr/bin/env node

'use strict';

require('yargs')
  .command(require('../lib/find'))
  .help().argv;
