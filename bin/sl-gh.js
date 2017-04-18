#!/usr/bin/env node

'use strict';

require('yargs')
  .command(require('../lib/find'))
  .command(require('../lib/make-sprint'))
  .command(require('../lib/get-age'))
  .help().argv;
