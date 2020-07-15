# @ianwalter/clone
> A configurable utility to clone JavaScript data (Objects, Arrays, etc)

[![npm page][npmImage]][npmUrl]

## About

I created clone because I wanted to use the terrific
[nanoclone](https://github.com/Kelin2025/nanoclone) utility but also be able to
configure how it clones Objects. With the `proto` option, you can decide whether
Objects that are cloned will receive the source Object's prototype (`true`) or
won't (the default, `false`).

The difference, for my purposes, is to be able to clone an Object without
cloning it's getters and setters. The state management library
[Vuex](https://vuex.vuejs.org) uses Object getters and setters for it's
"reactive" functionality and there are times when you might want to extract and
mutate data from the store without those mutations affecting the original data
in the store.

## Installation

```console
yarn add @ianwalter/clone
```

## Usage

```js
import clone from '@ianwalter/clone'

const clonedBook = clone(book)
const clonedBookWithProto = clone(book, { proto: true })
```

## License

Apache 2.0 with Commons Clause - See [LICENSE][licenseUrl]

&nbsp;

Created by [Ian Walter](https://iankwalter.com)

[npmImage]: https://img.shields.io/npm/v/@ianwalter/clone.svg
[npmUrl]: https://www.npmjs.com/package/@ianwalter/clone
[licenseUrl]: https://github.com/ianwalter/clone/blob/master/LICENSE
