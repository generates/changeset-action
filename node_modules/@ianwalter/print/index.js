const util = require('util')
const chromafi = require('@ianwalter/chromafi')
const { Log } = require('@ianwalter/log')
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

const defaults = {
  types: [
    'debug', // For debugging code through log statements.
    'log', // For general log statements in which you can customize the emoji.
    'info', // For standard log statements.
    'success', // For log statements indicating a successful operation.
    'warn', // For the gray area between info and error.
    'error', // For normal errors.
    'fatal', // For unrecoverable errors.
    'md', // For log statements in Markdown format.
    'plain', // For plain text without an emoji or ANSI escape sequences.
    'write' // For writing to the log without any formatting at all.
  ],
  // Write all logs to stdout by default. You can change std.err if you would
  // like to write errors to stderr, for example.
  std: {
    out: process.stdout.write.bind(process.stdout),
    err: process.stdout.write.bind(process.stdout)
  },
  level: 'debug',
  chalkLevel: chalk.level || 2
}
const chromafiOptions = { tabsToSpaces: 2, lineNumberPad: 0 }
const atRe = /^\s+at\s(.*)/
const refRe = /^\s+at\s(.*)\s(\(.*\))$/
const toPaddedString = s => `    ${s}`
const toPaddedLine = line => line ? toPaddedString(line) : line
const at = chalk.gray('at')
const byNotWhitespace = str => str && str.trim()
const startsWithANewline = msg => typeof msg === 'string' &&
  msg.replace(' ', '')[0] === '\n'
const endsWithANewline = msg => typeof msg === 'string' &&
  msg.replace(' ', '')[msg.length - 1] === '\n'
const md = str => marked(str).trimEnd()

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

function toFormattedItems (color, isFirst = false, style) {
  const coloredChalk = color ? chalk[color] : chalk
  return (item, index = 0, items) => {
    if (item instanceof Error) {
      const { message, stack, ...rest } = item

      // Preface the log output with the error name.
      let str = ''
      if (isFirst) str = coloredChalk.bold(`${item.constructor.name}: `)

      // Format the error message with the given color and make it bold, unless
      // it's already formatted using ANSI escape sequences.
      if (hasAnsi(message)) {
        str += message
      } else {
        str += coloredChalk.bold(message)
      }

      // Format the error stacktrace.
      const stackLines = stack.split('\n').map(toStackLines)
      item = str + '\n' + stackLines.filter(byNotWhitespace).join('\n')

      // Add the rest of the Error properties to the item
      if (Object.keys(rest).length) {
        str = chromafi(getClone(rest), chromafiOptions)
        const end = str.lastIndexOf('\n\u001b[37m\u001b[39m')
        item += '\n' + (end > 0 ? str.substring(0, end) : str.trimEnd())
      }
    } else if (typeof item === 'object') {
      // If the item is an object, let chromafi format it.
      const str = chromafi(getClone(item), chromafiOptions)
      const end = str.lastIndexOf('\n\u001b[37m\u001b[39m')
      item = '\n' + (end > 0 ? str.substring(0, end) : str.trimEnd())
    } else {
      // If the item is not a string, turn it into one using util.inspect.
      if (typeof item !== 'string') item = util.inspect(item)

      // If the item is the first item logged and isn't already formatted using
      // ANSI escape sequences, format it with the given color and make it bold.
      if (isFirst && !hasAnsi(item)) {
        item = style ? coloredChalk[style](item) : coloredChalk(item)
      }
    }

    // Split the item string by newlines.
    let [newline, ...rest] = item ? item.split('\n') : []

    // Handle formatting an item with newlines.
    if (rest.length) {
      newline = newline ? newline + '\n' : '\n'
      rest = rest.map(toPaddedLine)
    }

    // Handle formatting an item that comes after a newline.
    const previous = index > 0 && items[index - 1]
    if (typeof previous === 'string' && endsWithANewline(previous)) {
      newline = toPaddedLine(newline)
    }

    // Recombine the item string with newlines.
    return (newline || '') + rest.join('\n')
  }
}

function formatItems ([first, ...rest], color, style) {
  return [
    toFormattedItems(color, true, style)(first),
    ...rest.map(toFormattedItems(color))
  ]
}

function toSpacedString (acc, msg, idx, src) {
  if (endsWithANewline(msg)) {
    return acc + msg
  } else if (idx === src.length - 1) {
    return `${acc}${msg}\n`
  }
  return `${acc}${msg} `
}

class Print {
  constructor (options = {}) {
    this.options = merge({ logger: this }, defaults, options)
    chalk.level = this.options.chalkLevel
    return new Log(this.options)
  }

  debug (...items) {
    return this.write('🐛 ', ...formatItems(items, 'magenta'))
  }

  log (...items) {
    let [first, ...rest] = items
    let prefix = '   '
    const prefixIsEmoji = typeof first === 'string' && hasEmoji(first)
    if (prefixIsEmoji) {
      const [actual, ...actualRest] = rest
      if (prefixIsEmoji) prefix = first.padEnd(2 + [...first].length)
      first = actual
      rest = actualRest
    }
    return this.write(prefix, ...formatItems([first, ...rest]))
  }

  info (...items) {
    return this.write('💁 ', ...formatItems(items, 'blue', 'bold'))
  }

  success (...items) {
    return this.write('✅ ', ...formatItems(items, 'green', 'bold'))
  }

  warn (...items) {
    return this.write('⚠️  ', ...formatItems(items, 'yellow', 'bold'))
  }

  error (...items) {
    return this.writeErr('🚫 ', ...formatItems(items, 'red', 'bold'))
  }

  fatal (...items) {
    return this.writeErr('💀 ', ...formatItems(items, 'red', 'bold'))
  }

  md (...items) {
    return this.write(...items.map(i => {
      const item = md(i).split('\n').map(toPaddedString).join('\n')
      return startsWithANewline(i) ? '\n' + item : item
    }))
  }

  plain (...items) {
    return this.write('   ', ...items.map(toFormattedItems()).map(stripAnsi))
  }

  write (...items) {
    const str = items.reduce(toSpacedString, '')
    if (this.options.std) this.options.std.out(str)
    return str
  }

  writeErr (...items) {
    const str = items.reduce(toSpacedString, '')
    if (this.options.std) this.options.std.err(str)
    return str
  }
}

module.exports = { Print, print: new Print(), chalk, md }
