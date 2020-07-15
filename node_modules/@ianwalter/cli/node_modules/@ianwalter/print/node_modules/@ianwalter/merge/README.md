# @ianwalter/merge
> Recursively merge JavaScript Objects

[![npm page][npmImage]][npmUrl]
[![CI][ciImage]][ciUrl]

## About

Inspired by and created as an alternative for [deepmerge][deepmergeUrl].

## Usage

```js
import merge from '@ianwalter/merge'

const item1 = { id: 1, details: { name: 'Civilian', lists: ['Folk'] } }
const item3 = { id: 2, details: { plays: 2 } }
const item2 = { id: 3, details: { lists: ['Chill', 'Alt'] } }

merge(item1, item2, item3) //=> {
//    id: 3,
//    details: {
//      name: 'Civilian',
//      plays: 2,
//      lists: ['Chill', 'Alt']
//    }
//  }
```

## Note

Like `Object.assign`, `merge` will treat the first passed item as the
"destination" and mutate it. If you want a new "destination" object simply pass
an empty object `{}` as the first argument or you can always use
[@ianwalter/clone][cloneUrl] and clone the first argument beforehand. `merge`
will also merge prototype properties of objects so if you don't want that you
can also use `clone` to clone your objects before merging them since, with the
default options, `clone` does not clone prototype properties.

## Related

* [`@ianwalter/clone`][cloneUrl] - A configurable utility to clone JavaScript
data (Objects, Arrays, etc)

## License

Apache 2.0 with Commons Clause - See [LICENSE][licenseUrl]

&nbsp;

Created by [Ian Walter](https://ianwalter.dev)

[npmImage]: https://img.shields.io/npm/v/@ianwalter/merge.svg
[npmUrl]: https://www.npmjs.com/package/@ianwalter/merge
[ciImage]: https://github.com/ianwalter/merge/workflows/CI/badge.svg
[ciUrl]: https://github.com/ianwalter/merge/actions
[cloneUrl]: https://github.com/ianwalter/clone
[deepmergeUrl]: https://github.com/TehShrike/deepmerge
[licenseUrl]: https://github.com/ianwalter/merge/blob/master/LICENSE
