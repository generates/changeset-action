'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const isObj = i => typeof i === 'object' && i && !Array.isArray(i);

function get (src, path, defaultValue) {
  if (!path) return src

  const pathKeys = path.split('.');

  let current = src;
  for (const key of pathKeys) {
    if (!current || !(key in current)) return defaultValue
    current = current[key];
  }

  return current
}

function set (src, path = '', value) {
  const pathKeys = path.split('.');
  const lastIndex = pathKeys.length - 1;

  let current = src;
  for (let i = 0; i < pathKeys.length; i++) {
    if (i === lastIndex) {
      current[pathKeys[i]] = value;
    } else {
      if (!isObj(current[pathKeys[i]])) current[pathKeys[i]] = {};

      current = current[pathKeys[i]];
    }
  }

  return src
}

function del (src, path = '') {
  const pathKeys = path.split('.');
  const lastIndex = pathKeys.length - 1;

  let current = src;
  for (let i = 0; i < pathKeys.length; i++) {
    if (!current) continue
    if (i === lastIndex) {
      delete current[pathKeys[i]];
    } else {
      if (!isObj(current[pathKeys[i]])) return

      current = current[pathKeys[i]];
    }
  }

  return src
}

function has (src, path = '') {
  const pathKeys = path.split('.');
  const lastIndex = pathKeys.length - 1;

  let current = src;
  for (let i = 0; i < pathKeys.length; i++) {
    if (i === lastIndex) {
      return pathKeys[i] in current
    } else {
      if (!isObj(current[pathKeys[i]])) return false

      current = current[pathKeys[i]];
    }
  }
}

function match (a = '', b = '') {
  const aKeys = a.split('.');
  const bKeys = b.split('.');
  const last = Math.min(aKeys.length, bKeys.length) - 1;
  let aStar = false;
  let bStar = false;
  for (let i = 0; i < aKeys.length; i++) {
    aStar = aKeys[i] === '*' || (aStar && !aKeys[i]);
    bStar = bKeys[i] === '*' || (bStar && !bKeys[i]);
    const aStarMatch = aStar && (bKeys[i] || i >= last);
    const bStarMatch = bStar && (aKeys[i] || i >= last);
    const lengthMismatch = aKeys.length !== bKeys.length;
    if (aKeys[i] !== bKeys[i] && !aStarMatch && !bStarMatch) return false
    if (i === last && lengthMismatch && !aStar && !bStar) return false
  }
  return true
}

var index = { get, set, del, has, match };

exports.default = index;
exports.del = del;
exports.get = get;
exports.has = has;
exports.match = match;
exports.set = set;
