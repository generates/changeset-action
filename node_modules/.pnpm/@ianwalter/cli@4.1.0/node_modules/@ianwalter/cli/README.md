# @ianwalter/cli
> A utility to help build command-line and package.json driven applications

[![npm page][npmImage]][npmUrl]
[![CI][ciImage]][ciUrl]

## About

This is basically a marriage between [`pkg-conf`][pkgConfUrl] and
[`getopts`][getoptsUrl] to allow you to build a Node.js application that can be
configured through both the command-line as well as a package.json property.

## Installation

```console
yarn add @ianwalter/cli
```

## Usage

Call `cli` with a `name` and CLI options as `options` and get back a single
config Object containing any command-line and package.json values:

```js
const cli = require('@ianwalter/cli')

const config = cli({
  name: 'equip',
  options: {
    type: {
      alias: 't',
      description: `
        The general class of equipment to use. Possible values include
        excavator, dumptruck, and cementmixer.
      `
    },
    color: {
      alias: 'c',
      default: 'red'
    }
  }
})
```

An example of some command-line values might look like:

```console
equip -t excavator --amount 3 --active --engine.horsepower 500
```

An example of some package.json values might look like:

```js
{
  "equip": {
    "amount": 1,
    "color": "yellow"
  }
}
```

Using the examples above, the resulting config would be:

```js
{
  type: 'excavator',
  color: 'yellow',
  amount: 3,
  active: true,
  engine: {
    horsepower: 500
  }
}
```

## License

Hippocratic License - See [LICENSE][licenseUrl]

&nbsp;

Created by [Ian Walter](https://ianwalter.dev)

[npmImage]: https://img.shields.io/npm/v/@ianwalter/cli.svg
[npmUrl]: https://www.npmjs.com/package/@ianwalter/cli
[ciImage]: https://github.com/ianwalter/cli/workflows/CI/badge.svg
[ciUrl]: https://github.com/ianwalter/cli/actions
[pkgConfUrl]: https://github.com/sindresorhus/pkg-conf
[getoptsUrl]: https://github.com/jorgebucaran/getopts
[licenseUrl]: https://github.com/ianwalter/cli/blob/master/LICENSE
