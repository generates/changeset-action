# @ianwalter/print
> Colorful Node.js logging

[![npm page][npmImage]][npmUrl]
[![CI][ciImage]][ciUrl]

## Installation

```console
pnpm add @ianwalter/print
```

## Usage

Basic usage:

```js
const { print } = require('@ianwalter/print')

print.info('Done in 0.91s.') // => 💁  Done in 0.91s.
```

Using debug / namespacing:

```console
export DEBUG="app.*"
```

```js
const { createPrint } = require('@ianwalter/print')

const print = createPrint({ level: 'info' })

// Will not be printed:
print.debug('Hello!')

// Will be printed:
print.ns('app.test').debug('Flaky test started.') // => 🐛  Flaky test started.
```

## License

Hippocratic License - See [LICENSE][licenseUrl]

&nbsp;

Created by [Ian Walter](https://ianwalter.dev)

[npmImage]: https://img.shields.io/npm/v/@ianwalter/print.svg
[npmUrl]: https://www.npmjs.com/package/@ianwalter/print
[ciImage]: https://github.com/ianwalter/print/workflows/CI/badge.svg
[ciUrl]: https://github.com/ianwalter/print/actions
[licenseUrl]: https://github.com/ianwalter/print/blob/master/LICENSE
