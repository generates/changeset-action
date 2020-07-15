# @ianwalter/log
> A tiny level-based console logger

[![npm page][npmImage]][npmUrl]

## Installation

```console
yarn add @ianwalter/log
```

## Usage

### Basic

```js
import log from '@ianwalter/log'

log.update({ level: 'warn' })

log.warn('Such logging!')
```

### Using a custom logger (e.g. [signale][signaleUrl])

```js
import log from '@ianwalter/log'
import signale from 'signale'

log.update({ types: Object.keys(signale._types), logger: signale })

log.complete('log can be used with signale')
```

### Creating a separate, local logger

```js
import log from '@ianwalter/log'

const localLog = log.create({ level: 'debug' })

localLog.debug('I am a debug statement')
```

## License

Apache 2.0 with Commons Clause - See [LICENSE][licenseUrl]

&nbsp;

Created by [Ian Walter](https://iankwalter.com)

[npmImage]: https://img.shields.io/npm/v/@ianwalter/log.svg
[npmUrl]: https://www.npmjs.com/package/@ianwalter/log
[signaleUrl]: https://github.com/klaussinani/signale
[licenseUrl]: https://github.com/ianwalter/log/blob/master/LICENSE
