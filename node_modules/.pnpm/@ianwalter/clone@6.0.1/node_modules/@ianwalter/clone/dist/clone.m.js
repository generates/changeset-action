function clone (src) {
  // Null/undefined/functions/etc
  if (!src || typeof src !== 'object' || typeof src === 'function') {
    return src
  }

  // DOM Node
  if (src.nodeType && 'cloneNode' in src) {
    return src.cloneNode(true)
  }

  // Date
  if (src instanceof Date) {
    return new Date(src.getTime())
  }

  // RegExp
  if (src instanceof RegExp) {
    return new RegExp(src)
  }

  // Arrays
  if (Array.isArray(src)) {
    return src.map(clone)
  }

  // ES6 Maps
  if (src instanceof Map) {
    return new Map(Array.from(src.entries()).map(([k, v]) => [k, clone(v)]))
  }

  // ES6 Sets
  if (src instanceof Set) {
    return new Set(Array.from(src.values()).map(clone))
  }

  // Object
  if (src instanceof Object) {
    const destination = {};
    const circulars = (this && this.circulars) || [];
    circulars.push(src);
    for (const key in src) {
      if (circulars.includes(src[key])) {
        continue
      } else if (typeof src[key] === 'object') {
        destination[key] = clone.call({ circulars }, src[key]);
      } else {
        destination[key] = clone(src[key]);
      }
    }
    return destination
  }

  // ???
  return src
}

export default clone;
