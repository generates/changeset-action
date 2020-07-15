const isObj = i => typeof i === 'object' && i && !Array.isArray(i);

function setValue (item, key, destination) {
  const val = item[key];
  const destVal = destination[key];
  if (isObj(val)) {
    destination[key] = merge(isObj(destVal) ? destVal : {}, val);
  } else if (val !== undefined) {
    destination[key] = val;
  }
}

function merge (...items) {
  const destination = items.shift();
  for (const item of items) {
    if (isObj(item)) {
      // Keep track of non-enumerable properties so they can be merged.
      const nonEnumerableKeys = Object.getOwnPropertyNames(item);
      for (const key in item) {
        setValue(item, key, destination);

        // Remove the key if the array includes it since it's enumerable.
        const index = nonEnumerableKeys.indexOf(key);
        if (index > -1) {
          nonEnumerableKeys.splice(index, 1);
        }
      }

      // Merge non-enumerable properties.
      for (const key of nonEnumerableKeys) {
        setValue(item, key, destination);
      }
    }
  }
  return destination
}

export default merge;
