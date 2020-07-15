function cloneable (src, refs = new Map([]), link) {
  switch (true) {
    case src instanceof Date:
      return src
    case src && typeof src === 'object':
      return refs.get(src) || (refs.set(src, link) && reduce(src, refs, link))
    case typeof src === 'function':
      throw new Error('NO FUNCTIONS!')
    default:
      return src
  }
}

function reduce (src, refs, link) {
  if (Array.isArray(src)) {
    return src.reduce(
      (acc, item, index) => {
        try {
          link = link ? `${link} -> ${index}` : index
          return acc.concat([cloneable(item, refs, link)])
        } catch (err) {
          // No-op on error.
        }
        return acc
      },
      []
    )
  } else {
    const dest = {}
    for (const key of Object.getOwnPropertyNames(src)) {
      try {
        dest[key] = cloneable(src[key], refs, link ? `${link} -> ${key}` : key)
      } catch (err) {
        // No-op on error.
      }
    }
    return dest
  }
}

module.exports = cloneable
