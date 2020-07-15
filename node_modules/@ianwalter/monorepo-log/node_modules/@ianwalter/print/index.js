const util = require('util')
const chromafi = require('@ianwalter/chromafi')
const { match, get } = require('@ianwalter/dot')
const chalk = require('chalk')
const hasAnsi = require('has-ansi')
const hasEmoji = require('has-emoji')
const clone = require('@ianwalter/clone')
const marked = require('marked')
const TerminalRenderer = require('marked-terminal')
const stripAnsi = require('strip-ansi')
const merge = require('@ianwalter/merge')
const cloneable = require('@ianwalter/cloneable')

// Set up marked with the TerminalRenderer.
marked.setOptions({ renderer: new TerminalRenderer({ tab: 2 }) })

const atRe = /^\s+at\s(.*)/
const refRe = /^\s+at\s(.*)\s(\(.*\))$/
const toPaddedString = s => `    ${s}`
const toPaddedLine = line => line ? toPaddedString(line) : line
const toPaddedItems = (a, i) => a.concat(['\n', ...i ? [toPaddedLine(i)] : []])
const toMarkdownItems = i => md(i).split('\n').map(toPaddedString).join('\n')
const at = chalk.gray('at')
const byNotWhitespace = str => str && str.trim()
const isANewLine = msg => typeof msg === 'string' && msg === '\n'
const md = str => marked(str).trimEnd()
const isObj = i => i && typeof i === 'object' && !Array.isArray(i)

function extractLogPrefix ({ items: [first, ...rest] }) {
  let prefix = ' '
  if (typeof first === 'string' && hasEmoji(first)) {
    const [actual, ...actualRest] = rest
    prefix = first
    first = actual
    rest = actualRest
  }
  return { prefix, items: [first, ...rest] }
}

function formatMarkdown (log) {
  log.items = log.items.map(toMarkdownItems)
}

function toStackLines (line) {
  if (line.match(refRe)) {
    return line.replace(refRe, `${at} ${chalk.bold('$1')} ${chalk.gray('$2')}`)
  } else if (line.match(atRe)) {
    return line.replace(atRe, `${at} ${chalk.gray('$1')}`)
  }
}

function getClone (src) {
  try {
    return clone(cloneable(src), { circulars: 0 })
  } catch (err) {
    return util.inspect(src)
  }
}

