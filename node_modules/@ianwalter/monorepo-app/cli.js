#!/usr/bin/env node

const cli = require('@ianwalter/cli')
const { greet, leave } = require('@ianwalter/monorepo-hello')
const log = require('@ianwalter/monorepo-log')

const config = cli({
  name: 'mrapp',
  options: {
    bye: {
      alias: 'b',
      default: false
    }
  }
})

if (config.bye) {
  log(leave(config._[0]))
} else {
  log(greet(config._[0]))
}
