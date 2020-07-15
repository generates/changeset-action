'use strict';

function runMerge (destination, key, value) {
  if (value !== undefined) {
    const keyIsUndefined = key === undefined;
    const newDestination = keyIsUndefined ? destination : destination[key];
    if (
      typeof value === 'object' &&
      typeof newDestination === 'object' &&
      value &&
      newDestination &&
      !Array.isArray(value) &&
      !Array.isArray(newDestination)
    ) {
      for (const newKey in value) {
        runMerge(newDestination, newKey, value[newKey]);
      }
    } else if (!keyIsUndefined) {
      destination[key] = value;
    }
  }
}

function merge (...items) {
  const destination = items.shift();
  items.forEach(value => runMerge(destination, undefined, value));
  return destination
}

module.exports = merge;
