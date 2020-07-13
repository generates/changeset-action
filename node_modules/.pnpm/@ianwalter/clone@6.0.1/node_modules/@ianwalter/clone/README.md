# @ianwalter/clone
> A configurable utility to clone JavaScript data (Objects, Arrays, etc)

[![npm page][npmImage]][npmUrl]
[![CI][ciImage]][ciUrl]

## About

I created clone because I wanted to use the terrific
[nanoclone](https://github.com/Kelin2025/nanoclone) utility but not have the
source Object's prototype properties be copied.

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
```

## License

Apache 2.0 with Commons Clause - See [LICENSE][licenseUrl]

&nbsp;

Created by [Ian Walter](https://ianwalter.dev)

[npmImage]: https://img.shields.io/npm/v/@ianwalter/clone.svg
[npmUrl]: https://www.npmjs.com/package/@ianwalter/clone
[ciImage]: https://github.com/ianwalter/clone/workflows/CI/badge.svg
[ciUrl]: https://github.com/ianwalter/clone/actions
[licenseUrl]: https://github.com/ianwalter/clone/blob/master/LICENSE