function createPrint (config = {}) {
  function addTypes (print) {
    for (const type of print.options.types) {
      print[type.type] = function (...items) {
        this.name = type.type
        return this.out(type, items)
      }
    }
  }

  function toOutputString (acc = '', msg, idx, src) {
    if (isObj(msg)) return `${JSON.stringify(msg)}\n`
    const space = acc && !isANewLine(acc[acc.length - 1]) && !isANewLine(msg)
    const newline = idx === src.length - 1
    return acc + (msg ? (space ? ` ${msg}` : msg) : '') + (newline ? '\n' : '')
  }

  function toNdjson (acc, msg, idx, src) {
    if (isObj(msg)) {
      acc.data = merge(acc.data || {}, msg)
    } else if (typeof msg === 'string') {
      acc.message = toOutputString(acc.message, msg, idx, src).trim()
    }
    // FIXME: Handle other types of data.
    return acc
  }

  function format (log) {
    const styled = get(chalk, log.style?.join('.'))

    log.items = log.items.reduce(
      (acc, item, index) => {
        const isFirst = index === 0
        const isString = typeof item === 'string'

        // Split the item by newlines so the first item and rest can be
        // formatted differently.
        let rest = []
        if (isString) {
          rest = item.split('\n')
          item = rest.shift()
        }

        if (item instanceof Error) {
          const { message, stack, ...err } = item

          // Format the error message with the given color and make it bold,
          // unless it's already formatted using ANSI escape sequences.
          item = styled(`${item.constructor.name}: `)
          item += hasAnsi(message) ? message : styled(message)

          // Format the error stacktrace.
          const stackLines = stack.split('\n').map(toStackLines)
          rest = rest.concat(stackLines.filter(byNotWhitespace))

          // Add the rest of the Error properties as a new item.
          if (Object.keys(err).length) {
            const items = chromafi(getClone(err), options.chromafi).split('\n')
            rest = rest.concat(items.slice(0, items.length - 1))
          }
        } else if (typeof item === 'object') {
          // If the item is an object, let chromafi format it.
          const items = chromafi(getClone(item), options.chromafi).split('\n')
          item = isFirst ? items.shift() : ''
          rest = rest.concat(items.slice(0, items.length - 1))
        } else {
          // If the item is not a string, turn it into one using util.inspect.
          if (!isString) item = util.inspect(item)

          // If the item is the first item logged and isn't already formatted
          // using ANSI escape sequences, format it with the log style.
          if (isFirst && !hasAnsi(item)) item = styled(item)
        }

        // Handle formatting an item that comes after a newline.
        if (isANewLine(acc[acc.length - 1])) item = toPaddedLine(item)

        // Add all the items back into the accumulator and return it.
        return acc.concat([item, ...rest.reduce(toPaddedItems, [])])
      },
      []
    )
  }

  function formatPlain (log) {
    format(log)
    log.items = log.items?.map(stripAnsi)
  }

  const defaults = {
    types: [
      // For debugging code through log statements.
      { type: 'debug', level: 'debug', prefix: '🐛', style: ['magenta'] },
      // For standard log statements.
      { type: 'info', level: 'info', prefix: '💁', style: ['cyan', 'bold'] },
      // For general log statements in which you can customize the emoji.
      { type: 'log', level: 'info', prefix: extractLogPrefix },
      // For log statements indicating a successful operation.
      { type: 'success', level: 'info', prefix: '✅', style: ['green', 'bold'] },
      // For the gray area between info and error.
      { type: 'warn', level: 'warn', prefix: '⚠️', style: ['yellow', 'bold'] },
      // For normal errors.
      { type: 'error', level: 'error', prefix: '🚫', style: ['red', 'bold'] },
      // For unrecoverable errors.
      { type: 'fatal', level: 'fatal', prefix: '💀', style: ['red', 'bold'] },
      // For log statements in Markdown format.
      { type: 'md', format: formatMarkdown },
      // For plain text without an emoji or ANSI escape sequences.
      { type: 'plain', prefix: ' ', format: formatPlain },
      // For writing to the log without any formatting at all.
      { type: 'write', format: false }
    ],
    // Write all logs to stdout by default. You can change io.err if you would
    // like to write errors to stderr, for example.
    io: {
      out: process.stdout.write.bind(process.stdout),
      err: process.stdout.write.bind(process.stdout)
    },
    level: 'debug',
    unrestricted: process.env.DEBUG,
    chalkLevel: chalk.level || 2,
    ndjson: false,
    chromafi: { tabsToSpaces: 2, lineNumberPad: 0 },
    collectOutput ({ items, ...log }) {
      if (this.ndjson) {
        return [{
          ...items,
          message: items.message,
          level: log.level,
          type: log.type,
          namespace: this.namespace
        }]
      }
      const ns = this.namespace ? `${chalk.blue.bold(this.namespace)} •` : ''
      return [log.prefix, ns, ...(items || [])]
    }
  }

  // Create the options Object by combinging defaults with the passed config.
  const options = merge({}, defaults, config)

  // Set the chalk level if configured.
  if (options.chalkLevel) chalk.level = options.chalkLevel

  // Determine the position of the type with the configured log level so that
  // print can determine if future logs should be logged or not.
  const levelIndex = options.types.findIndex(t => t.type === options.level)

  const print = {
    options,
    create (options) {
      return createPrint(options)
    },
    update (options) {
      // Clean up obsolete log types.
      for (const t of this.options.types) {
        if (options.types && options.types.indexOf(t) === -1) delete this[t]
      }

      // Merge the passed options with the existing options.
      merge(this.options, options)

      // Add the types to the print instance now that the options are updated.
      addTypes(this)

      // Return the print instance.
      return this
    },
    ns (namespace) {
      return this.create(merge({}, this.options, { namespace }))
    },
    out (type, items) {
      // Create the log object.
      const log = { ...type, items }

      // Determine if the log item should be logged based on level.
      log.shouldLog = !type.level || options.types.indexOf(type) >= levelIndex

      // Determine if the log item should be logged because it's namespace
      // matches a value in the "unrestricted" list.
      for (const ns of options.unrestricted?.split(',') || []) {
        log.unrestricted = ns && match(ns.trim(), options.namespace)
        if (log.unrestricted) break
      }

      // Format and output the log if it has a high enough log level or has been
      // marked as unrestriected by the namespace functionality.
      if (log.shouldLog || log.unrestricted) {
        // If prefix is a function, get the prefix by calling the function with
        // the log items.
        if (typeof log.prefix === 'function') merge(log, log.prefix(log))

        // Determine how many spaces should pad the prefix to separate it from
        // the log item. This is tricky because of weird emoji lengths.
        const pad = log.prefix?.length + [...log.prefix || []].length
        log.prefix = log.prefix?.padEnd(pad + log.prefix.split(' ').length - 1)

        // Format the log items.
        if (options.ndjson) {
          log.items = log.items.reduce(toNdjson, {})
        } else if (log.format === undefined) {
          format(log)
        } else if (log.format) {
          log.format(log)
        }

        // Create the output string.
        const output = options.collectOutput(log).reduce(toOutputString, '')

        // Print the output string using configured io.
        if (options.io) options.io[log.io || 'out'](output)

        // Return output to the caller.
        return output
      }
    }
  }

  // Add the log types to the print object.
  addTypes(print)

  // Return the print object for use.
  return print
}

module.exports = { createPrint, print: createPrint(), chalk, md }
