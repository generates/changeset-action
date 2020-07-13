const util = require('util')
const readPkgUp = require('read-pkg-up')
const getopts = require('getopts')
const dotProp = require('dot-prop')
const merge = require('@ianwalter/merge')
const { oneLine } = require('common-tags')
const { md } = require('@ianwalter/print')
const decamelize = require('decamelize')
const camelcase = require('camelcase')

module.exports = function cli ({ name, description, usage, options, help }) {
  // Extract the curren't package's package.json so that it can be included in
  // the returned config object.
  const { packageJson } = readPkgUp.sync() || {}

  // Create the configuration object that will be returned to the CLI.
  const config = { packageJson, ...(packageJson && packageJson[name]) }

  // Convert cli config to getopts config.
  const opts = { alias: {}, default: {} }
  if (options) {
    for (let [key, option] of Object.entries(options)) {
      // Convert camelCased option names to kebab-case.
      option.flag = key = decamelize(key, '-')

      // Add option alias to getopts alias configuration.
      if (option.alias) {
        opts.alias[key] = option.alias
      }

      // Default to package.json config or option config.
      opts.default[key] = dotProp.get(config, key) || option.default

      // Specify the option type.
      option.type = option.type || typeof opts.default[key]
      if (opts[option.type]) {
        opts[option.type].push(key)
      } else if (['string', 'boolean'].includes(option.type)) {
        opts[option.type] = [key]
      }
    }
  }

  // Collect any command-line arguments passed to the process.
  let cliOpts = getopts(process.argv.slice(2), opts)

  // Reduce any command-line arguments containing dots into a nested structure.
  cliOpts = Object.entries(cliOpts).reduce(
    (acc, [key, val]) => {
      // Convert keys back to camelCase.
      const flag = key
      key = key.split('.').map(k => camelcase(k)).join('.')

      if (key.includes('.')) {
        dotProp.set(acc, key, val)
        delete acc[key]
      } else if (flag !== key) {
        acc[key] = val
        delete acc[flag]
      }
      return acc
    },
    cliOpts
  )

  // Add/overwrite configuration data with options passed through command-line
  // flags.
  merge(config, cliOpts)

  if (help || config.help) {
    config.helpText = `# ${name}\n`

    if (description) {
      config.helpText += `${description}\n\n`
    }

    if (usage) {
      config.helpText += `## Usage\n${usage}\n\n`
    }

    if (options) {
      config.helpText += '## Options\n'
      config.helpText += Object.entries(options).reduce(
        (acc, [key, option]) => {
          const alias = option.alias ? `, -${option.alias}` : ''
          const info = option.description ? oneLine(option.description) : ''
          const def = option.default !== undefined
            ? `${info ? ' ' : ''}(default: \`${util.inspect(option.default)}\`)`
            : ''
          acc += `* \`--${option.type === 'boolean' ? '(no-)' : ''}`
          return acc + `${option.flag}${alias}\`  ${info}${def}\n`
        },
        ''
      )
    }

    // Format the help markdown text with marked.
    config.helpText = md(config.helpText) + '\n'
  }

  // Return the populated configuration object.
  return config
}
