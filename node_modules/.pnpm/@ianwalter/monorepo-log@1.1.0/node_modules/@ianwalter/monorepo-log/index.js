const { print, chalk } = require('@ianwalter/print')

module.exports = function log (msg) {
  return print.log('👋', chalk.bold(msg))
}
